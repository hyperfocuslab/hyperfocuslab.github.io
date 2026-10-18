// One-time import of copy from the previous static site (legacy/) into src/data.
// Legal and support text is copied verbatim; only the page chrome is dropped.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as cheerio from 'cheerio';

const LANGS = { ko: '', en: '-en', ja: '-ja' };
const read = (name) => cheerio.load(readFileSync(`legacy/${name}`, 'utf8'));
const clean = (s) => s.replace(/\s+/g, ' ').trim();

mkdirSync('src/data/docs', { recursive: true });

for (const [lang, suffix] of Object.entries(LANGS)) {
  for (const doc of ['privacy', 'terms', 'support']) {
    const $d = read(`${doc}${suffix}.html`);
    const $body = $d(doc === 'support' ? 'main.card' : 'article.card');
    const meta = {
      title: clean($d('title').text()),
      description: $d('meta[name="description"]').attr('content') ?? '',
      heading: clean($body.find('h1').first().text()),
    };
    $body.find('h1').first().remove();
    writeFileSync(`src/data/docs/${doc}.${lang}.html`, $body.html().trim() + '\n');
    writeFileSync(`src/data/docs/${doc}.${lang}.json`, JSON.stringify(meta, null, 2) + '\n');
  }
}
console.log('extracted', Object.keys(LANGS).join(', '));
