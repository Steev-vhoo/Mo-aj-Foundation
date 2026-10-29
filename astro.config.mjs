// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  // TODO: replace with the real domain once it is connected in Vercel
  site: 'https://moajfoundation.org',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // Pages stay static; only the routes in src/pages/api/ run as Vercel functions.
  adapter: vercel(),
  env: {
    schema: {
      // All optional so the site still builds and runs before the services are set up.
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      SUPABASE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      ALERT_EMAIL_TO: envField.string({ context: 'server', access: 'secret', optional: true }),
      ALERT_EMAIL_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      PAYSTACK_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CRON_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
