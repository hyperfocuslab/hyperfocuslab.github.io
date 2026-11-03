import type { APIRoute } from 'astro';
import { SITE, href, pageLangs, type Page } from '../i18n';
import { DRUG_IDS } from '../lib/pk';

const PAGES: Page[] = ['home', 'support', 'privacy', 'terms', 'timing'];

export const GET: APIRoute = () => {
  const urls = PAGES.flatMap((page) =>
    pageLangs(page).flatMap((lang) => {
      const subs: (string | undefined)[] = page === 'timing' ? [undefined, ...DRUG_IDS] : [undefined];
      return subs.map((sub) => `  <url><loc>${SITE}${href(page, lang, sub)}</loc></url>`);
    }),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
