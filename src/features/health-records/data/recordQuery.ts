import type { RecordFilter } from '../model/HealthRecord';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export interface SqlQuery {
  sql: string;
  params: (string | number)[];
}

/**
 * Converts the free-text date search into SQL conditions.
 * Supported inputs:
 *  - ISO fragments: "2026", "2026-11", "2026-11-17", "11-17"
 *  - Day/month(/year): "17/11", "17/11/2026"
 *  - Month names: "nov", "November", "nov 2026"
 */
export function parseDateQuery(raw: string): SqlQuery | null {
  const query = raw.trim().toLowerCase();
  if (!query) return null;

  const dmy = query.match(/^(\d{1,2})[/.](\d{1,2})(?:[/.](\d{4}))?$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const md = `${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    return y
      ? { sql: 'date = ?', params: [`${y}-${md}`] }
      : { sql: 'substr(date, 6, 5) = ?', params: [md] };
  }

  const monthName = query.match(/^([a-z]{3,})\.?\s*(\d{4})?$/);
  if (monthName) {
    const index = MONTHS.findIndex((m) => monthName[1].startsWith(m));
    if (index === -1) return { sql: '0', params: [] }; // unknown word -> no matches
    const mm = String(index + 1).padStart(2, '0');
    return monthName[2]
      ? { sql: "substr(date, 1, 7) = ?", params: [`${monthName[2]}-${mm}`] }
      : { sql: 'substr(date, 6, 2) = ?', params: [mm] };
  }

  if (/^[\d-]+$/.test(query)) {
    return { sql: 'date LIKE ?', params: [`%${query}%`] };
  }

  return { sql: '0', params: [] };
}

/** Builds the SELECT used by the history screen. */
export function buildRecordQuery(filter: RecordFilter = {}): SqlQuery {
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filter.from) {
    where.push('date >= ?');
    params.push(filter.from);
  }
  if (filter.to) {
    where.push('date <= ?');
    params.push(filter.to);
  }
  if (filter.query) {
    const q = parseDateQuery(filter.query);
    if (q) {
      where.push(`(${q.sql})`);
      params.push(...q.params);
    }
  }

  const order = filter.sort === 'asc' ? 'ASC' : 'DESC';
  const sql =
    'SELECT * FROM health_records' +
    (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
    ` ORDER BY date ${order}, id ${order}`;

  return { sql, params };
}
