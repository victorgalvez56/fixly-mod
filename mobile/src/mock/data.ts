import type { VehicleType } from '@/lib/wear/types';
import type { StatusKey } from '@/theme/tokens';

export type Vehicle = {
  type: VehicleType;
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

/** Identity facts the plate lookup would return. Maintenance data lives in src/data and the vehicle context. */
export const vehicle: Vehicle = {
  type: 'auto',
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

export const motorcycle: Vehicle = {
  type: 'moto',
  plate: 'M1B-742',
  brand: 'Honda',
  model: 'CB125F',
  year: 2021,
  color: 'Rojo',
  engine: '125 cc, 1 cilindro',
  fuel: 'Gasolina',
  mileage: 32600,
  mileageUpdatedAt: '2026-08-22',
};

export function mockVehicleFor(type: VehicleType): Vehicle {
  return type === 'moto' ? motorcycle : vehicle;
}

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

/** A motorcycle carries the same papers; only the SOAT premium and the fines differ. */
export const motorcycleDocumentStatuses: DocumentStatus[] = [
  { id: 'soat', title: 'SOAT', status: 'expired', dueDate: '2026-08-20', fineAmount: 660 },
  { id: 'revision-tecnica', title: 'Revisión técnica', status: 'warn', dueDate: '2026-09-14', fineAmount: 1237 },
  { id: 'licencia', title: 'Licencia de conducir (A-I)', status: 'ok', dueDate: '2029-03-02' },
];

export function documentStatusesFor(type: VehicleType): DocumentStatus[] {
  return type === 'moto' ? motorcycleDocumentStatuses : documentStatuses;
}

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
    description: 'Cuando se acerca el siguiente servicio según tu manual.',
    enabled: true,
    leadTimeDays: 7,
  },
  {
    id: 'kilometraje',
    title: 'Revisión de kilometraje',
    description: 'Un recordatorio cada dos semanas para que actualices tu kilometraje.',
    enabled: false,
  },
];
