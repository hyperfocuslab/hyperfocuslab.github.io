// The "effect timing" tool: copy, clock maths and the HTML/SVG the page shows.
// Runs at build (first paint of the default state) and in the browser (every change),
// so everything here is plain TypeScript with no DOM access.
// The explicit extension lets Node run this module directly (tests, the share-card script).
import { DRUG_IDS, MODEL_VERSION, PROFILES, type DrugId, type Evidence, type Profile, type SectionKind } from './pk.ts';

export type TimingLang = 'ko' | 'en' | 'ja';
export const TIMING_LANGS: TimingLang[] = ['ko', 'en', 'ja'];
export const DEFAULT_DRUG: DrugId = 'concerta';
export const DEFAULT_MINUTES = 8 * 60;
export { DRUG_IDS, MODEL_VERSION, PROFILES };

// Phase colours of the app's dark chart (PKPhasePalette, dark): first window, main peak, decline.
export const PHASE_COLORS = ['#6CCBFF', '#FF7A6B', '#A99BFF'] as const;
// Clock tick every four hours; the app caps the chart at 16 h after the dose.
const TICK_HOURS = 4;

type Names = Record<DrugId, string>;
type Copy = {
  title: (drug: string) => string;
  description: (drug: string, dose: string, peak: string) => string;
  label: string;
  h1: string;
  lead: string;
  drug: string;
  time: string;
  copy: string;
  copied: string;
  now: string;
  names: Names;
  formulations: Names;
  section: Record<SectionKind, string>;
  ritalinLA: [string, string];
  window: (label: string) => string;
  beforeDose: string;
  rising: string;
  middle: string;
  wearingOff: string;
  residual: string;
  outside: string;
  taken: (drug: string, time: string) => string;
  elapsed: (h: number, m: number) => string;
  untilDose: (h: number, m: number) => string;
  summary: (time: string, peakLabel: string, peakRange: string, declineLabel: string, declineRange: string, end: number) => string;
  nextDay: string;
  axis: (hour24: number) => string;
  sourcesTitle: string;
  rows: { timing: string; evidence: string; dose: string; conditions: string; links: string };
  evidence: Record<Evidence, string>;
  timing: Names;
  /** Empty when the profile needs no extra note; the row is then left out. */
  conditions: Names;
  /** One label per catalog source, in catalog order, in the reader's language. */
  sourceLabels: Record<DrugId, string[]>;
  notice: string[];
  cta: { title: string; body: string };
};

const FORMULATION_EN: Names = Object.fromEntries(DRUG_IDS.map((id) => [id, PROFILES[id].formulation])) as Names;

export const copy: Record<TimingLang, Copy> = {
  ko: {
    title: (drug) => `${drug} 약효 흐름 | 피클리`,
    description: (drug, dose, peak) => `${dose}에 ${drug}를 먹으면 최고 농도 구간은 ${peak}로 예상됩니다. 약과 복용 시각을 바꿔 가며 하루 약효 흐름을 참고 곡선으로 볼 수 있습니다.`,
    label: '피클리 · 약효 흐름',
    h1: 'ADHD 약 약효 흐름',
    lead: '약과 복용 시각을 고르면 복용 후 16시간의 약효 흐름을 참고 곡선으로 그립니다. 피클리 앱의 약효 차트와 같은 곡선입니다.',
    drug: '약',
    time: '복용 시각',
    copy: '링크 복사',
    copied: '복사됨',
    now: '지금',
    names: { concerta: '콘서타', medikinet: '메디키넷', penid_ir: '페니드', ritalin_ir: '리탈린', ritalin_la: '리탈린 LA', adderall_xr: '애더럴 XR', vyvanse: '바이반스' },
    formulations: {
      concerta: '메틸페니데이트 OROS 서방정',
      medikinet: '메틸페니데이트 속방 50% · 서방 50%',
      penid_ir: '메틸페니데이트 속방정',
      ritalin_ir: '메틸페니데이트 속방정',
      ritalin_la: '메틸페니데이트 속방 50% · 장용 지연방출 비드 50%',
      adderall_xr: '혼합 암페타민염 서방 캡슐 (d-암페타민 기준)',
      vyvanse: '리스덱스암페타민 (활성체 d-암페타민 기준)',
    },
    section: { initial: '초기', peak: '최고 농도', secondary: '2차 농도', decline: '감소' },
    ritalinLA: ['1차 피크', '2차 피크'],
    window: (label) => `${label} 구간`,
    beforeDose: '복용 전',
    rising: '상승 중',
    middle: '중간 구간',
    wearingOff: '감소 중',
    residual: '잔효',
    outside: '표시 범위 밖',
    taken: (drug, time) => `${drug} · ${time} 복용`,
    elapsed: (h, m) => `${h}시간 ${m}분 지남`,
    untilDose: (h, m) => `복용까지 ${h}시간 ${m}분`,
    summary: (time, peakLabel, peakRange, declineLabel, declineRange, end) =>
      `${time}에 먹으면 ${peakLabel} 구간은 ${peakRange}, ${declineLabel} 구간은 ${declineRange}로 예상됩니다. 그래프는 복용 후 ${end}시간까지 표시합니다.`,
    nextDay: '다음 날 ',
    axis: (h) => `${h}시`,
    sourcesTitle: '출처와 기준',
    rows: { timing: '기준 시점', evidence: '곡선 종류', dose: '기준 용량', conditions: '조건', links: '출처' },
    evidence: {
      legacyReference: '제품 설명서의 평균값을 바탕으로 한 참고 곡선',
      digitized: '제품 설명서의 평균 농도 그래프를 옮긴 참고 곡선',
      schematic: '제품 설명서의 수치로 만든 개략 곡선 (실제 측정 곡선 아님)',
    },
    timing: {
      concerta: '설명서 기준 평균 최고 농도: 복용 후 6~10시간',
      medikinet: '설명서 기준(아침 식후) 최고 농도: 복용 후 2~4시간. 그 뒤 구간은 발표된 평균 곡선을 참고한 추정',
      penid_ir: '성분(메틸페니데이트 속방) 설명서 기준 평균 최고 농도: 복용 후 약 2시간 (1~2시간)',
      ritalin_ir: '설명서 기준 평균 최고 농도: 복용 후 약 2시간 (1~2시간)',
      ritalin_la: '설명서 기준 2차 최고 농도: 복용 후 5.5시간 (4.3~6.5시간, 소아 평균 6.6시간)',
      adderall_xr: '설명서 기준(성인) 평균 최고 농도: 복용 후 5.2~7.7시간',
      vyvanse: '설명서 기준 평균 최고 농도: 복용 후 3.8~4.7시간',
    },
    conditions: {
      concerta: '',
      medikinet: '아침 식후 복용 기준의 곡선입니다.',
      penid_ir: '메틸페니데이트 속방정의 일반적인 곡선입니다. 페니드만의 측정값은 아닙니다.',
      ritalin_ir: '복용 2시간 뒤 최고, 이후 2시간마다 절반으로 줄어드는 것으로 그린 곡선입니다.',
      ritalin_la: '성인 남성 8명이 20mg을 1회 복용한 설명서 평균값(2시간·3.6시간·5.5시간)으로 그렸습니다. 8시간 이후는 3.3시간마다 절반으로 줄어드는 것으로 계산했습니다. 소아는 2차 최고 농도가 더 늦습니다(평균 6.6시간).',
      adderall_xr: '식후 20mg을 1회 복용한 성인의 평균 곡선(설명서 그림 1)입니다.',
      vyvanse: '설명서의 최고 농도 시점과 성인 반감기로 그린 곡선입니다. 실제 측정 곡선이 아닙니다.',
    },
    sourceLabels: {
      concerta: ['콘서타 제품 설명서 (FDA)'],
      medikinet: ['메디키넷 XL 제품 특성 요약 (영국 emc)'],
      penid_ir: ['페니드 제품 정보 (환인제약)', '리탈린 제품 설명서 (FDA, 성분 참고)', '리탈린 10mg 제품 특성 요약 (영국 emc, 반감기 참고)'],
      ritalin_ir: ['리탈린 제품 설명서 (FDA)', '리탈린 10mg 제품 특성 요약 (영국 emc)'],
      ritalin_la: ['리탈린 LA 제품 설명서 (FDA, 2025년 9월 개정)', '리탈린 LA 제품 설명서 (FDA, 2019)'],
      adderall_xr: ['애더럴 XR 제품 설명서 (FDA, 2023)'],
      vyvanse: ['바이반스 제품 설명서 (FDA, 2025)'],
    },
    notice: [
      '정규화된 참고 곡선입니다. 개인 측정값이 아니며, 농도 피크와 체감 약효 피크는 서로 다를 수 있습니다. 표시 마지막 시각은 약효 종료 시각이 아닙니다.',
      '이 페이지의 약물 정보는 이해를 돕기 위한 참고용 요약이며 의학적 진단이나 치료, 처방을 대신하지 않습니다. 복용 시각이나 용량 변경은 의사 또는 약사와 상의하세요.',
    ],
    cta: {
      title: '내 복용 기록으로 매일 보기',
      body: '피클리에 복용 시각을 기록하면 이 곡선이 매일 그려지고, 상승·피크·감소 때 알림을 받습니다. 구간 시간은 내 몸에 맞게 조정할 수 있습니다.',
    },
  },
  en: {
    title: (drug) => `${drug} effect timing | Peakly`,
    description: (drug, dose, peak) => `Taken at ${dose}, ${drug} is expected to be in its peak window ${peak}. Change the medication and dose time to see the day's effect curve for reference.`,
    label: 'Peakly · Effect timing',
    h1: 'ADHD medication effect timing',
    lead: 'Pick a medication and a dose time to draw the 16 hours after the dose as a reference curve. It is the same curve as the effect chart in the Peakly app.',
    drug: 'Medication',
    time: 'Dose time',
    copy: 'Copy link',
    copied: 'Copied',
    now: 'Now',
    names: { concerta: 'Concerta', medikinet: 'Medikinet Retard', penid_ir: 'Penid', ritalin_ir: 'Ritalin', ritalin_la: 'Ritalin LA', adderall_xr: 'Adderall XR', vyvanse: 'Vyvanse' },
    formulations: FORMULATION_EN,
    section: { initial: 'Early', peak: 'Peak', secondary: 'Second window', decline: 'Decline' },
    ritalinLA: ['First peak', 'Second peak'],
    window: (label) => `${label} window`,
    beforeDose: 'Before the dose',
    rising: 'Rising',
    middle: 'Middle window',
    wearingOff: 'Wearing off',
    residual: 'Residual effect',
    outside: 'Outside the displayed range',
    taken: (drug, time) => `${drug} · taken ${time}`,
    elapsed: (h, m) => `${h} h ${m} min since`,
    untilDose: (h, m) => `${h} h ${m} min until the dose`,
    summary: (time, peakLabel, peakRange, declineLabel, declineRange, end) =>
      `Taken at ${time}, the ${peakLabel.toLowerCase()} window is expected ${peakRange} and the ${declineLabel.toLowerCase()} window ${declineRange}. The chart shows the first ${end} hours after the dose.`,
    nextDay: ' next day',
    axis: (h) => (h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`),
    sourcesTitle: 'Sources and basis',
    rows: { timing: 'Reference timing', evidence: 'Curve type', dose: 'Reference dose', conditions: 'Conditions', links: 'Sources' },
    evidence: {
      legacyReference: "Reference curve based on the label's mean values",
      digitized: "Reference curve traced from the label's mean concentration figure",
      schematic: "Schematic curve built from the label's figures (not a measured curve)",
    },
    timing: {
      concerta: 'Label mean peak concentration: 6–10 h after the dose',
      medikinet: 'Label peak (after breakfast): 2–4 h after the dose. The later part of the curve is an estimate guided by published mean curves',
      penid_ir: 'Ingredient (methylphenidate IR) label mean peak: about 2 h after the dose (1–2 h)',
      ritalin_ir: 'Label mean peak concentration: about 2 h after the dose (1–2 h)',
      ritalin_la: 'Label second peak: 5.5 h after the dose (4.3–6.5 h; children mean 6.6 h)',
      adderall_xr: 'Label mean peak concentration (adults): 5.2–7.7 h after the dose',
      vyvanse: 'Label mean peak concentration: 3.8–4.7 h after the dose',
    },
    conditions: {
      concerta: '',
      medikinet: 'Curve for a dose taken after breakfast.',
      penid_ir: 'A general methylphenidate IR curve, not measurements of Penid itself.',
      ritalin_ir: 'Drawn with a peak at 2 h and a halving every 2 h after it.',
      ritalin_la: "Drawn from the label's mean values for eight adult men after a single 20 mg dose (2 h, 3.6 h, 5.5 h); from 8 h on it halves every 3.3 h. Children reach the second peak later (mean 6.6 h).",
      adderall_xr: 'Mean curve of adults after a single 20 mg dose with food (label Figure 1).',
      vyvanse: "Drawn from the label's peak timing and adult half-life, not from measured concentrations.",
    },
    sourceLabels: {
      concerta: ['Concerta prescribing information (FDA)'],
      medikinet: ['Medikinet XL summary of product characteristics (UK emc)'],
      penid_ir: ['Penid product information (Whanin Pharm)', 'Ritalin prescribing information (FDA, ingredient reference)', 'Ritalin 10 mg summary of product characteristics (UK emc, half-life)'],
      ritalin_ir: ['Ritalin prescribing information (FDA)', 'Ritalin 10 mg summary of product characteristics (UK emc)'],
      ritalin_la: ['Ritalin LA prescribing information (FDA, rev. Sept 2025)', 'Ritalin LA prescribing information (FDA, 2019)'],
      adderall_xr: ['Adderall XR prescribing information (FDA, 2023)'],
      vyvanse: ['Vyvanse prescribing information (FDA, 2025)'],
    },
    notice: [
      'This is a normalized reference curve, not a personal measurement. Concentration and felt effect can peak at different times. The last displayed time is not the end of the effect.',
      'Medication information on this page is a general reference summary and does not replace medical diagnosis, treatment, or prescribing advice. Talk to your doctor or pharmacist before changing a dose or its timing.',
    ],
    cta: {
      title: 'See it every day with your own doses',
      body: 'Log your dose time in Peakly and this curve is drawn every day, with notifications as it rises, peaks, and wears off. You can adjust each window to fit how your body responds.',
    },
  },
  ja: {
    title: (drug) => `${drug}の作用の流れ | ピークリー`,
    description: (drug, dose, peak) => `${dose}に${drug}を服用すると、最高濃度の区間は${peak}と予想されます。薬と服用時刻を変えて、一日の作用の流れを参考曲線で確認できます。`,
    label: 'ピークリー · 作用の流れ',
    h1: 'ADHD治療薬の作用の流れ',
    lead: '薬と服用時刻を選ぶと、服用後16時間の作用の流れを参考曲線で描きます。ピークリーアプリの作用チャートと同じ曲線です。',
    drug: '薬',
    time: '服用時刻',
    copy: 'リンクをコピー',
    copied: 'コピーしました',
    now: '現在',
    names: { concerta: 'コンサータ', medikinet: 'メディキネット', penid_ir: 'Penid', ritalin_ir: 'リタリン', ritalin_la: 'リタリン LA', adderall_xr: 'アデロール XR', vyvanse: 'ビバンセ' },
    formulations: {
      concerta: 'メチルフェニデート OROS 徐放錠',
      medikinet: 'メチルフェニデート 速放50% · 徐放50%',
      penid_ir: 'メチルフェニデート 速放錠',
      ritalin_ir: 'メチルフェニデート 速放錠',
      ritalin_la: 'メチルフェニデート 速放50% · 腸溶性遅延放出ビーズ50%',
      adderall_xr: '混合アンフェタミン塩 徐放カプセル（d-アンフェタミン基準）',
      vyvanse: 'リスデキサンフェタミン（活性体 d-アンフェタミン基準）',
    },
    section: { initial: '初期', peak: '最高濃度', secondary: '第2濃度帯', decline: '減少' },
    ritalinLA: ['1回目のピーク', '2回目のピーク'],
    window: (label) => `${label}の区間`,
    beforeDose: '服用前',
    rising: '上昇中',
    middle: '中間区間',
    wearingOff: '減少中',
    residual: '残存効果',
    outside: '表示範囲外',
    taken: (drug, time) => `${drug} · ${time} 服用`,
    elapsed: (h, m) => `${h}時間${m}分経過`,
    untilDose: (h, m) => `服用まで${h}時間${m}分`,
    summary: (time, peakLabel, peakRange, declineLabel, declineRange, end) =>
      `${time}に服用すると、${peakLabel}の区間は${peakRange}、${declineLabel}の区間は${declineRange}と予想されます。グラフは服用後${end}時間まで表示します。`,
    nextDay: '翌日 ',
    axis: (h) => `${h}時`,
    sourcesTitle: '出典と基準',
    rows: { timing: '基準時点', evidence: '曲線の種類', dose: '基準用量', conditions: '条件', links: '出典' },
    evidence: {
      legacyReference: '添付文書の平均値をもとにした参考曲線',
      digitized: '添付文書の平均濃度グラフを写した参考曲線',
      schematic: '添付文書の数値から作った概略曲線（実測の曲線ではありません）',
    },
    timing: {
      concerta: '添付文書の平均最高濃度: 服用後6~10時間',
      medikinet: '添付文書の最高濃度（朝食後）: 服用後2~4時間。その後の曲線は公表された平均曲線をもとにした推定',
      penid_ir: '成分（メチルフェニデート速放）の添付文書の平均最高濃度: 服用後約2時間（1~2時間）',
      ritalin_ir: '添付文書の平均最高濃度: 服用後約2時間（1~2時間）',
      ritalin_la: '添付文書の2回目の最高濃度: 服用後5.5時間（4.3~6.5時間、小児平均6.6時間）',
      adderall_xr: '添付文書の平均最高濃度（成人）: 服用後5.2~7.7時間',
      vyvanse: '添付文書の平均最高濃度: 服用後3.8~4.7時間',
    },
    conditions: {
      concerta: '',
      medikinet: '朝食後に服用した場合の曲線です。',
      penid_ir: 'メチルフェニデート速放錠の一般的な曲線で、Penid固有の測定値ではありません。',
      ritalin_ir: '服用2時間後に最高、その後2時間ごとに半分になるものとして描いた曲線です。',
      ritalin_la: '成人男性8人が20mgを単回服用した添付文書の平均値（2時間・3.6時間・5.5時間）から描きました。8時間以降は3.3時間ごとに半分になるものとして計算しています。小児は2回目の最高濃度がより遅くなります（平均6.6時間）。',
      adderall_xr: '食後に20mgを単回服用した成人の平均曲線（添付文書 図1）です。',
      vyvanse: '添付文書の最高濃度の時点と成人の半減期から描いた曲線で、実測の曲線ではありません。',
    },
    sourceLabels: {
      concerta: ['コンサータ 添付文書（FDA）'],
      medikinet: ['メディキネット XL 製品特性概要（英国 emc）'],
      penid_ir: ['Penid 製品情報（Whanin製薬）', 'リタリン 添付文書（FDA、成分の参考）', 'リタリン 10mg 製品特性概要（英国 emc、半減期の参考）'],
      ritalin_ir: ['リタリン 添付文書（FDA）', 'リタリン 10mg 製品特性概要（英国 emc）'],
      ritalin_la: ['リタリン LA 添付文書（FDA、2025年9月改訂）', 'リタリン LA 添付文書（FDA、2019）'],
      adderall_xr: ['アデロール XR 添付文書（FDA、2023）'],
      vyvanse: ['ビバンセ 添付文書（FDA、2025）'],
    },
    notice: [
      '正規化した参考曲線で、個人の測定値ではありません。濃度のピークと体感のピークは異なる場合があります。表示の最後の時刻は作用の終了時刻ではありません。',
      'このページの薬の情報は理解を助けるための参考用の要約であり、医学的な診断、治療、処方に代わるものではありません。服用時刻や用量の変更は医師または薬剤師に相談してください。',
    ],
    cta: {
      title: '自分の服薬記録で毎日見る',
      body: 'ピークリーに服用時刻を記録すると、この曲線が毎日描かれ、上昇・ピーク・減少のときに通知が届きます。区間の時間は自分の体に合わせて調整できます。',
    },
  },
};

// ── Clock helpers ───────────────────────────────────────────────

export function parseMinutes(value: string | null | undefined): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value ?? '');
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function toHHMM(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

interface Clock {
  day: number;
  hour: number;
  minute: number;
}
function clockAt(doseMinutes: number, offsetHours: number): Clock {
  const total = doseMinutes + Math.round(offsetHours * 60);
  return { day: Math.floor(total / 1440), hour: Math.floor((total % 1440) / 60), minute: total % 60 };
}

function hhmm12(c: Clock): string {
  return `${c.hour % 12 || 12}:${String(c.minute).padStart(2, '0')}`;
}
function hhmm24(c: Clock): string {
  return `${c.hour}:${String(c.minute).padStart(2, '0')}`;
}

/// A single clock time in the app's own format per language (ko "오전 8:00", en "8:00 AM", ja "8:00").
export function clockText(lang: TimingLang, doseMinutes: number, offsetHours = 0): string {
  const c = clockAt(doseMinutes, offsetHours);
  const t = copy[lang];
  const next = c.day > 0 ? t.nextDay : '';
  if (lang === 'ko') return `${next}${c.hour < 12 ? '오전' : '오후'} ${hhmm12(c)}`;
  if (lang === 'en') return `${hhmm12(c)} ${c.hour < 12 ? 'AM' : 'PM'}${next}`;
  return `${next}${hhmm24(c)}`;
}

/// "오전 9:00~10:00": the second time repeats the period or the day only when it changes.
export function rangeText(lang: TimingLang, doseMinutes: number, start: number, end: number): string {
  const a = clockAt(doseMinutes, start);
  const b = clockAt(doseMinutes, end);
  const t = copy[lang];
  const sameDay = a.day === b.day;
  const samePeriod = sameDay && a.hour < 12 === b.hour < 12;
  const first = clockText(lang, doseMinutes, start);
  if (lang === 'ko') {
    const second = `${sameDay ? '' : t.nextDay}${samePeriod ? '' : `${b.hour < 12 ? '오전' : '오후'} `}${hhmm12(b)}`;
    return `${first}~${second}`;
  }
  if (lang === 'en') {
    const ampm = (c: Clock) => (c.hour < 12 ? 'AM' : 'PM');
    const suffix = b.day > 0 ? t.nextDay : '';
    if (samePeriod) return `${hhmm12(a)}–${hhmm12(b)} ${ampm(b)}${suffix}`;
    const head = sameDay ? `${hhmm12(a)} ${ampm(a)}` : first;
    return `${head} – ${hhmm12(b)} ${ampm(b)}${suffix}`;
  }
  return `${first}~${sameDay ? hhmm24(b) : clockText(lang, doseMinutes, end)}`;
}

// ── Phases ──────────────────────────────────────────────────────

export function windowLabels(lang: TimingLang, profile: Profile): [string, string, string] {
  const t = copy[lang];
  if (profile.id === 'ritalin_la') return [t.ritalinLA[0], t.ritalinLA[1], t.section.decline];
  return profile.sectionKinds.map((k) => t.section[k]) as [string, string, string];
}

export interface PhaseState {
  text: string;
  /** Index of the window the elapsed time falls in, or -1 between windows. */
  windowIndex: number;
}

const EPS = 1e-9;
export function phaseAt(lang: TimingLang, profile: Profile, elapsedHours: number): PhaseState {
  const t = copy[lang];
  const labels = windowLabels(lang, profile);
  if (elapsedHours < 0) return { text: t.beforeDose, windowIndex: -1 };
  if (elapsedHours > profile.displayEndHours + EPS) return { text: t.outside, windowIndex: -1 };
  const w = profile.windows;
  for (let i = 0; i < 3; i++) {
    if (elapsedHours >= w[i].start - EPS && elapsedHours <= w[i].end + EPS) return { text: t.window(labels[i]), windowIndex: i };
  }
  if (elapsedHours < w[0].start) return { text: t.rising, windowIndex: -1 };
  // After a first window that is itself a peak (Medikinet, Ritalin LA) the gap is a dip, not a rise.
  if (elapsedHours < w[1].start) return { text: profile.sectionKinds[0] === 'peak' || profile.id === 'ritalin_la' ? t.middle : t.rising, windowIndex: -1 };
  if (elapsedHours < w[2].start) return { text: t.wearingOff, windowIndex: -1 };
  return { text: t.residual, windowIndex: -1 };
}

// ── Rendering ───────────────────────────────────────────────────

export interface RenderInput {
  lang: TimingLang;
  drug: DrugId;
  /** Dose time as minutes after midnight. */
  minutes: number;
  /** Current time as minutes after the dose; omitted at build time. */
  nowHours?: number | null;
}

export interface Rendered {
  status: string;
  legend: string;
  chart: string;
  axis: string;
  summary: string;
  sources: string;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const TOP = 80; // headroom above the peak in viewBox units (of 1000)
function sx(hour: number, end: number): number {
  return (hour / end) * 1000;
}
function sy(value: number): number {
  return TOP + (1 - value) * (1000 - TOP);
}
function f(n: number): string {
  return n.toFixed(1);
}

/// Shapes only (preserveAspectRatio="none"): text and the marker dot are HTML so they never stretch.
export function chartSvg(profile: Profile, nowHours: number | null | undefined): string {
  const end = profile.chartEndHours;
  const pts = profile.curve.samples(0.05, end);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${f(sx(p.hour, end))} ${f(sy(p.value))}`).join('');
  const area = `${line}L1000 1000L0 1000Z`;
  const grads = PHASE_COLORS.map(
    (c, i) =>
      `<linearGradient id="pk-g${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="0.62"/><stop offset="1" stop-color="${c}" stop-opacity="0.14"/></linearGradient>`,
  );
  const shades = profile.windows
    .map((w, i) => {
      const x = sx(w.start, end);
      const width = sx(Math.min(w.end, end), end) - x;
      return width > 0 ? `<rect x="${f(x)}" y="0" width="${f(width)}" height="1000" fill="url(#pk-g${i})"/>` : '';
    })
    .join('');
  const ticks: string[] = [];
  for (let h = TICK_HOURS; h < end; h += TICK_HOURS) {
    ticks.push(`<line x1="${f(sx(h, end))}" y1="0" x2="${f(sx(h, end))}" y2="1000" class="pk-grid" vector-effect="non-scaling-stroke"/>`);
  }
  let now = '';
  if (nowHours != null && nowHours >= 0 && nowHours <= end) {
    const x = sx(nowHours, end);
    const y = sy(profile.curve.value(nowHours));
    now = `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="1000" class="pk-now-line" vector-effect="non-scaling-stroke"/>`;
  }
  return (
    `<svg class="pk-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">` +
    `<defs><clipPath id="pk-area"><path d="${area}"/></clipPath>${grads.join('')}</defs>` +
    `<path d="${area}" class="pk-fill"/>` +
    `<g clip-path="url(#pk-area)">${shades}</g>` +
    ticks.join('') +
    `<line x1="0" y1="1000" x2="1000" y2="1000" class="pk-base" vector-effect="non-scaling-stroke"/>` +
    `<path d="${line}" class="pk-line" vector-effect="non-scaling-stroke"/>` +
    now +
    `</svg>`
  );
}

/// The marker dot and its tag, positioned in percent over the SVG.
export function nowMarker(lang: TimingLang, profile: Profile, nowHours: number | null | undefined): string {
  if (nowHours == null || nowHours < 0 || nowHours > profile.chartEndHours) return '';
  const x = nowHours / profile.chartEndHours;
  const value = profile.curve.value(nowHours);
  const y = sy(value) / 1000;
  const style = `left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%`;
  // Near the peak the tag sits under the dot, as the app's dose marker does (PKDoseMarker,
  // y >= 0.82 of the maximum); near the right edge it shifts left to stay inside the chart.
  const place = value >= 0.82 ? ' below' : '';
  const flip = x > 0.86 ? ' flip' : '';
  return `<span class="pk-now-dot" style="${style}"></span><span class="pk-now-tag${place}${flip}" style="${style}">${esc(copy[lang].now)}</span>`;
}

export function render(input: RenderInput): Rendered {
  const { lang, drug, minutes, nowHours } = input;
  const t = copy[lang];
  const profile = PROFILES[drug];
  const labels = windowLabels(lang, profile);
  const name = t.names[drug];

  // Status: the phase now, as the app's chart header says it. Without a clock (build time,
  // no JS) the header carries the drug name instead.
  let title = name;
  let color = '';
  let sub = t.taken(name, clockText(lang, minutes));
  if (nowHours != null) {
    const phase = phaseAt(lang, profile, nowHours);
    title = phase.text;
    if (phase.windowIndex >= 0) color = PHASE_COLORS[phase.windowIndex];
    const whole = Math.abs(Math.floor(nowHours * 60));
    const h = Math.floor(whole / 60);
    const m = whole % 60;
    sub += ` · ${nowHours >= 0 ? t.elapsed(h, m) : t.untilDose(h, m)}`;
  }
  const status =
    `<p class="pk-phase"${color ? ` style="color:${color}"` : ''}>${esc(title)}</p>` + `<p class="pk-sub">${esc(sub)}</p>`;

  const legend = profile.windows
    .map(
      (w, i) =>
        `<div class="pk-legend-item"><span class="pk-legend-name"><i style="background:${PHASE_COLORS[i]}"></i>${esc(labels[i])}</span>` +
        `<span class="pk-legend-range">${esc(rangeText(lang, minutes, w.start, w.end))}</span></div>`,
    )
    .join('');

  const chart = chartSvg(profile, nowHours) + nowMarker(lang, profile, nowHours);

  const end = profile.chartEndHours;
  const axisTicks: string[] = [];
  for (let h = 0; h <= end; h += TICK_HOURS) {
    const c = clockAt(minutes, h);
    const edge = h === 0 ? ' start' : h === end ? ' end' : '';
    axisTicks.push(`<span class="pk-tick${edge}" style="left:${((h / end) * 100).toFixed(2)}%">${esc(t.axis(c.hour))}</span>`);
  }
  const axis = axisTicks.join('');

  const peakIndex = Math.max(0, profile.sectionKinds.indexOf('peak'));
  const summary = esc(
    t.summary(
      clockText(lang, minutes),
      labels[peakIndex],
      rangeText(lang, minutes, profile.windows[peakIndex].start, profile.windows[peakIndex].end),
      labels[2],
      rangeText(lang, minutes, profile.windows[2].start, profile.windows[2].end),
      end,
    ),
  );

  // Link text is the reader's own language; the catalog's titles are internal notes.
  const links = profile.sources
    .map((s, i) => `<a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(t.sourceLabels[drug][i] ?? s.title)} ↗</a>`)
    .join('');
  const row = (k: string, v: string) => (v ? `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>` : '');
  const sources =
    `<p class="pk-drug-name">${esc(name)} <span class="muted">${esc(t.formulations[drug])}</span></p>` +
    `<dl class="pk-facts">` +
    row(t.rows.timing, esc(t.timing[drug])) +
    row(t.rows.evidence, esc(t.evidence[profile.evidence])) +
    row(t.rows.dose, `${profile.referenceDoseMg} mg`) +
    row(t.rows.conditions, esc(t.conditions[drug])) +
    row(t.rows.links, `<span class="pk-links">${links}</span>`) +
    `</dl>`;

  return { status, legend, chart, axis, summary, sources };
}

/// Meta description of a drug page in its default state (dose at 08:00).
export function describe(lang: TimingLang, drug: DrugId): string {
  const t = copy[lang];
  const profile = PROFILES[drug];
  const peakIndex = Math.max(0, profile.sectionKinds.indexOf('peak'));
  const w = profile.windows[peakIndex];
  return t.description(t.names[drug], clockText(lang, DEFAULT_MINUTES), rangeText(lang, DEFAULT_MINUTES, w.start, w.end));
}
