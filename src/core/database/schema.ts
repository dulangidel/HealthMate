/**
 * SQLite schema for HealthMate.
 *
 * `health_records` holds the coursework-required columns
 * (id, date, steps, calories, water) plus optional metadata columns.
 * `app_settings` is a small key/value table used for user preferences
 * such as daily goals.
 */
export const DATABASE_NAME = 'healthmate.db';

/** Bump this and add a step in `migrations.ts` whenever the schema changes. */
export const DATABASE_VERSION = 1;

export const CREATE_HEALTH_RECORDS_TABLE = `
CREATE TABLE IF NOT EXISTS health_records (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date       TEXT    NOT NULL,
  steps      INTEGER NOT NULL DEFAULT 0 CHECK (steps >= 0),
  calories   INTEGER NOT NULL DEFAULT 0 CHECK (calories >= 0),
  water      INTEGER NOT NULL DEFAULT 0 CHECK (water >= 0),
  note       TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records (date);
`;

export const CREATE_APP_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;
