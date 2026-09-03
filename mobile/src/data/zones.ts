import type { Feather } from '@expo/vector-icons';

/** The eight zones the car drawing knows how to highlight. */
export type ZoneId = 'motor' | 'refrigeracion' | 'transmision' | 'frenos' | 'llantas' | 'electrico' | 'cabina' | 'combustible';

export const ZONE_ORDER: ZoneId[] = ['motor', 'frenos', 'refrigeracion', 'electrico', 'transmision', 'llantas', 'cabina', 'combustible'];

export const ZONE_META: Record<ZoneId, { label: string; shortLabel: string; icon: keyof typeof Feather.glyphMap }> = {
  motor: { label: 'Motor', shortLabel: 'Motor', icon: 'cpu' },
  frenos: { label: 'Frenos', shortLabel: 'Frenos', icon: 'disc' },
  refrigeracion: { label: 'Refrigeración', shortLabel: 'Radiador', icon: 'thermometer' },
  electrico: { label: 'Eléctrico', shortLabel: 'Eléctrico', icon: 'battery' },
  transmision: { label: 'Transmisión', shortLabel: 'Caja', icon: 'settings' },
  llantas: { label: 'Llantas', shortLabel: 'Llantas', icon: 'circle' },
  cabina: { label: 'Cabina', shortLabel: 'Cabina', icon: 'wind' },
  combustible: { label: 'Combustible', shortLabel: 'Tanque', icon: 'droplet' },
};

export function isZoneId(v: string | undefined): v is ZoneId {
  return v !== undefined && (ZONE_ORDER as string[]).includes(v);
}
