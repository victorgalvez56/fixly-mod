import type { Feather } from '@expo/vector-icons';

import type { VehicleType, Zone } from '@/lib/wear/types';

/** The zones a vehicle drawing knows how to highlight. Same union as the wear model's Zone. */
export type ZoneId = Zone;

export const ALL_ZONES: ZoneId[] = [
  'motor',
  'frenos',
  'refrigeracion',
  'electrico',
  'transmision',
  'llantas',
  'cabina',
  'suspension',
  'combustible',
];

/**
 * Zone order per vehicle type, worst-first-ish for the chip row. A car has a
 * cabin (filter, wipers) and no suspension zone of its own; a motorcycle has
 * exposed suspension and no cabin at all.
 */
const ORDER: Record<VehicleType, ZoneId[]> = {
  auto: ['motor', 'frenos', 'refrigeracion', 'electrico', 'transmision', 'llantas', 'cabina', 'combustible'],
  moto: ['motor', 'transmision', 'frenos', 'llantas', 'suspension', 'electrico', 'refrigeracion', 'combustible'],
};

export type ZoneMeta = { label: string; shortLabel: string; icon: keyof typeof Feather.glyphMap };

const BASE_META: Record<ZoneId, ZoneMeta> = {
  motor: { label: 'Motor', shortLabel: 'Motor', icon: 'cpu' },
  frenos: { label: 'Frenos', shortLabel: 'Frenos', icon: 'disc' },
  refrigeracion: { label: 'Refrigeración', shortLabel: 'Radiador', icon: 'thermometer' },
  electrico: { label: 'Eléctrico', shortLabel: 'Eléctrico', icon: 'battery' },
  transmision: { label: 'Transmisión', shortLabel: 'Caja', icon: 'settings' },
  llantas: { label: 'Llantas', shortLabel: 'Llantas', icon: 'circle' },
  cabina: { label: 'Cabina', shortLabel: 'Cabina', icon: 'wind' },
  suspension: { label: 'Suspensión', shortLabel: 'Suspensión', icon: 'git-commit' },
  combustible: { label: 'Combustible', shortLabel: 'Tanque', icon: 'droplet' },
};

/** The one zone a rider names differently: the "caja" of a bike is its chain kit. */
const MOTO_META: Partial<Record<ZoneId, ZoneMeta>> = {
  transmision: { label: 'Transmisión', shortLabel: 'Arrastre', icon: 'link' },
};

export function zoneOrder(type: VehicleType): ZoneId[] {
  return ORDER[type];
}

export function zoneMeta(type: VehicleType, zone: ZoneId): ZoneMeta {
  return (type === 'moto' ? MOTO_META[zone] : undefined) ?? BASE_META[zone];
}

export function isZoneId(v: string | undefined): v is ZoneId {
  return v !== undefined && (ALL_ZONES as string[]).includes(v);
}
