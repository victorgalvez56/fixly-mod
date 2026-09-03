import { createContext, use, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { DEMO_PROFILE, DEMO_READINGS, DEMO_RECORDS } from '@/data/demo';
import { findSpec } from '@/data/specs/toyota-yaris-2013-2017-pe';
import type { MaintenanceSpec, OdometerReading, ServiceRecord, UsageProfile, VehicleProfile } from '@/lib/wear/types';
import { vehicle as mockVehicle, type Vehicle } from '@/mock/data';
import { getItem, setItem } from '@/state/storage';

const STORAGE_KEY = 'fixly.vehicle.v1';

export function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

type Persisted = {
  version: 1;
  plate: string | null;
  profile: VehicleProfile | null;
  readings: OdometerReading[];
  records: ServiceRecord[];
  assumeDone: string[];
};

const EMPTY: Persisted = { version: 1, plate: null, profile: null, readings: [], records: [], assumeDone: [] };

type NewRecord = Omit<ServiceRecord, 'id' | 'source'> & { source?: ServiceRecord['source'] };

type VehicleContextValue = {
  hydrated: boolean;
  plate: string | null;
  profile: VehicleProfile | null;
  spec: MaintenanceSpec | null;
  readings: OdometerReading[];
  records: ServiceRecord[];
  assumeDone: string[];
  lastReading: OdometerReading | null;
  /** Legacy shape the older screens read (plate, brand, model, mileage…). Derived, never stored. */
  vehicle: Vehicle | null;
  setFound: (plate: string) => void;
  reset: () => void;
  addReading: (km: number, date?: string) => void;
  /** Kept for the vehicle sheet: appends a reading, never overwrites. */
  updateMileage: (km: number) => void;
  addRecord: (record: NewRecord) => void;
  setUsage: (usage: UsageProfile) => void;
  setAcquisition: (a: VehicleProfile['acquisition']) => void;
  markAssumedDone: (componentId: string) => void;
};

const VehicleContext = createContext<VehicleContextValue | null>(null);

function newId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * All user-owned data lives here: the plate, the vehicle profile, every
 * odometer reading and every service record. Persisted as one JSON blob in
 * expo-sqlite's kv-store on native (see storage.native.ts) and localStorage
 * on web (storage.ts).
 */
export function VehicleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as Persisted;
          if (parsed && parsed.version === 1) setState(parsed);
        }
      } catch {
        // Corrupt or unavailable storage: start clean, never crash the app for this.
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }, 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  const value = useMemo<VehicleContextValue>(() => {
    const sortedReadings = [...state.readings].sort((a, b) => a.date.localeCompare(b.date) || a.km - b.km);
    const lastReading = sortedReadings[sortedReadings.length - 1] ?? null;
    const spec = state.profile ? findSpec(state.profile.brand, state.profile.model, state.profile.year) : null;
    const vehicle: Vehicle | null = state.profile
      ? {
          ...mockVehicle,
          plate: state.plate ?? mockVehicle.plate,
          brand: state.profile.brand,
          model: state.profile.model,
          year: state.profile.year,
          fuel: state.profile.fuel === 'gasolina' ? 'Gasolina' : state.profile.fuel,
          mileage: lastReading?.km ?? 0,
          mileageUpdatedAt: lastReading?.date ?? todayISO(),
        }
      : null;

    return {
      hydrated,
      plate: state.plate,
      profile: state.profile,
      spec,
      readings: sortedReadings,
      records: state.records,
      assumeDone: state.assumeDone,
      lastReading,
      vehicle,
      setFound: (plate) =>
        setState({ version: 1, plate, profile: DEMO_PROFILE, readings: DEMO_READINGS, records: DEMO_RECORDS, assumeDone: [] }),
      reset: () => setState(EMPTY),
      addReading: (km, date = todayISO()) =>
        setState((prev) => ({ ...prev, readings: [...prev.readings, { id: newId('o'), date, km, source: 'user' }] })),
      updateMileage: (km) =>
        setState((prev) => ({ ...prev, readings: [...prev.readings, { id: newId('o'), date: todayISO(), km, source: 'user' }] })),
      addRecord: (record) =>
        setState((prev) => ({
          ...prev,
          records: [...prev.records, { ...record, id: newId('r'), source: record.source ?? 'user' }],
        })),
      setUsage: (usage) => setState((prev) => (prev.profile ? { ...prev, profile: { ...prev.profile, usage } } : prev)),
      setAcquisition: (acquisition) =>
        setState((prev) => (prev.profile ? { ...prev, profile: { ...prev.profile, acquisition } } : prev)),
      markAssumedDone: (componentId) =>
        setState((prev) => (prev.assumeDone.includes(componentId) ? prev : { ...prev, assumeDone: [...prev.assumeDone, componentId] })),
    };
  }, [state, hydrated]);

  return <VehicleContext value={value}>{children}</VehicleContext>;
}

export function useVehicle() {
  const ctx = use(VehicleContext);
  if (!ctx) throw new Error('useVehicle must be used within VehicleProvider');
  return ctx;
}
