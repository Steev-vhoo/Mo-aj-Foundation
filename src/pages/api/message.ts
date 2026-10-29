import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { getDb } from '../../lib/server/db';
import { sendAlert } from '../../lib/server/alerts';
import { readBody, reply, sameOrigin, text, required, email, consent, isBot, overLimit } from '../../lib/server/forms';

export const prerender = false;

// Handles both the contact form (`message` field) and the share-a-story form (`story` field).
const Message = z
  .object({
    _form: z.enum(['contact', 'story']).default('contact'),
    name: required(120),
    email,
    phone: text(40).optional(),
    topic: text(60).optional(),
    message: text(8000).optional(),
    story: text(8000).optional(),
    consent,
  })
  .transform((m) => ({ ...m, body: (m._form === 'story' ? m.story : m.message) ?? '' }))
  .refine((m) => m.body.length > 0);

export const POST: APIRoute = async (ctx) => {
  if (!sameOrigin(ctx)) return reply(ctx, 403, { ok: false, error: 'Forbidden' });
  const body = await readBody(ctx.request).catch(() => ({}));
  if (isBot(body)) return reply(ctx, 200, { ok: true });

  const parsed = Message.safeParse(body);
  if (!parsed.success) return reply(ctx, 400, { ok: false, error: 'Please check the form and try again.' });
  const m = parsed.data;

  const db = getDb();
  if (!db) return reply(ctx, 503, { ok: false, fallback: true, error: 'Online messages are not available yet.' });

  try {
    if (await overLimit(db, 'messages', m.email)) {
      return reply(ctx, 429, { ok: false, error: 'You have sent several messages recently. Please try again later.' });
    }
    const { error } = await db.from('messages').insert({
      kind: m._form,
      name: m.name,
      email: m.email,
      phone: m.phone || null,
      topic: m.topic || null,
      body: m.body,
      consent_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (err) {
    console.error('Message insert failed', err);
    return reply(ctx, 500, { ok: false, fallback: true, error: 'Something went wrong sending your message.' });
  }

  const label = m._form === 'story' ? 'New story submission' : `New message${m.topic ? ` (${m.topic})` : ''}`;
  await sendAlert(
    `${label} from ${m.name}`,
    { Name: m.name, Email: m.email, Phone: m.phone, Topic: m.topic, [m._form === 'story' ? 'Story' : 'Message']: m.body },
    m.email,
  );
  return reply(ctx, 200, { ok: true });
};
