import { createInMemoryRepository } from '@/test-utils/inMemoryRepository';
import { createHealthStore } from '../healthStore';

jest.mock('@/core/database/database', () => ({ getDatabase: jest.fn() }));

const input = (date: string, steps = 1000) => ({ date, steps, calories: 100, water: 500 });

describe('health store (CRUD through state management)', () => {
  it('loads records newest first', async () => {
    const store = createHealthStore(createInMemoryRepository([input('2026-11-15'), input('2026-11-17')]));
    await store.getState().load();
    expect(store.getState().status).toBe('ready');
    expect(store.getState().records.map((r) => r.date)).toEqual(['2026-11-17', '2026-11-15']);
  });

  it('creates, updates and deletes a record', async () => {
    const store = createHealthStore(createInMemoryRepository());
    await store.getState().load();

    const id = await store.getState().addRecord(input('2026-11-17', 7850));
    expect(store.getState().records).toHaveLength(1);

    await store.getState().updateRecord(id, input('2026-11-17', 9000));
    expect(store.getState().records[0].steps).toBe(9000);

    const removed = await store.getState().deleteRecord(id);
    expect(removed?.steps).toBe(9000);
    expect(store.getState().records).toHaveLength(0);
  });

  it('increments revision after each write', async () => {
    const store = createHealthStore(createInMemoryRepository());
    await store.getState().load();
    const before = store.getState().revision;
    await store.getState().addRecord(input('2026-11-17'));
    expect(store.getState().revision).toBe(before + 1);
  });

  it('exposes an error state when loading fails', async () => {
    const repo = createInMemoryRepository();
    repo.findAll = jest.fn().mockRejectedValue(new Error('disk I/O error'));
    const store = createHealthStore(repo);
    await store.getState().load();
    expect(store.getState().status).toBe('error');
    expect(store.getState().error).toBe('disk I/O error');
  });
});
