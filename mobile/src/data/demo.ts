import type { OdometerReading, ServiceRecord, VehicleProfile, VehicleType } from '@/lib/wear/types';

export type DemoFixture = {
  profile: VehicleProfile;
  records: ServiceRecord[];
  readings: OdometerReading[];
};

/**
 * The canonical demo fixture (DETALLE-AUTO.md §4.6): Toyota Yaris 2015,
 * oil changed 2026-06-02 at 83,600 km, air filter 2026-07-18 at 85,900 km,
 * odometer 87,400 km read on 2026-08-20. Everything the app shows derives
 * from these records plus the manual spec — nothing is measured.
 */
export const DEMO_PROFILE: VehicleProfile = {
  id: 'demo-yaris',
  type: 'auto',
  brand: 'Toyota',
  model: 'Yaris',
  year: 2015,
  transmission: 'MT',
  fuel: 'gasolina',
  usage: { rideHailing: true, mostlyCity: true, dustyRoads: false, shortTrips: false, highAltitude: false },
  acquisition: { date: '2021-03-10', odometerKm: 41000, wasUsed: true },
};

export const DEMO_RECORDS: ServiceRecord[] = [
  { id: 'r1', componentIds: ['aceite_motor', 'rotacion_llantas'], date: '2026-06-02', odometerKm: 83600, kind: 'replaced', costPen: 210, workshop: 'Taller Los Olivos', source: 'user' },
  { id: 'r1b', componentIds: ['pastillas_freno', 'correa_accesorios'], date: '2026-06-02', odometerKm: 83600, kind: 'inspected_ok', workshop: 'Taller Los Olivos', source: 'user' },
  { id: 'r2', componentIds: ['filtro_aire_motor'], date: '2026-07-18', odometerKm: 85900, kind: 'replaced', costPen: 45, workshop: 'Taller Los Olivos', source: 'user' },
  { id: 'r3', componentIds: ['refrigerante'], date: '2025-01-20', odometerKm: 58000, kind: 'replaced', costPen: 120, workshop: 'Taller Los Olivos', source: 'user' },
  { id: 'r4', componentIds: ['bujias'], date: '2025-03-15', odometerKm: 62000, kind: 'replaced', costPen: 140, workshop: 'Electroauto Callao', source: 'user' },
  { id: 'r5', componentIds: ['bateria', 'liquido_frenos'], date: '2025-05-22', odometerKm: 66900, kind: 'replaced', costPen: 390, workshop: 'Electroauto Callao', source: 'user' },
];

export const DEMO_READINGS: OdometerReading[] = [{ id: 'o1', date: '2026-08-20', km: 87400, source: 'user' }];

/**
 * The motorcycle fixture, built the same way: a 2021 CB125F used for delivery,
 * serviced regularly, odometer 32,600 km read on 2026-08-22. Because the rider
 * works with it, the manual's severe table applies and the chain's 300 km
 * interval is already 700 km past — the classic delivery-bike failure, and the
 * one pending headline the demo opens on.
 */
export const DEMO_MOTO_PROFILE: VehicleProfile = {
  id: 'demo-cb125f',
  type: 'moto',
  brand: 'Honda',
  model: 'CB125F',
  year: 2021,
  engineCc: 125,
  transmission: 'secuencial',
  fuel: 'gasolina',
  finalDrive: 'cadena',
  cooling: 'aire',
  usage: { rideHailing: true, mostlyCity: true, dustyRoads: false, shortTrips: true, highAltitude: false },
  acquisition: { date: '2021-11-06', odometerKm: 0, wasUsed: false },
};

export const DEMO_MOTO_RECORDS: ServiceRecord[] = [
  { id: 'm1', componentIds: ['aceite_motor'], date: '2026-07-30', odometerKm: 31200, kind: 'replaced', costPen: 65, workshop: 'Moto Center Ate', source: 'user' },
  { id: 'm2', componentIds: ['lubricacion_cadena'], date: '2026-08-12', odometerKm: 31900, kind: 'inspected_ok', workshop: 'Moto Center Ate', source: 'user' },
  { id: 'm3', componentIds: ['pastillas_freno', 'zapatas_freno', 'llantas', 'embrague', 'rayos_ruedas'], date: '2026-06-14', odometerKm: 29400, kind: 'inspected_ok', workshop: 'Moto Center Ate', source: 'user' },
  { id: 'm4', componentIds: ['filtro_aire_motor'], date: '2026-06-14', odometerKm: 29400, kind: 'replaced', costPen: 40, workshop: 'Moto Center Ate', source: 'user' },
  { id: 'm5', componentIds: ['bujia', 'ajuste_valvulas'], date: '2026-05-18', odometerKm: 28100, kind: 'replaced', costPen: 95, workshop: 'Moto Center Ate', source: 'user' },
  { id: 'm6', componentIds: ['kit_arrastre'], date: '2025-09-08', odometerKm: 19800, kind: 'replaced', costPen: 260, workshop: 'Repuestos Villa', source: 'user' },
  { id: 'm7', componentIds: ['aceite_horquilla'], date: '2025-11-10', odometerKm: 21300, kind: 'replaced', costPen: 130, workshop: 'Moto Center Ate', source: 'user' },
  { id: 'm8', componentIds: ['amortiguador_trasero'], date: '2025-11-10', odometerKm: 21300, kind: 'inspected_ok', workshop: 'Moto Center Ate', source: 'user' },
  { id: 'm9', componentIds: ['bateria', 'liquido_frenos', 'filtro_combustible'], date: '2025-03-02', odometerKm: 11800, kind: 'replaced', costPen: 210, workshop: 'Electro Moto Lima', source: 'user' },
];

export const DEMO_MOTO_READINGS: OdometerReading[] = [{ id: 'mo1', date: '2026-08-22', km: 32600, source: 'user' }];

const FIXTURES: Record<VehicleType, DemoFixture> = {
  auto: { profile: DEMO_PROFILE, records: DEMO_RECORDS, readings: DEMO_READINGS },
  moto: { profile: DEMO_MOTO_PROFILE, records: DEMO_MOTO_RECORDS, readings: DEMO_MOTO_READINGS },
};

/** What the plate lookup "returns" for the demo, per vehicle type. */
export function demoFixture(type: VehicleType): DemoFixture {
  return FIXTURES[type];
}
