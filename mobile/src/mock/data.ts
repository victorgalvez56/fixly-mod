import type { StatusKey } from '@/theme/tokens';

export type Vehicle = {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  engine: string;
  fuel: string;
  mileage: number;
  mileageUpdatedAt: string;
};

export const vehicle: Vehicle = {
  plate: 'ABC-123',
  brand: 'Toyota',
  model: 'Yaris',
  year: 2015,
  color: 'Gris plata',
  engine: '1.5L 4 cilindros',
  fuel: 'Gasolina',
  mileage: 87400,
  mileageUpdatedAt: '2026-08-20',
};

export type DocumentStatus = {
  id: string;
  title: string;
  status: StatusKey;
  dueDate: string;
  fineAmount?: number;
};

// Ordered by gravity — worst status first, per DESIGN.md.
export const documentStatuses: DocumentStatus[] = [
  { id: 'soat', title: 'SOAT', status: 'expired', dueDate: '2026-08-20', fineAmount: 660 },
  {
    id: 'revision-tecnica',
    title: 'Revisión técnica',
    status: 'warn',
    dueDate: '2026-09-14',
    fineAmount: 2475,
  },
  { id: 'licencia', title: 'Licencia de conducir', status: 'ok', dueDate: '2029-03-02' },
];

export type MaintenanceZone = 'motor' | 'frenos';

export type MaintenanceItem = {
  id: string;
  km: number;
  service: string;
  parts: string;
  done: boolean;
  next?: boolean;
  zone: MaintenanceZone;
  intervalKm: number;
  lastDoneAt?: string;
  priceRange: [number, number];
  description: string;
  whatIfSkipped: string;
  checklist: string[];
};

export const maintenancePlan: MaintenanceItem[] = [
  {
    id: 'aceite-80k',
    km: 80000,
    service: 'Cambio de aceite y filtro',
    parts: 'Aceite 5W-30, filtro de aceite',
    done: true,
    zone: 'motor',
    intervalKm: 5000,
    lastDoneAt: '2026-06-02',
    priceRange: [90, 140],
    description:
      'El aceite lubrica el motor y se degrada con el uso. Cambiarlo a tiempo evita que las piezas internas se desgasten entre sí.',
    whatIfSkipped: 'El motor trabaja con más fricción y puede recalentarse o dañarse antes de tiempo.',
    checklist: ['Aceite nuevo 5W-30', 'Filtro de aceite nuevo', 'Revisión de niveles'],
  },
  {
    id: 'filtro-aire-85k',
    km: 85000,
    service: 'Cambio de filtro de aire',
    parts: 'Filtro de aire de motor',
    done: true,
    zone: 'motor',
    intervalKm: 10000,
    lastDoneAt: '2026-07-18',
    priceRange: [35, 60],
    description:
      'El filtro de aire evita que entre polvo al motor. Sucio, el motor consume más gasolina y pierde potencia.',
    whatIfSkipped: 'Mayor consumo de combustible y menos respuesta del motor al acelerar.',
    checklist: ['Filtro de aire nuevo', 'Limpieza del compartimento'],
  },
  {
    id: 'pastillas-90k',
    km: 90000,
    service: 'Cambio de pastillas de freno',
    parts: 'Pastillas delanteras',
    done: false,
    next: true,
    zone: 'frenos',
    intervalKm: 30000,
    lastDoneAt: '2023-11-10',
    priceRange: [120, 220],
    description:
      'Las pastillas se desgastan con cada frenada. Sin suficiente grosor, el auto tarda más en detenerse.',
    whatIfSkipped: 'La distancia de frenado aumenta y el disco de freno se puede dañar, elevando el costo después.',
    checklist: ['Pastillas delanteras nuevas', 'Revisión de discos', 'Purga de sistema si es necesario'],
  },
  {
    id: 'correa-100k',
    km: 100000,
    service: 'Cambio de correa de distribución',
    parts: 'Correa, tensor, bomba de agua',
    done: false,
    zone: 'motor',
    intervalKm: 100000,
    priceRange: [650, 950],
    description:
      'La correa sincroniza el motor por dentro. Es un cambio caro pero programado: se sabe con anticipación cuándo toca.',
    whatIfSkipped:
      'Si se rompe en movimiento, puede dañar el motor por completo. Es la revisión más cara de ignorar.',
    checklist: ['Correa de distribución', 'Tensor', 'Bomba de agua', 'Mano de obra especializada'],
  },
];

export type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  leadTimeDays?: number;
};

export const notificationSettings: NotificationSetting[] = [
  {
    id: 'documentos',
    title: 'Documentos por vencer',
    description: 'SOAT, revisión técnica y licencia.',
    enabled: true,
    leadTimeDays: 15,
  },
  {
    id: 'mantenimiento',
    title: 'Mantenimiento próximo',
    description: 'Cuando se acerca el siguiente servicio de tu plan.',
    enabled: true,
    leadTimeDays: 7,
  },
  {
    id: 'kilometraje',
    title: 'Revisión de kilometraje',
    description: 'Un recordatorio para que actualices tu kilometraje actual.',
    enabled: false,
  },
];

export type HistoryEntry = {
  id: string;
  date: string;
  service: string;
  workshop: string;
  cost: number;
};

export const history: { year: number; entries: HistoryEntry[] }[] = [
  {
    year: 2026,
    entries: [
      { id: 'h1', date: '2026-07-18', service: 'Cambio de filtro de aire', workshop: 'Taller Los Olivos', cost: 45 },
      { id: 'h2', date: '2026-06-02', service: 'Cambio de aceite y filtro', workshop: 'Taller Los Olivos', cost: 130 },
      { id: 'h3', date: '2026-02-14', service: 'Alineamiento y balanceo', workshop: 'Llantas del Sur', cost: 80 },
    ],
  },
  {
    year: 2025,
    entries: [
      { id: 'h4', date: '2025-11-10', service: 'Cambio de pastillas traseras', workshop: 'Taller Los Olivos', cost: 160 },
      { id: 'h5', date: '2025-05-22', service: 'Cambio de batería', workshop: 'Electroauto Callao', cost: 320 },
    ],
  },
];

export const historyTotals = {
  totalSpent: history.flatMap((y) => y.entries).reduce((sum, e) => sum + e.cost, 0),
  serviceCount: history.flatMap((y) => y.entries).length,
};
