// The reference concentration curve tool: copy, clock maths and the HTML/SVG the page shows.
// Runs at build (first paint of the default state) and in the browser (every change),
// so everything here is plain TypeScript with no DOM access.
// The explicit extension lets Node run this module directly (tests, the share-card script).
//
// Wording: the page names a profile by ingredient and form, never by product name, and speaks of
// the label's blood concentration, never of an effect. ko, en and ja follow the same rule.
import { DRUG_IDS, DRUG_SLUGS, MODEL_VERSION, PROFILES, drugFromSlug, type DrugId, type Profile, type SectionKind, type ToolDrugId } from './pk.ts';

export type TimingLang = 'ko' | 'en' | 'ja';
export const TIMING_LANGS: TimingLang[] = ['ko', 'en', 'ja'];
export const DEFAULT_DRUG: ToolDrugId = 'concerta';
export const DEFAULT_MINUTES = 8 * 60;
export { DRUG_IDS, DRUG_SLUGS, MODEL_VERSION, PROFILES };

// Phase colours of the app's dark chart (PKPhasePalette, dark): first window, main peak, decline.
export const PHASE_COLORS = ['#6CCBFF', '#FF7A6B', '#A99BFF'] as const;
// Clock tick every four hours; the app caps the chart at 16 h after the dose.
const TICK_HOURS = 4;

type Names = Record<ToolDrugId, string>;
export interface Source {
  label: string;
  url: string;
}
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
  /** Grey note after the name in the sources table; empty where the name already says it all. */
  formulations: Names;
  /** Window names as each app chart shows them: Concerta and Medikinet have charts of their own;
   *  the others share the reference chart (sectionTitle), which calls Ritalin LA's first two peaks. */
  labels: {
    concerta: [string, string, string];
    medikinet: [string, string, string];
    reference: Record<SectionKind, string>;
    ritalinLA: [string, string];
  };
  beforeDose: string;
  taken: (drug: string, time: string) => string;
  elapsed: (h: number, m: number) => string;
  untilDose: (h: number, m: number) => string;
  nextDay: string;
  axis: (hour24: number) => string;
  /** Heading of the second group in the list: drugs not sold in the language's market. ko lists
   *  only drugs approved in Korea, so it has no second group. */
  market: string;
  sourcesTitle: string;
  rows: { timing: string; links: string };
  /** Added to the note of a schematic profile, the one place it says so. */
  schematic: string;
  timing: Names;
  /** Source links in the reader's language. Each language has its own list, so one can point at
   *  its own regulator (ko → MFDS) without touching the others. */
  sources: Record<ToolDrugId, Source[]>;
  notice: string;
  /** Plain link at the foot of the page to the Peakly introduction. */
  about: string;
};

/// The catalog's links for `drug` under the reader's labels, one label per link in catalog order.
// A product's approval record on the MFDS drug safety portal (의약품안전나라), by item number.
const MFDS = (itemSeq: string) => `https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=${itemSeq}`;

function catalogLinks(drug: ToolDrugId, ...labels: string[]): Source[] {
  return PROFILES[drug].sources.map((s, i) => ({ label: labels[i] ?? '', url: s.url }));
}

export const copy: Record<TimingLang, Copy> = {
  ko: {
    title: (drug) => `${drug} 혈중 농도 흐름 | Hyperfocus Lab`,
    description: (drug, dose, peak) =>
      `${dose}에 복용하면 ${drug}의 설명서 기준 최고 농도 구간은 ${peak}입니다. 복용 시각을 바꿔 참고 곡선을 볼 수 있습니다.`,
    label: '설명서 기준 참고 곡선',
    // No indication in any heading: the page shows the label's concentration data only.
    h1: '설명서 기준 평균 혈중 농도 흐름',
    drug: '성분·제형',
    time: '복용 시각',
    copy: '링크 복사',
    copied: '복사됨',
    now: '지금',
    // Only the first three have pages in Korean (LANG_DRUGS); the rest keep the type complete.
    names: {
      concerta: '메틸페니데이트 OROS 서방정',
      medikinet: '메틸페니데이트 속방·장용 펠렛 캡슐',
      penid_ir: '메틸페니데이트 속방정',
      ritalin_la: '메틸페니데이트 이상성 캡슐(속방 50%·지연 방출 50%)',
      adderall_xr: '혼합 암페타민염 서방 캡슐',
      vyvanse: '리스덱스암페타민 캡슐',
    },
    formulations: {
      concerta: '',
      medikinet: '',
      penid_ir: '',
      ritalin_la: '',
      adderall_xr: 'd-암페타민 기준',
      vyvanse: '활성체 d-암페타민 기준',
    },
    labels: {
      concerta: ['1차', '최대농도', '감소'],
      medikinet: ['1차 상승', '2차 상승', '감소'],
      reference: { initial: '농도 상승', peak: '최고 농도', secondary: '2차 농도 구간', decline: '농도 감소' },
      ritalinLA: ['1차 피크', '2차 피크'],
    },
    beforeDose: '복용 전',
    taken: (drug, time) => `${drug} · ${time} 복용`,
    elapsed: (h, m) => `${h}시간 ${m}분 지남`,
    untilDose: (h, m) => `복용까지 ${h}시간 ${m}분`,
    nextDay: '다음 날 ',
    axis: (h) => `${h}시`,
    market: '',
    sourcesTitle: '출처와 기준',
    rows: { timing: '최고 농도', links: '출처' },
    schematic: '실측이 아닌 개략 곡선',
    timing: {
      concerta: '복용 후 6~10시간',
      medikinet: '아침 식후 복용 시 2~4시간',
      penid_ir: '복용 후 약 2시간 (1~2시간)',
      ritalin_la: '2차 피크: 복용 후 5.5시간 (4.3~6.5시간, 소아 평균 6.6시간)',
      adderall_xr: '복용 후 5.2~7.7시간',
      vyvanse: '복용 후 3.8~4.7시간',
    },
    sources: {
      // The domestic approval first. Korean labels have no pharmacokinetics section, so the times
      // on the chart come from the US (FDA) or UK (emc) labels listed after it.
      concerta: [
        { label: '국내 허가사항 (식약처 의약품안전나라)', url: MFDS('202005265') },
        { label: '미국 FDA 설명서 (최고 농도 시점)', url: PROFILES.concerta.sources[0].url },
      ],
      medikinet: [
        { label: '국내 허가사항 (식약처 의약품안전나라)', url: MFDS('201111086') },
        { label: '영국 emc 제품 특성 요약 (최고 농도 시점)', url: PROFILES.medikinet.sources[0].url },
      ],
      penid_ir: [
        { label: '국내 허가사항 (식약처 의약품안전나라)', url: MFDS('198902796') },
        { label: '미국 FDA 설명서 (최고 농도 시점)', url: PROFILES.penid_ir.sources[1].url },
        { label: '영국 emc 제품 특성 요약 (반감기)', url: PROFILES.penid_ir.sources[2].url },
      ],
      ritalin_la: catalogLinks('ritalin_la', '메틸페니데이트 이상성 캡슐 설명서 (미국 FDA, 2025년 9월 개정)', '메틸페니데이트 이상성 캡슐 설명서 (미국 FDA, 2019)'),
      adderall_xr: catalogLinks('adderall_xr', '혼합 암페타민염 서방 캡슐 설명서 (미국 FDA, 2023)'),
      vyvanse: catalogLinks('vyvanse', '리스덱스암페타민 캡슐 설명서 (미국 FDA, 2025)'),
    },
    notice: '개인 측정값이 아니라 설명서의 평균값으로 그린 참고 곡선입니다. 그래프가 끝나는 시점이 농도가 사라지는 시점은 아닙니다. 복용 시각·용량은 의사·약사와 상의하세요.',
    about: '피클리 소개',
  },
  en: {
    title: (drug) => `${drug}: blood concentration over time | Hyperfocus Lab`,
    description: (drug, dose, peak) =>
      `Taken at ${dose}, the label's peak concentration window for ${drug} is ${peak}. Change the dose time to see the reference curve.`,
    label: 'Reference curve from the label',
    h1: 'Mean blood concentration over time, per the label',
    drug: 'Ingredient and form',
    time: 'Dose time',
    copy: 'Copy link',
    copied: 'Copied',
    now: 'Now',
    names: {
      concerta: 'Methylphenidate OROS extended-release tablet',
      medikinet: 'Methylphenidate modified-release capsule (50% IR, 50% ER)',
      penid_ir: 'Methylphenidate immediate-release tablet',
      ritalin_la: 'Methylphenidate biphasic capsule (50% IR, 50% delayed release)',
      adderall_xr: 'Mixed amphetamine salts extended-release capsule',
      vyvanse: 'Lisdexamfetamine capsule',
    },
    formulations: {
      concerta: '',
      medikinet: '',
      penid_ir: '',
      ritalin_la: '',
      adderall_xr: 'd-amphetamine',
      vyvanse: 'active d-amphetamine',
    },
    labels: {
      concerta: ['1st', 'Max', 'Decline'],
      medikinet: ['First rise', 'Second rise', 'Decline'],
      reference: { initial: 'Concentration rise', peak: 'Peak concentration', secondary: 'Second concentration window', decline: 'Concentration decline' },
      ritalinLA: ['First peak', 'Second peak'],
    },
    beforeDose: 'Before the dose',
    taken: (drug, time) => `${drug} · taken ${time}`,
    elapsed: (h, m) => `${h} h ${m} min since`,
    untilDose: (h, m) => `${h} h ${m} min until the dose`,
    nextDay: ' next day',
    axis: (h) => (h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`),
    market: 'Not sold in the US',
    sourcesTitle: 'Sources and basis',
    rows: { timing: 'Peak', links: 'Sources' },
    schematic: 'schematic, not a measured curve',
    timing: {
      concerta: '6–10 h after the dose',
      medikinet: '2–4 h after a dose taken after breakfast',
      penid_ir: 'About 2 h after the dose (1–2 h)',
      ritalin_la: 'Second peak: 5.5 h after the dose (4.3–6.5 h; children mean 6.6 h)',
      adderall_xr: '5.2–7.7 h after the dose',
      vyvanse: '3.8–4.7 h after the dose',
    },
    sources: {
      concerta: catalogLinks('concerta', 'Methylphenidate OROS extended-release tablet prescribing information (US FDA)'),
      medikinet: catalogLinks('medikinet', 'Methylphenidate modified-release capsule summary of product characteristics (UK emc)'),
      penid_ir: catalogLinks(
        'penid_ir',
        'Methylphenidate immediate-release tablet product information (Whanin Pharm, Korea)',
        'Methylphenidate immediate-release tablet prescribing information (US FDA, ingredient reference)',
        'Methylphenidate 10 mg immediate-release tablet summary of product characteristics (UK emc, half-life)',
      ),
      ritalin_la: catalogLinks(
        'ritalin_la',
        'Methylphenidate biphasic capsule prescribing information (US FDA, rev. Sept 2025)',
        'Methylphenidate biphasic capsule prescribing information (US FDA, 2019)',
      ),
      adderall_xr: catalogLinks('adderall_xr', 'Mixed amphetamine salts extended-release capsule prescribing information (US FDA, 2023)'),
      vyvanse: catalogLinks('vyvanse', 'Lisdexamfetamine capsule prescribing information (US FDA, 2025)'),
    },
    notice: "A reference curve drawn from the label's mean values, not a personal measurement. The end of the chart is not where the concentration reaches zero. Ask your doctor or pharmacist about dose and timing.",
    about: 'About Peakly',
  },
  ja: {
    title: (drug) => `${drug}の血中濃度の推移 | Hyperfocus Lab`,
    description: (drug, dose, peak) =>
      `${dose}に服用した場合、${drug}の製品情報に基づく最高濃度の区間は${peak}です。服用時刻を変えて参考曲線を確認できます。`,
    label: '製品情報に基づく参考曲線',
    h1: '製品情報に基づく平均血中濃度の推移',
    drug: '成分・剤形',
    time: '服用時刻',
    copy: 'リンクをコピー',
    copied: 'コピーしました',
    now: '現在',
    names: {
      concerta: 'メチルフェニデート OROS 徐放錠',
      medikinet: 'メチルフェニデート 徐放カプセル（速放50%・徐放50%）',
      penid_ir: 'メチルフェニデート 速放錠',
      ritalin_la: 'メチルフェニデート 二相性カプセル（速放50%・遅延放出50%）',
      adderall_xr: '混合アンフェタミン塩 徐放カプセル',
      vyvanse: 'リスデキサンフェタミン カプセル',
    },
    formulations: {
      concerta: '',
      medikinet: '',
      penid_ir: '',
      ritalin_la: '',
      adderall_xr: 'd-アンフェタミン基準',
      vyvanse: '活性体 d-アンフェタミン基準',
    },
    labels: {
      concerta: ['一次', '最大濃度', '減少'],
      medikinet: ['一次上昇', '二次上昇', '減少'],
      reference: { initial: '濃度上昇', peak: '最高濃度', secondary: '第2濃度帯', decline: '濃度低下' },
      ritalinLA: ['一次ピーク', '二次ピーク'],
    },
    beforeDose: '服用前',
    taken: (drug, time) => `${drug} · ${time} 服用`,
    elapsed: (h, m) => `${h}時間${m}分経過`,
    untilDose: (h, m) => `服用まで${h}時間${m}分`,
    nextDay: '翌日 ',
    axis: (h) => `${h}時`,
    market: '日本未発売・適応外',
    sourcesTitle: '出典と基準',
    rows: { timing: '最高濃度', links: '出典' },
    // The sources are US labels (FDA) and UK product information (emc), not Japanese 添付文書;
    // the source links name the country.
    schematic: '実測ではない概略曲線',
    timing: {
      concerta: '服用後6~10時間',
      medikinet: '朝食後の服用で2~4時間',
      penid_ir: '服用後約2時間（1~2時間）',
      ritalin_la: '2回目のピーク: 服用後5.5時間（4.3~6.5時間、小児平均6.6時間）',
      adderall_xr: '服用後5.2~7.7時間',
      vyvanse: '服用後3.8~4.7時間',
    },
    sources: {
      concerta: catalogLinks('concerta', 'メチルフェニデート OROS 徐放錠 米国の製品ラベル（FDA）'),
      medikinet: catalogLinks('medikinet', 'メチルフェニデート 徐放カプセル 英国の製品情報（emc）'),
      penid_ir: catalogLinks(
        'penid_ir',
        'メチルフェニデート 速放錠 韓国の製品情報（Whanin製薬）',
        'メチルフェニデート 速放錠 米国の製品ラベル（FDA、成分の参考）',
        'メチルフェニデート 速放錠 10mg 英国の製品情報（emc、半減期の参考）',
      ),
      ritalin_la: catalogLinks(
        'ritalin_la',
        'メチルフェニデート 二相性カプセル 米国の製品ラベル（FDA、2025年9月改訂）',
        'メチルフェニデート 二相性カプセル 米国の製品ラベル（FDA、2019）',
      ),
      adderall_xr: catalogLinks('adderall_xr', '混合アンフェタミン塩 徐放カプセル 米国の製品ラベル（FDA、2023）'),
      vyvanse: catalogLinks('vyvanse', 'リスデキサンフェタミン カプセル 米国の製品ラベル（FDA、2025）'),
    },
    notice: '個人の測定値ではなく、製品情報の平均値から描いた参考曲線です。グラフの終わりは濃度がなくなる時点ではありません。服用時刻や用量は医師・薬剤師に相談してください。',
    about: 'ピークリーについて',
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

/// Hours since the dose the chart shows, negative before it. The axis runs from the dose time
/// past midnight, so a time still on it counts from yesterday's dose (dose 20:00, now 1:00 → 5 h);
/// any other time before today's dose is "before the dose" (dose 8:00, now 7:00 → -1 h).
export function hoursSinceDose(now: Date, doseMinutes: number, chartEndHours: number): number {
  const hours = (now.getHours() * 60 + now.getMinutes() - doseMinutes) / 60 + now.getSeconds() / 3600;
  return hours < 0 && hours + 24 <= chartEndHours ? hours + 24 : hours;
}

/// Tick positions (hours after the dose) on whole clock hours: the first whole hour at or after
/// the dose, then every TICK_HOURS, up to the chart end (08:30 → 9, 13, 17, 21).
export function tickOffsets(doseMinutes: number, end: number): number[] {
  const first = ((60 - (doseMinutes % 60)) % 60) / 60;
  const ticks: number[] = [];
  for (let i = 0; first + i * TICK_HOURS <= end + 1e-9; i++) ticks.push(first + i * TICK_HOURS);
  return ticks;
}

// Drugs with a page in each language. Korean pages cover only the drugs approved in Korea;
// en and ja cover the catalog. Ritalin LA (Taiwan, Hong Kong only) has pages but no list entry.
const LANG_DRUGS: Record<TimingLang, ToolDrugId[]> = {
  ko: ['concerta', 'medikinet', 'penid_ir'],
  en: DRUG_IDS,
  ja: DRUG_IDS,
};

/// Drugs that have a page in `lang`, in list order.
export function drugsFor(lang: TimingLang): ToolDrugId[] {
  return LANG_DRUGS[lang];
}

/// Languages that have a page for `drug`.
export function langsFor(drug: ToolDrugId): TimingLang[] {
  return TIMING_LANGS.filter((lang) => LANG_DRUGS[lang].includes(drug));
}

/// The drug a URL slug asks for in `lang`, or null when the slug is unknown or that language has
/// no page for it (an en-only slug on a ko page).
export function drugIn(lang: TimingLang, slug: unknown): ToolDrugId | null {
  const id = drugFromSlug(slug);
  return id && LANG_DRUGS[lang].includes(id) ? id : null;
}

// Drugs sold in the language's home market (ja → Japan, en → US), after the app's
// MedicationMarketAvailability (JPN: Vyvanse; USA: Adderall XR, Vyvanse, Ritalin) plus Concerta
// where it is sold. The US has methylphenidate immediate-release tablets (Ritalin and generics), so
// the one immediate-release entry (penid_ir, named by ingredient and form) is home there; Japan's
// are approved for narcolepsy only, so it stays in the second group. ko lists Korean drugs only.
const HOME_MARKET: Record<TimingLang, ToolDrugId[]> = {
  ko: LANG_DRUGS.ko,
  ja: ['concerta', 'vyvanse'],
  en: ['concerta', 'penid_ir', 'adderall_xr', 'vyvanse'],
};

/// Medication list for the select: the home market first, then the others under `market`.
/// `current` keeps the page's own drug listed even when it is Ritalin LA.
export function selectGroups(lang: TimingLang, current?: ToolDrugId): { label: string; ids: ToolDrugId[] }[] {
  const home = HOME_MARKET[lang];
  const listed = LANG_DRUGS[lang].filter((id) => id !== 'ritalin_la' || id === current);
  return [
    { label: '', ids: listed.filter((id) => home.includes(id)) },
    { label: copy[lang].market, ids: listed.filter((id) => !home.includes(id)) },
  ];
}

// ── Phases ──────────────────────────────────────────────────────

export function windowLabels(lang: TimingLang, profile: Profile): [string, string, string] {
  const l = copy[lang].labels;
  if (profile.id === 'concerta') return l.concerta;
  if (profile.id === 'medikinet') return l.medikinet;
  if (profile.id === 'ritalin_la') return [l.ritalinLA[0], l.ritalinLA[1], l.reference.decline];
  return profile.sectionKinds.map((k) => l.reference[k]) as [string, string, string];
}

/// The app's phase (PKPhase); the keys are MedicationPhase.key(for:).
export type PhaseKey = 'rising_1' | 'peak_1' | 'valley' | 'rising_2' | 'peak_2' | 'falling' | 'releaseEnd' | 'after';
/// Index into PHASE_COLORS (the app's PKPhasePalette: first window, main peak, decline); null is neutral.
export type ColorIndex = 0 | 1 | 2 | null;

/// MedicationPhase.statusPaletteIndex: the colour of the status title and of the chart band of that
/// phase. It does not depend on the medication.
const STATUS_COLOR: Record<PhaseKey, ColorIndex> = {
  rising_1: 0,
  peak_1: 0,
  valley: 0,
  rising_2: 0,
  peak_2: 1,
  falling: 2,
  releaseEnd: 2,
  after: null,
};
// DS.Palette.Phase.after: the app paints the finished state grey rather than leaving it uncoloured.
const AFTER_COLOR = '#8E8E93';

/// Colour of the status title and the now dot; empty before the dose (a web-only state).
function statusColor(phase: PhaseState): string {
  if (phase.colorIndex != null) return PHASE_COLORS[phase.colorIndex];
  return phase.key === 'after' ? AFTER_COLOR : '';
}

// The app words a phase per medication: Concerta and Medikinet have their own (compactText(medication:)),
// the others share compactText(stimulantProfileKind:) with small differences.
type PhaseFamily = 'concerta' | 'medikinet' | 'adderall_xr' | 'standard' | 'ritalin_la';
type PhaseWords = Record<PhaseKey, string>;

function phaseFamily(id: DrugId): PhaseFamily {
  if (id === 'concerta' || id === 'medikinet' || id === 'adderall_xr' || id === 'ritalin_la') return id;
  return 'standard'; // Vyvanse, Penid, Ritalin
}

/// The app's phases in concentration words (the web never names an effect). `standard` is the
/// shared wording; Concerta and Medikinet call the gap before their main window a second rise,
/// Medikinet and Ritalin LA name their two peaks.
function phaseWords(
  standard: PhaseWords,
  w: { secondRise: string; maxConcentration: string; firstPeak: string; secondPeak: string },
): Record<PhaseFamily, PhaseWords> {
  const concerta = { ...standard, rising_2: w.secondRise };
  return {
    concerta,
    medikinet: { ...concerta, peak_1: w.maxConcentration, peak_2: w.secondPeak },
    // Adderall XR has no "residual": past its last window the app says the final phase.
    adderall_xr: { ...standard, after: standard.releaseEnd },
    standard,
    ritalin_la: { ...standard, peak_1: w.firstPeak, peak_2: w.secondPeak },
  };
}

const PHASE_TEXT: Record<TimingLang, Record<PhaseFamily, PhaseWords>> = {
  ko: phaseWords(
    { rising_1: '농도 상승 중', peak_1: '1차 구간', valley: '중간 구간', rising_2: '농도 상승 중', peak_2: '최고 농도 구간', falling: '농도 감소 중', releaseEnd: '농도 감소 구간', after: '후반 구간' },
    { secondRise: '2차 상승', maxConcentration: '최대 농도', firstPeak: '1차 최고 농도', secondPeak: '2차 최고 농도' },
  ),
  en: phaseWords(
    { rising_1: 'Concentration rising', peak_1: 'First window', valley: 'Middle window', rising_2: 'Concentration rising', peak_2: 'Peak concentration window', falling: 'Concentration falling', releaseEnd: 'Concentration decline window', after: 'Late phase' },
    { secondRise: 'Second rise', maxConcentration: 'Peak concentration', firstPeak: 'First peak concentration', secondPeak: 'Second peak concentration' },
  ),
  ja: phaseWords(
    { rising_1: '濃度上昇中', peak_1: '一次区間', valley: '中間区間', rising_2: '濃度上昇中', peak_2: '最高濃度の区間', falling: '濃度減少中', releaseEnd: '濃度減少の区間', after: '後半の区間' },
    { secondRise: '二次上昇', maxConcentration: '最大濃度', firstPeak: '一次最高濃度', secondPeak: '二次最高濃度' },
  ),
};

const EPS = 1e-9;

/// Concerta and Medikinet: MedicationPhase.phase(medication:elapsedHours:settings:eventOffsets:) with the
/// default settings. The windows are the app's defaults: first window, main peak, release end.
function ownChartKey([first, main, releaseEnd]: Profile['windows'], hours: number): PhaseKey {
  if (hours >= 18) return 'after';
  // The release end takes over at its start, so the main peak's last instant is just before it.
  if (hours > releaseEnd.end) return 'after';
  if (hours >= releaseEnd.start && hours <= releaseEnd.end) return 'releaseEnd';
  if (hours < first.start) return 'rising_1';
  if (hours <= first.end) return 'peak_1';
  if (hours < (first.end + main.start) / 2) return 'valley';
  if (hours < main.start) return 'rising_2';
  if (hours <= main.end) return 'peak_2';
  return 'falling';
}

/// The other profiles: MedicationPhase.phase(stimulantProfileKind:elapsedHours:sections:windows:) with the
/// default windows. The peak is the catalog's peak section, which `windows[1]` holds for these profiles.
function stimulantKey(id: DrugId, [early, peak, ending]: Profile['windows'], hours: number): PhaseKey {
  if (hours < early.start - EPS) return 'rising_1';
  if (hours <= early.end + EPS) return 'peak_1';
  // Ritalin LA's first window is a real peak, so the gap before the main peak is a dip, not a rise.
  if (hours < peak.start - EPS) return id === 'ritalin_la' ? 'valley' : 'rising_2';
  if (hours <= peak.end + EPS) return 'peak_2';
  // Adderall XR has no release-end phase: the decline runs to the end of the last window.
  if (id === 'adderall_xr') return hours < ending.end - EPS ? 'falling' : 'after';
  if (hours < ending.start - EPS) return 'falling';
  if (hours <= ending.end + EPS) return 'releaseEnd';
  return 'after';
}

export interface PhaseState {
  text: string;
  /** The app's phase, or null before the dose (the web's own state). */
  key: PhaseKey | null;
  /** The app's status colour as an index into PHASE_COLORS; null is neutral (finished, before the dose). */
  colorIndex: ColorIndex;
}

/// The status the app's chart header shows `elapsedHours` after the dose (default windows, no
/// heart-rate fit). A negative time is the web's own "before the dose".
export function phaseAt(lang: TimingLang, profile: Profile, elapsedHours: number): PhaseState {
  if (elapsedHours < 0) return { text: copy[lang].beforeDose, key: null, colorIndex: null };
  const family = phaseFamily(profile.id);
  const key =
    family === 'concerta' || family === 'medikinet'
      ? ownChartKey(profile.windows, elapsedHours)
      : stimulantKey(profile.id, profile.windows, elapsedHours);
  return { text: PHASE_TEXT[lang][family][key], key, colorIndex: STATUS_COLOR[key] };
}

// ── Rendering ───────────────────────────────────────────────────

export interface RenderInput {
  lang: TimingLang;
  drug: ToolDrugId;
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

// Headroom above the peak in viewBox units (of 1000): the app's y domain is 0...1.05 on every chart.
const TOP = 1000 * (0.05 / 1.05);
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
/// Like the app's chart there are no grid lines; the shades fade as PKChartPreset.phaseGradient (dark).
export function chartSvg(profile: Profile, nowHours: number | null | undefined): string {
  const end = profile.chartEndHours;
  const pts = profile.curve.samples(0.05, end);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${f(sx(p.hour, end))} ${f(sy(p.value))}`).join('');
  const area = `${line}L1000 1000L0 1000Z`;
  const grads = PHASE_COLORS.map(
    (c, i) =>
      `<linearGradient id="pk-g${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="0.62"/><stop offset="1" stop-color="${c}" stop-opacity="0.06"/></linearGradient>`,
  );
  const shades = profile.windows
    .map((w, i) => {
      const x = sx(w.start, end);
      const width = sx(Math.min(w.end, end), end) - x;
      return width > 0 ? `<rect x="${f(x)}" y="0" width="${f(width)}" height="1000" fill="url(#pk-g${i})"/>` : '';
    })
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
  // The dot is the status colour, as in the app (the title above the chart has the same).
  const color = statusColor(phaseAt(lang, profile, nowHours));
  const dotStyle = color ? `${style};background:${color}` : style;
  // Near the peak the tag sits under the dot, as the app's dose marker does (PKDoseMarker,
  // y >= 0.82 of the maximum); near either edge it shifts inward, as the chart runs edge to edge.
  const place = value >= 0.82 ? ' below' : '';
  const flip = x > 0.86 ? ' flip' : x < 0.1 ? ' start' : '';
  return `<span class="pk-now-dot" style="${dotStyle}"></span><span class="pk-now-tag${place}${flip}" style="${style}">${esc(copy[lang].now)}</span>`;
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
    color = statusColor(phase);
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
  const chart = chartSvg(profile, nowHours) + nowMarker(lang, profile, nowHours);

  // Labels sit on whole clock hours; the ones at the edges are aligned inward so they stay in the chart.
  const axis = ticks
    .map((h) => {
      const pct = (h / end) * 100;
      const edge = pct <= 4 ? ' start' : pct >= 96 ? ' end' : '';
      return `<span class="pk-tick${edge}" style="left:${pct.toFixed(2)}%">${esc(t.axis(clockAt(minutes, h).hour))}</span>`;
    })
    .join('');

  // Links come from the reader's language (copy.sources); the catalog's titles are internal notes.
  const links = t.sources[drug]
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(s.label)} ↗</a>`)
    .join('');
  const row = (k: string, v: string) => (v ? `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>` : '');
  // The grey note: what the curve is measured as, then "schematic" where it is; nothing otherwise.
  const note = [t.formulations[drug], profile.evidence === 'schematic' ? t.schematic : ''].filter(Boolean).join(' · ');
  const sources =
    `<p class="pk-drug-name">${esc(name)}${note ? ` <span class="muted">${esc(note)}</span>` : ''}</p>` +
    `<dl class="pk-facts">` +
    row(t.rows.timing, esc(t.timing[drug])) +
    row(t.rows.links, `<span class="pk-links">${links}</span>`) +
    `</dl>`;

  return { status, legend, chart, axis, sources };
}

/// Meta description of a drug page in its default state (dose at 08:00).
export function describe(lang: TimingLang, drug: ToolDrugId): string {
  const t = copy[lang];
  const profile = PROFILES[drug];
  const peakIndex = Math.max(0, profile.sectionKinds.indexOf('peak'));
  const w = profile.windows[peakIndex];
  return t.description(t.names[drug], clockText(lang, DEFAULT_MINUTES), rangeText(lang, DEFAULT_MINUTES, w.start, w.end));
}
