import type { SQLiteDatabase } from 'expo-sqlite';

import { createSQLiteHealthRecordRepository } from '../healthRecordRepository';

jest.mock('@/core/database/database', () => ({ getDatabase: jest.fn() }));

/** Minimal mock of the expo-sqlite async API that records every call. */
function createMockDb() {
  const row = {
    id: 1,
    date: '2026-11-17',
    steps: 7850,
    calories: 420,
    water: 2000,
    note: 'Walk',
    created_at: '2026-11-17 08:00:00',
    updated_at: '2026-11-17 08:00:00',
  };
  const db = {
    getAllAsync: jest.fn().mockResolvedValue([row]),
    getFirstAsync: jest.fn().mockResolvedValue(row),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 42, changes: 1 }),
    execAsync: jest.fn().mockResolvedValue(undefined),
    withTransactionAsync: jest.fn(async (task: () => Promise<void>) => task()),
  };
  return { db, row, repo: createSQLiteHealthRecordRepository(async () => db as unknown as SQLiteDatabase) };
}

describe('SQLite health record repository', () => {
  it('maps snake_case rows to HealthRecord objects', async () => {
    const { repo } = createMockDb();
    const [record] = await repo.findAll();
    expect(record).toEqual({
      id: 1,
      date: '2026-11-17',
      steps: 7850,
      calories: 420,
      water: 2000,
      note: 'Walk',
      createdAt: '2026-11-17 08:00:00',
      updatedAt: '2026-11-17 08:00:00',
    });
  });

  it('passes filters to SQL as bound parameters', async () => {
    const { repo, db } = createMockDb();
    await repo.findAll({ from: '2026-11-10', to: '2026-11-17' });
    expect(db.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE date >= ? AND date <= ?'), [
      '2026-11-10',
      '2026-11-17',
    ]);
  });

  it('creates a record and returns the new id', async () => {
    const { repo, db } = createMockDb();
    const id = await repo.create({ date: '2026-11-17', steps: 100, calories: 10, water: 250 });
    expect(id).toBe(42);
    expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO health_records'), [
      '2026-11-17',
      100,
      10,
      250,
      null,
    ]);
  });

  it('updates a record by id', async () => {
    const { repo, db } = createMockDb();
    await repo.update(1, { date: '2026-11-16', steps: 1, calories: 2, water: 3, note: 'x' });
    expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('UPDATE health_records'), ['2026-11-16', 1, 2, 3, 'x', 1]);
  });

  it('throws when updating a record that does not exist', async () => {
    const { repo, db } = createMockDb();
    db.runAsync.mockResolvedValueOnce({ lastInsertRowId: 0, changes: 0 });
    await expect(repo.update(999, { date: '2026-11-16', steps: 1, calories: 0, water: 0 })).rejects.toThrow(/not found/);
  });

  it('deletes a record by id', async () => {
    const { repo, db } = createMockDb();
    await repo.remove(5);
    expect(db.runAsync).toHaveBeenCalledWith('DELETE FROM health_records WHERE id = ?', [5]);
  });

  it('returns null when a record is not found', async () => {
    const { repo, db } = createMockDb();
    db.getFirstAsync.mockResolvedValueOnce(null);
    expect(await repo.findById(123)).toBeNull();
  });

  it('resets sample data inside a transaction', async () => {
    const { repo, db } = createMockDb();
    await repo.resetToSampleData();
    expect(db.withTransactionAsync).toHaveBeenCalled();
    expect(db.runAsync).toHaveBeenCalledWith('DELETE FROM health_records');
    expect(db.runAsync.mock.calls.length).toBeGreaterThan(20);
  });
});
