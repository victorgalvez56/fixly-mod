/**
 * Every Spanish string the wear model puts in front of the driver, in one
 * place. Rules (DESIGN.md + NEGOCIO.md): attribute intervals to the manual,
 * attribute remaining numbers to the user's own odometer, say "aprox." on
 * projections, never sound like the app has sensors, never diagnose.
 */
export const COPY = {
  statusWord: {
    ok: 'Al día',
    pronto: 'Pronto',
    toca: 'Toca ahora',
    vencido: 'Vencido',
    sin_datos: 'Sin datos',
  },
  inspectWord: {
    ok: 'Revisión al día',
    pronto: 'Revisar pronto',
    toca: 'Toca revisar',
    vencido: 'Revisión vencida',
    sin_datos: 'Sin datos',
  },
  confidence: {
    alta: 'Estimación confiable',
    media: 'Estimación aproximada',
    baja: 'Estimación poco confiable. Actualiza tu kilometraje',
    bajaAssumed: 'Estimación poco confiable. Confirma el último cambio',
  },
  basis: {
    manual: 'Según el manual',
    manualUnreviewed: 'Según el manual (sin revisar aún)',
    userEntered: 'Según lo que escribiste',
    whicheverFirst: 'lo que ocurra primero',
    severe: 'tabla de uso intensivo del manual',
    severeNotInManual: 'Tu manual no indica un intervalo distinto para uso intensivo; mostramos el normal.',
    estimatedWithKm: 'estimado con tu kilometraje',
  },
  noSchedule: 'El manual no programa un cambio; se revisa si hay ruido o fuga.',
  noRecord: 'No registraste cuándo fue el último cambio.',
  possiblyOverdue: 'Tu auto ya pasó ese kilometraje; si no sabes cuándo se hizo, pídele al taller que lo revise.',
  inspectionSaidReplace: 'El taller indicó que hay que cambiarlo.',
  inspectHint: 'El cambio depende de lo que mida el taller.',
  parkedHint: 'Mientras no manejes, no avanza.',
  updateKm: 'Actualizar kilometraje',
  staleKm: 'Actualiza tu kilometraje para afinar la estimación.',
  howItWorksTitle: 'Cómo se calcula',
  howItWorks:
    'Fixly no tiene ningún dato del auto: no hay sensores ni conexión. El cálculo usa dos cosas: el intervalo del manual del propietario (en kilómetros y en meses, lo que ocurra primero) y lo que tú registras: tu kilometraje y los servicios que hiciste. Con tus lecturas de kilometraje estimamos cuántos km manejas por día para convertir lo que falta en días. Nada de esto mide el estado real de la pieza.',
  intervalCaption: 'Intervalo',
  doneAction: 'Registrar que ya lo hice',
  scheduleAction: 'Agendar este servicio',
  recordService: 'Registrar un servicio',
  recordLastChange: 'Registrar último cambio',
  ifSkipped: 'Si no lo haces',
  componentsByManual: 'Componentes según tu manual',
  reviewingPlan: 'Revisando tu plan',
} as const;

export const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'setiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;
