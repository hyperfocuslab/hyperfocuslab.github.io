// Run: npm test (node --test). Golden values are copied from the app's
// PeaklyTests/MedicationLiveActivityTimingTests.swift testNativeInterpolationMatchesSharedGoldenValues,
// so a passing run means the web curve equals the iOS curve at these points (|diff| <= 1e-12).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROFILES, DRUG_IDS, DRUG_SLUGS, MODEL_VERSION, drugFromSlug, type DrugId } from './pk.ts';

test('slugs and ids map one to one, and only slugs are accepted', () => {
  const slugs = DRUG_IDS.map((id) => DRUG_SLUGS[id]);
  assert.equal(new Set(slugs).size, DRUG_IDS.length);
  for (const id of DRUG_IDS) assert.equal(drugFromSlug(DRUG_SLUGS[id]), id, id);
  assert.deepEqual(DRUG_SLUGS, {
    concerta: 'methylphenidate-oros',
    medikinet: 'methylphenidate-mr',
    penid_ir: 'methylphenidate-ir',
    ritalin_la: 'methylphenidate-biphasic',
    adderall_xr: 'amphetamine-salts-er',
    vyvanse: 'lisdexamfetamine',
  });
  // Catalog ids (the old URLs), inherited object keys and other values are not slugs.
  for (const bad of [...Object.keys(PROFILES), 'constructor', '__proto__', 'toString', 'hasOwnProperty', '', 'Concerta', null, undefined, 3]) {
    assert.equal(drugFromSlug(bad), null, String(bad));
  }
  // Slugs name ingredient and form only.
  for (const slug of slugs) assert.match(slug, /^(methylphenidate|amphetamine|lisdexamfetamine)(-[a-z]+)*$/);
});

test('Ritalin IR is left out of the web list: its curve and windows are Penid\'s', () => {
  assert.ok(!(DRUG_IDS as string[]).includes('ritalin_ir'));
  const [a, b] = [PROFILES.penid_ir, PROFILES.ritalin_ir];
  assert.deepEqual(a.curve.points, b.curve.points);
  assert.deepEqual(a.windows, b.windows);
  assert.deepEqual(a.sectionKinds, b.sectionKinds);
  assert.deepEqual(a.tmaxHours, b.tmaxHours);
  assert.equal(a.evidence, b.evidence);
});

const GOLDEN: [DrugId, number, number][] = [
  ['concerta', 0.75, 0.398733296213808],
  ['concerta', 2.25, 0.581514151954132],
  ['concerta', 3.5, 0.623615160349855],
  ['concerta', 6.25, 0.900888888888886],
  ['concerta', 8.75, 0.930359231411863],
  ['concerta', 12.25, 0.518506326611309],
  ['concerta', 18.25, 0.0],
  ['concerta', 24.0, 0.0],
  ['medikinet', 0.75, 0.5],
  ['medikinet', 2.25, 0.95],
  ['medikinet', 3.5, 0.940266666666696],
  ['medikinet', 6.25, 0.863577127659575],
  ['medikinet', 8.75, 0.469521313448075],
  ['medikinet', 12.25, 0.239435489251747],
  ['medikinet', 18.25, 0.0],
  ['medikinet', 24.0, 0.0],
  ['adderall_xr', 0.75, 0.068338815789474],
  ['adderall_xr', 2.25, 0.451066761363636],
  ['adderall_xr', 3.5, 0.743493338557994],
  ['adderall_xr', 6.25, 0.986875],
  ['adderall_xr', 8.75, 0.94623801293488],
  ['adderall_xr', 12.25, 0.767048891129032],
  ['adderall_xr', 18.25, 0.523117852980091],
  ['adderall_xr', 24.0, 0.36],
  ['vyvanse', 0.75, 0.1279125],
  ['vyvanse', 2.25, 0.5842],
  ['vyvanse', 3.5, 0.9388],
  ['vyvanse', 6.25, 0.893938636150675],
  ['vyvanse', 8.75, 0.747589043090062],
  ['vyvanse', 12.25, 0.569650390625],
  ['vyvanse', 18.25, 0.374299537417763],
  ['vyvanse', 24.0, 0.25],
  ['penid_ir', 0.75, 0.475],
  ['penid_ir', 2.25, 0.97195225416013],
  ['penid_ir', 3.5, 0.658764666478003],
  ['penid_ir', 6.25, 0.308173248812072],
  ['penid_ir', 8.75, 0.154112128632097],
  ['penid_ir', 12.25, 0.0],
  ['penid_ir', 18.25, 0.0],
  ['penid_ir', 24.0, 0.0],
  ['ritalin_ir', 0.75, 0.475],
  ['ritalin_ir', 2.25, 0.97195225416013],
  ['ritalin_ir', 3.5, 0.658764666478003],
  ['ritalin_ir', 6.25, 0.308173248812072],
  ['ritalin_ir', 8.75, 0.154112128632097],
  ['ritalin_ir', 12.25, 0.0],
  ['ritalin_ir', 18.25, 0.0],
  ['ritalin_ir', 24.0, 0.0],
  ['ritalin_la', 0.5, 0.0],
  ['ritalin_la', 1.25, 0.329562306370696],
  ['ritalin_la', 2.0, 0.854838709677],
  ['ritalin_la', 2.75, 0.68672130953861],
  ['ritalin_la', 3.6, 0.483870967742],
  ['ritalin_la', 4.5, 0.721580781549118],
  ['ritalin_la', 5.5, 1.0],
  ['ritalin_la', 6.25, 0.931307632377352],
  ['ritalin_la', 8.75, 0.505077254819082],
  ['ritalin_la', 12.25, 0.242377202965478],
  ['ritalin_la', 16.0, 0.110198906875],
  ['ritalin_la', 18.25, 0.0],
];

test('interpolation matches the app golden values', () => {
  assert.equal(GOLDEN.length, 60);
  for (const [id, hour, expected] of GOLDEN) {
    const actual = PROFILES[id].curve.value(hour);
    assert.ok(Math.abs(actual - expected) <= 1e-12, `${id} at ${hour}: ${actual} != ${expected}`);
  }
});

test('anchors are reproduced exactly and out-of-domain input returns 0', () => {
  for (const id of Object.keys(PROFILES) as DrugId[]) {
    const p = PROFILES[id];
    for (const anchor of p.curve.points) assert.ok(Math.abs(p.curve.value(anchor.hour) - anchor.value) <= 1e-12, `${id} anchor ${anchor.hour}`);
    assert.equal(p.curve.value(NaN), 0);
    assert.equal(p.curve.value(-1), 0);
    assert.equal(p.curve.value(p.displayEndHours + 1), 0);
  }
});

test('catalog shape: seven profiles, three ordered windows each, 16 h chart cap', () => {
  assert.equal(Object.keys(PROFILES).length, 7);
  assert.equal(DRUG_IDS.length, 6);
  assert.equal(MODEL_VERSION, '2026-11-01-v4');
  for (const id of Object.keys(PROFILES) as DrugId[]) {
    const p = PROFILES[id];
    assert.equal(p.windows.length, 3);
    for (let i = 0; i < 3; i++) {
      assert.ok(p.windows[i].start < p.windows[i].end, `${id} window ${i}`);
      if (i > 0) assert.ok(p.windows[i - 1].end <= p.windows[i].start + 1e-9, `${id} windows overlap at ${i}`);
    }
    assert.equal(p.chartEndHours, Math.min(p.displayEndHours, 16));
  }
});
