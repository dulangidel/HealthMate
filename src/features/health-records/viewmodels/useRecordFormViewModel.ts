import { useCallback, useEffect, useState } from 'react';

import { todayISO } from '@/core/utils/date';
import { healthRecordRepository, type HealthRecordRepository } from '../data/healthRecordRepository';
import type { HealthRecord } from '../model/HealthRecord';
import { validateRecordForm, type RecordFormErrors, type RecordFormValues } from '../model/validation';
import { useHealthStore } from '../state/healthStore';

const emptyValues = (date = todayISO()): RecordFormValues => ({ date, steps: '', calories: '', water: '', note: '' });

const toValues = (r: HealthRecord): RecordFormValues => ({
  date: r.date,
  steps: r.steps ? String(r.steps) : '',
  calories: r.calories ? String(r.calories) : '',
  water: r.water ? String(r.water) : '',
  note: r.note ?? '',
});

/**
 * ViewModel for the Add / Edit record screen.
 * @param recordId when provided the form edits an existing record.
 */
export function useRecordFormViewModel(
  recordId?: number,
  initialDate?: string,
  repository: HealthRecordRepository = healthRecordRepository,
) {
  const isEditing = recordId !== undefined;
  const addRecord = useHealthStore((s) => s.addRecord);
  const updateRecord = useHealthStore((s) => s.updateRecord);
  const deleteRecord = useHealthStore((s) => s.deleteRecord);

  const [values, setValues] = useState<RecordFormValues>(() => emptyValues(initialDate));
  const [errors, setErrors] = useState<RecordFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    repository
      .findById(recordId)
      .then((record) => {
        if (cancelled) return;
        if (record) setValues(toValues(record));
        else setNotFound(true);
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isEditing, recordId, repository]);

  const setField = useCallback(
    (field: keyof RecordFormValues, value: string) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        // After the first submit attempt, re-validate live so errors clear as the user fixes them.
        if (submitted) setErrors(validateRecordForm(next).errors);
        return next;
      });
    },
    [submitted],
  );

  /** Returns true when the record was saved. */
  const submit = useCallback(async (): Promise<boolean> => {
    setSubmitted(true);
    const result = validateRecordForm(values);
    setErrors(result.errors);
    if (!result.valid) return false;

    setSaving(true);
    try {
      if (isEditing) await updateRecord(recordId, result.data);
      else await addRecord(result.data);
      return true;
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : 'Could not save the record. Please try again.' });
      return false;
    } finally {
      setSaving(false);
    }
  }, [values, isEditing, recordId, addRecord, updateRecord]);

  const remove = useCallback(async () => {
    if (isEditing) await deleteRecord(recordId);
  }, [isEditing, recordId, deleteRecord]);

  return { values, errors, setField, submit, remove, saving, loading, notFound, isEditing };
}
