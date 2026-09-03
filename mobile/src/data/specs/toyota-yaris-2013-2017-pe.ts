import type { MaintenanceSpec, SpecSource } from '@/lib/wear/types';

/**
 * DEMO VALUES — replace with the spec extracted from the real owner's manual
 * (see detalle-auto/manual-extraction-prompt.md) before shipping. Numbers only:
 * the manual's wording is never stored.
 */
const source: SpecSource = {
  kind: 'owner_manual',
  documentTitle: 'Manual del propietario (demo)',
  edition: 'demo',
  market: 'PE',
  pageRefs: ['demo'],
  extractedAt: '2026-09-01',
  extractedBy: 'human',
  reviewedBy: 'demo',
};

export const TOYOTA_YARIS_2013_2017_PE: MaintenanceSpec = {
  specId: 'toyota-yaris-2013-2017-pe',
  brand: 'Toyota',
  model: 'Yaris',
  yearFrom: 2013,
  yearTo: 2017,
  severeConditions: ['dusty_roads', 'short_trips', 'taxi_or_commercial', 'extended_idling'],
  source,
  components: [
    { componentId: 'aceite_motor', zone: 'motor', action: 'replace', normal: { km: 5000, months: 6 }, severe: null, criticality: 'engine', source, consumable: { grade: '5W-30', capacityL: 3.7, partNote: 'incluye filtro' } },
    { componentId: 'filtro_aire_motor', zone: 'motor', action: 'inspect_then_replace', normal: { km: 20000, months: 24 }, severe: { km: 10000, months: 12 }, criticality: 'engine', source },
    { componentId: 'filtro_cabina', zone: 'cabina', action: 'replace', normal: { km: 15000, months: 12 }, severe: null, criticality: 'comfort', source },
    { componentId: 'bujias', zone: 'motor', action: 'replace', normal: { km: 40000, months: 48 }, severe: null, criticality: 'engine', source },
    { componentId: 'refrigerante', zone: 'refrigeracion', action: 'replace', normal: { km: 40000, months: 24 }, severe: null, criticality: 'engine', source },
    { componentId: 'aceite_caja_mt', zone: 'transmision', action: 'inspect_then_replace', normal: { km: 40000, months: 24 }, severe: null, criticality: 'engine', source, appliesTo: { transmissions: ['MT'] } },
    { componentId: 'cadena_distribucion', zone: 'motor', action: 'no_schedule', normal: { km: null, months: null }, severe: null, criticality: 'engine', source },
    { componentId: 'correa_accesorios', zone: 'motor', action: 'inspect', normal: { km: 20000, months: 12 }, severe: null, criticality: 'engine', source },
    { componentId: 'pastillas_freno', zone: 'frenos', action: 'inspect', normal: { km: 10000, months: 6 }, severe: null, criticality: 'safety', source, replaceCriterion: { measure: 'grosor', limit: 1, unit: 'mm' } },
    { componentId: 'liquido_frenos', zone: 'frenos', action: 'replace', normal: { km: 40000, months: 24 }, severe: null, criticality: 'safety', source },
    { componentId: 'rotacion_llantas', zone: 'llantas', action: 'rotate', normal: { km: 10000, months: 6 }, severe: null, criticality: 'comfort', source },
    { componentId: 'bateria', zone: 'electrico', action: 'inspect', normal: { km: null, months: 36 }, severe: null, criticality: 'comfort', source },
    { componentId: 'plumillas', zone: 'cabina', action: 'inspect', normal: { km: null, months: 12 }, severe: null, criticality: 'comfort', source },
    { componentId: 'filtro_combustible', zone: 'combustible', action: 'replace', normal: { km: 40000, months: 24 }, severe: null, criticality: 'engine', source },
  ],
};

/** Later: a registry keyed by brand/model/year with a cold-start path. One demo spec for now. */
export function findSpec(brand: string, model: string, year: number): MaintenanceSpec | null {
  const s = TOYOTA_YARIS_2013_2017_PE;
  if (brand.toLowerCase() === s.brand.toLowerCase() && model.toLowerCase() === s.model.toLowerCase() && year >= s.yearFrom && year <= s.yearTo) {
    return s;
  }
  return null;
}
