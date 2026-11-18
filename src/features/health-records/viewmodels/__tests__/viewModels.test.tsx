import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { HealthRecord } from '../../model/HealthRecord';
import { healthStore } from '../../state/healthStore';
import { useRecordFormViewModel } from '../useRecordFormViewModel';
import { buildFilter, groupIntoSections } from '../useRecordListViewModel';

// Replace the SQLite-backed singleton repository with an in-memory fake.
jest.mock('@/core/database/database', () => ({ getDatabase: jest.fn() }));
jest.mock('@/features/goals/data/goalsRepository', () => {
  const actual = jest.requireActual('@/features/goals/data/goalsRepository');
  return { ...actual, goalsRepository: { load: jest.fn(async () => actual.DEFAULT_GOALS), save: jest.fn() } };
});
jest.mock('@/features/health-records/data/healthRecordRepository', () => {
  const { createInMemoryRepository: create } = jest.requireActual('@/test-utils/inMemoryRepository');
  return { healthRecordRepository: create() };
});

describe('buildFilter', () => {
  const today = '2026-11-17';
  it('maps quick filters to date ranges', () => {
    expect(buildFilter('today', today, '', 'desc', null)).toMatchObject({ from: today, to: today });
    expect(buildFilter('week', today, '', 'desc', null)).toMatchObject({ from: '2026-11-11', to: today });
    expect(buildFilter('month', today, '', 'desc', null)).toMatchObject({ from: '2026-11-01', to: today });
    expect(buildFilter('date', today, '', 'desc', '2026-11-05')).toMatchObject({ from: '2026-11-05', to: '2026-11-05' });
    expect(buildFilter('all', today, '  nov ', 'asc', null)).toEqual({ query: 'nov', sort: 'asc' });
  });
});

describe('groupIntoSections', () => {
  it('groups consecutive records by date with daily totals', () => {
    const r = (id: number, date: string, steps: number) =>
      ({ id, date, steps, calories: 0, water: 0, note: null, createdAt: '', updatedAt: '' }) as HealthRecord;
    const sections = groupIntoSections([r(3, '2026-11-17', 100), r(2, '2026-11-17', 200), r(1, '2026-11-16', 50)]);
    expect(sections.map((s) => s.title)).toEqual(['2026-11-17', '2026-11-16']);
    expect(sections[0].summary.steps).toBe(300);
    expect(sections[0].data).toHaveLength(2);
  });
});

describe('useRecordFormViewModel', () => {
  beforeEach(async () => {
    await healthStore.getState().clearAll();
  });

  it('shows validation errors and does not save invalid input', async () => {
    const { result } = await renderHook(() => useRecordFormViewModel(undefined, '2026-11-17'));
    await act(async () => {
      result.current.setField('steps', 'abc');
    });
    let saved = true;
    await act(async () => {
      saved = await result.current.submit();
    });
    expect(saved).toBe(false);
    expect(result.current.errors.steps).toMatch(/whole number/);
    expect(healthStore.getState().records).toHaveLength(0);
  });

  it('saves a valid record to the store and database', async () => {
    const { result } = await renderHook(() => useRecordFormViewModel(undefined, '2026-11-17'));
    await act(async () => {
      result.current.setField('steps', '7850');
      result.current.setField('calories', '420');
      result.current.setField('water', '2000');
    });
    let saved = false;
    await act(async () => {
      saved = await result.current.submit();
    });
    expect(saved).toBe(true);
    expect(healthStore.getState().records[0]).toMatchObject({ date: '2026-11-17', steps: 7850, calories: 420, water: 2000 });
  });

  it('loads an existing record for editing', async () => {
    const id = await healthStore.getState().addRecord({ date: '2026-11-16', steps: 5000, calories: 300, water: 1500 });
    const { result } = await renderHook(() => useRecordFormViewModel(id));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isEditing).toBe(true);
    expect(result.current.values).toMatchObject({ date: '2026-11-16', steps: '5000', water: '1500' });
  });

  it('flags a missing record as not found', async () => {
    const { result } = await renderHook(() => useRecordFormViewModel(9999));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notFound).toBe(true);
  });
});

