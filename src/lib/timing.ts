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
  nextDay: string;
  axis: (hour24: number) => string;
  /** Heading of the second group in the medication list: drugs not sold in the language's market. */
  market: string;
  sourcesTitle: string;
  rows: { timing: string; evidence: string; conditions: string; links: string };
  evidence: Record<Evidence, string>;
  timing: Names;
  /** Empty when the profile needs no extra note; the row is then left out. */
  conditions: Names;
  /** One label per catalog source, in catalog order, in the reader's language. */
  sourceLabels: Record<DrugId, string[]>;
  notice: string;
  cta: { title: string; body: string };
};

const FORMULATION_EN: Names = Object.fromEntries(DRUG_IDS.map((id) => [id, PROFILES[id].formulation])) as Names;

/// Korean object particle after a word: 을 after a final consonant, 를 otherwise. Latin letters
/// and digits go by how they are read aloud (XR → "알" → 을, LA → "에이" → 를).
export function objectParticle(word: string): string {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 === 0 ? '를' : '을';
  if (/[lmnrLMNR]/.test(last)) return '을';
  if (/[013678]/.test(last)) return '을';
  return '를';
}

export const copy: Record<TimingLang, Copy> = {
  ko: {
    title: (drug) => `${drug} 약효 흐름 | 피클리`,
    description: (drug, dose, peak) =>
      `${dose}에 ${drug}${objectParticle(drug)} 먹으면 최고 농도 구간은 ${peak}입니다. 약과 복용 시각을 바꿔 참고 곡선을 볼 수 있습니다.`,
    label: '피클리 · 약효 흐름',
    h1: 'ADHD 약 약효 흐름',
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
    nextDay: '다음 날 ',
    axis: (h) => `${h}시`,
    market: '국내 미출시',
    sourcesTitle: '출처와 기준',
    rows: { timing: '최고 농도', evidence: '곡선 근거', conditions: '조건', links: '출처' },
    evidence: {
      legacyReference: '설명서 평균값',
      digitized: '설명서 평균 농도 그래프를 옮김',
      schematic: '설명서 수치로 그린 개략 곡선 · 실측 곡선 아님',
    },
    timing: {
      concerta: '복용 후 6~10시간',
      medikinet: '아침 식후 복용 시 2~4시간',
      penid_ir: '복용 후 약 2시간 (1~2시간)',
      ritalin_ir: '복용 후 약 2시간 (1~2시간)',
      ritalin_la: '2차 피크: 복용 후 5.5시간 (4.3~6.5시간, 소아 평균 6.6시간)',
      adderall_xr: '복용 후 5.2~7.7시간',
      vyvanse: '복용 후 3.8~4.7시간',
    },
    conditions: {
      concerta: '',
      medikinet: '피크 이후는 발표된 평균 곡선을 참고한 추정',
      penid_ir: '페니드 측정값이 아닌 메틸페니데이트 속방정 일반 곡선. 2시간 뒤 피크, 이후 2.5시간마다 절반으로 감소',
      ritalin_ir: '2시간 뒤 피크, 이후 2.5시간마다 절반으로 감소하도록 계산',
      ritalin_la: '성인 남성 8명, 20mg 1회 복용 평균값(2·3.6·5.5시간). 8시간 이후는 3.3시간마다 절반으로 감소하도록 계산',
      adderall_xr: '성인, 식후 20mg 1회 복용 평균 곡선 (설명서 그림 1)',
      vyvanse: '설명서의 피크 시점과 성인 반감기로 계산',
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
    notice: '개인 측정값이 아닌 참고 곡선입니다. 체감 피크는 농도 피크와 다를 수 있고, 그래프 끝이 약효 종료는 아닙니다. 복용 시각·용량 변경은 의사·약사와 상의하세요.',
    cta: {
      title: '내 복용 기록으로 매일 보기',
      body: '피클리에 복용 시각을 기록하면 이 곡선이 매일 그려지고, 상승·피크·감소 때 알림을 받습니다. 구간은 직접 옮겨서 맞출 수 있습니다.',
    },
  },
  en: {
    title: (drug) => `${drug} effect timing | Peakly`,
    description: (drug, dose, peak) =>
      `Taken at ${dose}, ${drug}'s peak window is ${peak}. Change the medication or dose time to see its reference curve.`,
    label: 'Peakly · Effect timing',
    h1: 'ADHD medication effect timing',
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
    nextDay: ' next day',
    axis: (h) => (h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`),
    market: 'Not sold in the US',
    sourcesTitle: 'Sources and basis',
    rows: { timing: 'Peak', evidence: 'Curve basis', conditions: 'Conditions', links: 'Sources' },
    evidence: {
      legacyReference: "Label's mean values",
      digitized: "Traced from the label's mean concentration figure",
      schematic: "Schematic curve from the label's figures · not a measured curve",
    },
    timing: {
      concerta: '6–10 h after the dose',
      medikinet: '2–4 h after a dose taken after breakfast',
      penid_ir: 'About 2 h after the dose (1–2 h)',
      ritalin_ir: 'About 2 h after the dose (1–2 h)',
      ritalin_la: 'Second peak: 5.5 h after the dose (4.3–6.5 h; children mean 6.6 h)',
      adderall_xr: '5.2–7.7 h after the dose',
      vyvanse: '3.8–4.7 h after the dose',
    },
    conditions: {
      concerta: '',
      medikinet: 'After the peak, an estimate guided by published mean curves',
      penid_ir: 'A general methylphenidate IR curve, not measurements of Penid. Peak at 2 h, then halving every 2.5 h',
      ritalin_ir: 'Peak at 2 h, then halving every 2.5 h',
      ritalin_la: 'Mean values for eight adult men after one 20 mg dose (2, 3.6 and 5.5 h). From 8 h on, halving every 3.3 h',
      adderall_xr: 'Adults, one 20 mg dose with food, mean curve (label Figure 1)',
      vyvanse: "Calculated from the label's peak timing and adult half-life",
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
    notice: 'A reference curve, not a personal measurement. The felt peak can differ from the concentration peak, and the end of the chart is not the end of the effect. Talk to your doctor or pharmacist before changing a dose or its timing.',
    cta: {
      title: 'See it every day with your own doses',
      body: 'Log your dose time in Peakly and this curve is drawn every day, with notifications as it rises, peaks, and wears off. You can move each window yourself.',
    },
  },
  ja: {
    title: (drug) => `${drug}の作用の流れ | ピークリー`,
    description: (drug, dose, peak) =>
      `${dose}に${drug}を服用した場合、最高濃度の区間は${peak}です。薬と服用時刻を変えて参考曲線を確認できます。`,
    label: 'ピークリー · 作用の流れ',
    // Not "ADHD治療薬": Ritalin is approved for narcolepsy, not ADHD, in Japan.
    h1: '薬の作用の流れ',
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
    nextDay: '翌日 ',
    axis: (h) => `${h}時`,
    market: '日本未発売・適応外',
    sourcesTitle: '出典と基準',
    rows: { timing: '最高濃度', evidence: '曲線の根拠', conditions: '条件', links: '出典' },
    // The sources are US labels (FDA) and UK product information (emc), not Japanese 添付文書;
    // the source links name the country.
    evidence: {
      legacyReference: '製品情報の平均値',
      digitized: '製品情報の平均濃度グラフを写したもの',
      schematic: '製品情報の数値から描いた概略曲線・実測の曲線ではありません',
    },
    timing: {
      concerta: '服用後6~10時間',
      medikinet: '朝食後の服用で2~4時間',
      penid_ir: '服用後約2時間（1~2時間）',
      ritalin_ir: '服用後約2時間（1~2時間）',
      ritalin_la: '2回目のピーク: 服用後5.5時間（4.3~6.5時間、小児平均6.6時間）',
      adderall_xr: '服用後5.2~7.7時間',
      vyvanse: '服用後3.8~4.7時間',
    },
    conditions: {
      concerta: '',
      medikinet: 'ピーク後は公表された平均曲線をもとにした推定',
      penid_ir: 'Penid固有の測定値ではなく、メチルフェニデート速放錠の一般的な曲線。2時間後にピーク、その後2.5時間ごとに半減',
      ritalin_ir: '2時間後にピーク、その後2.5時間ごとに半減するものとして計算',
      ritalin_la: '成人男性8人、20mg単回服用の平均値（2・3.6・5.5時間）。8時間以降は3.3時間ごとに半減するものとして計算',
      adderall_xr: '成人、食後20mg単回服用の平均曲線（米国の製品ラベル 図1）',
      vyvanse: '米国の製品ラベルのピーク時点と成人の半減期から計算',
    },
    sourceLabels: {
      concerta: ['コンサータ 米国の製品ラベル（FDA）'],
      medikinet: ['メディキネット XL 英国の製品情報（emc）'],
      penid_ir: ['Penid 製品情報（Whanin製薬）', 'リタリン 米国の製品ラベル（FDA、成分の参考）', 'リタリン 10mg 英国の製品情報（emc、半減期の参考）'],
      ritalin_ir: ['リタリン 米国の製品ラベル（FDA）', 'リタリン 10mg 英国の製品情報（emc）'],
      ritalin_la: ['リタリン LA 米国の製品ラベル（FDA、2025年9月改訂）', 'リタリン LA 米国の製品ラベル（FDA、2019）'],
      adderall_xr: ['アデロール XR 米国の製品ラベル（FDA、2023）'],
      vyvanse: ['ビバンセ 米国の製品ラベル（FDA、2025）'],
    },
    notice: '個人の測定値ではない参考曲線です。体感のピークは濃度のピークと異なることがあり、グラフの終わりは作用の終わりではありません。服用時刻や用量の変更は医師・薬剤師に相談してください。',
    cta: {
      title: '自分の服薬記録で毎日見る',
      body: 'ピークリーに服用時刻を記録すると、この曲線が毎日描かれ、上昇・ピーク・減少のときに通知が届きます。区間は自分で動かして合わせられます。',
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

/// Hours since today's dose, negative before it. A dose later today is simply "before the dose".
export function hoursSinceDose(now: Date, doseMinutes: number): number {
  return (now.getHours() * 60 + now.getMinutes() - doseMinutes) / 60 + now.getSeconds() / 3600;
}

/// Tick positions (hours after the dose) on whole clock hours: the first whole hour at or after
/// the dose, then every TICK_HOURS, up to the chart end (08:30 → 9, 13, 17, 21).
export function tickOffsets(doseMinutes: number, end: number): number[] {
  const first = ((60 - (doseMinutes % 60)) % 60) / 60;
  const ticks: number[] = [];
  for (let i = 0; first + i * TICK_HOURS <= end + 1e-9; i++) ticks.push(first + i * TICK_HOURS);
  return ticks;
}

// Drugs sold in the language's home market (ko → Korea, ja → Japan, en → US), after the app's
// MedicationMarketAvailability (KOR: Penid; JPN: Vyvanse; USA: Adderall XR, Vyvanse, Ritalin) plus
// Concerta and Medikinet where they are sold. The rest are listed under a separate heading.
// Ritalin LA (Taiwan, Hong Kong only) is left out of every list; its pages stay reachable by URL.
const HOME_MARKET: Record<TimingLang, DrugId[]> = {
  ko: ['concerta', 'medikinet', 'penid_ir'],
  ja: ['concerta', 'vyvanse'],
  en: ['concerta', 'ritalin_ir', 'adderall_xr', 'vyvanse'],
};

/// Medication list for the select: the home market first, then the others under `market`.
/// `current` keeps the page's own drug listed even when it is Ritalin LA.
export function selectGroups(lang: TimingLang, current?: DrugId): { label: string; ids: DrugId[] }[] {
  const home = HOME_MARKET[lang];
  const listed = DRUG_IDS.filter((id) => id !== 'ritalin_la' || id === current);
  return [
    { label: '', ids: listed.filter((id) => home.includes(id)) },
    { label: copy[lang].market, ids: listed.filter((id) => !home.includes(id)) },
  ];
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
/// `ticks` are the axis positions in hours after the dose; a faint line marks each inside the chart.
export function chartSvg(profile: Profile, nowHours: number | null | undefined, ticks: number[]): string {
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
  const grid = ticks
    .filter((h) => h > 1e-9 && h < end - 1e-9)
    .map((h) => `<line x1="${f(sx(h, end))}" y1="0" x2="${f(sx(h, end))}" y2="1000" class="pk-grid" vector-effect="non-scaling-stroke"/>`)
    .join('');
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
    grid +
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

  const end = profile.chartEndHours;
  const ticks = tickOffsets(minutes, end);
  const chart = chartSvg(profile, nowHours, ticks) + nowMarker(lang, profile, nowHours);

  // Labels sit on whole clock hours; the ones at the edges are aligned inward so they stay in the chart.
  const axis = ticks
    .map((h) => {
      const pct = (h / end) * 100;
      const edge = pct <= 4 ? ' start' : pct >= 96 ? ' end' : '';
      return `<span class="pk-tick${edge}" style="left:${pct.toFixed(2)}%">${esc(t.axis(clockAt(minutes, h).hour))}</span>`;
    })
    .join('');

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
    row(t.rows.conditions, esc(t.conditions[drug])) +
    row(t.rows.links, `<span class="pk-links">${links}</span>`) +
    `</dl>`;

  return { status, legend, chart, axis, sources };
}

/// Meta description of a drug page in its default state (dose at 08:00).
export function describe(lang: TimingLang, drug: DrugId): string {
  const t = copy[lang];
  const profile = PROFILES[drug];
  const peakIndex = Math.max(0, profile.sectionKinds.indexOf('peak'));
  const w = profile.windows[peakIndex];
  return t.description(t.names[drug], clockText(lang, DEFAULT_MINUTES), rangeText(lang, DEFAULT_MINUTES, w.start, w.end));
}
