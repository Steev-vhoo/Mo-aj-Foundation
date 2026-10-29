// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // TODO: replace with the real domain once it is connected in Vercel
  site: 'https://moajfoundation.org',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
