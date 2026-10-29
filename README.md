# MO-AJ Foundation website

Static website for the Mark Ofosu-Ampadu Jnr (MO-AJ) Foundation, built with [Astro](https://astro.build) and deployed on [Vercel](https://vercel.com).

## Run it locally

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # builds the site (static pages + Vercel functions for /api)
cp .env.example .env   # optional: local settings for the forms/database
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repository. Vercel detects Astro automatically (build `npm run build`, output `dist`).
3. Add the foundation's domain under **Settings → Domains**, then update `site` in `astro.config.mjs`.

Every push to the main branch redeploys the site; pull requests get preview links.

## Where to change things

| What | Where |
|---|---|
| Email, phone, location, social links | `src/config.ts` → `site` |
| Paystack link, MoMo and bank details | `src/config.ts` → `donate` |
| Form handling (saves to Supabase, emails alerts) | `src/pages/api/`, see [docs/DATABASE.md](docs/DATABASE.md) |
| Menu | `src/config.ts` → `nav` |
| Stories | `src/content/stories/*.md` (copy `_TEMPLATE.md`) |
| News posts | `src/content/news/*.md` (copy `_TEMPLATE.md`) |
| Gallery photos | drop images into `src/assets/gallery/` (file name becomes the caption) |
| Team names and roles | `src/pages/about.astro` → `team` |
| Team group photos | drop images into `src/assets/team/` (file name becomes the caption) |
| Colours and fonts | `src/styles/global.css` (`:root` variables) |

Stories only appear when `consentOnFile: true` and `draft` is not `true`. Do not publish a story without the family's written consent.

## Setting up services

- **Donations (Paystack):** create a Paystack account for the foundation, then create a *Payment Page* (Paystack dashboard → Payment Pages). Copy its link into `donate.paystackUrl`. It accepts MoMo and cards with no server code.
- **Database and forms:** follow [docs/DATABASE.md](docs/DATABASE.md) to create the Supabase tables and add the keys in Vercel. Until then, forms offer visitors a pre-filled email instead.
- **Social feed:** put the Facebook page URL in `site.social.facebook`; the home page shows its timeline.

## Before launch (open items)

- [ ] Real photos (hero, Mark, team, events). Each placeholder says what photo belongs there
- [ ] High-resolution / vector logo (current logo was cut from a JPG)
- [ ] Team names and roles, and group photos in `src/assets/team/`
- [ ] Paystack payment page, MoMo and bank details
- [ ] Supabase tables created and keys added in Vercel ([docs/DATABASE.md](docs/DATABASE.md))
- [ ] Resend account for email alerts
- [ ] Social media links
- [ ] Phone number and confirmed location
- [ ] Confirm emergency numbers and advocacy priorities on the Road Safety page
- [ ] Review the privacy notice
- [ ] Domain name
