import { componentDef } from '@/data/catalog';
import { ALL_ZONES, zoneOrder, type ZoneId } from '@/data/zones';
import { estimateAll, policyFor } from '@/lib/wear/engine';
import { isPending, sortByGravity, worstOf } from '@/lib/wear/selectors';
import type { ComponentSpec, VehicleType, WearEstimate, WearStatus } from '@/lib/wear/types';
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
 * Compiler handles memoization. Cars and motorcycles run the same model with a
 * different manual, a different zone list and a different policy — a bike's
 * intervals are short enough that the car's "pronto" windows would never fit.
 */
export function useMaintenance() {
  const { profile, spec, readings, records, assumeDone, hydrated, lastReading, vehicleType } = useVehicle();
  const today = todayISO();
  const type: VehicleType = vehicleType;

  const estimates: WearEstimate[] =
    spec && profile ? estimateAll(spec, profile, records, readings, today, new Set(assumeDone), policyFor(type)) : [];

  const specById = new Map<string, ComponentSpec>();
  spec?.components.forEach((c) => specById.set(c.componentId, c));

  const order = zoneOrder(type);
  // Every zone gets an entry, even the ones this vehicle does not have, so a
  // lookup by id can never come back undefined. `zoneOrder` says which to show.
  const zones: Record<ZoneId, ZoneState> = Object.fromEntries(
    ALL_ZONES.map((zone) => {
      const list = sortByGravity(estimates.filter((e) => componentDef(e.componentId, type).zone === zone));
      const worst = worstOf(list);
      return [zone, { zone, worst, status: worst?.status ?? 'sin_datos', pending: list.filter(isPending).length, estimates: list }];
    }),
  ) as Record<ZoneId, ZoneState>;

  return {
    hydrated,
    vehicleType: type,
    coldStart: hydrated && spec === null,
    spec,
    estimates: sortByGravity(estimates),
    byId: (id: string) => estimates.find((e) => e.componentId === id) ?? null,
    specFor: (id: string) => specById.get(id) ?? null,
    /** Zone order for this vehicle. Zones the manual says nothing about are dropped. */
    zoneOrder: order,
    /** Only the zones this manual actually covers: an air-cooled bike has no coolant zone. */
    activeZones: order.filter((z) => zones[z].estimates.length > 0),
    zones,
    worst: worstOf(estimates),
    lastReading,
  };
}
