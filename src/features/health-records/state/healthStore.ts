import { createStore, useStore } from 'zustand';

import { healthRecordRepository, type HealthRecordRepository } from '../data/healthRecordRepository';
import type { HealthRecord, HealthRecordInput } from '../model/HealthRecord';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface HealthState {
  status: LoadStatus;
  error: string | null;
  /** Every record, newest first. Source of truth for dashboard & insights. */
  records: HealthRecord[];
  /** Incremented after each write so filtered queries know to re-run. */
  revision: number;

  load(): Promise<void>;
  addRecord(input: HealthRecordInput): Promise<number>;
  updateRecord(id: number, input: HealthRecordInput): Promise<void>;
  /** Deletes a record and returns the removed record. */
  deleteRecord(id: number): Promise<HealthRecord | undefined>;
  resetToSampleData(): Promise<void>;
  clearAll(): Promise<void>;
}

const messageOf = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.');

/**
 * Factory for the records store. The repository is injected so the store
 * can be unit-tested with an in-memory fake.
 */
export function createHealthStore(repository: HealthRecordRepository) {
  return createStore<HealthState>()((set, get) => {
    /** Re-reads all records from SQLite after a write. */
    const sync = async () => {
      const records = await repository.findAll({ sort: 'desc' });
      set((s) => ({ records, revision: s.revision + 1, status: 'ready', error: null }));
    };

    return {
      status: 'idle',
      error: null,
      records: [],
      revision: 0,

      async load() {
        set({ status: 'loading', error: null });
        try {
          await sync();
        } catch (e) {
          set({ status: 'error', error: messageOf(e) });
        }
      },

      async addRecord(input) {
        const id = await repository.create(input);
        await sync();
        return id;
      },

      async updateRecord(id, input) {
        await repository.update(id, input);
        await sync();
      },

      async deleteRecord(id) {
        const existing = get().records.find((r) => r.id === id);
        await repository.remove(id);
        await sync();
        return existing;
      },

      async resetToSampleData() {
        await repository.resetToSampleData();
        await sync();
      },

      async clearAll() {
        await repository.removeAll();
        await sync();
      },
    };
  });
}

export const healthStore = createHealthStore(healthRecordRepository);

export function useHealthStore<T>(selector: (state: HealthState) => T): T {
  return useStore(healthStore, selector);
}
