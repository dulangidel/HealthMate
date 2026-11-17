import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/core/database/database';
import { insertRecords } from '@/core/database/migrations';
import { generateDummyRecords } from '@/core/database/seed';
import type { HealthRecord, HealthRecordInput, RecordFilter } from '../model/HealthRecord';
import { buildRecordQuery } from './recordQuery';

interface HealthRecordRow {
  id: number;
  date: string;
  steps: number;
  calories: number;
  water: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

const mapRow = (row: HealthRecordRow): HealthRecord => ({
  id: row.id,
  date: row.date,
  steps: row.steps,
  calories: row.calories,
  water: row.water,
  note: row.note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/** Data-access contract for health records (makes the store easy to test). */
export interface HealthRecordRepository {
  findAll(filter?: RecordFilter): Promise<HealthRecord[]>;
  findById(id: number): Promise<HealthRecord | null>;
  create(input: HealthRecordInput): Promise<number>;
  update(id: number, input: HealthRecordInput): Promise<void>;
  remove(id: number): Promise<void>;
  resetToSampleData(): Promise<void>;
  removeAll(): Promise<void>;
}

/** SQLite implementation of {@link HealthRecordRepository}. */
export function createSQLiteHealthRecordRepository(
  db: () => Promise<SQLiteDatabase> = getDatabase,
): HealthRecordRepository {
  return {
    async findAll(filter) {
      const { sql, params } = buildRecordQuery(filter);
      const rows = await (await db()).getAllAsync<HealthRecordRow>(sql, params);
      return rows.map(mapRow);
    },

    async findById(id) {
      const row = await (await db()).getFirstAsync<HealthRecordRow>(
        'SELECT * FROM health_records WHERE id = ?',
        [id],
      );
      return row ? mapRow(row) : null;
    },

    async create(input) {
      const result = await (await db()).runAsync(
        'INSERT INTO health_records (date, steps, calories, water, note) VALUES (?, ?, ?, ?, ?)',
        [input.date, input.steps, input.calories, input.water, input.note ?? null],
      );
      return result.lastInsertRowId;
    },

    async update(id, input) {
      const result = await (await db()).runAsync(
        `UPDATE health_records
            SET date = ?, steps = ?, calories = ?, water = ?, note = ?, updated_at = datetime('now')
          WHERE id = ?`,
        [input.date, input.steps, input.calories, input.water, input.note ?? null, id],
      );
      if (result.changes === 0) throw new Error('Record not found. It may have been deleted.');
    },

    async remove(id) {
      await (await db()).runAsync('DELETE FROM health_records WHERE id = ?', [id]);
    },

    async resetToSampleData() {
      const database = await db();
      await database.withTransactionAsync(async () => {
        await database.runAsync('DELETE FROM health_records');
        await insertRecords(database, generateDummyRecords());
      });
    },

    async removeAll() {
      await (await db()).runAsync('DELETE FROM health_records');
    },
  };
}

export const healthRecordRepository = createSQLiteHealthRecordRepository();
