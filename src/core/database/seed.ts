import { addDays, todayISO } from '@/core/utils/date';
import type { HealthRecordInput } from '@/features/health-records/model/HealthRecord';

/** Small deterministic pseudo-random generator so sample data is reproducible. */
function createRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

const between = (rand: () => number, min: number, max: number, step = 1) =>
  Math.round((min + rand() * (max - min)) / step) * step;

const NOTES = [
  'Morning jog in the park',
  'Gym session – legs day',
  'Long walk after dinner',
  'Rest day, light stretching',
  'Cycled to work',
  'Yoga class',
  null,
  null,
  null,
];

/**
 * Builds dummy health records for the last `days` days (including today).
 * Some days get two entries (morning + evening) to show that daily totals
 * are aggregated across multiple records.
 */
export function generateDummyRecords(days = 21, today: string = todayISO(), seed = 42): HealthRecordInput[] {
  const rand = createRandom(seed);
  const records: HealthRecordInput[] = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = addDays(today, -offset);
    const isToday = offset === 0;
    const split = !isToday && rand() < 0.3;

    if (isToday) {
      // Matches the scenario in the brief: 7,850 steps / 420 kcal / 2,000 ml.
      records.push({ date, steps: 4350, calories: 230, water: 1250, note: 'Morning walk' });
      records.push({ date, steps: 3500, calories: 190, water: 750, note: null });
      continue;
    }

    const steps = between(rand, 3500, 13500, 50);
    const calories = between(rand, 180, 700, 5);
    const water = between(rand, 1200, 3200, 50);
    const note = NOTES[Math.floor(rand() * NOTES.length)];

    if (split) {
      const ratio = 0.4 + rand() * 0.2;
      records.push({
        date,
        steps: Math.round(steps * ratio),
        calories: Math.round(calories * ratio),
        water: Math.round((water * ratio) / 50) * 50,
        note,
      });
      records.push({
        date,
        steps: steps - Math.round(steps * ratio),
        calories: calories - Math.round(calories * ratio),
        water: water - Math.round((water * ratio) / 50) * 50,
        note: null,
      });
    } else {
      records.push({ date, steps, calories, water, note });
    }
  }
  return records;
}
