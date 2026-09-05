import type { MaintenanceSpec, SpecSource } from '@/lib/wear/types';

/**
 * DEMO VALUES — replace with the spec extracted from the real owner's manual
 * (see detalle-auto/manual-extraction-prompt.md) before shipping. Numbers only:
 * the manual's wording is never stored.
 *
 * The other half of the Peruvian market: a liquid-cooled, fuel-injected naked
 * with discs on both wheels. It exercises the coolant zone the CB125F lacks.
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

export const BAJAJ_PULSAR_NS200_2018_2024_PE: MaintenanceSpec = {
  specId: 'bajaj-pulsar-ns200-2018-2024-pe',
  vehicleType: 'moto',
  brand: 'Bajaj',
  model: 'Pulsar NS200',
  yearFrom: 2018,
  yearTo: 2024,
  severeConditions: ['dusty_roads', 'short_trips', 'taxi_or_commercial', 'extended_idling', 'mountain'],
  source,
  components: [
    { componentId: 'aceite_motor', zone: 'motor', action: 'replace', normal: { km: 5000, months: 6 }, severe: { km: 2500, months: 3 }, firstServiceKm: 1000, criticality: 'engine', source, consumable: { grade: '10W-50 JASO MA2', capacityL: 1.4, partNote: 'lubrica motor, caja y embrague' } },
    { componentId: 'filtro_aire_motor', zone: 'motor', action: 'inspect_then_replace', normal: { km: 10000, months: 12 }, severe: { km: 5000, months: 6 }, criticality: 'engine', source },
    { componentId: 'bujia', zone: 'motor', action: 'replace', normal: { km: 10000, months: 12 }, severe: null, criticality: 'engine', source },
    { componentId: 'ajuste_valvulas', zone: 'motor', action: 'inspect', normal: { km: 10000, months: 12 }, severe: null, criticality: 'engine', source },
    { componentId: 'refrigerante', zone: 'refrigeracion', action: 'replace', normal: { km: 24000, months: 24 }, severe: null, criticality: 'engine', source, consumable: { grade: 'refrigerante sin silicatos', capacityL: 1.2 } },
    { componentId: 'lubricacion_cadena', zone: 'transmision', action: 'inspect', normal: { km: 600, months: 1 }, severe: { km: 300, months: 1 }, criticality: 'safety', source },
    { componentId: 'kit_arrastre', zone: 'transmision', action: 'inspect_then_replace', normal: { km: 24000, months: 24 }, severe: null, criticality: 'safety', source, replaceCriterion: { measure: 'elongación de la cadena', limit: 2, unit: '%' } },
    { componentId: 'embrague', zone: 'transmision', action: 'inspect', normal: { km: 10000, months: 12 }, severe: null, criticality: 'engine', source },
    { componentId: 'pastillas_freno', zone: 'frenos', action: 'inspect', normal: { km: 5000, months: 6 }, severe: null, criticality: 'safety', source, replaceCriterion: { measure: 'grosor', limit: 1.5, unit: 'mm' } },
    { componentId: 'liquido_frenos', zone: 'frenos', action: 'replace', normal: { km: null, months: 24 }, severe: null, criticality: 'safety', source },
    { componentId: 'llantas', zone: 'llantas', action: 'inspect', normal: { km: 5000, months: 6 }, severe: null, criticality: 'safety', source, replaceCriterion: { measure: 'profundidad de dibujo', limit: 1.5, unit: 'mm' } },
    { componentId: 'aceite_horquilla', zone: 'suspension', action: 'replace', normal: { km: 20000, months: 24 }, severe: null, criticality: 'comfort', source },
    { componentId: 'amortiguador_trasero', zone: 'suspension', action: 'inspect', normal: { km: 10000, months: 12 }, severe: null, criticality: 'comfort', source },
    { componentId: 'bateria', zone: 'electrico', action: 'inspect', normal: { km: null, months: 24 }, severe: null, criticality: 'comfort', source },
    { componentId: 'filtro_combustible', zone: 'combustible', action: 'replace', normal: { km: 24000, months: 24 }, severe: null, criticality: 'engine', source },
  ],
};
