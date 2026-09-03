import type { Feather } from '@expo/vector-icons';

import type { ComponentId, Zone } from '@/lib/wear/types';

export type ComponentDef = {
  id: ComponentId;
  label: string;
  shortLabel: string;
  zone: Zone;
  icon: keyof typeof Feather.glyphMap;
  criticality: 'safety' | 'engine' | 'comfort';
  description: string;
  whatIfSkipped: string;
  checklist: string[];
  /** Example workshop prices in soles. Marked as example in the UI; not from the manual. */
  priceRangePen: [number, number];
};

/**
 * What each component IS, for a driver who does not know mechanics. Intervals
 * never live here — they come from the model's MaintenanceSpec (the manual).
 */
export const CATALOG: Record<string, ComponentDef> = {
  aceite_motor: {
    id: 'aceite_motor',
    label: 'Aceite de motor y filtro',
    shortLabel: 'Aceite y filtro',
    zone: 'motor',
    icon: 'droplet',
    criticality: 'engine',
    description:
      'El aceite lubrica el motor y se degrada con el uso y con el tiempo. Cambiarlo a tiempo evita que las piezas internas se desgasten entre sí.',
    whatIfSkipped: 'El motor trabaja con más fricción y puede recalentarse o dañarse antes de tiempo.',
    checklist: ['Aceite nuevo del grado que indica el manual', 'Filtro de aceite nuevo', 'Revisión de niveles'],
    priceRangePen: [90, 140],
  },
  filtro_aire_motor: {
    id: 'filtro_aire_motor',
    label: 'Filtro de aire del motor',
    shortLabel: 'Filtro de aire',
    zone: 'motor',
    icon: 'wind',
    criticality: 'engine',
    description:
      'El filtro de aire evita que entre polvo al motor. Sucio, el motor consume más gasolina y pierde potencia.',
    whatIfSkipped: 'Mayor consumo de combustible y menos respuesta del motor al acelerar.',
    checklist: ['Filtro de aire nuevo', 'Limpieza de la caja del filtro'],
    priceRangePen: [35, 60],
  },
  filtro_cabina: {
    id: 'filtro_cabina',
    label: 'Filtro de cabina',
    shortLabel: 'Filtro de cabina',
    zone: 'cabina',
    icon: 'wind',
    criticality: 'comfort',
    description: 'Limpia el aire que entra al habitáculo por el aire acondicionado. Con el polvo de la ciudad se tapa rápido.',
    whatIfSkipped: 'El aire acondicionado sopla menos y con olor; más polvo dentro del auto.',
    checklist: ['Filtro de cabina nuevo'],
    priceRangePen: [30, 55],
  },
  bujias: {
    id: 'bujias',
    label: 'Bujías',
    shortLabel: 'Bujías',
    zone: 'motor',
    icon: 'zap',
    criticality: 'engine',
    description: 'Las bujías encienden la mezcla en cada cilindro. Gastadas, el motor arranca peor y gasta más.',
    whatIfSkipped: 'Arranque difícil, tironeos, mayor consumo y puede dañar la bobina de encendido.',
    checklist: ['Juego de bujías del tipo que indica el manual', 'Calibración', 'Revisión de cables o bobinas'],
    priceRangePen: [80, 180],
  },
  refrigerante: {
    id: 'refrigerante',
    label: 'Refrigerante del motor',
    shortLabel: 'Refrigerante',
    zone: 'refrigeracion',
    icon: 'thermometer',
    criticality: 'engine',
    description: 'El refrigerante saca el calor del motor. Con el tiempo pierde sus aditivos y protege menos.',
    whatIfSkipped: 'Riesgo de recalentamiento y corrosión en el radiador y la bomba de agua.',
    checklist: ['Drenado del sistema', 'Refrigerante nuevo del tipo que indica el manual', 'Revisión de mangueras'],
    priceRangePen: [80, 150],
  },
  aceite_caja_mt: {
    id: 'aceite_caja_mt',
    label: 'Aceite de caja manual',
    shortLabel: 'Aceite de caja',
    zone: 'transmision',
    icon: 'settings',
    criticality: 'engine',
    description: 'Lubrica los engranajes de la caja de cambios. Se revisa en el taller y se cambia cuando el manual lo indica.',
    whatIfSkipped: 'Cambios duros o ruidosos y desgaste de la caja, que es cara de reparar.',
    checklist: ['Revisión de nivel y fugas', 'Aceite de caja del grado que indica el manual'],
    priceRangePen: [120, 220],
  },
  cadena_distribucion: {
    id: 'cadena_distribucion',
    label: 'Cadena de distribución',
    shortLabel: 'Cadena',
    zone: 'motor',
    icon: 'link',
    criticality: 'engine',
    description: 'Sincroniza el motor por dentro. En este motor es una cadena y el manual no programa su cambio; se revisa si hay ruido.',
    whatIfSkipped: 'Si se estira o se rompe puede dañar el motor por completo.',
    checklist: ['Revisión de ruido al arrancar en frío'],
    priceRangePen: [650, 950],
  },
  correa_accesorios: {
    id: 'correa_accesorios',
    label: 'Correa de accesorios',
    shortLabel: 'Correa',
    zone: 'motor',
    icon: 'refresh-cw',
    criticality: 'engine',
    description: 'Mueve el alternador, el aire acondicionado y la dirección. Se revisa por grietas y tensión.',
    whatIfSkipped: 'Si se rompe, la batería deja de cargar y el auto se queda en la calle.',
    checklist: ['Revisión de grietas y tensión', 'Cambio si está agrietada'],
    priceRangePen: [60, 120],
  },
  pastillas_freno: {
    id: 'pastillas_freno',
    label: 'Pastillas de freno',
    shortLabel: 'Pastillas',
    zone: 'frenos',
    icon: 'disc',
    criticality: 'safety',
    description: 'Las pastillas se desgastan con cada frenada. El manual pide revisarlas; el cambio depende del grosor que mida el taller.',
    whatIfSkipped: 'La distancia de frenado aumenta y el disco se puede dañar, elevando el costo después.',
    checklist: ['Medición del grosor de las pastillas', 'Revisión de discos', 'Cambio si están al límite'],
    priceRangePen: [120, 220],
  },
  liquido_frenos: {
    id: 'liquido_frenos',
    label: 'Líquido de frenos',
    shortLabel: 'Líquido de frenos',
    zone: 'frenos',
    icon: 'droplet',
    criticality: 'safety',
    description: 'Transmite la fuerza del pedal a las ruedas. Absorbe humedad con el tiempo, aunque no manejes.',
    whatIfSkipped: 'El pedal se siente esponjoso y el auto frena peor cuando los frenos se calientan.',
    checklist: ['Purga del sistema', 'Líquido nuevo del tipo DOT que indica el manual'],
    priceRangePen: [60, 110],
  },
  rotacion_llantas: {
    id: 'rotacion_llantas',
    label: 'Rotación de llantas',
    shortLabel: 'Rotación',
    zone: 'llantas',
    icon: 'refresh-cw',
    criticality: 'comfort',
    description: 'Cambiar las llantas de posición reparte el desgaste y las hace durar más.',
    whatIfSkipped: 'Las delanteras se gastan mucho antes y hay que comprar llantas nuevas antes de tiempo.',
    checklist: ['Rotación según el esquema del manual', 'Revisión de presión'],
    priceRangePen: [25, 50],
  },
  bateria: {
    id: 'bateria',
    label: 'Batería',
    shortLabel: 'Batería',
    zone: 'electrico',
    icon: 'battery',
    criticality: 'comfort',
    description: 'Arranca el auto. Dura unos años y el calor la acorta; el manual pide revisarla en cada servicio.',
    whatIfSkipped: 'Un día no arranca, normalmente cuando más lo necesitas.',
    checklist: ['Prueba de carga', 'Limpieza de bornes'],
    priceRangePen: [280, 420],
  },
  plumillas: {
    id: 'plumillas',
    label: 'Plumillas',
    shortLabel: 'Plumillas',
    zone: 'cabina',
    icon: 'cloud-rain',
    criticality: 'comfort',
    description: 'Limpian el parabrisas. El sol las endurece y con la garúa dejan rayas.',
    whatIfSkipped: 'Ves mal con lluvia o garúa, sobre todo de noche.',
    checklist: ['Par de plumillas de la medida del auto'],
    priceRangePen: [30, 70],
  },
  filtro_combustible: {
    id: 'filtro_combustible',
    label: 'Filtro de combustible',
    shortLabel: 'Filtro de combustible',
    zone: 'combustible',
    icon: 'filter',
    criticality: 'engine',
    description: 'Retiene la suciedad de la gasolina antes de que llegue al motor.',
    whatIfSkipped: 'Pérdida de potencia, tironeos y desgaste de la bomba de combustible.',
    checklist: ['Filtro de combustible nuevo'],
    priceRangePen: [50, 110],
  },
};

export function componentDef(id: string): ComponentDef {
  return (
    CATALOG[id] ?? {
      id,
      label: id.replace(/_/g, ' '),
      shortLabel: id.replace(/_/g, ' '),
      zone: 'motor',
      icon: 'tool',
      criticality: 'comfort',
      description: '',
      whatIfSkipped: '',
      checklist: [],
      priceRangePen: [0, 0],
    }
  );
}
