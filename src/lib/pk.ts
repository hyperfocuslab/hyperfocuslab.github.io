// Reference PK curves shared with the Peakly app.
// Data: src/data/pk/catalog-v1.json is a verbatim copy of Peakly/ReferencePK/catalog-v1.json.
// Interpolation: a line-for-line port of PKReferenceCurve in Peakly/UI/MedicationPKModels.swift
// (shape-preserving Hermite). The golden values in pk.test.ts come from the app's test suite,
// so the web chart and the app chart draw the same curve. Re-copy the JSON when the app's
// modelVersion changes.
import catalog from '../data/pk/catalog-v1.json' with { type: 'json' };

export type DrugId = 'concerta' | 'medikinet' | 'adderall_xr' | 'vyvanse' | 'penid_ir' | 'ritalin_ir' | 'ritalin_la';
export type Evidence = 'legacyReference' | 'digitized' | 'schematic';
export type SectionKind = 'initial' | 'peak' | 'secondary' | 'decline';

export interface Point {
  hour: number;
  value: number;
}
export interface Window {
  start: number;
  end: number;
}
export interface Profile {
  id: DrugId;
  name: string;
  formulation: string;
  evidence: Evidence;
  referenceDoseMg: number;
  tmaxHours: [number, number];
  displayEndHours: number;
  /// The visible chart range, as in the app (ReferencePKProfile.chartWindowHours = 16).
  chartEndHours: number;
  curve: ReferenceCurve;
  sources: { title: string; url: string }[];
  /// Kind of each of the three fixed windows, in chart order.
  sectionKinds: [SectionKind, SectionKind, SectionKind];
  /// The three shaded windows as the app's chart draws them by default (hours after the dose).
  windows: [Window, Window, Window];
  conditions: string;
}

/// Shape-preserving Hermite interpolation; tangents are computed once.
export class ReferenceCurve {
  readonly points: Point[];
  private readonly tangents: number[];

  constructor(points: Point[]) {
    if (points.length < 2 || !points.every((p) => Number.isFinite(p.hour) && Number.isFinite(p.value) && p.value >= 0)) {
      throw new Error('ReferenceCurve needs at least two finite, non-negative points');
    }
    for (let i = 1; i < points.length; i++) {
      if (!(points[i - 1].hour < points[i].hour)) throw new Error('ReferenceCurve hours must increase');
    }
    this.points = points;
    const n = points.length;
    const widths: number[] = [];
    const slopes: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      widths.push(points[i + 1].hour - points[i].hour);
      slopes.push((points[i + 1].value - points[i].value) / widths[i]);
    }
    const m = new Array<number>(n).fill(0);
    m[0] = slopes[0];
    m[n - 1] = slopes[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (slopes[i - 1] * slopes[i] > 0) {
        const w1 = 2 * widths[i] + widths[i - 1];
        const w2 = widths[i] + 2 * widths[i - 1];
        m[i] = (w1 + w2) / (w1 / slopes[i - 1] + w2 / slopes[i]);
      }
    }
    this.tangents = m;
  }

  /// Normalized value at `hour`. Outside the modeled domain it returns 0 as a computational
  /// boundary, not a claim that the drug has left the body (ReferencePK/README.md).
  value(hour: number): number {
    const points = this.points;
    const last = points[points.length - 1];
    if (!Number.isFinite(hour) || hour < points[0].hour || hour > last.hour) return 0;
    for (let i = 0; i < points.length - 1; i++) {
      if (hour <= points[i + 1].hour) {
        const a = points[i];
        const b = points[i + 1];
        const h = b.hour - a.hour;
        const t = (hour - a.hour) / h;
        const t2 = t * t;
        const t3 = t2 * t;
        const y =
          (2 * t3 - 3 * t2 + 1) * a.value +
          (t3 - 2 * t2 + t) * h * this.tangents[i] +
          (-2 * t3 + 3 * t2) * b.value +
          (t3 - t2) * h * this.tangents[i + 1];
        return Math.max(Math.min(a.value, b.value), Math.min(Math.max(a.value, b.value), y));
      }
    }
    return last.value;
  }

  samples(step = 0.25, end = this.points[this.points.length - 1].hour): Point[] {
    if (!Number.isFinite(step) || step <= 0) return [];
    const result: Point[] = [];
    for (let hour = this.points[0].hour; hour < end; hour += step) result.push({ hour, value: this.value(hour) });
    result.push({ hour: end, value: this.value(end) });
    return result;
  }
}

const CHART_WINDOW_HOURS = 16;
// Concerta and Medikinet have charts of their own in the app, which shade the editable windows.
// The other profiles share MedicationReferencePKChartView, which shades the catalog's peak section
// in the middle instead (MedicationPhase.chartPhaseRanges), so the chart, the phase text and the
// Live Activity call the same hours "peak": Adderall XR 5.2–7.7 h rather than 5.75–8.25 h.
const OWN_CHART = ['concerta', 'medikinet'];

export const MODEL_VERSION: string = catalog.modelVersion;

export const PROFILES: Record<DrugId, Profile> = Object.fromEntries(
  catalog.profiles.map((p) => {
    const windows = p.manualTiming.windows.map(([start, end]) => ({ start, end })) as [Window, Window, Window];
    const peak = p.sections.find((s) => s.kind === 'peak');
    if (!OWN_CHART.includes(p.id) && peak) windows[1] = { start: peak.hours[0], end: peak.hours[1] };
    const profile: Profile = {
      id: p.id as DrugId,
      name: p.name,
      formulation: p.formulation,
      evidence: p.evidence as Evidence,
      referenceDoseMg: p.referenceDoseMg,
      tmaxHours: p.tmaxHours as [number, number],
      displayEndHours: p.displayEndHours,
      chartEndHours: Math.min(p.displayEndHours, CHART_WINDOW_HOURS),
      curve: new ReferenceCurve(p.anchors.map(([hour, value]) => ({ hour, value }))),
      sources: p.sources,
      sectionKinds: p.sections.map((s) => s.kind) as [SectionKind, SectionKind, SectionKind],
      windows,
      conditions: p.conditions,
    };
    return [profile.id, profile];
  }),
) as Record<DrugId, Profile>;

/// Profiles the web tool shows. Ritalin IR is left out: its curve, windows and peak are the same as
/// Penid's, and the web names a profile by ingredient and form, so the two would be one entry twice.
export type ToolDrugId = Exclude<DrugId, 'ritalin_ir'>;

/// Select order: the Korean market first, then the catalog's other profiles.
export const DRUG_IDS: ToolDrugId[] = ['concerta', 'medikinet', 'penid_ir', 'adderall_xr', 'vyvanse', 'ritalin_la'];

/// What a reader sees in the URL and the share card's file name: ingredient and form, never a
/// product name. The catalog ids stay inside the code.
export const DRUG_SLUGS: Record<ToolDrugId, string> = {
  concerta: 'methylphenidate-osmotic',
  medikinet: 'methylphenidate-mr',
  penid_ir: 'methylphenidate-ir',
  ritalin_la: 'methylphenidate-biphasic',
  adderall_xr: 'amphetamine-salts-er',
  vyvanse: 'lisdexamfetamine',
};

const BY_SLUG = new Map<string, ToolDrugId>(DRUG_IDS.map((id) => [DRUG_SLUGS[id], id]));

/// The tool's drug for a URL slug (?drug=methylphenidate-osmotic), or null. A Map, so inherited
/// object keys (?drug=constructor) are not slugs.
export function drugFromSlug(value: unknown): ToolDrugId | null {
  return typeof value === 'string' ? (BY_SLUG.get(value) ?? null) : null;
}
