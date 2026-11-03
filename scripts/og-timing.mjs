// Share cards for the reference curve tool: public/assets/og/timing-{lang}-{slug}.png (1200×630),
// one per drug that has a page in that language, named by the URL slug (ingredient and form).
// Each card is the page's own chart (same render code, same CSS) screenshotted with headless
// Chrome, so the card matches what the link opens. Run after changing the curve, the copy or
// the chart styles: npm run og:timing
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_MINUTES, DRUG_SLUGS, TIMING_LANGS, clockText, copy, drugsFor, render } from '../src/lib/timing.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/assets/og');
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
const logo = readFileSync(join(root, 'public/favicon.svg'), 'utf8');

const FONT = {
  ko: 'IBM+Plex+Sans+KR',
  en: 'IBM+Plex+Sans+KR',
  ja: 'IBM+Plex+Sans+JP',
};
const SUBTITLE = {
  ko: (dose) => `${dose} 복용 기준 · 참고 곡선`,
  en: (dose) => `Taken at ${dose} · reference curve`,
  ja: (dose) => `${dose} 服用の場合 · 参考曲線`,
};

function page(lang, drug) {
  const t = copy[lang];
  const r = render({ lang, drug, minutes: DEFAULT_MINUTES, nowHours: null });
  const fontCss = `https://fonts.googleapis.com/css2?family=${FONT[lang]}:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="${fontCss}">
<style>
${css}
html, body { width: 1200px; height: 630px; overflow: hidden; }
.og { display: grid; grid-template-rows: auto auto auto 1fr auto auto; gap: 18px; width: 1200px; height: 630px; padding: 48px 64px 44px; }
.og-top { display: flex; justify-content: space-between; align-items: baseline; gap: 24px; }
.og-top .label { font-size: 0.9375rem; }
/* Ingredient-and-form names run long (up to two lines in en and ja). They break at their spaces
   and brackets only, so a Japanese name is not split inside a word. */
.og-name { font-size: 2.75rem; font-weight: 700; line-height: 1.12; letter-spacing: -0.025em; text-wrap: balance; word-break: keep-all; }
.og-dose { font-size: 1.125rem; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.og .pk-legend { margin-top: 6px; }
.og .pk-legend-item { font-size: 1.25rem; }
.og .pk-legend-range { font-size: 1.125rem; }
.og .pk-legend-name i { width: 14px; height: 14px; border-radius: 4px; }
.og .pk-chart { height: auto; margin-top: 4px; }
.og .pk-line { stroke-width: 3.5; }
.og .pk-axis { font-size: 1rem; height: 24px; }
.og-foot { display: flex; align-items: center; gap: 12px; color: var(--ink-3); font-size: 1rem; }
.og-foot svg { width: 20px; height: 20px; }
</style>
</head>
<body>
<div class="og">
  <div class="og-top">
    <p class="label">${t.label}</p>
    <p class="og-dose">${SUBTITLE[lang](clockText(lang, DEFAULT_MINUTES))}</p>
  </div>
  <p class="og-name">${t.names[drug]}</p>
  <div class="pk-legend">${r.legend}</div>
  <div class="pk-chart">${r.chart}</div>
  <div class="pk-axis">${r.axis}</div>
  <div class="og-foot">${logo}<span>Hyperfocus Lab · hyperfocuslab.app</span></div>
</div>
</body>
</html>`;
}

mkdirSync(outDir, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'og-timing-'));
try {
  for (const lang of TIMING_LANGS) {
    for (const drug of drugsFor(lang)) {
      const slug = DRUG_SLUGS[drug];
      const html = join(work, `${lang}-${slug}.html`);
      const png = join(outDir, `timing-${lang}-${slug}.png`);
      writeFileSync(html, page(lang, drug));
      execFileSync(chrome, [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${join(work, 'profile')}`,
        '--window-size=1200,630',
        '--force-device-scale-factor=1',
        '--virtual-time-budget=8000',
        `--screenshot=${png}`,
        `file://${html}`,
      ], { stdio: 'ignore' });
      console.log(`wrote ${png}`);
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
