import type { APIRoute } from 'astro';
import { LANGS, SHELTIE_DOCS, SHELTIE_LANGS, SITE, href, sheltieHref, type Page } from '../i18n';

const PAGES: Page[] = ['home', 'support', 'privacy', 'terms'];

export const GET: APIRoute = () => {
  const urls = PAGES.flatMap((page) => LANGS.map((lang) => `  <url><loc>${SITE}${href(page, lang)}</loc></url>`));
  const sheltie = SHELTIE_DOCS.flatMap((doc) => SHELTIE_LANGS.map((lang) => `  <url><loc>${SITE}${sheltieHref(doc, lang)}</loc></url>`));
  urls.push(...sheltie);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
