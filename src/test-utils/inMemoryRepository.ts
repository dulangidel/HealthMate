import type { HealthRecordRepository } from '@/features/health-records/data/healthRecordRepository';
import type { HealthRecord, HealthRecordInput } from '@/features/health-records/model/HealthRecord';

/** In-memory fake of the SQLite repository for fast, isolated tests. */
export function createInMemoryRepository(seed: HealthRecordInput[] = []): HealthRecordRepository & { rows: HealthRecord[] } {
  let nextId = 1;
  const now = '2026-11-17 10:00:00';
  const rows: HealthRecord[] = [];
  const insert = (input: HealthRecordInput) => {
    const record: HealthRecord = { ...input, id: nextId++, note: input.note ?? null, createdAt: now, updatedAt: now };
    rows.push(record);
    return record.id;
  };
  seed.forEach(insert);

  return {
    rows,
    async findAll(filter = {}) {
      const result = rows.filter(
        (r) => (!filter.from || r.date >= filter.from) && (!filter.to || r.date <= filter.to) && (!filter.query || r.date.includes(filter.query)),
      );
      const dir = filter.sort === 'asc' ? 1 : -1;
      return [...result].sort((a, b) => (a.date === b.date ? (a.id - b.id) * dir : a.date < b.date ? -dir : dir));
    },
    async findById(id) {
      return rows.find((r) => r.id === id) ?? null;
    },
    async create(input) {
      return insert(input);
    },
    async update(id, input) {
      const r = rows.find((x) => x.id === id);
      if (!r) throw new Error('Record not found. It may have been deleted.');
      Object.assign(r, input, { note: input.note ?? null });
    },
    async remove(id) {
      const i = rows.findIndex((r) => r.id === id);
      if (i >= 0) rows.splice(i, 1);
    },
    async resetToSampleData() {
      rows.splice(0, rows.length);
    },
    async removeAll() {
      rows.splice(0, rows.length);
    },
  };
}
