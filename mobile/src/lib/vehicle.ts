import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { Transmission, VehicleType } from '@/lib/wear/types';

/**
 * Everything that changes wording or iconography between a car and a
 * motorcycle, in one place. Screens read from here instead of hard-coding
 * "auto": the model is identical for both, only the noun and a few labels move.
 */
export type VehicleCopy = {
  type: VehicleType;
  /** 'auto' / 'moto' — lowercase, no article. */
  noun: string;
  /** 'Auto' / 'Moto' — sentence start. */
  nounCap: string;
  /** 'tu auto' / 'tu moto'. */
  yours: string;
  /** 'del auto' / 'de la moto'. */
  ofThe: string;
  /** 'el auto' / 'la moto'. */
  theOne: string;
  /** 'al auto' / 'a la moto' — Spanish contracts a+el, so this cannot be built by hand. */
  toThe: string;
  /** 'Autos' / 'Motos' — the picker's plural. */
  plural: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  /** One line under the option in the vehicle-type picker. */
  pickerHint: string;
  /** How the transmission row is titled in the vehicle sheet. */
  transmissionLabel: string;
  /** Label of the "I work with it" usage switch, and its hint. */
  commercialUse: { label: string; hint: string };
  /** Label of the odometer, which drivers of both call "kilometraje". */
  odometerLabel: string;
};

export const VEHICLE_COPY: Record<VehicleType, VehicleCopy> = {
  auto: {
    type: 'auto',
    noun: 'auto',
    nounCap: 'Auto',
    yours: 'tu auto',
    ofThe: 'del auto',
    theOne: 'el auto',
    toThe: 'al auto',
    plural: 'Autos',
    icon: 'car-hatchback',
    pickerHint: 'Sedán, hatchback, SUV o camioneta.',
    transmissionLabel: 'Caja',
    commercialUse: { label: 'Manejo para aplicativo o taxi', hint: 'Aplica la tabla de uso intensivo del manual cuando existe.' },
    odometerLabel: 'Kilometraje actual',
  },
  moto: {
    type: 'moto',
    noun: 'moto',
    nounCap: 'Moto',
    yours: 'tu moto',
    ofThe: 'de la moto',
    theOne: 'la moto',
    toThe: 'a la moto',
    plural: 'Motos',
    icon: 'motorbike',
    pickerHint: 'Naked, scooter, de trabajo o mototaxi.',
    transmissionLabel: 'Transmisión',
    commercialUse: { label: 'Trabajo con delivery o mototaxi', hint: 'Aplica la tabla de uso intensivo del manual cuando existe.' },
    odometerLabel: 'Kilometraje actual',
  },
};

export const VEHICLE_TYPES: VehicleType[] = ['auto', 'moto'];

export function vehicleCopy(type: VehicleType | null | undefined): VehicleCopy {
  return VEHICLE_COPY[type ?? 'auto'];
}

export function isVehicleType(v: string | null | undefined): v is VehicleType {
  return v === 'auto' || v === 'moto';
}

/** What the transmission row shows, which is a different vocabulary on each vehicle. */
export function transmissionLabel(type: VehicleType, t: Transmission): string {
  if (t === 'unknown') return 'Sin dato';
  if (type === 'moto') {
    switch (t) {
      case 'secuencial':
      case 'MT':
        return 'Secuencial (con embrague)';
      case 'CVT':
        return 'Automática (scooter)';
      default:
        return 'Automática';
    }
  }
  switch (t) {
    case 'MT':
      return 'Manual';
    case 'CVT':
      return 'Automática CVT';
    case 'DCT':
      return 'Automática de doble embrague';
    default:
      return 'Automática';
  }
}
