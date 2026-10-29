import type { APIContext } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'astro/zod';

/** Reads a form post (urlencoded/multipart) or JSON body into a plain object; repeated keys become arrays. */
export async function readBody(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) return (await request.json()) ?? {};
  const form = await request.formData();
  const out: Record<string, unknown> = {};
  for (const key of new Set(form.keys())) {
    const all = form.getAll(key).filter((v): v is string => typeof v === 'string');
    out[key] = all.length > 1 ? all : all[0];
  }
  return out;
}

const wantsJson = (request: Request) => (request.headers.get('accept') ?? '').includes('application/json');

/** JSON for the site's own fetch() calls; a redirect for plain no-JavaScript form posts. */
export function reply(ctx: APIContext, status: number, body: { ok: boolean; error?: string; fallback?: boolean }) {
  if (wantsJson(ctx.request)) return Response.json(body, { status });
  const target = body.ok ? '/thanks' : `/thanks?error=${body.fallback ? 'unavailable' : 'invalid'}`;
  return ctx.redirect(target, 303);
}

/** Rejects posts from other websites. Requests with no Origin header (some older browsers) are allowed. */
export function sameOrigin(ctx: APIContext) {
  const origin = ctx.request.headers.get('origin');
  return !origin || origin === ctx.url.origin;
}

// Shared field rules
export const text = (max: number) => z.string().trim().max(max);
export const required = (max: number) => z.string().trim().min(1).max(max);
export const email = z.string().trim().toLowerCase().max(254).pipe(z.email());
export const consent = z.union([z.literal('on'), z.literal('true'), z.literal(true)]);
/** Honeypot: humans never see this field, so anything in it means a bot. */
export const isBot = (body: Record<string, unknown>) => typeof body._gotcha === 'string' && body._gotcha.length > 0;

/** True if this email has already sent `limit` submissions to `table` in the last hour. */
export async function overLimit(db: SupabaseClient, table: string, address: string, limit = 5) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await db
    .from(table)
    .select('id', { count: 'exact', head: true })
    .ilike('email', address)
    .gte('created_at', since);
  if (error) throw error;
  return (count ?? 0) >= limit;
}
