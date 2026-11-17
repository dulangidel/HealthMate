import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { migrateDatabase } from './migrations';
import { DATABASE_NAME } from './schema';

let databasePromise: Promise<SQLiteDatabase> | null = null;

/**
 * Returns the single shared connection to the embedded SQLite database,
 * opening it and running migrations the first time it is requested.
 */
export function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await openDatabaseAsync(DATABASE_NAME);
      await migrateDatabase(db);
      return db;
    })().catch((error) => {
      databasePromise = null; // allow a retry
      throw error;
    });
  }
  return databasePromise;
}
