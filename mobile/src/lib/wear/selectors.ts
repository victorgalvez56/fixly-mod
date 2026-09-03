import { formatKm } from '@/lib/format';

import { COPY, MONTHS_ES } from './copy';
import type { ComponentSpec, WearEstimate, WearStatus } from './types';

/** Gravity order used everywhere a list is sorted: worst first, unknowns before "fine". */
export const STATUS_RANK: Record<WearStatus, number> = { vencido: 0, toca: 1, pronto: 2, sin_datos: 3, ok: 4 };

export function isInspect(e: Pick<WearEstimate, 'action'>): boolean {
  return e.action === 'inspect' || e.action === 'inspect_then_replace';
}

export function statusWord(e: Pick<WearEstimate, 'action' | 'status'>): string {
  return isInspect(e) ? COPY.inspectWord[e.status] : COPY.statusWord[e.status];
}

/** "Sin datos" is actionable (record it) except when the manual schedules nothing: that one sorts after "Al día". */
function rankOf(e: WearEstimate): number {
  if (e.status === 'sin_datos' && e.action === 'no_schedule') return STATUS_RANK.ok + 1;
  return STATUS_RANK[e.status];
}

export function sortByGravity(list: WearEstimate[]): WearEstimate[] {
  return [...list].sort((a, b) => {
    const r = rankOf(a) - rankOf(b);
    if (r !== 0) return r;
    const da = a.remainingDays ?? Number.POSITIVE_INFINITY;
    const db = b.remainingDays ?? Number.POSITIVE_INFINITY;
    return da - db;
  });
}

export function worstOf(list: WearEstimate[]): WearEstimate | null {
  return sortByGravity(list)[0] ?? null;
}

/** Only items the driver should act on soon count as "pending" for badges. */
export function isPending(e: WearEstimate): boolean {
  return e.status === 'vencido' || e.status === 'toca' || e.status === 'pronto';
}

export function daysLabel(n: number): string {
  const d = Math.max(0, Math.round(n));
  return `${d} día${d === 1 ? '' : 's'}`;
}

/** "14 de setiembre" (Peruvian spelling). Adds the year only when it is not the current one. */
export function formatDateEs(iso: string, today = new Date()): string {
  const [y, m, d] = iso.split('-').map(Number);
  const base = `${d} de ${MONTHS_ES[(m ?? 1) - 1]}`;
  return y === today.getFullYear() ? base : `${base} de ${y}`;
}

function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

/** The one-line remaining/overdue sentence under a status word. */
export function remainingLine(e: WearEstimate): string {
  if (e.status === 'sin_datos') {
    return e.action === 'no_schedule' ? COPY.noSchedule : COPY.noRecord;
  }
  if (e.reasons.includes('inspection_said_replace')) return COPY.inspectionSaidReplace;

  const overKm = e.kmTrack && e.kmTrack.remaining < 0 ? -e.kmTrack.remaining : null;
  const overDays = e.timeTrack && e.timeTrack.remaining < 0 ? -e.timeTrack.remaining : null;
  if (overKm !== null || overDays !== null) {
    if (overKm !== null && (overDays === null || e.binding === 'km')) return `Se pasó ~${formatKm(roundTo(overKm, 10))}`;
    if (overDays !== null) return `Se pasó ~${daysLabel(overDays)}`;
  }

  const parts: string[] = [];
  if (e.remainingKm !== null) parts.push(`Faltan ~${formatKm(roundTo(Math.max(0, e.remainingKm), 10))}`);
  if (e.remainingDays !== null) parts.push(`aprox. ${daysLabel(e.remainingDays)}`);
  else if (e.reasons.includes('daily_km_zero')) parts.push(COPY.parkedHint);
  return parts.join(' · ');
}

export function projectedLabel(e: WearEstimate): string | null {
  if (!e.projectedDueDate) return null;
  const past = e.remainingDays !== null && e.remainingDays < 0;
  return past ? `venció aprox. el ${formatDateEs(e.projectedDueDate)}` : `el ${formatDateEs(e.projectedDueDate)}`;
}

/** "Según el manual, cada 5,000 km o 6 meses, lo que ocurra primero" */
export function intervalSentence(spec: ComponentSpec, e: WearEstimate): string {
  const interval = e.severeApplied && spec.severe ? spec.severe : spec.normal;
  const basis =
    spec.source.kind === 'user_entered'
      ? COPY.basis.userEntered
      : spec.source.reviewedBy
        ? COPY.basis.manual
        : COPY.basis.manualUnreviewed;
  if (spec.action === 'no_schedule') return `${basis}, no programa un cambio.`;
  const parts: string[] = [];
  if (interval.km !== null) parts.push(formatKm(interval.km));
  if (interval.months !== null) parts.push(`${interval.months} meses`);
  if (parts.length === 0) return `${basis}, sin intervalo.`;
  const verb = isInspect(e) ? 'revisar' : e.action === 'rotate' ? 'rotar' : 'cambiar';
  const tail = parts.length === 2 ? `, ${COPY.basis.whicheverFirst}` : '';
  const severe = e.severeApplied ? ` (${COPY.basis.severe})` : '';
  return `${basis}, ${verb} cada ${parts.join(' o ')}${tail}${severe}.`;
}

export function kmPerDayLabel(e: WearEstimate): string {
  if (e.dailyKm.source === 'default_assumption') return e.dailyKm.assumptionLabel ?? '';
  const rate = Math.round(e.dailyKm.kmPerDay);
  return e.dailyKm.source === 'readings'
    ? `al ritmo que registraste, ~${rate} km por día`
    : `según los km por semana que declaraste, ~${rate} km por día`;
}

export function confidenceLabel(e: WearEstimate): string | null {
  if (e.confidence === 'ninguna') return null;
  if (e.confidence === 'baja' && e.anchor.kind === 'assumed_at_acquisition') return COPY.confidence.bajaAssumed;
  return COPY.confidence[e.confidence];
}

/** Full explanation paragraph for a verdict card or the "?" sheet. */
export function explanation(e: WearEstimate, spec: ComponentSpec, name: string): string {
  const sentences: string[] = [intervalSentence(spec, e)];
  if (e.status === 'sin_datos') {
    if (spec.action === 'no_schedule') return `${name}: ${COPY.noSchedule}`;
    sentences.push(`${COPY.noRecord}`);
    if (e.reasons.includes('possibly_overdue_never_recorded')) sentences.push(COPY.possiblyOverdue);
    return sentences.join(' ');
  }
  if (e.anchor.date) {
    const what = isInspect(e) ? 'revisión' : 'cambio';
    const anchorKm = e.anchor.km !== null ? ` a los ${formatKm(Math.round(e.anchor.km))}` : '';
    const usedKm = e.kmTrack ? `${formatKm(e.kmTrack.used)}` : null;
    const usedDays = e.timeTrack ? daysLabel(e.timeTrack.used) : null;
    const used = [usedKm, usedDays].filter(Boolean).join(' y ');
    const assumed = e.anchor.kind === 'assumed_at_acquisition' ? ' (asumido, no registrado)' : '';
    sentences.push(`Desde el último ${what} que registraste (${formatDateEs(e.anchor.date)}${anchorKm})${assumed} llevas ${used}.`);
  }
  const rem = remainingLine(e);
  const projected = projectedLabel(e);
  const rate = e.kmTrack ? `, ${kmPerDayLabel(e)}` : '';
  if (e.percentConsumed !== null && e.percentConsumed >= 1) {
    sentences.push(`${rem} del intervalo del manual, ${COPY.basis.estimatedWithKm}${rate}.`);
  } else {
    sentences.push(`${rem}${projected ? ` (${projected})` : ''}, ${COPY.basis.estimatedWithKm}${rate}.`);
  }
  if (e.reasons.includes('severe_not_in_manual')) sentences.push(COPY.basis.severeNotInManual);
  if (isInspect(e)) sentences.push(COPY.inspectHint);
  return sentences.join(' ');
}

/** "87,400 km · hace 14 días" */
export function freshnessLabel(e: Pick<WearEstimate, 'lastReadingDate' | 'lastReadingAgeDays' | 'odometerNowKm' | 'odometerIsProjected'>, lastReadingKm: number | null): string {
  if (lastReadingKm === null) return 'Sin lectura de kilometraje';
  const age = e.lastReadingAgeDays ?? 0;
  const when = age === 0 ? 'hoy' : age === 1 ? 'ayer' : `hace ${age} días`;
  return `${formatKm(lastReadingKm)} · ${when}`;
}

/** Percent of the binding interval consumed, clamped for a gauge (0..1) plus the excess (0..0.5). */
export function gaugeParts(e: WearEstimate): { fill: number; excess: number; km: number | null; time: number | null } {
  const p = e.percentConsumed ?? 0;
  return {
    fill: Math.min(1, Math.max(0, p)),
    excess: Math.min(0.5, Math.max(0, p - 1)),
    km: e.kmTrack ? Math.min(1.5, e.kmTrack.percent) : null,
    time: e.timeTrack ? Math.min(1.5, e.timeTrack.percent) : null,
  };
}
