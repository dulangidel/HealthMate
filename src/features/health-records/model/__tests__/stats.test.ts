import type { HealthRecord } from '../HealthRecord';
import { dailySeries, periodStats, progress, summariseByDate, summaryForDate } from '../stats';

let id = 0;
const rec = (date: string, steps: number, calories: number, water: number): HealthRecord => ({
  id: ++id,
  date,
  steps,
  calories,
  water,
  note: null,
  createdAt: '',
  updatedAt: '',
});

const records = [
  rec('2026-11-17', 4350, 230, 1250),
  rec('2026-11-17', 3500, 190, 750),
  rec('2026-11-16', 11000, 520, 2600),
  rec('2026-11-15', 10500, 480, 2000),
  rec('2026-11-13', 12000, 600, 3000),
];
const goals = { steps: 10000, calories: 500, water: 2500 };

describe('stats', () => {
  it('sums multiple entries on the same day', () => {
    expect(summaryForDate(records, '2026-11-17')).toEqual({
      date: '2026-11-17',
      steps: 7850,
      calories: 420,
      water: 2000,
      entries: 2,
    });
  });

  it('returns zeros for a day with no entries', () => {
    expect(summaryForDate(records, '2026-11-14')).toMatchObject({ steps: 0, entries: 0 });
  });

  it('groups by date', () => {
    expect(summariseByDate(records).size).toBe(4);
  });

  it('builds a zero-filled series oldest first', () => {
    const series = dailySeries(records, '2026-11-17', 7);
    expect(series).toHaveLength(7);
    expect(series[0].date).toBe('2026-11-11');
    expect(series[6].steps).toBe(7850);
    expect(series.find((d) => d.date === '2026-11-14')?.entries).toBe(0);
  });

  it('clamps progress between 0 and 1', () => {
    expect(progress(5000, 10000)).toBe(0.5);
    expect(progress(15000, 10000)).toBe(1);
    expect(progress(10, 0)).toBe(0);
  });

  it('computes averages over active days, best day and goal days', () => {
    const stats = periodStats(dailySeries(records, '2026-11-17', 7), goals);
    expect(stats.activeDays).toBe(4);
    expect(stats.totals.steps).toBe(7850 + 11000 + 10500 + 12000);
    expect(stats.averages.steps).toBe(Math.round(41350 / 4));
    expect(stats.best.steps?.date).toBe('2026-11-13');
    expect(stats.goalDays).toEqual({ steps: 3, calories: 2, water: 2 });
  });
});
