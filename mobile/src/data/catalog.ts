import type { Feather } from '@expo/vector-icons';

import type { ComponentId, VehicleType, Zone } from '@/lib/wear/types';

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
 * Fields a component describes differently on a motorcycle. Same part, same
 * id, another shape and another price: brake pads on a bike are a single
 * caliper's worth, and its battery is smaller than a car's.
 */
type ComponentOverride = Partial<Omit<ComponentDef, 'id'>>;

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
  bujia: {
    id: 'bujia',
    label: 'Bujía',
    shortLabel: 'Bujía',
    zone: 'motor',
    icon: 'zap',
    criticality: 'engine',
    description: 'La bujía enciende la mezcla en el cilindro. Es una sola pieza barata y cambiarla a tiempo se nota al arrancar.',
    whatIfSkipped: 'Arranca con dificultad, pierde fuerza en subida y consume más.',
    checklist: ['Bujía del tipo que indica el manual', 'Calibración de la separación', 'Revisión de la capucha'],
    priceRangePen: [20, 45],
  },
  ajuste_valvulas: {
    id: 'ajuste_valvulas',
    label: 'Ajuste de válvulas',
    shortLabel: 'Válvulas',
    zone: 'motor',
    icon: 'sliders',
    criticality: 'engine',
    description: 'Con el uso, la luz entre válvula y balancín cambia. El manual programa medirla y volverla a dejar en el valor de fábrica.',
    whatIfSkipped: 'El motor suena a golpeteo, pierde compresión y a la larga se daña la válvula.',
    checklist: ['Medición de luz en frío', 'Ajuste al valor del manual', 'Revisión de empaquetadura de tapa'],
    priceRangePen: [60, 120],
  },
  lubricacion_cadena: {
    id: 'lubricacion_cadena',
    label: 'Lubricación y tensión de cadena',
    shortLabel: 'Cadena',
    zone: 'transmision',
    icon: 'link',
    criticality: 'safety',
    description: 'La cadena transmite toda la fuerza a la rueda trasera. Es lo que más seguido pide el manual: limpiarla, lubricarla y dejarla con el juego correcto.',
    whatIfSkipped: 'Seca se estira y se come los piñones; muy floja puede salirse y bloquear la rueda.',
    checklist: ['Limpieza de la cadena', 'Lubricante de cadena', 'Ajuste del juego según el manual'],
    priceRangePen: [15, 40],
  },
  kit_arrastre: {
    id: 'kit_arrastre',
    label: 'Kit de arrastre (cadena, piñón y catalina)',
    shortLabel: 'Kit de arrastre',
    zone: 'transmision',
    icon: 'settings',
    criticality: 'safety',
    description: 'Cadena, piñón delantero y catalina trasera se gastan juntos. Por eso se cambian como juego, no por separado.',
    whatIfSkipped: 'Saltos al acelerar, ruido y riesgo de que la cadena se corte en marcha.',
    checklist: ['Kit completo del paso que indica el manual', 'Revisión del juego de la rueda', 'Ajuste y lubricación final'],
    priceRangePen: [180, 380],
  },
  embrague: {
    id: 'embrague',
    label: 'Embrague',
    shortLabel: 'Embrague',
    zone: 'transmision',
    icon: 'git-merge',
    criticality: 'engine',
    description: 'Conecta el motor con la caja al soltar la maneta. Se revisa el juego del cable y el estado de los discos.',
    whatIfSkipped: 'Patina en subida, cuesta meter cambios y termina en un cambio de discos más caro.',
    checklist: ['Ajuste del juego de la maneta', 'Revisión de discos si patina'],
    priceRangePen: [40, 260],
  },
  zapatas_freno: {
    id: 'zapatas_freno',
    label: 'Zapatas de freno',
    shortLabel: 'Zapatas',
    zone: 'frenos',
    icon: 'disc',
    criticality: 'safety',
    description: 'El freno de tambor trasero usa zapatas en vez de pastillas. El manual pide revisarlas; se cambian cuando el taller mide que están al límite.',
    whatIfSkipped: 'El freno trasero deja de morder y el tambor se raya, lo que sale más caro.',
    checklist: ['Medición del forro de las zapatas', 'Limpieza del tambor', 'Ajuste del recorrido del pedal'],
    priceRangePen: [45, 90],
  },
  aceite_horquilla: {
    id: 'aceite_horquilla',
    label: 'Aceite de horquilla',
    shortLabel: 'Horquilla',
    zone: 'suspension',
    icon: 'git-commit',
    criticality: 'comfort',
    description: 'La suspensión delantera trabaja con aceite dentro de las barras. Se degrada y la moto empieza a rebotar o a hundirse al frenar.',
    whatIfSkipped: 'Menos control al frenar y en huecos; los retenes empiezan a botar aceite.',
    checklist: ['Aceite de horquilla del grado que indica el manual', 'Revisión de retenes', 'Purgado de aire'],
    priceRangePen: [80, 180],
  },
  amortiguador_trasero: {
    id: 'amortiguador_trasero',
    label: 'Amortiguador trasero',
    shortLabel: 'Amortiguador',
    zone: 'suspension',
    icon: 'align-center',
    criticality: 'comfort',
    description: 'Aguanta tu peso y el de la carga. El manual pide revisarlo por fugas y por rebote.',
    whatIfSkipped: 'La moto rebota, se hace inestable en curva y castiga la llanta trasera.',
    checklist: ['Revisión de fugas y rebote', 'Ajuste de precarga según carga'],
    priceRangePen: [120, 320],
  },
  rayos_ruedas: {
    id: 'rayos_ruedas',
    label: 'Tensión de rayos',
    shortLabel: 'Rayos',
    zone: 'llantas',
    icon: 'sun',
    criticality: 'safety',
    description: 'En ruedas de rayos, el aro se mantiene derecho por la tensión pareja de cada rayo. Se revisa con el sonido y con llave de rayos.',
    whatIfSkipped: 'El aro se descentra, la llanta se gasta desparejo y un rayo suelto puede romper otros.',
    checklist: ['Revisión de rayos flojos', 'Tensado y centrado del aro'],
    priceRangePen: [30, 80],
  },
  llantas: {
    id: 'llantas',
    label: 'Llantas',
    shortLabel: 'Llantas',
    zone: 'llantas',
    icon: 'circle',
    criticality: 'safety',
    description: 'Son el único contacto con la pista. Se revisan por profundidad de dibujo, presión y cortes.',
    whatIfSkipped: 'Menos agarre en piso mojado y más riesgo de pinchadura o resbalón.',
    checklist: ['Medición de profundidad de dibujo', 'Presión según el manual', 'Revisión de cortes y desgaste desparejo'],
    priceRangePen: [140, 420],
  },
};

/** Same part, different machine: only the fields that actually change are listed. */
const MOTO_OVERRIDES: Record<string, ComponentOverride> = {
  aceite_motor: {
    label: 'Aceite de motor y filtro',
    description:
      'En una moto el mismo aceite lubrica el motor, la caja y el embrague, así que se degrada más rápido que en un auto y el manual lo cambia mucho más seguido.',
    whatIfSkipped: 'El embrague patina, los cambios entran duro y el motor se desgasta antes de tiempo.',
    checklist: ['Aceite nuevo del grado que indica el manual', 'Filtro o malla de aceite', 'Revisión de nivel por la mirilla'],
    priceRangePen: [45, 90],
  },
  filtro_aire_motor: {
    description: 'Evita que entre polvo al motor. En moto queda bajo el asiento o el tanque y en Lima se tapa rápido.',
    whatIfSkipped: 'Pierde fuerza en subida, consume más y ensucia la bujía.',
    priceRangePen: [25, 55],
  },
  refrigerante: {
    description: 'En motos refrigeradas por líquido, el refrigerante saca el calor del motor. Pierde sus aditivos con el tiempo aunque manejes poco.',
    whatIfSkipped: 'Riesgo de recalentar en tráfico parado, que es donde una moto sufre más.',
    priceRangePen: [45, 90],
  },
  pastillas_freno: {
    description: 'Las pastillas del disco se gastan con cada frenada. En moto el desgaste es más rápido que en un auto porque son más chicas.',
    whatIfSkipped: 'Frena mucho menos y el disco se raya, lo que multiplica el costo.',
    checklist: ['Medición del grosor de las pastillas', 'Revisión del disco', 'Cambio si están al límite'],
    priceRangePen: [45, 110],
  },
  liquido_frenos: {
    description: 'Transmite la fuerza de la maneta y el pedal a las ruedas. Absorbe humedad con el tiempo, aunque no manejes.',
    whatIfSkipped: 'La maneta se siente esponjosa y el freno responde tarde justo cuando lo necesitas.',
    priceRangePen: [40, 80],
  },
  bateria: {
    description: 'Da el arranque eléctrico y alimenta las luces. Si la moto para muchos días seguidos se descarga y se sulfata.',
    whatIfSkipped: 'Un día solo arranca a patada, y de noche las luces alumbran menos.',
    checklist: ['Prueba de carga', 'Limpieza de bornes', 'Revisión del regulador'],
    priceRangePen: [120, 260],
  },
  filtro_combustible: {
    description: 'Retiene la suciedad de la gasolina antes de que llegue al carburador o a los inyectores.',
    whatIfSkipped: 'Tironeos, ralentí inestable y en el peor caso se apaga en marcha.',
    priceRangePen: [25, 70],
  },
};

const FALLBACK = (id: string): ComponentDef => ({
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
});

/**
 * The definition of a component as the given vehicle's driver would read it.
 * The type defaults to 'auto' so a call site that genuinely has no vehicle in
 * hand keeps working; every screen with a profile should pass it.
 */
export function componentDef(id: string, type: VehicleType = 'auto'): ComponentDef {
  const base = CATALOG[id] ?? FALLBACK(id);
  const override = type === 'moto' ? MOTO_OVERRIDES[id] : undefined;
  return override ? { ...base, ...override } : base;
}
