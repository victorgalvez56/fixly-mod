import { useEffect, useState } from 'react';

/**
 * Simulates the delay of a real API call against mock data, so skeleton
 * states — required by DESIGN.md, never a spinner — actually get exercised.
 */
export function useMockQuery<T>(getData: () => T, delayMs = 650): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setData(getData()), delayMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayMs]);

  return { data, loading: data === null };
}
