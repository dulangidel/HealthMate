import { addDays } from '@/core/utils/date';
import type { MetricKey } from '@/core/theme/theme';
import type { DailySummary, HealthRecord, MetricValues } from './HealthRecord';

const emptySummary = (date: string): DailySummary => ({ date, steps: 0, calories: 0, water: 0, entries: 0 });

/** Groups records by date and sums each metric. */
export function summariseByDate(records: HealthRecord[]): Map<string, DailySummary> {
  const map = new Map<string, DailySummary>();
  for (const r of records) {
    const s = map.get(r.date) ?? emptySummary(r.date);
    s.steps += r.steps;
    s.calories += r.calories;
    s.water += r.water;
    s.entries += 1;
    map.set(r.date, s);
  }
  return map;
}

export function summaryForDate(records: HealthRecord[], date: string): DailySummary {
  return summariseByDate(records.filter((r) => r.date === date)).get(date) ?? emptySummary(date);
}

/** One summary per day for the `days` days ending at `endDate`, oldest first, zero-filled. */
export function dailySeries(records: HealthRecord[], endDate: string, days: number): DailySummary[] {
  const byDate = summariseByDate(records);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(endDate, i - (days - 1));
    return byDate.get(date) ?? emptySummary(date);
  });
}

/** Progress towards a goal, clamped to 0..1. */
export function progress(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.max(0, Math.min(1, value / goal));
}

export interface PeriodStats {
  totals: MetricValues;
  averages: MetricValues;
  best: Record<MetricKey, DailySummary | null>;
  activeDays: number;
  goalDays: Record<MetricKey, number>;
}

/** Totals, averages over active days, best days and goal hit counts for a series. */
export function periodStats(series: DailySummary[], goals: MetricValues): PeriodStats {
  const keys: MetricKey[] = ['steps', 'calories', 'water'];
  const active = series.filter((d) => d.entries > 0);
  const totals = { steps: 0, calories: 0, water: 0 };
  const best: PeriodStats['best'] = { steps: null, calories: null, water: null };
  const goalDays = { steps: 0, calories: 0, water: 0 };

  for (const day of active) {
    for (const k of keys) {
      totals[k] += day[k];
      if (!best[k] || day[k] > best[k]![k]) best[k] = day;
      if (day[k] >= goals[k]) goalDays[k] += 1;
    }
  }
  const n = active.length || 1;
  const averages = {
    steps: Math.round(totals.steps / n),
    calories: Math.round(totals.calories / n),
    water: Math.round(totals.water / n),
  };
  return { totals, averages, best, activeDays: active.length, goalDays };
}
