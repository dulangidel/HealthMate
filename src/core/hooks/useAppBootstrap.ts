import { useCallback, useEffect, useState } from 'react';

import { getDatabase } from '@/core/database/database';
import { goalsStore } from '@/features/goals/state/goalsStore';
import { healthStore } from '@/features/health-records/state/healthStore';

/** Opens/migrates the database and loads both stores. */
async function bootstrap(): Promise<void> {
  await getDatabase();
  await Promise.all([healthStore.getState().load(), goalsStore.getState().load()]);
  const { status, error } = healthStore.getState();
  if (status === 'error') throw new Error(error ?? 'Failed to load records');
}

/** Runs app start-up before the UI renders and exposes a retry on failure. */
export function useAppBootstrap() {
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    bootstrap()
      .then(() => !cancelled && setReady(true))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : 'Failed to open the database.'));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  return { ready, error, retry };
}
