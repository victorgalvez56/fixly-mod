// wear-engine.ts — pure, dependency-free. Pairs with wear-types.ts.
// estimateWear(spec, records, readings, today, ctx?) -> WearEstimate
//
// Model: two tracks per component — km and time — "whichever comes first"
// (the convention owner's manuals use: "every 10,000 km or 12 months, whichever comes first").
// Nothing is measured from the car. Everything is: manual facts + what the user typed + arithmetic.

import type {
  Anchor,
  ComponentSpec,
  Confidence,
  DailyKmEstimate,
  ISODate,
  Interval,
  MaintenanceSpec,
  MissingInput,
  OdometerReading,
  ReasonCode,
  ServiceRecord,
  TrackEstimate,
  UsageProfile,
  VehicleProfile,
  WearEstimate,
  WearStatus,
} from './types';

// ----------------------------------------------------------------------------
// Policy (thresholds + the ONLY assumptions in the engine). All overridable.
// ----------------------------------------------------------------------------

export type Policy = {
  /** ASSUMPTION, not a measurement. Secondary sources put a Lima taxi at ~200 km/day; 150 is a
   *  deliberately lower working figure so a stale odometer does not flip items to "vencido" on
   *  an assumption. The UI must label any number derived from it as "supuesto". */
  defaultDailyKmRideHailing: number;
  /** ASSUMPTION. Same sources put a private car in Lima at ~25 km/day. */
  defaultDailyKmPrivate: number;
  /** Minimum days between first and last reading before a km/day rate is trusted. */
  minSpanDaysForRate: number;
  /** Prefer readings inside this recent window when estimating km/day. */
  recentWindowDays: number;
  /** Rates above this are treated as data-entry errors. */
  maxPlausibleDailyKm: number;
  /** "pronto" window = clamp(fraction × interval, min, max). */
  prontoFraction: number;
  prontoMinKm: number;
  prontoMaxKm: number;
  prontoMinDays: number;
  prontoMaxDays: number;
  /** "toca" also triggers inside this absolute window before due. */
  tocaKm: number;
  tocaDays: number;
  /** "vencido" once consumed ≥ 1 + grace. */
  vencidoGracePct: number;
  vencidoGracePctSafety: number;
  /** Reading age (days) after which confidence drops / is capped. */
  staleReadingDays: number;
  veryStaleReadingDays: number;
  daysPerMonth: number;
};

export const DEFAULT_POLICY: Policy = {
  defaultDailyKmRideHailing: 150,
  defaultDailyKmPrivate: 25,
  minSpanDaysForRate: 14,
  recentWindowDays: 120,
  maxPlausibleDailyKm: 600,
  prontoFraction: 0.2,
  prontoMinKm: 500,
  prontoMaxKm: 5000,
  prontoMinDays: 14,
  prontoMaxDays: 60,
  tocaKm: 300,
  tocaDays: 7,
  vencidoGracePct: 0.1,
  vencidoGracePctSafety: 0.05,
  staleReadingDays: 45,
  veryStaleReadingDays: 120,
  daysPerMonth: 30.4375,
};

export type EstimateContext = {
  usage?: Partial<UsageProfile>;
  declaredWeeklyKm?: number | null;
  acquisition?: VehicleProfile['acquisition'];
  /** The user explicitly tapped "asumir que se hizo al comprar" for this component. Never default true. */
  assumeDoneAtAcquisition?: boolean;
  policy?: Partial<Policy>;
};

// ----------------------------------------------------------------------------
// Dates: 'YYYY-MM-DD' <-> integer day number (UTC-based, so no DST/timezone drift).
// ----------------------------------------------------------------------------

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

export function parseISODate(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = ISO_RE.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const ms = Date.UTC(y, mo - 1, d);
  const dt = new Date(ms);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return Math.round(ms / MS_PER_DAY);
}

export function toISODate(day: number): ISODate {
  const dt = new Date(Math.round(day) * MS_PER_DAY);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}

// ----------------------------------------------------------------------------
// Readings: merge, validate, drop future dates, resolve non-monotonic entries.
// ----------------------------------------------------------------------------

export type CleanReading = { id: string; day: number; km: number; source: OdometerReading['source'] };
export type DroppedReading = { id: string; reason: ReasonCode };

/** Longest non-decreasing subsequence by km over date-sorted readings. Readings outside it are
 *  the minority that contradicts the rest; they are dropped, not "fixed". Ties prefer keeping
 *  the most recent readings. O(n²) — n is tens, not thousands. */
function longestNonDecreasing(items: CleanReading[]): Set<number> {
  const n = items.length;
  const keep = new Set<number>();
  if (n === 0) return keep;
  const len: number[] = new Array<number>(n).fill(1);
  const prev: number[] = new Array<number>(n).fill(-1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (items[j].km <= items[i].km && len[j] + 1 >= len[i]) {
        len[i] = len[j] + 1;
        prev[i] = j;
      }
    }
  }
  let best = 0;
  for (let i = 1; i < n; i++) if (len[i] >= len[best]) best = i;
  for (let i = best; i !== -1; i = prev[i]) keep.add(i);
  return keep;
}

export function cleanReadings(
  readings: OdometerReading[],
  records: ServiceRecord[],
  todayDay: number,
): { clean: CleanReading[]; dropped: DroppedReading[] } {
  const dropped: DroppedReading[] = [];
  const raw: CleanReading[] = [];

  for (const r of readings) {
    const day = parseISODate(r.date);
    if (day === null) {
      dropped.push({ id: r.id, reason: 'reading_invalid_date' });
      continue;
    }
    if (!Number.isFinite(r.km) || r.km < 0) {
      dropped.push({ id: r.id, reason: 'reading_invalid_km' });
      continue;
    }
    if (day > todayDay) {
      dropped.push({ id: r.id, reason: 'reading_in_future' });
      continue;
    }
    raw.push({ id: r.id, day, km: r.km, source: r.source });
  }
  // A service record with an odometer is also an odometer reading.
  for (const s of records) {
    if (s.odometerKm === null || !Number.isFinite(s.odometerKm) || s.odometerKm < 0) continue;
    const day = parseISODate(s.date);
    if (day === null || day > todayDay) continue; // reported separately by the record pass
    raw.push({ id: `rec:${s.id}`, day, km: s.odometerKm, source: 'service_record' });
  }

  raw.sort((a, b) => a.day - b.day || a.km - b.km);
  // Exact duplicates (same day, same km) are one observation.
  const dedup: CleanReading[] = [];
  for (const r of raw) {
    const last = dedup[dedup.length - 1];
    if (last && last.day === r.day && last.km === r.km) continue;
    dedup.push(r);
  }
  const keep = longestNonDecreasing(dedup);
  const clean: CleanReading[] = [];
  dedup.forEach((r, i) => {
    if (keep.has(i)) clean.push(r);
    else dropped.push({ id: r.id, reason: 'reading_non_monotonic' });
  });
  return { clean, dropped };
}

// ----------------------------------------------------------------------------
// km/day: readings → declared weekly km → labeled default assumption.
// ----------------------------------------------------------------------------

export function estimateDailyKm(
  clean: CleanReading[],
  todayDay: number,
  ctx: EstimateContext,
  policy: Policy,
  reasons: Set<ReasonCode>,
): DailyKmEstimate {
  const rateOver = (subset: CleanReading[]): DailyKmEstimate | null => {
    if (subset.length < 2) return null;
    const first = subset[0];
    const last = subset[subset.length - 1];
    const span = last.day - first.day;
    if (span < policy.minSpanDaysForRate) return null;
    const rate = (last.km - first.km) / span;
    if (rate > policy.maxPlausibleDailyKm) {
      reasons.add('daily_km_implausible');
      return null;
    }
    return { kmPerDay: rate, source: 'readings', readingsUsed: subset.length, spanDays: span };
  };

  const recent = clean.filter((r) => r.day >= todayDay - policy.recentWindowDays);
  const fromReadings = rateOver(recent) ?? rateOver(clean);
  if (fromReadings) {
    reasons.add('daily_km_from_readings');
    if (fromReadings.kmPerDay === 0) reasons.add('daily_km_zero');
    return fromReadings;
  }
  if (clean.length === 0) reasons.add('no_readings');
  else if (clean.length === 1) reasons.add('single_reading');
  else reasons.add('readings_span_too_short');

  const weekly = ctx.declaredWeeklyKm;
  if (typeof weekly === 'number' && Number.isFinite(weekly) && weekly > 0) {
    reasons.add('daily_km_declared');
    return { kmPerDay: weekly / 7, source: 'declared', readingsUsed: 0, spanDays: 0 };
  }

  reasons.add('daily_km_default_assumption');
  const ride = ctx.usage?.rideHailing === true;
  return {
    kmPerDay: ride ? policy.defaultDailyKmRideHailing : policy.defaultDailyKmPrivate,
    source: 'default_assumption',
    readingsUsed: 0,
    spanDays: 0,
    assumptionLabel: ride
      ? `Supuesto: ${policy.defaultDailyKmRideHailing} km por día (conductor de aplicativo). Cámbialo en tu perfil.`
      : `Supuesto: ${policy.defaultDailyKmPrivate} km por día (uso particular). Cámbialo en tu perfil.`,
  };
}

// ----------------------------------------------------------------------------
// Odometer at an arbitrary date, from the cleaned readings.
// ----------------------------------------------------------------------------

function kmAtDay(
  clean: CleanReading[],
  day: number,
  kmPerDay: number,
  reasons: Set<ReasonCode>,
): number | null {
  if (clean.length === 0) return null;
  const first = clean[0];
  const last = clean[clean.length - 1];
  if (day <= first.day) {
    if (day === first.day) return first.km;
    reasons.add('anchor_km_extrapolated');
    return Math.max(0, first.km - (first.day - day) * kmPerDay);
  }
  if (day >= last.day) {
    if (day === last.day) return last.km;
    reasons.add('anchor_after_last_reading');
    return last.km + (day - last.day) * kmPerDay;
  }
  for (let i = 1; i < clean.length; i++) {
    const a = clean[i - 1];
    const b = clean[i];
    if (day >= a.day && day <= b.day) {
      if (b.day === a.day) return b.km;
      reasons.add('anchor_km_interpolated');
      return a.km + ((b.km - a.km) * (day - a.day)) / (b.day - a.day);
    }
  }
  return last.km;
}

// ----------------------------------------------------------------------------
// Anchor: the last event that reset the component's clock.
// ----------------------------------------------------------------------------

function findAnchor(
  spec: ComponentSpec,
  records: ServiceRecord[],
  clean: CleanReading[],
  todayDay: number,
  ctx: EstimateContext,
  kmPerDay: number,
  reasons: Set<ReasonCode>,
): { anchor: Anchor; inspectionSaidReplace: boolean } {
  type Ev = { rec: ServiceRecord; day: number };
  const events: Ev[] = [];
  for (const rec of records) {
    if (!rec.componentIds.includes(spec.componentId)) continue;
    const day = parseISODate(rec.date);
    if (day === null) {
      reasons.add('record_invalid_date');
      continue;
    }
    if (day > todayDay) {
      reasons.add('record_in_future');
      continue;
    }
    events.push({ rec, day });
  }
  events.sort((a, b) => b.day - a.day); // newest first

  const resets: ServiceRecord['kind'][] =
    spec.action === 'replace' || spec.action === 'rotate'
      ? ['replaced']
      : ['replaced', 'inspected_ok'];

  const latestReplace = events.find((e) => e.rec.kind === 'replaced');
  const latestNeedsReplace = events.find((e) => e.rec.kind === 'inspected_needs_replace');
  const inspectionSaidReplace =
    latestNeedsReplace !== undefined && (latestReplace === undefined || latestNeedsReplace.day > latestReplace.day);

  const hit = events.find((e) => resets.includes(e.rec.kind));
  if (hit) {
    const interp = hit.rec.odometerKm === null;
    const km = interp ? kmAtDay(clean, hit.day, kmPerDay, reasons) : hit.rec.odometerKm;
    return {
      anchor: {
        kind: hit.rec.kind === 'replaced' ? 'service_record' : 'inspection',
        date: toISODate(hit.day),
        km,
        kmWasInterpolated: interp,
        recordId: hit.rec.id,
      },
      inspectionSaidReplace,
    };
  }

  const acq = ctx.acquisition;
  const acqDay = parseISODate(acq?.date);
  if (acq && acqDay !== null && acqDay <= todayDay) {
    if (!acq.wasUsed) {
      reasons.add('anchor_new_vehicle');
      return {
        anchor: { kind: 'new_vehicle', date: toISODate(acqDay), km: acq.odometerKm ?? 0, kmWasInterpolated: false },
        inspectionSaidReplace,
      };
    }
    if (ctx.assumeDoneAtAcquisition === true) {
      reasons.add('anchor_assumed_at_acquisition');
      const interp = acq.odometerKm === undefined;
      const km = interp ? kmAtDay(clean, acqDay, kmPerDay, reasons) : (acq.odometerKm as number);
      return {
        anchor: { kind: 'assumed_at_acquisition', date: toISODate(acqDay), km, kmWasInterpolated: interp },
        inspectionSaidReplace,
      };
    }
  }
  reasons.add('no_anchor');
  return { anchor: { kind: 'none', date: null, km: null, kmWasInterpolated: false }, inspectionSaidReplace };
}

// ----------------------------------------------------------------------------
// Severe usage → the manual's own severe interval, if it defines one. Never a made-up multiplier.
// ----------------------------------------------------------------------------

export function isSevereUsage(u: Partial<UsageProfile> | undefined): boolean {
  if (!u) return false;
  return u.rideHailing === true || u.dustyRoads === true || u.shortTrips === true || u.mostlyCity === true;
}

function applicableInterval(
  spec: ComponentSpec,
  ctx: EstimateContext,
  anchorKind: Anchor['kind'],
  reasons: Set<ReasonCode>,
): { interval: Interval; severeApplied: boolean } {
  let interval: Interval = { km: spec.normal.km, months: spec.normal.months };
  let severeApplied = false;
  if (isSevereUsage(ctx.usage)) {
    if (spec.severe) {
      interval = { km: spec.severe.km ?? spec.normal.km, months: spec.severe.months ?? spec.normal.months };
      severeApplied = true;
      reasons.add('severe_interval_applied');
    } else {
      reasons.add('severe_not_in_manual');
    }
  }
  if (anchorKind === 'new_vehicle' && typeof spec.firstServiceKm === 'number') {
    interval = { km: spec.firstServiceKm, months: interval.months };
    reasons.add('first_service_interval');
  }
  return { interval, severeApplied };
}

// ----------------------------------------------------------------------------
// Status and confidence.
// ----------------------------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function statusFrom(
  percent: number,
  remainingKm: number | null,
  remainingDays: number | null,
  kmInterval: number | null,
  dayInterval: number | null,
  criticality: ComponentSpec['criticality'],
  policy: Policy,
): WearStatus {
  const grace = criticality === 'safety' ? policy.vencidoGracePctSafety : policy.vencidoGracePct;
  if (percent >= 1 + grace) return 'vencido';
  if (percent >= 1) return 'toca';
  if (remainingKm !== null && remainingKm <= policy.tocaKm) return 'toca';
  if (remainingDays !== null && remainingDays <= policy.tocaDays) return 'toca';
  const prontoKm = kmInterval === null ? null : clamp(kmInterval * policy.prontoFraction, policy.prontoMinKm, policy.prontoMaxKm);
  const prontoDays =
    dayInterval === null ? null : clamp(dayInterval * policy.prontoFraction, policy.prontoMinDays, policy.prontoMaxDays);
  if (remainingKm !== null && prontoKm !== null && remainingKm <= prontoKm) return 'pronto';
  if (remainingDays !== null && prontoDays !== null && remainingDays <= prontoDays) return 'pronto';
  return 'ok';
}

function confidenceFrom(args: {
  anchor: Anchor;
  readingsCount: number;
  lastReadingAgeDays: number | null;
  daily: DailyKmEstimate;
  spec: ComponentSpec;
  needsKm: boolean;
  policy: Policy;
}): Confidence {
  const { anchor, readingsCount, lastReadingAgeDays, daily, spec, needsKm, policy } = args;
  if (anchor.kind === 'none') return 'ninguna';
  let score = 0;
  const caps: Confidence[] = [];

  // Anchor quality
  if (anchor.kind === 'service_record' || anchor.kind === 'new_vehicle') score += anchor.kmWasInterpolated ? 2 : 3;
  else if (anchor.kind === 'inspection') score += 2;
  else if (anchor.kind === 'assumed_at_acquisition') caps.push('baja');

  if (needsKm) {
    // Reading count
    if (readingsCount >= 4) score += 2;
    else if (readingsCount >= 2) score += 1;
    // Freshness
    if (lastReadingAgeDays === null) caps.push('baja');
    else if (lastReadingAgeDays <= 14) score += 2;
    else if (lastReadingAgeDays <= policy.staleReadingDays) score += 1;
    else if (lastReadingAgeDays > policy.veryStaleReadingDays) caps.push('baja');
    // Rate source
    if (daily.source === 'readings') score += daily.spanDays >= 30 ? 2 : 1;
    else if (daily.source === 'declared') score += 1;
    else caps.push('media');
  } else {
    score += 3; // time-only items do not depend on the odometer at all
  }

  // Spec provenance
  if (spec.source.kind === 'placeholder') caps.push('baja');
  else if (spec.source.kind === 'user_entered') caps.push('media');
  else if (!spec.source.reviewedBy) caps.push('media');

  let level: Confidence = score >= 7 ? 'alta' : score >= 4 ? 'media' : 'baja';
  const order: Confidence[] = ['ninguna', 'baja', 'media', 'alta'];
  for (const cap of caps) if (order.indexOf(cap) < order.indexOf(level)) level = cap;
  return level;
}

// ----------------------------------------------------------------------------
// The estimator.
// ----------------------------------------------------------------------------

export function estimateWear(
  spec: ComponentSpec,
  records: ServiceRecord[],
  readings: OdometerReading[],
  today: ISODate,
  ctx: EstimateContext = {},
): WearEstimate {
  const policy: Policy = { ...DEFAULT_POLICY, ...(ctx.policy ?? {}) };
  const todayDay = parseISODate(today);
  if (todayDay === null) throw new TypeError(`estimateWear: invalid today "${today}" (expected YYYY-MM-DD)`);

  const reasons = new Set<ReasonCode>();
  const missing = new Set<MissingInput>();
  if (spec.source.kind === 'placeholder') {
    reasons.add('spec_is_placeholder');
    missing.add('spec_from_manual');
  } else if (!spec.source.reviewedBy) {
    reasons.add('spec_unreviewed');
  }

  // 1. Readings
  const { clean, dropped } = cleanReadings(readings, records, todayDay);
  for (const d of dropped) reasons.add(d.reason);

  // 2. km/day
  const daily = estimateDailyKm(clean, todayDay, ctx, policy, reasons);
  if (daily.source !== 'readings') {
    if (clean.length < 2) missing.add('second_odometer_reading');
    if (daily.source === 'default_assumption') missing.add('weekly_km');
  }

  // 3. Odometer today. Projected forward only from real information (readings or declared km),
  //    never from the default assumption — an assumption must not move a status on its own.
  const last = clean.length ? clean[clean.length - 1] : null;
  const lastAge = last ? todayDay - last.day : null;
  let odometerNowKm: number | null = last ? last.km : null;
  let odometerIsProjected = false;
  if (last && lastAge !== null && lastAge > 0) {
    if (daily.source !== 'default_assumption') {
      odometerNowKm = last.km + daily.kmPerDay * lastAge;
      odometerIsProjected = true;
      reasons.add('odometer_projected');
    }
    if (lastAge > policy.veryStaleReadingDays) reasons.add('odometer_very_stale');
    else if (lastAge > policy.staleReadingDays) reasons.add('odometer_stale');
  }
  if (!last) missing.add('odometer_reading');

  // 4. Anchor
  const { anchor, inspectionSaidReplace } = findAnchor(spec, records, clean, todayDay, ctx, daily.kmPerDay, reasons);

  // 5. Interval
  const { interval, severeApplied } = applicableInterval(spec, ctx, anchor.kind, reasons);

  const base: Omit<
    WearEstimate,
    'status' | 'confidence' | 'binding' | 'percentConsumed' | 'remainingKm' | 'remainingDays' | 'dueAtKm' | 'projectedDueDate' | 'kmTrack' | 'timeTrack'
  > = {
    componentId: spec.componentId,
    action: spec.action,
    odometerNowKm,
    odometerIsProjected,
    lastReadingDate: last ? toISODate(last.day) : null,
    lastReadingAgeDays: lastAge,
    dailyKm: daily,
    severeApplied,
    anchor,
    reasons: [],
    missingInputs: [],
    specSourceKind: spec.source.kind,
  };
  const finish = (partial: Pick<
    WearEstimate,
    'status' | 'confidence' | 'binding' | 'percentConsumed' | 'remainingKm' | 'remainingDays' | 'dueAtKm' | 'projectedDueDate' | 'kmTrack' | 'timeTrack'
  >): WearEstimate => ({ ...base, ...partial, reasons: Array.from(reasons), missingInputs: Array.from(missing) });

  const empty = (status: WearStatus, confidence: Confidence): WearEstimate =>
    finish({
      status,
      confidence,
      binding: 'none',
      percentConsumed: null,
      remainingKm: null,
      remainingDays: null,
      dueAtKm: null,
      projectedDueDate: null,
      kmTrack: null,
      timeTrack: null,
    });

  // 6. Items the manual does not schedule, or specs with no interval at all.
  if (spec.action === 'no_schedule') {
    reasons.add('no_schedule_in_manual');
    if (inspectionSaidReplace) reasons.add('inspection_said_replace');
    return empty(inspectionSaidReplace ? 'toca' : 'sin_datos', inspectionSaidReplace ? 'alta' : 'ninguna');
  }
  if (interval.km === null && interval.months === null) {
    reasons.add('no_interval_in_spec');
    missing.add('spec_from_manual');
    return empty('sin_datos', 'ninguna');
  }

  // 7. A recorded inspection that said "replace" overrides arithmetic until a 'replaced' record lands.
  if (inspectionSaidReplace) {
    reasons.add('inspection_said_replace');
    return empty('toca', 'alta');
  }

  // 8. No anchor: honest "sin datos", plus a hint when the car has plainly driven past one interval.
  if (anchor.kind === 'none') {
    missing.add('last_service_date');
    if (
      odometerNowKm !== null &&
      interval.km !== null &&
      odometerNowKm >= interval.km &&
      spec.criticality !== 'comfort'
    ) {
      reasons.add('possibly_overdue_never_recorded');
    }
    return empty('sin_datos', 'ninguna');
  }

  // 9. Tracks
  let kmTrack: TrackEstimate | null = null;
  if (interval.km !== null) {
    if (anchor.km !== null && odometerNowKm !== null) {
      const used = Math.max(0, odometerNowKm - anchor.km);
      kmTrack = { interval: interval.km, used, remaining: interval.km - used, percent: used / interval.km };
    } else {
      reasons.add('km_track_unavailable');
      if (odometerNowKm === null) missing.add('odometer_reading');
      if (anchor.km === null) missing.add('last_service_km');
    }
  }
  let timeTrack: TrackEstimate | null = null;
  if (interval.months !== null) {
    const anchorDay = parseISODate(anchor.date);
    if (anchorDay !== null) {
      const intervalDays = Math.round(interval.months * policy.daysPerMonth);
      const used = Math.max(0, todayDay - anchorDay);
      timeTrack = { interval: intervalDays, used, remaining: intervalDays - used, percent: used / intervalDays };
    } else {
      reasons.add('time_track_unavailable');
      missing.add('last_service_date');
    }
  }
  if (!kmTrack && !timeTrack) return empty('sin_datos', 'ninguna');

  // 10. Whichever comes first.
  const kmDays =
    kmTrack === null ? null : daily.kmPerDay > 0 ? kmTrack.remaining / daily.kmPerDay : kmTrack.remaining <= 0 ? kmTrack.remaining : Number.POSITIVE_INFINITY;
  const timeDays = timeTrack === null ? null : timeTrack.remaining;
  let binding: WearEstimate['binding'] = 'none';
  let remainingDays: number | null = null;
  if (kmDays !== null && timeDays !== null) {
    binding = kmDays <= timeDays ? 'km' : 'time';
    remainingDays = Math.min(kmDays, timeDays);
  } else if (kmDays !== null) {
    binding = 'km';
    remainingDays = kmDays;
  } else if (timeDays !== null) {
    binding = 'time';
    remainingDays = timeDays;
  }
  if (remainingDays !== null && !Number.isFinite(remainingDays)) remainingDays = null; // parked car, km-only item

  const kmFromTime = timeTrack === null ? null : timeTrack.remaining * daily.kmPerDay;
  let remainingKm: number | null = null;
  if (kmTrack && kmFromTime !== null) remainingKm = Math.min(kmTrack.remaining, kmFromTime);
  else if (kmTrack) remainingKm = kmTrack.remaining;
  else if (kmFromTime !== null) remainingKm = kmFromTime;

  const percentConsumed = Math.max(kmTrack?.percent ?? 0, timeTrack?.percent ?? 0);
  const dueAtKm = kmTrack && anchor.km !== null ? anchor.km + kmTrack.interval : null;
  const projectedDueDate = remainingDays === null ? null : toISODate(todayDay + remainingDays);

  const status = statusFrom(
    percentConsumed,
    remainingKm === null ? null : Math.round(remainingKm),
    remainingDays === null ? null : Math.round(remainingDays),
    kmTrack ? kmTrack.interval : null,
    timeTrack ? timeTrack.interval : null,
    spec.criticality,
    policy,
  );
  const confidence = confidenceFrom({
    anchor,
    readingsCount: clean.length,
    lastReadingAgeDays: lastAge,
    daily,
    spec,
    needsKm: kmTrack !== null,
    policy,
  });

  return finish({
    status,
    confidence,
    binding,
    percentConsumed: round3(percentConsumed),
    remainingKm: remainingKm === null ? null : Math.round(remainingKm),
    remainingDays: remainingDays === null ? null : Math.round(remainingDays),
    dueAtKm: dueAtKm === null ? null : Math.round(dueAtKm),
    projectedDueDate,
    kmTrack: kmTrack && roundTrack(kmTrack),
    timeTrack: timeTrack && roundTrack(timeTrack),
  });
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
function roundTrack(t: TrackEstimate): TrackEstimate {
  return { interval: Math.round(t.interval), used: Math.round(t.used), remaining: Math.round(t.remaining), percent: round3(t.percent) };
}

// ----------------------------------------------------------------------------
// Whole-car helper: filter the manual's lines by variant, build the context from the profile.
// ----------------------------------------------------------------------------

export function estimateAll(
  spec: MaintenanceSpec,
  vehicle: VehicleProfile,
  records: ServiceRecord[],
  readings: OdometerReading[],
  today: ISODate,
  assumeDoneAtAcquisitionFor: ReadonlySet<string> = new Set(),
  policy?: Partial<Policy>,
): WearEstimate[] {
  const applies = (c: ComponentSpec): boolean => {
    const a = c.appliesTo;
    if (!a) return true;
    if (a.engines && vehicle.engineCode && !a.engines.includes(vehicle.engineCode)) return false;
    if (a.transmissions && vehicle.transmission !== 'unknown' && !a.transmissions.includes(vehicle.transmission)) return false;
    if (a.fuels && vehicle.fuel !== 'unknown' && !a.fuels.includes(vehicle.fuel)) return false;
    return true;
  };
  return spec.components.filter(applies).map((c) =>
    estimateWear(c, records, readings, today, {
      usage: vehicle.usage,
      declaredWeeklyKm: vehicle.declaredWeeklyKm ?? null,
      acquisition: vehicle.acquisition,
      assumeDoneAtAcquisition: assumeDoneAtAcquisitionFor.has(c.componentId),
      policy,
    }),
  );
}

/** Sort helper for the UI: worst first, then soonest, then by confidence (unknowns last). */
export function sortByUrgency(list: WearEstimate[]): WearEstimate[] {
  const rank: Record<WearStatus, number> = { vencido: 0, toca: 1, pronto: 2, ok: 3, sin_datos: 4 };
  return [...list].sort((a, b) => {
    const r = rank[a.status] - rank[b.status];
    if (r !== 0) return r;
    const da = a.remainingDays ?? Number.POSITIVE_INFINITY;
    const db = b.remainingDays ?? Number.POSITIVE_INFINITY;
    return da - db;
  });
}
