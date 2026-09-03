// wear-types.ts — Fixly maintenance wear model. NO telemetry.
// Every field is one of: (a) a fact taken from the owner's manual, (b) something the user typed,
// or (c) a value derived from (a) and (b). Nothing here is measured from the car.

export type ISODate = string; // 'YYYY-MM-DD', calendar date, no time zone

export type Transmission = 'MT' | 'AT' | 'CVT' | 'DCT' | 'unknown';
export type Fuel = 'gasolina' | 'diesel' | 'glp' | 'gnv' | 'hibrido' | 'electrico' | 'unknown';

/** Known component ids. The union is open so a manual can add model-specific lines. */
export type ComponentId =
  | 'aceite_motor'
  | 'filtro_aire_motor'
  | 'filtro_cabina'
  | 'filtro_combustible'
  | 'bujias'
  | 'refrigerante'
  | 'aceite_caja_mt'
  | 'aceite_caja_at'
  | 'aceite_cvt'
  | 'correa_distribucion'
  | 'cadena_distribucion'
  | 'correa_accesorios'
  | 'pastillas_freno'
  | 'discos_freno'
  | 'liquido_frenos'
  | 'rotacion_llantas'
  | 'alineamiento_balanceo'
  | 'llantas'
  | 'bateria'
  | 'plumillas'
  | 'liquido_direccion'
  | 'aceite_diferencial'
  | 'amortiguadores'
  | 'ajuste_valvulas'
  | 'kit_gnv_glp'
  | 'aire_acondicionado'
  | (string & {});

export type Zone =
  | 'motor'
  | 'transmision'
  | 'refrigeracion'
  | 'frenos'
  | 'llantas'
  | 'electrico'
  | 'cabina'
  | 'suspension_direccion'
  | 'combustible';

/** What the user tells us about how the car is used. Maps onto the manual's "severe conditions". */
export type UsageProfile = {
  rideHailing: boolean; // taxi / aplicativo: "heavy commercial use" in most manuals
  mostlyCity: boolean; // stop-and-go, extended idling
  dustyRoads: boolean; // unpaved or dusty roads
  shortTrips: boolean; // habitual trips under ~8 km
  highAltitude: boolean; // sierra; some manuals list mountain driving
};

export type VehicleProfile = {
  id: string;
  brand: string;
  model: string;
  year: number;
  engineCode?: string; // e.g. '1NZ-FE' — needed when the manual splits intervals by engine
  transmission: Transmission;
  fuel: Fuel;
  usage: UsageProfile;
  /** How the user got the car. Drives the "unknown last service" logic for used cars. */
  acquisition?: { date?: ISODate; odometerKm?: number; wasUsed: boolean };
  /** Answer to "¿Cuántos km manejas por semana?" — used only when readings are insufficient. */
  declaredWeeklyKm?: number;
};

export type SpecSourceKind =
  | 'owner_manual'
  | 'warranty_booklet'
  | 'dealer_published'
  | 'user_entered' // the driver typed it from his own booklet while the manual is not in the base
  | 'placeholder'; // generic reference value, never shown as a status

/** Bibliographic reference to where a fact came from. Never stores the manual's wording. */
export type SpecSource = {
  kind: SpecSourceKind;
  documentTitle?: string;
  edition?: string; // publisher code / year, e.g. 'OM52G21S 2015'
  market?: string; // 'PE', 'LATAM', 'US', 'global'
  pageRefs?: string[]; // ['p. 412', 'p. 415']
  extractedAt: ISODate;
  extractedBy: 'llm' | 'human';
  reviewedBy?: string; // human reviewer id; until set, the UI must show the "sin revisar" caveat
};

export type ComponentAction =
  | 'replace' // the manual schedules a replacement
  | 'inspect' // the manual only schedules an inspection (pads, discs, battery, tires)
  | 'inspect_then_replace' // inspect on schedule, replace by criterion or when the inspection says so
  | 'rotate' // tires
  | 'no_schedule'; // the manual schedules nothing (timing chain, "lifetime" fluids)

export type Interval = { km: number | null; months: number | null };

export type SevereCondition =
  | 'dusty_roads'
  | 'short_trips'
  | 'taxi_or_commercial'
  | 'towing'
  | 'extended_idling'
  | 'extreme_heat'
  | 'extreme_cold'
  | 'mountain'
  | 'other';

export type ComponentSpec = {
  componentId: ComponentId;
  zone: Zone;
  action: ComponentAction;
  /** Normal-use interval. Both null only for 'no_schedule'. A null km with a months value = time-only item. */
  normal: Interval;
  /** Interval under the manual's severe/special operating conditions. null = the manual defines none. Never invented. */
  severe: Interval | null;
  /** Some manuals schedule the first service differently (e.g. first gearbox oil at 1,000 km). */
  firstServiceKm?: number | null;
  /** For inspect items: the manual's replacement criterion as data (e.g. pad thickness limit). */
  replaceCriterion?: { measure: string; limit: number; unit: string } | null;
  /** Consumable facts (grade, capacity). Facts, not text. */
  consumable?: { grade?: string; capacityL?: number; partNote?: string };
  /** When the manual splits the line by engine/transmission/fuel. Absent = applies to all variants. */
  appliesTo?: { engines?: string[]; transmissions?: Transmission[]; fuels?: Fuel[] };
  criticality: 'safety' | 'engine' | 'comfort';
  source: SpecSource;
};

/** One manual = one MaintenanceSpec. Extracted once, reused for every car of that model/years. */
export type MaintenanceSpec = {
  specId: string;
  brand: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  /** The manual's own list of severe conditions, as codes. The sentence itself is never stored. */
  severeConditions: SevereCondition[];
  components: ComponentSpec[];
  source: SpecSource;
};

export type ServiceKind =
  | 'replaced'
  | 'inspected_ok'
  | 'inspected_needs_replace'
  | 'unknown_before_purchase'; // user explicitly says "no sé" for a used car

/** A service the user records. One workshop visit may cover several components. */
export type ServiceRecord = {
  id: string;
  componentIds: ComponentId[];
  date: ISODate;
  odometerKm: number | null; // null when the user does not remember
  kind: ServiceKind;
  costPen?: number;
  workshop?: string;
  note?: string;
  source: 'user' | 'workshop_receipt' | 'assumed_at_purchase';
};

export type OdometerReading = {
  id: string;
  date: ISODate;
  km: number;
  source: 'user' | 'service_record' | 'acquisition' | 'photo';
};

export type WearStatus = 'ok' | 'pronto' | 'toca' | 'vencido' | 'sin_datos';
export type Confidence = 'alta' | 'media' | 'baja' | 'ninguna';

export type DailyKmSource = 'readings' | 'declared' | 'default_assumption';

export type DailyKmEstimate = {
  kmPerDay: number;
  source: DailyKmSource;
  readingsUsed: number;
  spanDays: number;
  /** Set only when source === 'default_assumption'. Shown verbatim in the UI as an assumption. */
  assumptionLabel?: string;
};

export type TrackEstimate = {
  interval: number; // applied interval, in km or days
  used: number;
  remaining: number; // negative when overdue
  percent: number; // 0..∞, 1 = due
};

export type AnchorKind = 'service_record' | 'inspection' | 'assumed_at_acquisition' | 'new_vehicle' | 'none';

export type Anchor = {
  kind: AnchorKind;
  date: ISODate | null;
  km: number | null;
  kmWasInterpolated: boolean;
  recordId?: string;
};

export type ReasonCode =
  | 'reading_invalid_date'
  | 'reading_invalid_km'
  | 'reading_in_future'
  | 'reading_non_monotonic'
  | 'record_invalid_date'
  | 'record_in_future'
  | 'no_readings'
  | 'single_reading'
  | 'readings_span_too_short'
  | 'daily_km_from_readings'
  | 'daily_km_declared'
  | 'daily_km_default_assumption'
  | 'daily_km_implausible'
  | 'daily_km_zero'
  | 'odometer_projected'
  | 'odometer_stale'
  | 'odometer_very_stale'
  | 'anchor_km_interpolated'
  | 'anchor_km_extrapolated'
  | 'anchor_assumed_at_acquisition'
  | 'anchor_new_vehicle'
  | 'anchor_after_last_reading'
  | 'no_anchor'
  | 'possibly_overdue_never_recorded'
  | 'inspection_said_replace'
  | 'severe_interval_applied'
  | 'severe_not_in_manual'
  | 'first_service_interval'
  | 'km_track_unavailable'
  | 'time_track_unavailable'
  | 'no_interval_in_spec'
  | 'no_schedule_in_manual'
  | 'spec_is_placeholder'
  | 'spec_unreviewed';

export type MissingInput =
  | 'odometer_reading'
  | 'second_odometer_reading'
  | 'weekly_km'
  | 'last_service_date'
  | 'last_service_km'
  | 'spec_from_manual'
  | 'inspection_result';

/** Derived. Recomputed on every render from spec + records + readings. Never persisted as truth. */
export type WearEstimate = {
  componentId: ComponentId;
  action: ComponentAction;
  status: WearStatus;
  confidence: Confidence;
  /** Which track is binding under "whichever comes first". */
  binding: 'km' | 'time' | 'none';
  percentConsumed: number | null;
  remainingKm: number | null;
  remainingDays: number | null;
  dueAtKm: number | null;
  projectedDueDate: ISODate | null; // in the past when overdue: the date it became due
  kmTrack: TrackEstimate | null;
  timeTrack: TrackEstimate | null;
  odometerNowKm: number | null;
  odometerIsProjected: boolean;
  lastReadingDate: ISODate | null;
  lastReadingAgeDays: number | null;
  dailyKm: DailyKmEstimate;
  severeApplied: boolean;
  anchor: Anchor;
  reasons: ReasonCode[];
  missingInputs: MissingInput[];
  specSourceKind: SpecSourceKind;
};
