import type { APIRoute } from 'astro';
import { SITE, href, pageLangs, type Page } from '../i18n';
import { DRUG_SLUGS, drugsFor, type TimingLang } from '../lib/timing';

const PAGES: Page[] = ['home', 'support', 'privacy', 'terms', 'timing'];

export const GET: APIRoute = () => {
  const urls = PAGES.flatMap((page) =>
    pageLangs(page).flatMap((lang) => {
      // Timing pages: the tool, then one per drug that has a page in this language.
      const drugs = page === 'timing' ? drugsFor(lang as TimingLang).map((id) => DRUG_SLUGS[id]) : [];
      const subs: (string | undefined)[] = [undefined, ...drugs];
      return subs.map((sub) => `  <url><loc>${SITE}${href(page, lang, sub)}</loc></url>`);
    }),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
