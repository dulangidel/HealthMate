import {
  addDays,
  daysBetween,
  formatDayMonthYear,
  isValidISODate,
  relativeDayLabel,
  startOfMonthISO,
  toISODate,
} from '../date';
import { formatNumber, formatWater } from '../format';

describe('date utils', () => {
  it('formats a Date as local YYYY-MM-DD', () => {
    expect(toISODate(new Date(2026, 7, 18))).toBe('2026-08-18');
  });

  it.each([
    ['2026-11-17', true],
    ['2026-02-29', false], // not a leap year
    ['2028-02-29', true],
    ['2026-13-01', false],
    ['17-11-2026', false],
    ['', false],
  ])('isValidISODate(%s) -> %s', (value, expected) => {
    expect(isValidISODate(value)).toBe(expected);
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('computes start of month and day differences', () => {
    expect(startOfMonthISO('2026-11-17')).toBe('2026-11-01');
    expect(daysBetween('2026-11-10', '2026-11-17')).toBe(7);
  });

  it('labels today and yesterday relatively', () => {
    expect(relativeDayLabel('2026-11-17', '2026-11-17')).toBe('Today');
    expect(relativeDayLabel('2026-11-16', '2026-11-17')).toBe('Yesterday');
    expect(relativeDayLabel('2026-11-10', '2026-11-17')).toContain('Nov');
  });

  it('formats the dashboard date like the brief', () => {
    expect(formatDayMonthYear('2026-08-18')).toBe('18 August 2026');
  });
});

describe('format utils', () => {
  it('formats numbers with thousands separators', () => {
    expect(formatNumber(7850)).toBe('7,850');
  });

  it('formats water in ml or litres', () => {
    expect(formatWater(800)).toBe('800 ml');
    expect(formatWater(2000)).toBe('2 L');
    expect(formatWater(2350)).toBe('2.35 L');
  });
});
