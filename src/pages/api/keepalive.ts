import type { APIRoute } from 'astro';
import { CRON_SECRET } from 'astro:env/server';
import { getDb } from '../../lib/server/db';

export const prerender = false;

/**
 * Called daily by Vercel Cron (see vercel.json). Supabase pauses free projects after a week
 * without activity; a tiny query each day keeps the database awake.
 */
export const GET: APIRoute = async ({ request }) => {
  if (!CRON_SECRET || request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  const db = getDb();
  if (!db) return new Response('Not configured', { status: 503 });
  const { error } = await db.from('volunteers').select('id', { head: true, count: 'exact' }).limit(1);
  if (error) {
    console.error('Keep-alive query failed', error);
    return new Response('Error', { status: 500 });
  }
  return new Response('OK');
};
