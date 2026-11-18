import { parseWholeNumber, validateGoals, validateRecordForm, type RecordFormValues } from '../validation';

const TODAY = '2026-11-17';
const valid: RecordFormValues = { date: '2026-11-17', steps: '7850', calories: '420', water: '2000', note: '' };

describe('parseWholeNumber', () => {
  it.each([
    ['', 0],
    ['  ', 0],
    ['7850', 7850],
    ['7,850', 7850],
    ['12.5', null],
    ['-3', null],
    ['abc', null],
  ])('parses %p as %p', (input, expected) => {
    expect(parseWholeNumber(input)).toBe(expected);
  });
});

describe('validateRecordForm', () => {
  it('accepts a valid record and converts values to numbers', () => {
    const result = validateRecordForm(valid, TODAY);
    expect(result.valid).toBe(true);
    expect(result.data).toEqual({ date: '2026-11-17', steps: 7850, calories: 420, water: 2000, note: null });
  });

  it('treats blank metric fields as zero', () => {
    const result = validateRecordForm({ ...valid, steps: '', calories: '' }, TODAY);
    expect(result.valid).toBe(true);
    expect(result.data).toMatchObject({ steps: 0, calories: 0, water: 2000 });
  });

  it('requires a date', () => {
    expect(validateRecordForm({ ...valid, date: '' }, TODAY).errors.date).toMatch(/choose a date/);
  });

  it('rejects future dates', () => {
    expect(validateRecordForm({ ...valid, date: '2026-11-18' }, TODAY).errors.date).toMatch(/future/);
  });

  it('rejects non-numeric, decimal and negative values', () => {
    const { errors } = validateRecordForm({ ...valid, steps: 'abc', calories: '1.5', water: '-200' }, TODAY);
    expect(errors.steps).toBeDefined();
    expect(errors.calories).toBeDefined();
    expect(errors.water).toBeDefined();
  });

  it('rejects unrealistically large values', () => {
    const { errors } = validateRecordForm({ ...valid, steps: '200000', water: '20000' }, TODAY);
    expect(errors.steps).toMatch(/too high/);
    expect(errors.water).toMatch(/too high/);
  });

  it('requires at least one non-zero metric', () => {
    const { valid: ok, errors } = validateRecordForm({ ...valid, steps: '0', calories: '', water: '0' }, TODAY);
    expect(ok).toBe(false);
    expect(errors.form).toMatch(/at least one/);
  });

  it('limits note length and trims notes', () => {
    expect(validateRecordForm({ ...valid, note: 'x'.repeat(201) }, TODAY).errors.note).toBeDefined();
    expect(validateRecordForm({ ...valid, note: '  Evening run  ' }, TODAY).data?.note).toBe('Evening run');
  });
});

describe('validateGoals', () => {
  it('accepts positive goals', () => {
    const r = validateGoals({ steps: '10000', calories: '500', water: '2500' });
    expect(r.valid).toBe(true);
    expect(r.data).toEqual({ steps: 10000, calories: 500, water: 2500 });
  });

  it('rejects zero and invalid goals', () => {
    const r = validateGoals({ steps: '0', calories: 'abc', water: '2500' });
    expect(r.valid).toBe(false);
    expect(Object.keys(r.errors)).toEqual(['steps', 'calories']);
  });
});
