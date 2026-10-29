import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { getDb } from '../../lib/server/db';
import { sendAlert } from '../../lib/server/alerts';
import { readBody, reply, sameOrigin, text, required, email, consent, isBot, overLimit } from '../../lib/server/forms';

export const prerender = false;

const Volunteer = z.object({
  name: required(120),
  email,
  phone: required(40),
  location: text(120).optional(),
  interests: z
    .union([text(80), z.array(text(80)).max(20)])
    .optional()
    .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]).filter(Boolean)),
  availability: text(60).optional(),
  message: text(4000).optional(),
  consent,
});

export const POST: APIRoute = async (ctx) => {
  if (!sameOrigin(ctx)) return reply(ctx, 403, { ok: false, error: 'Forbidden' });
  const body = await readBody(ctx.request).catch(() => ({}));
  if (isBot(body)) return reply(ctx, 200, { ok: true });

  const parsed = Volunteer.safeParse(body);
  if (!parsed.success) return reply(ctx, 400, { ok: false, error: 'Please check the form and try again.' });
  const v = parsed.data;

  const db = getDb();
  if (!db) return reply(ctx, 503, { ok: false, fallback: true, error: 'Online sign-up is not available yet.' });

  try {
    if (await overLimit(db, 'volunteers', v.email)) {
      return reply(ctx, 429, { ok: false, error: 'We have already received your registration. Thank you!' });
    }
    const { error } = await db.from('volunteers').insert({
      full_name: v.name,
      email: v.email,
      phone: v.phone,
      location: v.location || null,
      interests: v.interests,
      availability: v.availability || null,
      message: v.message || null,
      consent_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (err) {
    console.error('Volunteer insert failed', err);
    return reply(ctx, 500, { ok: false, fallback: true, error: 'Something went wrong saving your registration.' });
  }

  await sendAlert(
    `New volunteer: ${v.name}`,
    {
      Name: v.name,
      Email: v.email,
      Phone: v.phone,
      Location: v.location,
      Interests: v.interests.join(', '),
      Availability: v.availability,
      Message: v.message,
    },
    v.email,
  );
  return reply(ctx, 200, { ok: true });
};
