# Database setup (Supabase)

The website's pages are static. Form submissions go to small server functions on Vercel
(`src/pages/api/`), which save them to Supabase and email the foundation.

| Table | Filled by |
|---|---|
| `volunteers` | Volunteer form on **Get Involved** |
| `messages` | **Contact** form (`kind = contact`) and **Share your story** (`kind = story`) |
| `donations` | Paystack, automatically after each successful payment |

Each row has a `status` (`new`, `in_progress`, `done`, `archived`) and a `staff_notes` column for follow-up.

Supabase project: `https://pbwgcbqylimmkcqphymo.supabase.co`

## 1. Create the tables (once)

1. Open the project in Supabase, then **SQL Editor → New query**.
2. Paste the whole of `supabase/migrations/20261029000000_init.sql` and click **Run**.
3. Check **Table Editor**: you should see `volunteers`, `messages` and `donations`.

The script is safe to run again.

## 2. Copy the secret key

**Project Settings → API Keys**: copy the **secret** key (starts with `sb_secret_`).
If your project only shows legacy keys, use the `service_role` key.

Keep it private: never put it in the code, in chat, or in an email. It only goes into Vercel.

## 3. Email alerts (Resend)

1. Sign up at resend.com **using themoajfoundation@gmail.com** (without a verified domain,
   Resend only delivers to the account owner's address).
2. **API Keys → Create API key**, and copy it.

Once the foundation has its own domain, verify it in Resend and set `ALERT_EMAIL_FROM`
(e.g. `MO-AJ Website <hello@moajfoundation.org>`) to send from it, and to more addresses.

## 4. Add the settings in Vercel

**Vercel → the project → Settings → Environment Variables**, for *Production* and *Preview*:

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://pbwgcbqylimmkcqphymo.supabase.co` |
| `SUPABASE_SECRET_KEY` | the secret key from step 2 |
| `RESEND_API_KEY` | the Resend key from step 3 |
| `ALERT_EMAIL_TO` | `themoajfoundation@gmail.com` (comma-separate several) |
| `CRON_SECRET` | any long random string (keeps the free database from pausing) |
| `PAYSTACK_SECRET_KEY` | later, once Paystack is set up |

Then **Deployments → ⋯ → Redeploy** so the new settings take effect.

## 5. Test it

Submit the volunteer form on the live site. Within a few seconds the row should appear in
**Table Editor → volunteers**, and an alert email should arrive.

## Paystack donations (later)

1. Add `PAYSTACK_SECRET_KEY` in Vercel and redeploy.
2. In Paystack: **Settings → API Keys & Webhooks → Webhook URL** =
   `https://<your-domain>/api/paystack-webhook`.
3. Make a small test payment; it appears in the `donations` table (amounts are in pesewas:
   `25000` = GH₵250.00).

## Giving staff access

**Supabase → Organization → Team → Invite**. Give staff the *Read-only* role unless they need
to update `status` / `staff_notes`. Remove people when they leave.

## Requests to see or delete personal data

Under Ghana's Data Protection Act, 2012 (Act 843), people can ask what we hold and ask for it to be
removed. Search the `volunteers` and `messages` tables by email in the Table Editor, then export
or delete the matching rows. Reply to the person to confirm.

## Safeguards built in

- Row Level Security is on with no public policies: the public API key can't read or write anything.
  Only the website's server (secret key) inserts rows.
- Every form checks consent, field lengths and email format before saving.
- Posts from other websites are refused, a hidden "honeypot" field catches bots, and each email
  address is limited to 5 submissions an hour.
- Paystack notifications are verified with their signature; repeats never create duplicates.
- If the database is unreachable, visitors are offered a pre-filled email instead, so no message is lost.
