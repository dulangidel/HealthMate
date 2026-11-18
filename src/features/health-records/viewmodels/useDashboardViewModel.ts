import { useMemo } from 'react';

import { useToday } from '@/core/hooks/useToday';
import { METRIC_KEYS, METRICS, type MetricConfig } from '@/core/theme/theme';
import { formatDayMonthYear } from '@/core/utils/date';
import { useGoalsStore } from '@/features/goals/state/goalsStore';
import { progress, summaryForDate } from '../model/stats';
import { useHealthStore } from '../state/healthStore';

export interface DashboardMetric extends MetricConfig {
  value: number;
  goal: number;
  progress: number;
}

/** ViewModel for the Dashboard screen: derives today's summary from the store. */
export function useDashboardViewModel() {
  const records = useHealthStore((s) => s.records);
  const error = useHealthStore((s) => s.error);
  const reload = useHealthStore((s) => s.load);
  const goals = useGoalsStore((s) => s.goals);
  const today = useToday();

  const derived = useMemo(() => {
    const summary = summaryForDate(records, today);
    const metrics: DashboardMetric[] = METRIC_KEYS.map((key) => ({
      ...METRICS[key],
      value: summary[key],
      goal: goals[key],
      progress: progress(summary[key], goals[key]),
    }));
    return { summary, metrics, todayEntries: records.filter((r) => r.date === today) };
  }, [records, goals, today]);

  return { ...derived, today, todayLabel: formatDayMonthYear(today), error, reload };
}
