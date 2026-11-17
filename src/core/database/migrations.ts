import type { SQLiteDatabase } from 'expo-sqlite';

import { CREATE_APP_SETTINGS_TABLE, CREATE_HEALTH_RECORDS_TABLE, DATABASE_VERSION } from './schema';
import { generateDummyRecords } from './seed';
import type { HealthRecordInput } from '@/features/health-records/model/HealthRecord';

export async function insertRecords(db: SQLiteDatabase, records: HealthRecordInput[]): Promise<void> {
  for (const r of records) {
    await db.runAsync(
      'INSERT INTO health_records (date, steps, calories, water, note) VALUES (?, ?, ?, ?, ?)',
      [r.date, r.steps, r.calories, r.water, r.note ?? null],
    );
  }
}

/**
 * Runs schema migrations using SQLite's `user_version` pragma.
 * On first launch the tables are created and dummy records are inserted.
 */
export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(CREATE_HEALTH_RECORDS_TABLE);
      await db.execAsync(CREATE_APP_SETTINGS_TABLE);
      await insertRecords(db, generateDummyRecords());
    });
    currentVersion = 1;
  }

  // Future migrations go here, e.g.
  // if (currentVersion === 1) { await db.execAsync('ALTER TABLE ...'); currentVersion = 2; }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
