import { useEffect, useState } from 'react';
import { Workspace } from './Workspace';
import { api } from './api';
import { DEFAULT_DATA } from '../shared/constants';
import { sanitizeSettings } from '../shared/pomodoro';
import type { AppData } from '../shared/types';

/**
 * Loads the saved state once, then hands over to the workspace so every
 * screen can start from real data instead of guessing.
 */
export function App() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .loadData()
      .then((loaded) => {
        if (cancelled) return;
        setData({
          ...DEFAULT_DATA,
          ...loaded,
          settings: sanitizeSettings(loaded?.settings),
        });
      })
      .catch((error) => {
        console.error('[app] could not load data:', error);
        if (!cancelled) setData(structuredClone(DEFAULT_DATA));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return (
      <div className="splash">
        <span className="splash__pulse" aria-hidden />
        <p>Pomodoro Focus</p>
      </div>
    );
  }

  return <Workspace initialData={data} />;
}
