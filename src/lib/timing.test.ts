// Run: npm test. Clock text, phase naming and the rendered HTML of the timing tool.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_VERSION, PROFILES } from './pk.ts';
import {
  clockText,
  copy,
  describe,
  hoursSinceDose,
  objectParticle,
  parseMinutes,
  phaseAt,
  rangeText,
  render,
  selectGroups,
  tickOffsets,
  toHHMM,
} from './timing.ts';

test('hoursSinceDose counts from yesterday\'s dose while now is still on the chart axis', () => {
  const at = (h: number, m: number, s = 0) => new Date(2026, 10, 4, h, m, s);
  assert.equal(hoursSinceDose(at(15, 0), 8 * 60, 16), 7);
  assert.ok(Math.abs(hoursSinceDose(at(15, 30, 36), 8 * 60, 16) - 7.51) < 1e-9);
  // After midnight, a time the axis still covers: dose 20:00 → axis 20:00–12:00.
  assert.equal(hoursSinceDose(at(1, 0), 20 * 60, 16), 5);
  assert.ok(Math.abs(hoursSinceDose(at(2, 20), 11 * 60, 16) - (15 + 1 / 3)) < 1e-9);
  assert.equal(hoursSinceDose(at(12, 0), 20 * 60, 16), 16);
  // Off the axis it is today's dose still to come; a 12-hour chart reaches less far.
  assert.equal(hoursSinceDose(at(7, 0), 8 * 60, 16), -1);
  assert.equal(hoursSinceDose(at(1, 0), 8 * 60, 16), -7);
  assert.equal(hoursSinceDose(at(9, 0), 20 * 60, 12), -11);

  const at1 = (drug: 'concerta' | 'adderall_xr', dose: number) =>
    render({ lang: 'ko', drug, minutes: dose, nowHours: hoursSinceDose(at(1, 0), dose, PROFILES[drug].chartEndHours) });
  for (const drug of ['concerta', 'adderall_xr'] as const) {
    // 1:00 after a 20:00 dose: on the chart, with the marker.
    const on = at1(drug, 20 * 60);
    assert.ok(!on.status.includes('복용 전'), drug);
    assert.ok(on.status.includes('5시간 0분 지남'), drug);
    assert.ok(on.chart.includes('pk-now-dot'), drug);
    // 1:00 with an 08:00 dose: 17 h after yesterday's, past the chart, so before today's.
    const before = at1(drug, 8 * 60);
    assert.ok(before.status.includes('복용 전'), drug);
    assert.ok(before.status.includes('복용까지 7시간 0분'), drug);
    assert.ok(!before.chart.includes('pk-now-dot'), drug);
  }
});

test('tickOffsets land on whole clock hours', () => {
  assert.deepEqual(tickOffsets(8 * 60, 16), [0, 4, 8, 12, 16]);
  assert.deepEqual(tickOffsets(8 * 60 + 30, 16), [0.5, 4.5, 8.5, 12.5]);
  assert.deepEqual(tickOffsets(8 * 60 + 1, 12), [59 / 60, 59 / 60 + 4, 59 / 60 + 8]);
  const axis = render({ lang: 'ko', drug: 'concerta', minutes: 8 * 60 + 30, nowHours: null }).axis;
  assert.deepEqual([...axis.matchAll(/>([^<]+)<\/span>/g)].map((m) => m[1]), ['9시', '13시', '17시', '21시']);
  assert.ok(axis.includes('class="pk-tick start"'), 'first label is aligned inward');
});

test('objectParticle follows the final sound', () => {
  assert.equal(objectParticle('콘서타'), '를');
  assert.equal(objectParticle('메디키넷'), '을');
  assert.equal(objectParticle('리탈린'), '을');
  assert.equal(objectParticle('애더럴 XR'), '을');
  assert.equal(objectParticle('리탈린 LA'), '를');
  assert.equal(objectParticle('바이반스'), '를');
  assert.ok(describe('ko', 'medikinet').includes('메디키넷을 먹으면'));
  assert.ok(describe('ko', 'adderall_xr').includes('애더럴 XR을 먹으면'));
  assert.ok(describe('ko', 'concerta').includes('콘서타를 먹으면'));
});

test('selectGroups lists the home market first and leaves Ritalin LA out', () => {
  assert.deepEqual(selectGroups('ko').map((g) => g.ids), [
    ['concerta', 'medikinet', 'penid_ir'],
    ['ritalin_ir', 'adderall_xr', 'vyvanse'],
  ]);
  assert.deepEqual(selectGroups('ja').map((g) => g.ids), [
    ['concerta', 'vyvanse'],
    ['medikinet', 'penid_ir', 'ritalin_ir', 'adderall_xr'],
  ]);
  assert.deepEqual(selectGroups('en').map((g) => g.ids), [
    ['concerta', 'ritalin_ir', 'adderall_xr', 'vyvanse'],
    ['medikinet', 'penid_ir'],
  ]);
  assert.equal(selectGroups('ko')[1].label, '국내 미출시');
  // The Ritalin LA page itself still lists its own drug.
  assert.ok(selectGroups('ko', 'ritalin_la')[1].ids.includes('ritalin_la'));
});

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
  assert.equal(at(1), '1차 구간');
  assert.equal(at(3), '상승 중');
  assert.equal(at(8), '최대농도 구간');
  assert.equal(at(10), '최대농도 구간'); // the shared boundary belongs to the earlier window
  assert.equal(at(11), '감소 구간');
  assert.equal(at(14), '잔효');
  assert.equal(at(17), '표시 범위 밖');

  const m = PROFILES.medikinet; // windows 2–4, 5–6, 6–7
  assert.equal(phaseAt('ko', m, 3).text, '1차 상승 구간');
  assert.equal(phaseAt('ko', m, 4.5).text, '중간 구간');
  assert.equal(phaseAt('ko', m, 5.5).text, '2차 상승 구간');
  assert.equal(phaseAt('en', m, 6.5).text, 'Decline window');

  const la = PROFILES.ritalin_la; // windows 1.5–2.5, 5–6, 7–8
  assert.equal(phaseAt('ko', la, 2).text, '1차 피크 구간');
  assert.equal(phaseAt('ko', la, 4).text, '중간 구간');
  assert.equal(phaseAt('ja', la, 5.5).text, '二次ピークの区間');
  assert.equal(phaseAt('ko', la, 7.5).text, '농도 감소 구간');

  // The shared reference chart shades the catalog's peak section in the middle (5.2–7.7 h).
  const a = PROFILES.adderall_xr;
  assert.equal(phaseAt('ko', a, 1).text, '농도 상승 구간');
  assert.equal(phaseAt('ko', a, 5.5).text, '최고 농도 구간');
  assert.equal(phaseAt('ko', a, 8).text, '감소 중');
  assert.equal(phaseAt('ko', a, 11).text, '농도 감소 구간');
  assert.equal(phaseAt('en', a, 11).text, 'Concentration decline window');
});

test('the middle window follows the app chart: peak section for shared-chart profiles', () => {
  const mid = (drug: keyof typeof PROFILES) => [PROFILES[drug].windows[1].start, PROFILES[drug].windows[1].end];
  assert.deepEqual(mid('adderall_xr'), [5.2, 7.7]); // editing default 5.75–8.25
  assert.deepEqual(mid('vyvanse'), [3.8, 4.7]); // editing default 3.55–4.45
  assert.deepEqual(mid('concerta'), [6, 10]); // its own chart keeps the editable window
  assert.deepEqual(mid('medikinet'), [5, 6]);
  const legend = (drug: keyof typeof PROFILES) => render({ lang: 'ko', drug, minutes: 480, nowHours: null }).legend;
  assert.ok(legend('adderall_xr').includes('오후 1:12~3:42'));
  assert.ok(legend('adderall_xr').includes('농도 상승'));
  assert.ok(legend('vyvanse').includes('오전 11:48~오후 12:42'));
  assert.ok(legend('concerta').includes('최대농도'));
  assert.ok(describe('ko', 'adderall_xr').includes('오후 1:12~3:42'));
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
      assert.ok(!r.sources.includes(`<dd>${PROFILES[drug].referenceDoseMg} mg</dd>`), `${lang} ${drug} shows the reference dose row`);
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
