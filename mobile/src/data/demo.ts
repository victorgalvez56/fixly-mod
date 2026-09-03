import type { OdometerReading, ServiceRecord, VehicleProfile } from '@/lib/wear/types';

/**
 * The canonical demo fixture (DETALLE-AUTO.md §4.6): Toyota Yaris 2015,
 * oil changed 2026-06-02 at 83,600 km, air filter 2026-07-18 at 85,900 km,
 * odometer 87,400 km read on 2026-08-20. Everything the app shows derives
 * from these records plus the manual spec — nothing is measured.
 */
export const DEMO_PROFILE: VehicleProfile = {
  id: 'demo-yaris',
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
