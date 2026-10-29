import { RESEND_API_KEY, ALERT_EMAIL_TO, ALERT_EMAIL_FROM } from 'astro:env/server';

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Emails the foundation about a new submission. Never throws: the submission is already saved,
 * so a failed alert is logged rather than shown to the visitor.
 */
export async function sendAlert(subject: string, fields: Record<string, string | undefined>, replyTo?: string) {
  if (!RESEND_API_KEY || !ALERT_EMAIL_TO) return;
  const rows = Object.entries(fields)
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#586174;vertical-align:top">${escape(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${escape(v!)}</td></tr>`,
    )
    .join('');
  const html = `<div style="font-family:system-ui,sans-serif;color:#1c2333">
    <h2 style="color:#0a285e;margin:0 0 12px">${escape(subject)}</h2>
    <table style="border-collapse:collapse;font-size:15px">${rows}</table>
    <p style="color:#586174;font-size:13px;margin-top:20px">Sent by the MO-AJ Foundation website. Full details are in Supabase.</p>
  </div>`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: ALERT_EMAIL_FROM || 'MO-AJ Website <onboarding@resend.dev>',
        to: ALERT_EMAIL_TO.split(',').map((s) => s.trim()),
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) console.error('Alert email failed', res.status, await res.text());
  } catch (err) {
    console.error('Alert email failed', err);
  }
}
