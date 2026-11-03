// Run: npm test. Clock text, phase naming and the rendered HTML of the timing tool.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_VERSION, PROFILES, type DrugId } from './pk.ts';
import {
  DEFAULT_MINUTES,
  DRUG_IDS,
  PHASE_COLORS,
  TIMING_LANGS,
  clockText,
  copy,
  describe,
  drugIn,
  drugsFor,
  hoursSinceDose,
  langsFor,
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

test('page titles, descriptions and headings follow the label wording', () => {
  assert.equal(copy.ko.title(copy.ko.names.concerta), '메틸페니데이트 OROS 서방정 혈중 농도 흐름 | Hyperfocus Lab');
  assert.equal(copy.en.title(copy.en.names.vyvanse), 'Lisdexamfetamine capsule: blood concentration over time | Hyperfocus Lab');
  assert.equal(copy.ja.title(copy.ja.names.concerta), 'メチルフェニデート OROS 徐放錠の血中濃度の推移 | Hyperfocus Lab');
  assert.equal(
    describe('ko', 'concerta'),
    '오전 8:00에 복용하면 메틸페니데이트 OROS 서방정의 설명서 기준 최고 농도 구간은 오후 2:00~6:00입니다. 복용 시각을 바꿔 참고 곡선을 볼 수 있습니다.',
  );
  assert.equal(
    describe('en', 'concerta'),
    "Taken at 8:00 AM, the label's peak concentration window for Methylphenidate OROS extended-release tablet is 2:00–6:00 PM. Change the dose time to see the reference curve.",
  );
  assert.equal(
    describe('ja', 'concerta'),
    '8:00に服用した場合、メチルフェニデート OROS 徐放錠の製品情報に基づく最高濃度の区間は14:00~18:00です。服用時刻を変えて参考曲線を確認できます。',
  );
  assert.deepEqual([copy.ko.h1, copy.en.h1, copy.ja.h1], ['설명서 기준 평균 혈중 농도 흐름', 'Mean blood concentration over time, per the label', '製品情報に基づく平均血中濃度の推移']);
  assert.deepEqual([copy.ko.drug, copy.en.drug, copy.ja.drug], ['성분·제형', 'Ingredient and form', '成分・剤形']);
  for (const lang of TIMING_LANGS) assert.ok(!/Peakly|피클리|ピークリー/.test(copy[lang].title('X')), `${lang} title names the app`);
});

test('each language has its own drug pages: ko only the drugs approved in Korea', () => {
  assert.deepEqual(drugsFor('ko'), ['concerta', 'medikinet', 'penid_ir']);
  assert.deepEqual(drugsFor('en'), ['concerta', 'medikinet', 'penid_ir', 'adderall_xr', 'vyvanse', 'ritalin_la']);
  assert.deepEqual(drugsFor('ja'), drugsFor('en'));
  assert.deepEqual(langsFor('concerta'), ['ko', 'en', 'ja']);
  assert.deepEqual(langsFor('penid_ir'), ['ko', 'en', 'ja']);
  assert.deepEqual(langsFor('vyvanse'), ['en', 'ja']);
  assert.deepEqual(langsFor('ritalin_la'), ['en', 'ja']);
  // A URL slug resolves only where the language has that page; catalog ids are not slugs.
  assert.equal(drugIn('ko', 'methylphenidate-oros'), 'concerta');
  assert.equal(drugIn('ko', 'methylphenidate-ir'), 'penid_ir');
  assert.equal(drugIn('ko', 'lisdexamfetamine'), null);
  assert.equal(drugIn('ko', 'amphetamine-salts-er'), null);
  assert.equal(drugIn('en', 'lisdexamfetamine'), 'vyvanse');
  assert.equal(drugIn('ja', 'methylphenidate-biphasic'), 'ritalin_la');
  for (const bad of ['concerta', 'ritalin_ir', 'constructor', '', null]) assert.equal(drugIn('en', bad), null, String(bad));
  assert.deepEqual(
    [copy.ko.names.concerta, copy.ko.names.medikinet, copy.ko.names.penid_ir],
    ['메틸페니데이트 OROS 서방정', '메틸페니데이트 속방·장용 펠렛 캡슐', '메틸페니데이트 속방정'],
  );
});

test('selectGroups lists the home market first and leaves Ritalin LA out', () => {
  // ko lists Korean drugs only, so there is no second group to show.
  assert.deepEqual(selectGroups('ko').map((g) => g.ids), [['concerta', 'medikinet', 'penid_ir'], []]);
  assert.deepEqual(selectGroups('ja').map((g) => g.ids), [
    ['concerta', 'vyvanse'],
    ['medikinet', 'penid_ir', 'adderall_xr'],
  ]);
  // The US sells methylphenidate immediate-release tablets, so that entry is home in en.
  assert.deepEqual(selectGroups('en').map((g) => g.ids), [
    ['concerta', 'penid_ir', 'adderall_xr', 'vyvanse'],
    ['medikinet'],
  ]);
  assert.equal(selectGroups('en')[1].label, 'Not sold in the US');
  // The Ritalin LA page itself still lists its own drug; ko has no such page.
  assert.ok(selectGroups('en', 'ritalin_la')[1].ids.includes('ritalin_la'));
  assert.deepEqual(selectGroups('ko', 'ritalin_la').flatMap((g) => g.ids), ['concerta', 'medikinet', 'penid_ir']);
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
    [0, '농도 상승 중', 0],
    [0.25, '농도 상승 중', 0],
    [0.5, '1차 구간', 0],
    [1.5, '1차 구간', 0],
    [1.51, '중간 구간', 0],
    [2, '중간 구간', 0],
    [3.74, '중간 구간', 0],
    [3.75, '2차 상승', 0],
    [5, '2차 상승', 0],
    [5.99, '2차 상승', 0],
    [6, '최고 농도 구간', 1],
    [8, '최고 농도 구간', 1],
    [10 - 1 / 3600, '최고 농도 구간', 1],
    // The app's own test: orange peak until 10 h, then the gray decline from exactly 10 h.
    [10, '농도 감소 구간', 2],
    [11, '농도 감소 구간', 2],
    [12, '농도 감소 구간', 2],
    [12.01, '후반 구간', null],
    [13, '후반 구간', null],
    [17.9, '후반 구간', null],
    [18, '후반 구간', null],
    [30, '후반 구간', null],
  ]);
  expectRows('concerta', [[2, 'Middle window', 0], [5, 'Second rise', 0], [8, 'Peak concentration window', 1], [11, 'Concentration decline window', 2], [13, 'Late phase', null], [0.25, 'Concentration rising', 0], [1, 'First window', 0]], 'en');
  expectRows('concerta', [[2, '中間区間', 0], [5, '二次上昇', 0], [8, '最高濃度の区間', 1], [11, '濃度減少の区間', 2], [13, '後半の区間', null], [1, '一次区間', 0]], 'ja');
});

test('phaseAt: Medikinet follows the app (windows 2–4, 5–6, release 6–7, valley midpoint 4.5)', () => {
  expectRows('medikinet', [
    [-0.5, '복용 전', null],
    [1, '농도 상승 중', 0],
    [2, '최대 농도', 0],
    [4, '최대 농도', 0],
    [4.2, '중간 구간', 0],
    [4.49, '중간 구간', 0],
    [4.5, '2차 상승', 0],
    [4.99, '2차 상승', 0],
    [5, '2차 최고 농도', 1],
    [6 - 1 / 3600, '2차 최고 농도', 1],
    [6, '농도 감소 구간', 2],
    [6.5, '농도 감소 구간', 2],
    [7, '농도 감소 구간', 2],
    [7.01, '후반 구간', null],
    [12, '후반 구간', null],
  ]);
  expectRows('medikinet', [[3, 'Peak concentration', 0], [5.5, 'Second peak concentration', 1], [6.5, 'Concentration decline window', 2], [8, 'Late phase', null]], 'en');
  expectRows('medikinet', [[3, '最大濃度', 0], [5.5, '二次最高濃度', 1], [4.2, '中間区間', 0]], 'ja');
});

test('phaseAt: Adderall XR follows the app (early 0.5–1.5, peak section 5.2–7.7, ends at 12)', () => {
  expectRows('adderall_xr', [
    [0, '농도 상승 중', 0],
    [0.49, '농도 상승 중', 0],
    [0.5, '1차 구간', 0],
    [1.5, '1차 구간', 0],
    [1.6, '농도 상승 중', 0],
    [5.19, '농도 상승 중', 0],
    [5.2, '최고 농도 구간', 1],
    [7, '최고 농도 구간', 1],
    [7.7, '최고 농도 구간', 1],
    [7.71, '농도 감소 중', 2],
    [10, '농도 감소 중', 2],
    [11.99, '농도 감소 중', 2],
    // No release-end phase and no "residual": after the last window the app says the final phase.
    [12, '농도 감소 구간', null],
    [20, '농도 감소 구간', null],
  ]);
  expectRows('adderall_xr', [[0.2, 'Concentration rising', 0], [1, 'First window', 0], [3, 'Concentration rising', 0], [6, 'Peak concentration window', 1], [9, 'Concentration falling', 2], [12, 'Concentration decline window', null]], 'en');
  expectRows('adderall_xr', [[0.2, '濃度上昇中', 0], [6, '最高濃度の区間', 1], [15, '濃度減少の区間', null]], 'ja');
});

test('phaseAt: Vyvanse follows the app (early 1–2, peak section 3.8–4.7, ending 12–14)', () => {
  expectRows('vyvanse', [
    [0.5, '농도 상승 중', 0],
    [1, '1차 구간', 0],
    [2, '1차 구간', 0],
    [2.5, '농도 상승 중', 0],
    [3.79, '농도 상승 중', 0],
    [3.8, '최고 농도 구간', 1],
    [4.7, '최고 농도 구간', 1],
    [5, '농도 감소 중', 2],
    [11.99, '농도 감소 중', 2],
    [12, '농도 감소 구간', 2],
    [14, '농도 감소 구간', 2],
    [14.01, '후반 구간', null],
    [20, '후반 구간', null],
  ]);
  expectRows('vyvanse', [[4, 'Peak concentration window', 1], [13, 'Concentration decline window', 2], [15, 'Late phase', null]], 'en');
  expectRows('vyvanse', [[13, '濃度減少の区間', 2], [15, '後半の区間', null]], 'ja');
});

test('phaseAt: Penid and Ritalin share the short-profile windows (0.25–0.75, 1.5–2.5, 3–4)', () => {
  for (const drug of ['penid_ir', 'ritalin_ir'] as const) {
    expectRows(drug, [
      [0.1, '농도 상승 중', 0],
      [0.25, '1차 구간', 0],
      [0.75, '1차 구간', 0],
      [1, '농도 상승 중', 0],
      [1.5, '최고 농도 구간', 1],
      [2.5, '최고 농도 구간', 1],
      [2.8, '농도 감소 중', 2],
      [3, '농도 감소 구간', 2],
      [4, '농도 감소 구간', 2],
      [4.5, '후반 구간', null],
      [9, '후반 구간', null],
    ]);
  }
});

test('phaseAt: Ritalin LA has a dip between its two peaks (1.5–2.5, 5–6, ending 7–8)', () => {
  expectRows('ritalin_la', [
    [1, '농도 상승 중', 0],
    [1.5, '1차 최고 농도', 0],
    [2.5, '1차 최고 농도', 0],
    [3, '중간 구간', 0],
    [4.99, '중간 구간', 0],
    [5, '2차 최고 농도', 1],
    [6, '2차 최고 농도', 1],
    [6.5, '농도 감소 중', 2],
    [7, '농도 감소 구간', 2],
    [8, '농도 감소 구간', 2],
    [9, '후반 구간', null],
  ]);
  expectRows('ritalin_la', [[2, 'First peak concentration', 0], [4, 'Middle window', 0], [5.5, 'Second peak concentration', 1], [7.5, 'Concentration decline window', 2], [10, 'Late phase', null]], 'en');
  expectRows('ritalin_la', [[2, '一次最高濃度', 0], [4, '中間区間', 0], [5.5, '二次最高濃度', 1]], 'ja');
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
  const title = (drug: (typeof DRUG_IDS)[number], nowHours: number | null) => render({ lang: 'ko', drug, minutes: 480, nowHours }).status.split('</p>')[0];
  const dot = (drug: (typeof DRUG_IDS)[number], nowHours: number) => /<span class="pk-now-dot" style="([^"]*)">/.exec(render({ lang: 'ko', drug, minutes: 480, nowHours }).chart)?.[1];
  const [first, main, decline] = PHASE_COLORS;
  // Concerta: valley and rising share the first colour, the main peak is the second, the decline the third.
  assert.ok(title('concerta', 0.25).includes(`style="color:${first}">농도 상승 중`));
  assert.ok(title('concerta', 2).includes(`style="color:${first}">중간 구간`));
  assert.ok(title('concerta', 5).includes(`style="color:${first}">2차 상승`));
  assert.ok(title('concerta', 8).includes(`style="color:${main}">최고 농도 구간`));
  assert.ok(title('concerta', 11).includes(`style="color:${decline}">농도 감소 구간`));
  // Finished: the app's grey (DS.Palette.Phase.after). Before the dose and at build time: no colour.
  assert.equal(title('concerta', 13), '<p class="pk-phase" style="color:#8E8E93">후반 구간');
  assert.equal(title('adderall_xr', 14), '<p class="pk-phase" style="color:#8E8E93">농도 감소 구간');
  assert.equal(title('concerta', -1), '<p class="pk-phase">복용 전');
  assert.equal(title('concerta', null), '<p class="pk-phase">메틸페니데이트 OROS 서방정');
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
  const legend = (drug: (typeof DRUG_IDS)[number]) => render({ lang: 'ko', drug, minutes: 480, nowHours: null }).legend;
  assert.ok(legend('adderall_xr').includes('오후 1:12~3:42'));
  assert.ok(legend('adderall_xr').includes('농도 상승'));
  assert.ok(legend('vyvanse').includes('오전 11:48~오후 12:42'));
  assert.ok(legend('concerta').includes('최대농도'));
  assert.ok(describe('ko', 'adderall_xr').includes('오후 1:12~3:42'));
});

test('render produces the chart, legend and sources for every page', () => {
  for (const lang of TIMING_LANGS) {
    for (const drug of drugsFor(lang)) {
      const r = render({ lang, drug, minutes: 480, nowHours: 7 });
      assert.ok(r.chart.startsWith('<svg'), `${lang} ${drug} chart`);
      assert.ok(!r.chart.includes('NaN'), `${lang} ${drug} chart has NaN`);
      assert.ok(r.chart.includes('pk-now-dot'), `${lang} ${drug} marker`);
      assert.equal((r.legend.match(/pk-legend-item/g) ?? []).length, 3, `${lang} ${drug} legend`);
      assert.equal((r.axis.match(/pk-tick/g) ?? []).length, PROFILES[drug].chartEndHours / 4 + 1, `${lang} ${drug} axis`);
      assert.ok(!r.sources.includes(`<dd>${PROFILES[drug].referenceDoseMg} mg</dd>`), `${lang} ${drug} shows the reference dose row`);
      // The links are the language's own list: a label in the reader's language and an https URL each.
      const links = copy[lang].sources[drug];
      assert.ok(links.length > 0, `${lang} ${drug} has no sources`);
      for (const s of links) {
        assert.ok(s.label.length > 0, `${lang} ${drug} empty label`);
        assert.match(s.url, /^https:\/\//, `${lang} ${drug} url`);
        // Attribute values are escaped, so a URL with a query shows up with &amp;.
        assert.ok(r.sources.includes(s.url.replace(/&/g, '&amp;')), `${lang} ${drug} source ${s.url}`);
        assert.ok(r.sources.includes(`${s.label} ↗</a>`), `${lang} ${drug} label ${s.label}`);
      }
      assert.equal((r.sources.match(/<a /g) ?? []).length, links.length, `${lang} ${drug} link count`);
      for (const s of PROFILES[drug].sources) assert.ok(!r.sources.includes(s.title), `${lang} ${drug} leaks "${s.title}"`);
      assert.ok(!r.sources.includes(MODEL_VERSION), `${lang} ${drug} shows the model version`);
      assert.ok(!/Tmax|Peakly reference|기존 앱|既存アプリ/.test(r.sources), `${lang} ${drug} internal wording`);
    }
  }
  // en and ja link the catalog's sources; ko has its own list so it can move to MFDS pages.
  for (const lang of ['en', 'ja'] as const) {
    for (const drug of DRUG_IDS) assert.deepEqual(copy[lang].sources[drug].map((s) => s.url), PROFILES[drug].sources.map((s) => s.url), `${lang} ${drug}`);
  }
  // No conditions row. The grey note says what the curve is measured as and whether it is
  // schematic; a name that already says it all has no note.
  const sources = (drug: (typeof DRUG_IDS)[number]) => render({ lang: 'ko', drug, minutes: 480, nowHours: null }).sources;
  for (const drug of DRUG_IDS) assert.ok(!sources(drug).includes('<dt>조건</dt>'), drug);
  assert.ok(sources('vyvanse').includes('<span class="muted">활성체 d-암페타민 기준 · 실측이 아닌 개략 곡선</span>'));
  assert.ok(sources('adderall_xr').includes('<span class="muted">d-암페타민 기준</span>'));
  assert.ok(sources('penid_ir').includes('<span class="muted">실측이 아닌 개략 곡선</span>'));
  assert.equal(sources('concerta').split('</p>')[0], '<p class="pk-drug-name">메틸페니데이트 OROS 서방정');
  assert.equal(sources('medikinet').split('</p>')[0], '<p class="pk-drug-name">메틸페니데이트 속방·장용 펠렛 캡슐');
  // Korean pages cite the domestic approval first, then the label the times come from.
  for (const drug of ['concerta', 'medikinet', 'penid_ir'] as const) {
    const links = [...sources(drug).matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
    assert.ok(links[0][1].startsWith('https://nedrug.mfds.go.kr/'), drug);
    assert.equal(links[0][2], '국내 허가사항 (식약처 의약품안전나라) ↗', drug);
    assert.ok(links.length >= 2 && !links[1][1].includes('mfds'), `${drug} keeps a label with the times`);
  }
  assert.ok(!sources('penid_ir').includes('환인'));
  // Build time has no clock: the header shows the drug, not a phase, and no marker.
  const first = render({ lang: 'ko', drug: 'concerta', minutes: 480, nowHours: null });
  assert.ok(first.status.includes('메틸페니데이트 OROS 서방정'));
  assert.ok(!first.chart.includes('pk-now-dot'));
  // Beyond the chart the marker is hidden but the status still names the phase.
  const late = render({ lang: 'ko', drug: 'adderall_xr', minutes: 480, nowHours: 20 });
  assert.ok(!late.chart.includes('pk-now-dot'));
  assert.ok(late.status.includes('농도 감소 구간'));
  assert.ok(render({ lang: 'ko', drug: 'vyvanse', minutes: 480, nowHours: 20 }).status.includes('후반 구간'));
});

// Product names and effect words the page must never show (the label's concentration data only).
const PRODUCT_NAMES = [
  '콘서타', '메디키넷', '페니드', '리탈린', '애더럴', '바이반스',
  'Concerta', 'Medikinet', 'Penid', 'Ritalin', 'Adderall', 'Vyvanse',
  'コンサータ', 'メディキネット', 'リタリン', 'アデロール', 'ビバンセ',
];
const EFFECT_WORDS = ['약효', '효과', '체감', '잔효', '작용', '집중', 'effect', 'onset', 'wearing off', 'focus', '作用', '体感', '効果', '残存', 'ADHD'];
// Latin words match at a word start (so "effects" counts but the company name "Hyperfocus" does
// not); Korean and Japanese words anywhere.
const BANNED = [...PRODUCT_NAMES, ...EFFECT_WORDS].map((word) => ({
  word,
  re: /^[A-Za-z ]+$/.test(word) ? new RegExp(`(^|[^a-z])${word}`, 'i') : new RegExp(word),
}));
function assertClean(text: string, where: string) {
  for (const { word, re } of BANNED) assert.ok(!re.test(text), `${where} has "${word}": ${text}`);
}

/// Every string in the copy, with each function called on sample arguments.
function strings(value: unknown, path: string, out: [string, string][]) {
  if (typeof value === 'string') out.push([path, value]);
  else if (typeof value === 'function') out.push([path, String(value('X', 'Y', 'Z'))]);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) strings(v, `${path}.${k}`, out);
  return out;
}

test('the copy names no product and no effect, in every language', () => {
  for (const lang of TIMING_LANGS) {
    const all = strings(copy[lang], lang, []);
    assert.ok(all.length > 50, `${lang} walked too little`);
    for (const [path, text] of all) assertClean(text, path);
  }
});

test('rendered pages name no product and no effect, at every hour', () => {
  for (const lang of TIMING_LANGS) {
    for (const drug of drugsFor(lang)) {
      assertClean(describe(lang, drug), `${lang} ${drug} description`);
      assertClean(copy[lang].title(copy[lang].names[drug]), `${lang} ${drug} title`);
      for (const nowHours of [null, -1, ...Array.from({ length: 81 }, (_, i) => i / 4)]) {
        const r = render({ lang, drug, minutes: DEFAULT_MINUTES, nowHours });
        // URLs are checked apart: they are the regulator's and publisher's own addresses.
        const visible = `${r.status} ${r.legend} ${r.sources.replace(/href="[^"]*"/g, '')}`;
        assertClean(visible, `${lang} ${drug} @${nowHours}`);
      }
    }
  }
  // The phase words of every profile, the merged Ritalin IR included.
  for (const lang of TIMING_LANGS) {
    for (const id of Object.keys(PROFILES) as DrugId[]) {
      for (let h = 0; h <= 30; h += 0.05) assertClean(phaseAt(lang, PROFILES[id], h).text, `${lang} ${id} phase @${h}`);
    }
  }
  // Source URLs carry no product name either.
  for (const lang of TIMING_LANGS) {
    for (const drug of DRUG_IDS) for (const s of copy[lang].sources[drug]) for (const name of PRODUCT_NAMES) assert.ok(!s.url.toLowerCase().includes(name.toLowerCase()), `${lang} ${drug} url ${s.url}`);
  }
});
