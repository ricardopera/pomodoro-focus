import { useState, useEffect } from 'react';
import type { Settings } from '@shared/types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Load initial settings
    window.electronAPI.settings
      .get()
      .then((data) => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });

    // Listen for settings changes
    const unsubscribe = window.electronAPI.settings.onChange((newSettings) => {
      setSettings(newSettings);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateSettings = async (partial: Partial<Settings>): Promise<void> => {
    try {
      const updated = await window.electronAPI.settings.update(partial);
      setSettings(updated);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const resetSettings = async (): Promise<void> => {
    try {
      const defaults = await window.electronAPI.settings.reset();
      setSettings(defaults);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
  };
}
