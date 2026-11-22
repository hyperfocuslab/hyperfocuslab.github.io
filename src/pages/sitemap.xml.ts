import type { APIRoute } from 'astro';
import { COCKATOO_DOCS, HARUBOX_DOCS, HARUBOX_LANGS, LANGS, SHELTIE_DOCS, SHELTIE_LANGS, SITE, cockatooHref, haruboxHref, href, sheltieHref, type Page } from '../i18n';

const PAGES: Page[] = ['home', 'peakly', 'support', 'privacy', 'terms'];

export const GET: APIRoute = () => {
  const urls = PAGES.flatMap((page) => LANGS.map((lang) => `  <url><loc>${SITE}${href(page, lang)}</loc></url>`));
  const sheltie = (['product', ...SHELTIE_DOCS] as const).flatMap((doc) => SHELTIE_LANGS.map((lang) => `  <url><loc>${SITE}${sheltieHref(doc, lang)}</loc></url>`));
  urls.push(...sheltie);
  urls.push(...(['product', ...COCKATOO_DOCS] as const).map((doc) => `  <url><loc>${SITE}${cockatooHref(doc)}</loc></url>`));
  urls.push(...HARUBOX_DOCS.flatMap((doc) => HARUBOX_LANGS.map((lang) => `  <url><loc>${SITE}${haruboxHref(doc, lang)}</loc></url>`)));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
