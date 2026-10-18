import type { APIRoute } from 'astro';
import { LANGS, SITE, href, type Page } from '../i18n';

const PAGES: Page[] = ['home', 'support', 'privacy', 'terms'];

export const GET: APIRoute = () => {
  const urls = PAGES.flatMap((page) => LANGS.map((lang) => `  <url><loc>${SITE}${href(page, lang)}</loc></url>`));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
