import { useCallback, useEffect, useMemo, useState } from 'react';

import { useToday } from '@/core/hooks/useToday';
import { addDays, startOfMonthISO } from '@/core/utils/date';
import { healthRecordRepository, type HealthRecordRepository } from '../data/healthRecordRepository';
import type { DailySummary, HealthRecord, RecordFilter, SortOrder } from '../model/HealthRecord';
import { summariseByDate } from '../model/stats';
import { useHealthStore } from '../state/healthStore';

export type QuickFilter = 'all' | 'today' | 'week' | 'month' | 'date';

export const QUICK_FILTERS: { key: QuickFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Last 7 days' },
  { key: 'month', label: 'This month' },
];

export interface RecordSection {
  title: string;
  summary: DailySummary;
  data: HealthRecord[];
}

/** Builds the SQL filter for the current UI state (exported for tests). */
export function buildFilter(
  quick: QuickFilter,
  today: string,
  query: string,
  sort: SortOrder,
  selectedDate: string | null,
): RecordFilter {
  const filter: RecordFilter = { sort, query: query.trim() || undefined };
  switch (quick) {
    case 'today':
      return { ...filter, from: today, to: today };
    case 'week':
      return { ...filter, from: addDays(today, -6), to: today };
    case 'month':
      return { ...filter, from: startOfMonthISO(today), to: today };
    case 'date':
      return selectedDate ? { ...filter, from: selectedDate, to: selectedDate } : filter;
    default:
      return filter;
  }
}

export function groupIntoSections(records: HealthRecord[]): RecordSection[] {
  const summaries = summariseByDate(records);
  const sections: RecordSection[] = [];
  for (const r of records) {
    const last = sections[sections.length - 1];
    if (last && last.title === r.date) last.data.push(r);
    else sections.push({ title: r.date, summary: summaries.get(r.date)!, data: [r] });
  }
  return sections;
}

/** ViewModel for the History screen: search, filter, sort and delete. */
export function useRecordListViewModel(repository: HealthRecordRepository = healthRecordRepository) {
  const today = useToday();
  const revision = useHealthStore((s) => s.revision);
  const deleteRecord = useHealthStore((s) => s.deleteRecord);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOrder>('desc');
  // Result of the last query, tagged with the filter+revision it was run for.
  const [result, setResult] = useState<{ key: string; records: HealthRecord[]; error: string | null } | null>(null);

  // Debounce typing so we don't query SQLite on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const filter = useMemo(
    () => buildFilter(quickFilter, today, debouncedQuery, sort, selectedDate),
    [quickFilter, today, debouncedQuery, sort, selectedDate],
  );

  const queryKey = `${JSON.stringify(filter)}#${revision}`;

  useEffect(() => {
    let cancelled = false;
    repository
      .findAll(filter)
      .then((rows) => !cancelled && setResult({ key: queryKey, records: rows, error: null }))
      .catch(
        (e: unknown) =>
          !cancelled &&
          setResult({ key: queryKey, records: [], error: e instanceof Error ? e.message : 'Could not load records.' }),
      );
    return () => {
      cancelled = true;
    };
  }, [filter, queryKey, repository]);

  const records = useMemo(() => result?.records ?? [], [result]);
  const loading = result?.key !== queryKey;
  const error = result?.error ?? null;

  const sections = useMemo(() => groupIntoSections(records), [records]);

  const pickDate = useCallback((date: string) => {
    setSelectedDate(date);
    setQuickFilter('date');
  }, []);

  const selectQuickFilter = useCallback((key: QuickFilter) => {
    setQuickFilter(key);
    if (key !== 'date') setSelectedDate(null);
  }, []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setQuickFilter('all');
    setSelectedDate(null);
  }, []);

  const isFiltered = quickFilter !== 'all' || query.trim().length > 0;

  return {
    today,
    query,
    setQuery,
    quickFilter,
    selectQuickFilter,
    selectedDate,
    pickDate,
    sort,
    toggleSort: () => setSort((s) => (s === 'desc' ? 'asc' : 'desc')),
    clearFilters,
    isFiltered,
    sections,
    resultCount: records.length,
    loading,
    error,
    deleteRecord,
  };
}
