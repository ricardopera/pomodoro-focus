import { useState, useEffect } from 'react';
import type { Statistics } from '@shared/types';

export function useStatistics() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStatistics = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await window.electronAPI.statistics.get();
      setStatistics(stats);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  return {
    statistics,
    isLoading,
    error,
    reload: loadStatistics,
  };
}
