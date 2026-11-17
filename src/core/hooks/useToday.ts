import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayISO } from '@/core/utils/date';

/**
 * Returns today's ISO date and updates it when the app returns to the
 * foreground, so the dashboard rolls over correctly after midnight.
 */
export function useToday(): string {
  const [today, setToday] = useState(todayISO);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(todayISO());
    });
    const timer = setInterval(() => setToday(todayISO()), 60_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);

  return today;
}
