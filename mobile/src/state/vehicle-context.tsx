import { createContext, use, useMemo, useState, type ReactNode } from 'react';

import { vehicle as mockVehicle, type Vehicle } from '@/mock/data';

type VehicleContextValue = {
  vehicle: Vehicle | null;
  setFound: (plate: string) => void;
  updateMileage: (km: number) => void;
  reset: () => void;
};

const VehicleContext = createContext<VehicleContextValue | null>(null);

/**
 * The one piece of meaningful global state in this app — everything else is
 * mock data read directly by screens. No state library needed for this.
 */
export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const value = useMemo<VehicleContextValue>(
    () => ({
      vehicle,
      setFound: (plate: string) => setVehicle({ ...mockVehicle, plate }),
      updateMileage: (km: number) =>
        setVehicle((prev) => (prev ? { ...prev, mileage: km, mileageUpdatedAt: new Date().toISOString() } : prev)),
      reset: () => setVehicle(null),
    }),
    [vehicle],
  );

  return <VehicleContext value={value}>{children}</VehicleContext>;
}

export function useVehicle() {
  const ctx = use(VehicleContext);
  if (!ctx) throw new Error('useVehicle must be used within VehicleProvider');
  return ctx;
}
