import { maintenancePlan, type MaintenanceZone } from '@/mock/data';
import type { StatusKey } from '@/theme/tokens';

/** Marker anchors as % of the 240x400 car drawing: engine bay under the hood, and the front-left wheel. */
export const ZONE_META: Record<MaintenanceZone, { label: string; top: number; left: number }> = {
  motor: { label: 'Motor', top: 19, left: 50 },
  frenos: { label: 'Frenos', top: 21, left: 15 },
};

/** A zone is only ever 'warn' or 'ok' — maintenance items don't expire like documents do. */
export function getZoneStatus(zone: MaintenanceZone): StatusKey {
  const items = maintenancePlan.filter((item) => item.zone === zone);
  return items.some((item) => item.next) ? 'warn' : 'ok';
}

export function getZoneItems(zone: MaintenanceZone) {
  return maintenancePlan.filter((item) => item.zone === zone);
}
