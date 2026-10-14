import { defineConfig } from 'astro/config';

// 'preserve' keeps the flat legacy URLs (/privacy-en.html) that the stores and
// the apps already link to, while folder pages still build to /en/index.html.
export default defineConfig({
  site: 'https://hyperfocuslab.app',
  build: { format: 'preserve' },
  devToolbar: { enabled: false },
});
