// One-time import of copy from the previous static site (legacy/) into src/data.
// Legal and support text is copied verbatim; only the page chrome is dropped.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as cheerio from 'cheerio';

const LANGS = { ko: '', en: '-en', ja: '-ja' };
const read = (name) => cheerio.load(readFileSync(`legacy/${name}`, 'utf8'));
const clean = (s) => s.replace(/\s+/g, ' ').trim();
// Headline HTML keeps its <br> line breaks; the gradient span is flattened.
const lines = ($el) =>
  $el
    .html()
    .split(/<br\s*\/?>/)
    .map((part) => clean(cheerio.load(part).text()))
    .filter(Boolean);

mkdirSync('src/data/docs', { recursive: true });

const peakly = {};
for (const [lang, suffix] of Object.entries(LANGS)) {
  const $ = read(`index${suffix}.html`);
  const pair = (id) => {
    const $s = $(`#${id}`);
    return {
      badge: clean($s.find('.badge').text()),
      title: lines($s.find('h2')),
      lead: clean($s.find('.section-lead').text()),
      rows: $s.find('.text-row').toArray().map((r) => ({
        title: clean($(r).find('strong').text()),
        body: clean($(r).find('p').text()),
      })),
      image: $s.find('.phone-frame img').attr('src').replace('assets/', '/assets/'),
      alt: $s.find('.phone-frame img').attr('alt'),
      note: clean($s.find('.screen-note').text()),
    };
  };
  const header = ($s) => ({
    badge: clean($s.find('.badge').text()),
    title: lines($s.find('h2')),
    lead: clean($s.find('.section-header > p').text()),
  });
  peakly[lang] = {
    meta: {
      title: clean($('title').text()),
      description: $('meta[name="description"]').attr('content'),
    },
    tagline: clean($('.brand-sub').text()),
    hero: { title: lines($('.hero h1')), lead: lines($('.hero .lead')) },
    values: $('.value-card').toArray().map((c) => ({
      label: clean($(c).find('.value-label').text()),
      title: clean($(c).find('h3').text()),
      body: clean($(c).find('p').text()),
    })),
    medication: pair('medication'),
    condition: pair('condition'),
    features: {
      ...header($('#features')),
      items: $('.feature-card').toArray().map((c) => ({
        title: clean($(c).find('h3').text()),
        body: clean($(c).find('p').text()),
      })),
    },
    workflow: {
      ...header($('#workflow')),
      items: $('.workflow-step').toArray().map((c) => ({
        title: clean($(c).find('h3').text()),
        body: clean($(c).find('p').text()),
      })),
    },
    cta: { title: lines($('.cta-box h2')), body: lines($('.cta-box > p')) },
    badges: {
      appStore: {
        src: $('#hero-cta-ios img').attr('src').replace('assets/', '/assets/'),
        alt: $('#hero-cta-ios img').attr('alt'),
      },
      googlePlay: {
        src: $('#hero-cta-android img').attr('src').replace('assets/', '/assets/'),
        alt: $('#hero-cta-android img').attr('alt'),
      },
    },
  };

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
writeFileSync('src/data/peakly.json', JSON.stringify(peakly, null, 2) + '\n');
console.log('extracted', Object.keys(peakly).join(', '));
