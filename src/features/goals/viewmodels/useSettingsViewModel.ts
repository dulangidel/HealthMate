import { useCallback, useMemo, useState } from 'react';

import type { MetricKey } from '@/core/theme/theme';
import { validateGoals } from '@/features/health-records/model/validation';
import { useHealthStore } from '@/features/health-records/state/healthStore';
import { useGoalsStore } from '../state/goalsStore';

type GoalValues = Record<MetricKey, string>;

/** ViewModel for Settings: daily goals and data management. */
export function useSettingsViewModel() {
  const goals = useGoalsStore((s) => s.goals);
  const saveGoals = useGoalsStore((s) => s.saveGoals);
  const recordCount = useHealthStore((s) => s.records.length);
  const resetToSampleData = useHealthStore((s) => s.resetToSampleData);
  const clearAll = useHealthStore((s) => s.clearAll);

  // Unsaved edits; null means "show the stored goals".
  const [draft, setDraft] = useState<GoalValues | null>(null);
  const values = useMemo<GoalValues>(
    () => draft ?? { steps: String(goals.steps), calories: String(goals.calories), water: String(goals.water) },
    [draft, goals],
  );
  const [errors, setErrors] = useState<Partial<GoalValues>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty =
    values.steps !== String(goals.steps) ||
    values.calories !== String(goals.calories) ||
    values.water !== String(goals.water);

  const setField = useCallback(
    (key: MetricKey, value: string) => {
      setDraft({ ...values, [key]: value });
      setErrors((e) => ({ ...e, [key]: undefined }));
      setSavedAt(null);
    },
    [values],
  );

  const save = useCallback(async () => {
    const result = validateGoals(values);
    setErrors(result.errors);
    if (!result.valid) return false;
    setSaving(true);
    try {
      await saveGoals(result.data);
      setDraft(null);
      setSavedAt(Date.now());
      return true;
    } finally {
      setSaving(false);
    }
  }, [values, saveGoals]);

  return { values, errors, setField, save, saving, dirty, savedAt, recordCount, resetToSampleData, clearAll };
}
