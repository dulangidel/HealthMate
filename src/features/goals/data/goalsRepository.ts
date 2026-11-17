import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/core/database/database';
import type { MetricValues } from '@/features/health-records/model/HealthRecord';

export type Goals = MetricValues;

export const DEFAULT_GOALS: Goals = { steps: 10000, calories: 500, water: 2500 };

const GOALS_KEY = 'daily_goals';

export interface GoalsRepository {
  load(): Promise<Goals>;
  save(goals: Goals): Promise<void>;
}

export function createSQLiteGoalsRepository(
  db: () => Promise<SQLiteDatabase> = getDatabase,
): GoalsRepository {
  return {
    async load() {
      const row = await (await db()).getFirstAsync<{ value: string }>(
        'SELECT value FROM app_settings WHERE key = ?',
        [GOALS_KEY],
      );
      if (!row) return DEFAULT_GOALS;
      try {
        return { ...DEFAULT_GOALS, ...(JSON.parse(row.value) as Partial<Goals>) };
      } catch {
        return DEFAULT_GOALS;
      }
    },

    async save(goals) {
      await (await db()).runAsync(
        'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [GOALS_KEY, JSON.stringify(goals)],
      );
    },
  };
}

export const goalsRepository = createSQLiteGoalsRepository();
