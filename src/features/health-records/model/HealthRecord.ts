import type { MetricKey } from '@/core/theme/theme';

/** A row of the `health_records` table, mapped to camelCase. */
export interface HealthRecord {
  id: number;
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  steps: number;
  calories: number;
  /** Millilitres. */
  water: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Data needed to create or update a record. */
export interface HealthRecordInput {
  date: string;
  steps: number;
  calories: number;
  water: number;
  note?: string | null;
}

/** Totals for one calendar day (a day can have several entries). */
export interface DailySummary {
  date: string;
  steps: number;
  calories: number;
  water: number;
  entries: number;
}

export type MetricValues = Record<MetricKey, number>;

export type SortOrder = 'desc' | 'asc';

export interface RecordFilter {
  /** Inclusive lower bound, `YYYY-MM-DD`. */
  from?: string;
  /** Inclusive upper bound, `YYYY-MM-DD`. */
  to?: string;
  /** Free-text date search, e.g. "2026-11", "17", "nov". */
  query?: string;
  sort?: SortOrder;
}
