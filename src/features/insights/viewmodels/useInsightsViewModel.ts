import { useMemo, useState } from 'react';

import { useToday } from '@/core/hooks/useToday';
import { useGoalsStore } from '@/features/goals/state/goalsStore';
import { dailySeries, periodStats } from '@/features/health-records/model/stats';
import { useHealthStore } from '@/features/health-records/state/healthStore';

export type InsightRange = 7 | 30;

export const INSIGHT_RANGES: InsightRange[] = [7, 30];

/** ViewModel for the Insights screen: averages, totals and goal hit counts. */
export function useInsightsViewModel() {
  const records = useHealthStore((s) => s.records);
  const goals = useGoalsStore((s) => s.goals);
  const today = useToday();
  const [range, setRange] = useState<InsightRange>(7);

  const stats = useMemo(() => periodStats(dailySeries(records, today, range), goals), [records, today, range, goals]);

  return { range, setRange, stats, hasData: stats.activeDays > 0 };
}
