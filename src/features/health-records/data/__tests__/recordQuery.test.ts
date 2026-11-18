import { buildRecordQuery, parseDateQuery } from '../recordQuery';

describe('parseDateQuery', () => {
  it('returns null for an empty query', () => {
    expect(parseDateQuery('   ')).toBeNull();
  });

  it('matches ISO fragments with LIKE', () => {
    expect(parseDateQuery('2026-11')).toEqual({ sql: 'date LIKE ?', params: ['%2026-11%'] });
  });

  it('matches full day/month/year exactly', () => {
    expect(parseDateQuery('17/11/2026')).toEqual({ sql: 'date = ?', params: ['2026-11-17'] });
  });

  it('matches day/month in any year', () => {
    expect(parseDateQuery('7/8')).toEqual({ sql: 'substr(date, 6, 5) = ?', params: ['08-07'] });
  });

  it('matches month names with optional year', () => {
    expect(parseDateQuery('Nov')).toEqual({ sql: 'substr(date, 6, 2) = ?', params: ['11'] });
    expect(parseDateQuery('august 2026')).toEqual({ sql: 'substr(date, 1, 7) = ?', params: ['2026-08'] });
  });

  it('returns a no-match condition for unrelated text', () => {
    expect(parseDateQuery('hello')).toEqual({ sql: '0', params: [] });
  });
});

describe('buildRecordQuery', () => {
  it('selects everything newest first by default', () => {
    expect(buildRecordQuery()).toEqual({
      sql: 'SELECT * FROM health_records ORDER BY date DESC, id DESC',
      params: [],
    });
  });

  it('combines a date range, search and ascending sort using bound parameters', () => {
    const q = buildRecordQuery({ from: '2026-11-01', to: '2026-11-17', query: 'nov', sort: 'asc' });
    expect(q.sql).toBe(
      'SELECT * FROM health_records WHERE date >= ? AND date <= ? AND (substr(date, 6, 2) = ?) ORDER BY date ASC, id ASC',
    );
    expect(q.params).toEqual(['2026-11-01', '2026-11-17', '11']);
  });

  it('never interpolates user input into SQL', () => {
    const q = buildRecordQuery({ query: "2026'; DROP TABLE health_records;--" });
    expect(q.sql).not.toContain('DROP');
  });
});
