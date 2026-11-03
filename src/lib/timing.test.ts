// Run: npm test. Clock text, phase naming and the rendered HTML of the timing tool.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_VERSION, PROFILES } from './pk.ts';
import { clockText, copy, parseMinutes, phaseAt, rangeText, render, toHHMM } from './timing.ts';

test('parseMinutes accepts HH:MM only', () => {
  assert.equal(parseMinutes('08:00'), 480);
  assert.equal(parseMinutes('8:05'), 485);
  assert.equal(parseMinutes('23:59'), 1439);
  assert.equal(parseMinutes('24:00'), null);
  assert.equal(parseMinutes('8'), null);
  assert.equal(parseMinutes(null), null);
  assert.equal(toHHMM(485), '08:05');
});

test('clockText follows each language and marks the next day', () => {
  assert.equal(clockText('ko', 480), '오전 8:00');
  assert.equal(clockText('ko', 480, 6), '오후 2:00');
  assert.equal(clockText('ko', 18 * 60, 7), '다음 날 오전 1:00');
  assert.equal(clockText('en', 480), '8:00 AM');
  assert.equal(clockText('en', 18 * 60, 6), '12:00 AM next day');
  assert.equal(clockText('ja', 480, 0.5), '8:30');
  assert.equal(clockText('ja', 18 * 60, 8), '翌日 2:00');
});

test('rangeText repeats the period or the day only when it changes', () => {
  assert.equal(rangeText('ko', 480, 0.5, 1.5), '오전 8:30~9:30');
  assert.equal(rangeText('ko', 480, 2, 6), '오전 10:00~오후 2:00');
  assert.equal(rangeText('ko', 18 * 60, 6, 10), '다음 날 오전 12:00~4:00');
  assert.equal(rangeText('ko', 18 * 60, 5, 7), '오후 11:00~다음 날 오전 1:00');
  assert.equal(rangeText('en', 480, 0.5, 1.5), '8:30–9:30 AM');
  assert.equal(rangeText('en', 480, 2, 6), '10:00 AM – 2:00 PM');
  assert.equal(rangeText('en', 18 * 60, 6, 10), '12:00–4:00 AM next day');
  assert.equal(rangeText('en', 18 * 60, 5, 7), '11:00 PM – 1:00 AM next day');
  assert.equal(rangeText('ja', 480, 2, 6), '10:00~14:00');
  assert.equal(rangeText('ja', 18 * 60, 6, 10), '翌日 0:00~4:00');
  assert.equal(rangeText('ja', 18 * 60, 5, 7), '23:00~翌日 1:00');
});

test('phaseAt walks the three windows the way the app names them', () => {
  const c = PROFILES.concerta; // windows 0.5–1.5, 6–10, 10–12; display 16 h
  const at = (h: number) => phaseAt('ko', c, h).text;
  assert.equal(at(-1), '복용 전');
  assert.equal(at(0.25), '상승 중');
  assert.equal(at(1), '초기 구간');
  assert.equal(at(3), '상승 중');
  assert.equal(at(8), '최고 농도 구간');
  assert.equal(at(10), '최고 농도 구간'); // the shared boundary belongs to the earlier window
  assert.equal(at(11), '감소 구간');
  assert.equal(at(14), '잔효');
  assert.equal(at(17), '표시 범위 밖');

  const m = PROFILES.medikinet; // windows 2–4, 5–6, 6–7
  assert.equal(phaseAt('ko', m, 3).text, '최고 농도 구간');
  assert.equal(phaseAt('ko', m, 4.5).text, '중간 구간');
  assert.equal(phaseAt('ko', m, 5.5).text, '2차 농도 구간');
  assert.equal(phaseAt('en', m, 6.5).text, 'Decline window');

  const la = PROFILES.ritalin_la; // windows 1.5–2.5, 5–6, 7–8
  assert.equal(phaseAt('ko', la, 2).text, '1차 피크 구간');
  assert.equal(phaseAt('ko', la, 4).text, '중간 구간');
  assert.equal(phaseAt('ja', la, 5.5).text, '2回目のピークの区間');
});

test('render produces the chart, legend and sources for every drug and language', () => {
  for (const lang of ['ko', 'en', 'ja'] as const) {
    for (const drug of Object.keys(PROFILES) as (keyof typeof PROFILES)[]) {
      const r = render({ lang, drug, minutes: 480, nowHours: 7 });
      assert.ok(r.chart.startsWith('<svg'), `${lang} ${drug} chart`);
      assert.ok(!r.chart.includes('NaN'), `${lang} ${drug} chart has NaN`);
      assert.ok(r.chart.includes('pk-now-dot'), `${lang} ${drug} marker`);
      assert.equal((r.legend.match(/pk-legend-item/g) ?? []).length, 3, `${lang} ${drug} legend`);
      assert.equal((r.axis.match(/pk-tick/g) ?? []).length, PROFILES[drug].chartEndHours / 4 + 1, `${lang} ${drug} axis`);
      // Attribute values are escaped, so a URL with a query shows up with &amp;.
      for (const s of PROFILES[drug].sources) assert.ok(r.sources.includes(s.url.replace(/&/g, '&amp;')), `${lang} ${drug} source ${s.url}`);
      // Readers see link text in their language, one label per catalog source, and no internal notes.
      assert.equal(copy[lang].sourceLabels[drug].length, PROFILES[drug].sources.length, `${lang} ${drug} source labels`);
      for (const label of copy[lang].sourceLabels[drug]) assert.ok(r.sources.includes(label), `${lang} ${drug} label ${label}`);
      for (const s of PROFILES[drug].sources) assert.ok(!r.sources.includes(s.title), `${lang} ${drug} leaks "${s.title}"`);
      assert.ok(!r.sources.includes(MODEL_VERSION), `${lang} ${drug} shows the model version`);
      assert.ok(!/Tmax|Peakly reference|기존 앱|既存アプリ/.test(r.sources), `${lang} ${drug} internal wording`);
    }
  }
  // A profile without a note has no conditions row.
  assert.ok(!render({ lang: 'ko', drug: 'concerta', minutes: 480, nowHours: null }).sources.includes('<dt>조건</dt>'));
  assert.ok(render({ lang: 'ko', drug: 'medikinet', minutes: 480, nowHours: null }).sources.includes('<dt>조건</dt>'));
  // Build time has no clock: the header shows the drug, not a phase, and no marker.
  const first = render({ lang: 'ko', drug: 'concerta', minutes: 480, nowHours: null });
  assert.ok(first.status.includes('콘서타'));
  assert.ok(!first.chart.includes('pk-now-dot'));
  // Beyond the chart the marker is hidden but the status still names the phase.
  const late = render({ lang: 'ko', drug: 'adderall_xr', minutes: 480, nowHours: 20 });
  assert.ok(!late.chart.includes('pk-now-dot'));
  assert.ok(late.status.includes('잔효'));
});
