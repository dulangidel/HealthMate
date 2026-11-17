import { isValidISODate, todayISO } from '@/core/utils/date';
import type { HealthRecordInput, MetricValues } from './HealthRecord';

/** Raw text values as typed in the form. */
export interface RecordFormValues {
  date: string;
  steps: string;
  calories: string;
  water: string;
  note: string;
}

export type RecordFormErrors = Partial<Record<keyof RecordFormValues | 'form', string>>;

export const LIMITS: MetricValues = { steps: 100_000, calories: 10_000, water: 10_000 };
export const NOTE_MAX_LENGTH = 200;

export type ValidationResult =
  | { valid: true; errors: RecordFormErrors; data: HealthRecordInput }
  | { valid: false; errors: RecordFormErrors; data?: undefined };

/**
 * Parses a whole number typed by the user. Blank means 0; thousands
 * separators and spaces are ignored. Returns `null` when invalid.
 */
export function parseWholeNumber(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, '');
  if (cleaned === '') return 0;
  if (!/^\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}

function validateMetric(raw: string, label: string, max: number, unit: string): { value: number; error?: string } {
  const value = parseWholeNumber(raw);
  if (value === null) return { value: 0, error: `${label} must be a whole number (no decimals or negatives).` };
  if (value > max) return { value, error: `${label} looks too high. Maximum is ${max.toLocaleString('en-US')} ${unit}.` };
  return { value };
}

export function validateRecordForm(values: RecordFormValues, today: string = todayISO()): ValidationResult {
  const errors: RecordFormErrors = {};

  if (!values.date) errors.date = 'Please choose a date.';
  else if (!isValidISODate(values.date)) errors.date = 'Date must be in YYYY-MM-DD format.';
  else if (values.date > today) errors.date = 'You can’t log activity for a future date.';

  const steps = validateMetric(values.steps, 'Steps', LIMITS.steps, 'steps');
  const calories = validateMetric(values.calories, 'Calories', LIMITS.calories, 'kcal');
  const water = validateMetric(values.water, 'Water intake', LIMITS.water, 'ml');
  if (steps.error) errors.steps = steps.error;
  if (calories.error) errors.calories = calories.error;
  if (water.error) errors.water = water.error;

  const note = values.note.trim();
  if (note.length > NOTE_MAX_LENGTH) errors.note = `Note must be ${NOTE_MAX_LENGTH} characters or fewer.`;

  const hasFieldErrors = Object.keys(errors).length > 0;
  if (!hasFieldErrors && steps.value + calories.value + water.value === 0) {
    errors.form = 'Enter at least one activity value greater than zero.';
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors };

  return {
    valid: true,
    errors,
    data: { date: values.date, steps: steps.value, calories: calories.value, water: water.value, note: note || null },
  };
}

/** Validation for the daily goals form. */
export function validateGoals(values: Record<keyof MetricValues, string>) {
  const errors: Partial<Record<keyof MetricValues, string>> = {};
  const result = {} as MetricValues;
  (Object.keys(LIMITS) as (keyof MetricValues)[]).forEach((key) => {
    const value = parseWholeNumber(values[key]);
    if (value === null || value <= 0) errors[key] = 'Enter a whole number greater than zero.';
    else if (value > LIMITS[key]) errors[key] = `Maximum is ${LIMITS[key].toLocaleString('en-US')}.`;
    else result[key] = value;
  });
  return Object.keys(errors).length ? { valid: false as const, errors } : { valid: true as const, errors, data: result };
}
