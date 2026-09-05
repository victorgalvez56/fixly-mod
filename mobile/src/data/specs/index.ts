import type { MaintenanceSpec, VehicleProfile, VehicleType } from '@/lib/wear/types';

import { BAJAJ_PULSAR_NS200_2018_2024_PE } from './bajaj-pulsar-ns200-2018-2024-pe';
import { HONDA_CB125F_2018_2024_PE } from './honda-cb125f-2018-2024-pe';
import { TOYOTA_YARIS_2013_2017_PE } from './toyota-yaris-2013-2017-pe';

/**
 * Every manual we have extracted, in one list. A vehicle with no entry here is
 * a cold start: the app says so instead of inventing intervals.
 */
export const SPECS: MaintenanceSpec[] = [TOYOTA_YARIS_2013_2017_PE, HONDA_CB125F_2018_2024_PE, BAJAJ_PULSAR_NS200_2018_2024_PE];

export function specsFor(type: VehicleType): MaintenanceSpec[] {
  return SPECS.filter((s) => s.vehicleType === type);
}

export function findSpec(type: VehicleType, brand: string, model: string, year: number): MaintenanceSpec | null {
  const norm = (v: string) => v.trim().toLowerCase();
  return (
    specsFor(type).find(
      (s) => norm(s.brand) === norm(brand) && norm(s.model) === norm(model) && year >= s.yearFrom && year <= s.yearTo,
    ) ?? null
  );
}

export function specForProfile(profile: VehicleProfile | null): MaintenanceSpec | null {
  return profile ? findSpec(profile.type, profile.brand, profile.model, profile.year) : null;
}

export { BAJAJ_PULSAR_NS200_2018_2024_PE, HONDA_CB125F_2018_2024_PE, TOYOTA_YARIS_2013_2017_PE };
