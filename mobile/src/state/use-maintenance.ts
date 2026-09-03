import { componentDef } from '@/data/catalog';
import { ZONE_ORDER, type ZoneId } from '@/data/zones';
import { estimateAll } from '@/lib/wear/engine';
import { isPending, sortByGravity, worstOf } from '@/lib/wear/selectors';
import type { ComponentSpec, WearEstimate, WearStatus } from '@/lib/wear/types';
import { todayISO, useVehicle } from '@/state/vehicle-context';

export type ZoneState = {
  zone: ZoneId;
  worst: WearEstimate | null;
  status: WearStatus;
  pending: number;
  estimates: WearEstimate[];
};

/**
 * The maintenance view of the vehicle: every estimate recomputed from the
 * manual spec + the user's records on each render. Pure and cheap; the React
 * Compiler handles memoization.
 */
export function useMaintenance() {
  const { profile, spec, readings, records, assumeDone, hydrated, lastReading } = useVehicle();
  const today = todayISO();

  const estimates: WearEstimate[] =
    spec && profile ? estimateAll(spec, profile, records, readings, today, new Set(assumeDone)) : [];

  const specById = new Map<string, ComponentSpec>();
  spec?.components.forEach((c) => specById.set(c.componentId, c));

  const zones: Record<ZoneId, ZoneState> = Object.fromEntries(
    ZONE_ORDER.map((zone) => {
      const list = sortByGravity(estimates.filter((e) => componentDef(e.componentId).zone === zone));
      const worst = worstOf(list);
      return [zone, { zone, worst, status: worst?.status ?? 'sin_datos', pending: list.filter(isPending).length, estimates: list }];
    }),
  ) as Record<ZoneId, ZoneState>;

  return {
    hydrated,
    coldStart: hydrated && spec === null,
    spec,
    estimates: sortByGravity(estimates),
    byId: (id: string) => estimates.find((e) => e.componentId === id) ?? null,
    specFor: (id: string) => specById.get(id) ?? null,
    zones,
    worst: worstOf(estimates),
    lastReading,
  };
}
