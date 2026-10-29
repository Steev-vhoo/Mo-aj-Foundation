import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PAYSTACK_SECRET_KEY } from 'astro:env/server';
import { getDb } from '../../lib/server/db';
import { sendAlert } from '../../lib/server/alerts';

export const prerender = false;

/**
 * Paystack calls this after each payment (set the URL in Paystack → Settings → API Keys & Webhooks:
 * https://<your-domain>/api/paystack-webhook). Requests are verified with the HMAC-SHA512 signature
 * Paystack computes from the raw body and the secret key, so forged calls are rejected.
 */
export const POST: APIRoute = async ({ request }) => {
  const db = getDb();
  if (!PAYSTACK_SECRET_KEY || !db) return new Response('Not configured', { status: 503 });

  const raw = await request.text();
  const given = request.headers.get('x-paystack-signature') ?? '';
  const expected = createHmac('sha512', PAYSTACK_SECRET_KEY).update(raw).digest('hex');
  const valid = given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!valid) return new Response('Invalid signature', { status: 401 });

  let event: { event?: string; data?: Record<string, any> };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('Bad payload', { status: 400 });
  }
  // Acknowledge everything else so Paystack doesn't retry it.
  if (event.event !== 'charge.success' || !event.data?.reference) return new Response('Ignored', { status: 200 });

  const d = event.data;
  const name = [d.customer?.first_name, d.customer?.last_name].filter(Boolean).join(' ') || null;
  // Upsert on the unique reference, so Paystack's retries never create duplicates.
  const { error } = await db.from('donations').upsert(
    {
      reference: String(d.reference),
      amount_minor: Number(d.amount),
      currency: String(d.currency ?? 'GHS'),
      channel: d.channel ?? null,
      donor_email: d.customer?.email ?? null,
      donor_name: name,
      paid_at: d.paid_at ?? d.paidAt ?? null,
      paystack_id: typeof d.id === 'number' ? d.id : null,
      raw: d,
    },
    { onConflict: 'reference', ignoreDuplicates: true },
  );
  if (error) {
    console.error('Donation insert failed', error);
    return new Response('Error', { status: 500 }); // Paystack will retry
  }

  const amount = (Number(d.amount) / 100).toFixed(2);
  await sendAlert(`New donation: ${d.currency ?? 'GHS'} ${amount}`, {
    Amount: `${d.currency ?? 'GHS'} ${amount}`,
    Donor: name ?? undefined,
    Email: d.customer?.email,
    Channel: d.channel,
    Reference: String(d.reference),
  });
  return new Response('OK', { status: 200 });
};
