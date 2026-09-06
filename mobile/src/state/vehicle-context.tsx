import { createContext, use, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { demoFixture } from '@/data/demo';
import { specForProfile } from '@/data/specs';
import { isVehicleType } from '@/lib/vehicle';
import type { MaintenanceSpec, OdometerReading, ServiceRecord, UsageProfile, VehicleProfile, VehicleType } from '@/lib/wear/types';
import { mockVehicleFor, type Vehicle } from '@/mock/data';
import { getItem, setItem } from '@/state/storage';

const STORAGE_KEY = 'fixly.vehicle.v1';

export function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** One reminder the driver can switch off, and how far ahead it warns. */
export type NoticePref = { enabled: boolean; leadTimeDays?: number };

const DEFAULT_NOTICES: Record<string, NoticePref> = {
  documentos: { enabled: true, leadTimeDays: 15 },
  mantenimiento: { enabled: true, leadTimeDays: 7 },
  kilometraje: { enabled: false },
};

type Persisted = {
  version: 3;
  /** What the driver said they ride, before any plate is looked up. */
  vehicleType: VehicleType;
  plate: string | null;
  profile: VehicleProfile | null;
  readings: OdometerReading[];
  records: ServiceRecord[];
  assumeDone: string[];
  /** Reminder preferences. Survive navigation and restarts, unlike component state. */
  notices: Record<string, NoticePref>;
};

const EMPTY: Persisted = {
  version: 3,
  vehicleType: 'auto',
  plate: null,
  profile: null,
  readings: [],
  records: [],
  assumeDone: [],
  notices: DEFAULT_NOTICES,
};

/**
 * v1 had no vehicle type: everyone who saved one was driving a car.
 * v2 had no reminder preferences: they lived in component state and were lost
 * on every navigation, so there is nothing to carry forward — take the defaults.
 */
function migrate(raw: unknown): Persisted | null {
  const parsed = raw as (Omit<Partial<Persisted>, 'version'> & { version?: number }) | null;
  if (!parsed || ![1, 2, 3].includes(parsed.version ?? 0)) return null;
  const profileType = isVehicleType(parsed.profile?.type) ? parsed.profile.type : 'auto';
  const profile = parsed.profile ? { ...parsed.profile, type: profileType } : null;
  return {
    version: 3,
    vehicleType: isVehicleType(parsed.vehicleType) ? parsed.vehicleType : profileType,
    plate: parsed.plate ?? null,
    profile,
    readings: parsed.readings ?? [],
    records: parsed.records ?? [],
    assumeDone: parsed.assumeDone ?? [],
    notices: { ...DEFAULT_NOTICES, ...(parsed.notices ?? {}) },
  };
}

type NewRecord = Omit<ServiceRecord, 'id' | 'source'> & { source?: ServiceRecord['source'] };

type VehicleContextValue = {
  hydrated: boolean;
  /** The active vehicle type: the profile's when there is one, else the driver's choice. */
  vehicleType: VehicleType;
  plate: string | null;
  profile: VehicleProfile | null;
  spec: MaintenanceSpec | null;
  readings: OdometerReading[];
  records: ServiceRecord[];
  assumeDone: string[];
  lastReading: OdometerReading | null;
  /** Legacy shape the older screens read (plate, brand, model, mileage…). Derived, never stored. */
  vehicle: Vehicle | null;
  notices: Record<string, NoticePref>;
  setNotice: (id: string, pref: NoticePref) => void;
  setVehicleType: (type: VehicleType) => void;
  setFound: (plate: string) => void;
  reset: () => void;
  clearAll: () => void;
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
          const migrated = migrate(JSON.parse(raw));
          if (migrated) setState(migrated);
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
    const spec = specForProfile(state.profile);
    const vehicleType = state.profile?.type ?? state.vehicleType;
    const base = mockVehicleFor(vehicleType);
    const vehicle: Vehicle | null = state.profile
      ? {
          ...base,
          type: vehicleType,
          plate: state.plate ?? base.plate,
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
      vehicleType,
      plate: state.plate,
      profile: state.profile,
      spec,
      readings: sortedReadings,
      records: state.records,
      assumeDone: state.assumeDone,
      lastReading,
      vehicle,
      notices: state.notices,
      setNotice: (id, pref) => setState((prev) => ({ ...prev, notices: { ...prev.notices, [id]: pref } })),
      // Changing type invalidates the profile, its manual and its records; picking
      // the type you already have must leave every one of them alone.
      setVehicleType: (type) =>
        setState((prev) => (prev.vehicleType === type ? prev : { ...EMPTY, vehicleType: type, notices: prev.notices })),
      setFound: (plate) =>
        setState((prev) => {
          const fixture = demoFixture(prev.vehicleType);
          return {
            version: 3,
            vehicleType: prev.vehicleType,
            plate,
            profile: fixture.profile,
            readings: fixture.readings,
            records: fixture.records,
            assumeDone: [],
            notices: prev.notices,
          };
        }),
      reset: () => setState((prev) => ({ ...EMPTY, vehicleType: prev.vehicleType, notices: prev.notices })),
      /** Wipes everything, preferences included: the "borrar mis datos" action. */
      clearAll: () => setState(EMPTY),
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
