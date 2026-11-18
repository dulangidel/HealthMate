import type { SQLiteDatabase } from 'expo-sqlite';

import { migrateDatabase } from '../migrations';
import { DATABASE_VERSION } from '../schema';
import { generateDummyRecords } from '../seed';

describe('generateDummyRecords', () => {
  const records = generateDummyRecords(21, '2026-11-17');

  it('covers every day in the range ending today', () => {
    const dates = new Set(records.map((r) => r.date));
    expect(dates.size).toBe(21);
    expect(dates.has('2026-11-17')).toBe(true);
    expect(dates.has('2026-10-28')).toBe(true);
  });

  it('matches the brief example for today (7,850 steps / 420 kcal / 2,000 ml)', () => {
    const today = records.filter((r) => r.date === '2026-11-17');
    expect(today.reduce((a, r) => a + r.steps, 0)).toBe(7850);
    expect(today.reduce((a, r) => a + r.calories, 0)).toBe(420);
    expect(today.reduce((a, r) => a + r.water, 0)).toBe(2000);
  });

  it('only produces valid non-negative whole numbers', () => {
    for (const r of records) {
      for (const v of [r.steps, r.calories, r.water]) {
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('is deterministic for the same seed', () => {
    expect(generateDummyRecords(21, '2026-11-17')).toEqual(records);
  });
});

describe('migrateDatabase', () => {
  const createDb = (userVersion: number) => ({
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue({ user_version: userVersion }),
    withTransactionAsync: jest.fn(async (task: () => Promise<void>) => task()),
  });

  it('creates tables, seeds dummy data and sets user_version on first run', async () => {
    const db = createDb(0);
    await migrateDatabase(db as unknown as SQLiteDatabase);
    const sql = db.execAsync.mock.calls.map((c) => c[0] as string).join('\n');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS health_records');
    expect(sql).toMatch(/id\s+INTEGER PRIMARY KEY AUTOINCREMENT/);
    expect(sql).toMatch(/date\s+TEXT/);
    expect(sql).toMatch(/steps\s+INTEGER/);
    expect(sql).toMatch(/calories\s+INTEGER/);
    expect(sql).toMatch(/water\s+INTEGER/);
    expect(sql).toContain(`PRAGMA user_version = ${DATABASE_VERSION}`);
    expect(db.runAsync).toHaveBeenCalled(); // dummy inserts
  });

  it('does nothing when already on the latest version', async () => {
    const db = createDb(DATABASE_VERSION);
    await migrateDatabase(db as unknown as SQLiteDatabase);
    expect(db.withTransactionAsync).not.toHaveBeenCalled();
    expect(db.runAsync).not.toHaveBeenCalled();
  });
});
