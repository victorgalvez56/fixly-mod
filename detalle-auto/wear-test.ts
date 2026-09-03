import { estimateWear, cleanReadings, parseISODate, estimateAll, sortByUrgency } from './wear-engine';
import type { ComponentSpec, ServiceRecord, OdometerReading, MaintenanceSpec, VehicleProfile } from './wear-types';

const src = { kind: 'owner_manual' as const, extractedAt: '2026-08-01', extractedBy: 'human' as const, reviewedBy: 'victor' };
const oil: ComponentSpec = {
  componentId: 'aceite_motor', zone: 'motor', action: 'replace',
  normal: { km: 10000, months: 12 }, severe: { km: 5000, months: 6 }, criticality: 'engine', source: src,
};
const belt: ComponentSpec = {
  componentId: 'correa_distribucion', zone: 'motor', action: 'replace',
  normal: { km: 100000, months: 72 }, severe: null, criticality: 'engine', source: src,
};
const pads: ComponentSpec = {
  componentId: 'pastillas_freno', zone: 'frenos', action: 'inspect_then_replace',
  normal: { km: 10000, months: 6 }, severe: null,
  replaceCriterion: { measure: 'pad_thickness', limit: 1, unit: 'mm' }, criticality: 'safety', source: src,
};
const wipers: ComponentSpec = {
  componentId: 'plumillas', zone: 'cabina', action: 'replace', normal: { km: null, months: 12 }, severe: null,
  criticality: 'comfort', source: { ...src, kind: 'placeholder', reviewedBy: undefined },
};
const chain: ComponentSpec = {
  componentId: 'cadena_distribucion', zone: 'motor', action: 'no_schedule', normal: { km: null, months: null }, severe: null,
  criticality: 'engine', source: src,
};

const today = '2026-09-02';
const readings: OdometerReading[] = [
  { id: 'r1', date: '2026-06-02', km: 80000, source: 'user' },
  { id: 'r2', date: '2026-07-01', km: 84300, source: 'user' },
  { id: 'rBad', date: '2026-07-15', km: 70000, source: 'user' }, // typo, non-monotonic
  { id: 'r3', date: '2026-08-20', km: 91500, source: 'user' },
  { id: 'rFuture', date: '2026-12-01', km: 99999, source: 'user' }, // future
  { id: 'rInvalid', date: '2026-02-30', km: 1, source: 'user' }, // invalid date
];
const records: ServiceRecord[] = [
  { id: 's1', componentIds: ['aceite_motor'], date: '2026-06-02', odometerKm: 80000, kind: 'replaced', source: 'user' },
  { id: 's2', componentIds: ['pastillas_freno'], date: '2026-07-01', odometerKm: null, kind: 'inspected_ok', source: 'user' },
];
const ride = { usage: { rideHailing: true, mostlyCity: true, dustyRoads: false, shortTrips: false, highAltitude: false } };

function show(label: string, e: ReturnType<typeof estimateWear>) {
  const { kmTrack, timeTrack, ...rest } = e;
  console.log(`\n== ${label}`);
  console.log(JSON.stringify({ ...rest, kmTrack, timeTrack }, null, 0));
}

const c = cleanReadings(readings, records, parseISODate(today)!);
console.log('clean', c.clean.map((r) => `${r.id}:${r.km}`).join(' '), '| dropped', c.dropped.map((d) => `${d.id}=${d.reason}`).join(' '));

show('oil, ride-hailing, severe from manual, 4 readings', estimateWear(oil, records, readings, today, ride));
show('oil, private use', estimateWear(oil, records, readings, today, {}));
show('belt, used car, no history, no assumption', estimateWear(belt, [], readings, today, { ...ride, acquisition: { date: '2024-03-01', odometerKm: 62000, wasUsed: true } }));
show('belt, used car, user assumed done at purchase', estimateWear(belt, [], readings, today, { ...ride, acquisition: { date: '2024-03-01', odometerKm: 62000, wasUsed: true }, assumeDoneAtAcquisition: true }));
show('pads inspect, km interpolated from readings', estimateWear(pads, records, readings, today, ride));
show('pads after inspection said replace', estimateWear(pads, [...records, { id: 's3', componentIds: ['pastillas_freno'], date: '2026-08-25', odometerKm: 92000, kind: 'inspected_needs_replace', source: 'user' }], readings, today, ride));
show('wipers time-only placeholder', estimateWear(wipers, [{ id: 'w', componentIds: ['plumillas'], date: '2025-11-01', odometerKm: null, kind: 'replaced', source: 'user' }], readings, today, ride));
show('chain no schedule', estimateWear(chain, [], readings, today, ride));
show('oil, single reading, default assumption', estimateWear(oil, [{ id: 's1', componentIds: ['aceite_motor'], date: '2026-07-20', odometerKm: 86000, kind: 'replaced', source: 'user' }], [{ id: 'x', date: '2026-08-30', km: 89800, source: 'user' }], today, ride));
show('oil, single reading, declared weekly km', estimateWear(oil, [{ id: 's1', componentIds: ['aceite_motor'], date: '2026-07-20', odometerKm: 86000, kind: 'replaced', source: 'user' }], [{ id: 'x', date: '2026-08-30', km: 89800, source: 'user' }], today, { ...ride, declaredWeeklyKm: 1000 }));
show('oil, no readings at all, record with km only', estimateWear(oil, [{ id: 's1', componentIds: ['aceite_motor'], date: '2026-03-01', odometerKm: 70000, kind: 'replaced', source: 'user' }], [], today, ride));
show('oil, record in the future', estimateWear(oil, [{ id: 's1', componentIds: ['aceite_motor'], date: '2026-10-01', odometerKm: 95000, kind: 'replaced', source: 'user' }], readings, today, ride));
show('oil, very stale reading', estimateWear(oil, [{ id: 's1', componentIds: ['aceite_motor'], date: '2026-01-10', odometerKm: 60000, kind: 'replaced', source: 'user' }], [{ id: 'a', date: '2026-01-10', km: 60000, source: 'user' }, { id: 'b', date: '2026-03-01', km: 66000, source: 'user' }], today, ride));
show('new vehicle first service', estimateWear({ ...oil, firstServiceKm: 1000 }, [], [{ id: 'a', date: '2026-08-25', km: 40, source: 'acquisition' }, { id: 'b', date: '2026-09-01', km: 700, source: 'user' }], today, { ...ride, acquisition: { date: '2026-08-25', odometerKm: 40, wasUsed: false } }));

try { estimateWear(oil, [], [], 'hoy'); } catch (e) { console.log('\ninvalid today ->', (e as Error).message); }

const spec: MaintenanceSpec = { specId: 'toyota-yaris-2014-2017', brand: 'Toyota', model: 'Yaris', yearFrom: 2014, yearTo: 2017, severeConditions: ['taxi_or_commercial', 'dusty_roads'], components: [oil, belt, pads, wipers, chain, { ...oil, componentId: 'aceite_cvt', appliesTo: { transmissions: ['CVT'] } }], source: src };
const vehicle: VehicleProfile = { id: 'v', brand: 'Toyota', model: 'Yaris', year: 2015, transmission: 'MT', fuel: 'gasolina', usage: ride.usage, acquisition: { date: '2024-03-01', odometerKm: 62000, wasUsed: true } };
console.log('\n== estimateAll sorted:', sortByUrgency(estimateAll(spec, vehicle, records, readings, today)).map((e) => `${e.componentId}:${e.status}/${e.confidence}`).join('  '));
