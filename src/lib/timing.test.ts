// Run: npm test. Clock text, phase naming and the rendered HTML of the timing tool.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_VERSION, PROFILES } from './pk.ts';
import {
  PHASE_COLORS,
  clockText,
  copy,
  describe,
  hoursSinceDose,
  objectParticle,
  parseMinutes,
  phaseAt,
  type PhaseKey,
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

// Expected values come from the app: MedicationPhase.phase(...) and compactText(...) in
// Peakly/UI/MedicationPKModels.swift with the default windows, statusPaletteIndex for the colour index.
// Each row: elapsed hours → ko text, colour index (null = neutral).
type Row = [hours: number, text: string, color: 0 | 1 | 2 | null];
function expectRows(drug: keyof typeof PROFILES, rows: Row[], lang: 'ko' | 'en' | 'ja' = 'ko') {
  for (const [hours, text, color] of rows) {
    const state = phaseAt(lang, PROFILES[drug], hours);
    assert.equal(state.text, text, `${lang} ${drug} @${hours} h text`);
    assert.equal(state.colorIndex, color, `${lang} ${drug} @${hours} h colour`);
  }
}

test('phaseAt: Concerta follows the app (windows 0.5–1.5, 6–10, release 10–12, valley midpoint 3.75)', () => {
  expectRows('concerta', [
    [-1, '복용 전', null],
    [0, '상승 중', 0],
    [0.25, '상승 중', 0],
    [0.5, '1차 체감', 0],
    [1.5, '1차 체감', 0],
    [1.51, '중간 구간', 0],
    [2, '중간 구간', 0],
    [3.74, '중간 구간', 0],
    [3.75, '2차 상승', 0],
    [5, '2차 상승', 0],
    [5.99, '2차 상승', 0],
    [6, '메인 피크', 1],
    [8, '메인 피크', 1],
    [10 - 1 / 3600, '메인 피크', 1],
    // The app's own test: orange peak until 10 h, then the gray decline from exactly 10 h.
    [10, '감소 구간', 2],
    [11, '감소 구간', 2],
    [12, '감소 구간', 2],
    [12.01, '잔효', null],
    [13, '잔효', null],
    [17.9, '잔효', null],
    [18, '잔효', null],
    [30, '잔효', null],
  ]);
  expectRows('concerta', [[2, 'Middle window', 0], [5, 'Second rise', 0], [8, 'Main peak', 1], [11, 'Declining phase', 2], [13, 'Residual effect', null], [0.25, 'Rising', 0], [1, 'Initial effect', 0]], 'en');
  expectRows('concerta', [[2, '中間区間', 0], [5, '二次上昇', 0], [8, 'メインピーク', 1], [11, '減少段階', 2], [13, '残存効果', null], [1, '一次体感', 0]], 'ja');
});

test('phaseAt: Medikinet follows the app (windows 2–4, 5–6, release 6–7, valley midpoint 4.5)', () => {
  expectRows('medikinet', [
    [-0.5, '복용 전', null],
    [1, '상승 중', 0],
    [2, '최대 농도', 0],
    [4, '최대 농도', 0],
    [4.2, '중간 구간', 0],
    [4.49, '중간 구간', 0],
    [4.5, '2차 상승', 0],
    [4.99, '2차 상승', 0],
    [5, '2차 피크', 1],
    [6 - 1 / 3600, '2차 피크', 1],
    [6, '감소 구간', 2],
    [6.5, '감소 구간', 2],
    [7, '감소 구간', 2],
    [7.01, '잔효', null],
    [12, '잔효', null],
  ]);
  expectRows('medikinet', [[3, 'Peak', 0], [5.5, 'Second peak', 1], [6.5, 'Declining phase', 2], [8, 'Residual effect', null]], 'en');
  expectRows('medikinet', [[3, '最大濃度', 0], [5.5, '二次ピーク', 1], [4.2, '中間区間', 0]], 'ja');
});

test('phaseAt: Adderall XR follows the app (early 0.5–1.5, peak section 5.2–7.7, ends at 12)', () => {
  expectRows('adderall_xr', [
    [0, '작용 시작', 0],
    [0.49, '작용 시작', 0],
    [0.5, '초기 구간', 0],
    [1.5, '초기 구간', 0],
    [1.6, '상승 구간', 0],
    [5.19, '상승 구간', 0],
    [5.2, '최대 효과 구간', 1],
    [7, '최대 효과 구간', 1],
    [7.7, '최대 효과 구간', 1],
    [7.71, '감소 구간', 2],
    [10, '감소 구간', 2],
    [11.99, '감소 구간', 2],
    // No release-end phase and no "residual": after the last window the app says the final phase.
    [12, '종료 구간', null],
    [20, '종료 구간', null],
  ]);
  expectRows('adderall_xr', [[0.2, 'Onset', 0], [1, 'Early phase', 0], [3, 'Rising phase', 0], [6, 'Peak effect', 1], [9, 'Declining phase', 2], [12, 'Final phase', null]], 'en');
  expectRows('adderall_xr', [[0.2, '作用開始', 0], [6, '最大効果区間', 1], [15, '終了段階', null]], 'ja');
});

test('phaseAt: Vyvanse follows the app (early 1–2, peak section 3.8–4.7, ending 12–14)', () => {
  expectRows('vyvanse', [
    [0.5, '작용 시작', 0],
    [1, '초기 구간', 0],
    [2, '초기 구간', 0],
    [2.5, '상승 구간', 0],
    [3.79, '상승 구간', 0],
    [3.8, '최대 효과 구간', 1],
    [4.7, '최대 효과 구간', 1],
    [5, '감소 구간', 2],
    [11.99, '감소 구간', 2],
    [12, '종료 구간', 2],
    [14, '종료 구간', 2],
    [14.01, '잔효', null],
    [20, '잔효', null],
  ]);
  expectRows('vyvanse', [[4, 'Peak effect', 1], [13, 'Final phase', 2], [15, 'Residual effect', null]], 'en');
  expectRows('vyvanse', [[13, '終了段階', 2], [15, '残存効果', null]], 'ja');
});

test('phaseAt: Penid and Ritalin share the short-profile windows (0.25–0.75, 1.5–2.5, 3–4)', () => {
  for (const drug of ['penid_ir', 'ritalin_ir'] as const) {
    expectRows(drug, [
      [0.1, '작용 시작', 0],
      [0.25, '초기 구간', 0],
      [0.75, '초기 구간', 0],
      [1, '상승 구간', 0],
      [1.5, '최대 효과 구간', 1],
      [2.5, '최대 효과 구간', 1],
      [2.8, '감소 구간', 2],
      [3, '종료 구간', 2],
      [4, '종료 구간', 2],
      [4.5, '잔효', null],
      [9, '잔효', null],
    ]);
  }
});

test('phaseAt: Ritalin LA has a dip between its two peaks (1.5–2.5, 5–6, ending 7–8)', () => {
  expectRows('ritalin_la', [
    [1, '작용 시작', 0],
    [1.5, '1차 피크', 0],
    [2.5, '1차 피크', 0],
    [3, '중간 구간', 0],
    [4.99, '중간 구간', 0],
    [5, '2차 피크', 1],
    [6, '2차 피크', 1],
    [6.5, '감소 구간', 2],
    [7, '종료 구간', 2],
    [8, '종료 구간', 2],
    [9, '잔효', null],
  ]);
  expectRows('ritalin_la', [[2, 'First peak', 0], [4, 'Middle window', 0], [5.5, 'Second peak', 1], [7.5, 'Final phase', 2], [10, 'Residual effect', null]], 'en');
  expectRows('ritalin_la', [[2, '一次ピーク', 0], [4, '中間区間', 0], [5.5, '二次ピーク', 1]], 'ja');
});

test('phaseAt: keys only move forward, every language has words, colour follows the key', () => {
  const order: PhaseKey[] = ['rising_1', 'peak_1', 'valley', 'rising_2', 'peak_2', 'falling', 'releaseEnd', 'after'];
  const colorOf: Record<PhaseKey, 0 | 1 | 2 | null> = { rising_1: 0, peak_1: 0, valley: 0, rising_2: 0, peak_2: 1, falling: 2, releaseEnd: 2, after: null };
  for (const drug of Object.keys(PROFILES) as (keyof typeof PROFILES)[]) {
    let last = 0;
    for (let h = 0; h <= 30; h += 0.05) {
      const states = (['ko', 'en', 'ja'] as const).map((lang) => phaseAt(lang, PROFILES[drug], h));
      for (const state of states) {
        assert.ok(state.text.length > 0, `${drug} @${h} h has no text`);
        assert.ok(state.key !== null);
        assert.equal(state.colorIndex, colorOf[state.key], `${drug} @${h} h colour`);
      }
      const at = order.indexOf(states[0].key!);
      assert.ok(at >= last, `${drug} @${h} h went back to ${states[0].key}`);
      last = at;
    }
    assert.equal(phaseAt('ko', PROFILES[drug], 30).key, 'after', drug);
  }
  // Before the dose has no app phase and no colour.
  const before = phaseAt('en', PROFILES.concerta, -0.01);
  assert.deepEqual([before.text, before.key, before.colorIndex], ['Before the dose', null, null]);
});

test('the status title and the now dot take the app\'s status colour', () => {
  const title = (drug: keyof typeof PROFILES, nowHours: number | null) => render({ lang: 'ko', drug, minutes: 480, nowHours }).status.split('</p>')[0];
  const dot = (drug: keyof typeof PROFILES, nowHours: number) => /<span class="pk-now-dot" style="([^"]*)">/.exec(render({ lang: 'ko', drug, minutes: 480, nowHours }).chart)?.[1];
  const [first, main, decline] = PHASE_COLORS;
  // Concerta: valley and rising share the first colour, the main peak is the second, the decline the third.
  assert.ok(title('concerta', 0.25).includes(`style="color:${first}">상승 중`));
  assert.ok(title('concerta', 2).includes(`style="color:${first}">중간 구간`));
  assert.ok(title('concerta', 5).includes(`style="color:${first}">2차 상승`));
  assert.ok(title('concerta', 8).includes(`style="color:${main}">메인 피크`));
  assert.ok(title('concerta', 11).includes(`style="color:${decline}">감소 구간`));
  // Finished: the app's grey (DS.Palette.Phase.after). Before the dose and at build time: no colour.
  assert.equal(title('concerta', 13), '<p class="pk-phase" style="color:#8E8E93">잔효');
  assert.equal(title('adderall_xr', 14), '<p class="pk-phase" style="color:#8E8E93">종료 구간');
  assert.equal(title('concerta', -1), '<p class="pk-phase">복용 전');
  assert.equal(title('concerta', null), '<p class="pk-phase">콘서타');
  // The dot has the same colour inline; the left/top part is unchanged.
  assert.ok(dot('concerta', 2)?.endsWith(`;background:${first}`));
  assert.ok(dot('concerta', 8)?.endsWith(`;background:${main}`));
  assert.ok(dot('concerta', 11)?.endsWith(`;background:${decline}`));
  assert.ok(dot('ritalin_la', 3)?.endsWith(`;background:${first}`));
  assert.ok(dot('concerta', 13)?.endsWith(';background:#8E8E93'), 'finished phase: the app grey');
  // Near the left edge the tag steps inside the chart, which now runs edge to edge.
  assert.ok(render({ lang: 'ko', drug: 'concerta', minutes: 480, nowHours: 0.1 }).chart.includes('pk-now-tag start'));
  const chart8 = render({ lang: 'ko', drug: 'concerta', minutes: 480, nowHours: 8 }).chart;
  assert.ok(/<span class="pk-now-tag[^"]*" style="[^"]*">/.test(chart8) && !/<span class="pk-now-tag[^"]*" style="[^"]*background/.test(chart8), 'the tag keeps no background');
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
  // No conditions row; a schematic profile says so once, on its formulation line.
  const sources = (drug: keyof typeof PROFILES) => render({ lang: 'ko', drug, minutes: 480, nowHours: null }).sources;
  for (const drug of Object.keys(PROFILES) as (keyof typeof PROFILES)[]) assert.ok(!sources(drug).includes('<dt>조건</dt>'), drug);
  assert.ok(sources('vyvanse').includes('실측이 아닌 개략 곡선'));
  assert.ok(!sources('concerta').includes('개략'));
  assert.ok(!sources('adderall_xr').includes('개략'));
  // Build time has no clock: the header shows the drug, not a phase, and no marker.
  const first = render({ lang: 'ko', drug: 'concerta', minutes: 480, nowHours: null });
  assert.ok(first.status.includes('콘서타'));
  assert.ok(!first.chart.includes('pk-now-dot'));
  // Beyond the chart the marker is hidden but the status still names the phase.
  const late = render({ lang: 'ko', drug: 'adderall_xr', minutes: 480, nowHours: 20 });
  assert.ok(!late.chart.includes('pk-now-dot'));
  assert.ok(late.status.includes('종료 구간'));
  assert.ok(render({ lang: 'ko', drug: 'vyvanse', minutes: 480, nowHours: 20 }).status.includes('잔효'));
});
