import { describe, expect, it } from 'vitest';
import {
  addDays,
  compareDateKeys,
  formatDateKey,
  isValidDateKey,
  todayKey,
} from '../../src/domain/dates.js';

describe('todayKey', () => {
  it('usa la fecha local y no la fecha UTC', () => {
    // 23:30 hora local: en UTC−5 ya sería el día siguiente.
    const lateNight = new Date(2026, 9, 29, 23, 30);
    expect(todayKey(lateNight)).toBe('2026-10-29');
  });

  it('rellena mes y día con ceros', () => {
    expect(todayKey(new Date(2026, 0, 5, 8, 0))).toBe('2026-01-05');
  });
});

describe('isValidDateKey', () => {
  it('acepta una fecha real con formato AAAA-MM-DD', () => {
    expect(isValidDateKey('2026-10-29')).toBe(true);
    expect(isValidDateKey('2028-02-29')).toBe(true);
  });

  it.each([
    ['2026-02-30'],
    ['2026-13-01'],
    ['29/10/2026'],
    ['2026-1-5'],
    [''],
    [null],
    [undefined],
    [20261029],
  ])('rechaza %s', (value) => {
    expect(isValidDateKey(value)).toBe(false);
  });
});

describe('addDays', () => {
  it('suma y resta días cruzando fin de mes y de año', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-10-29', 0)).toBe('2026-10-29');
  });
});

describe('compareDateKeys', () => {
  it('ordena cronológicamente', () => {
    expect(compareDateKeys('2026-10-28', '2026-10-29')).toBeLessThan(0);
    expect(compareDateKeys('2026-10-29', '2026-10-29')).toBe(0);
    expect(compareDateKeys('2027-01-01', '2026-12-31')).toBeGreaterThan(0);
    expect(['2026-10-29', '2026-01-02', '2026-10-01'].sort(compareDateKeys)).toEqual([
      '2026-01-02',
      '2026-10-01',
      '2026-10-29',
    ]);
  });
});

describe('formatDateKey', () => {
  it('muestra la fecha en español sin desplazarla de día', () => {
    expect(formatDateKey('2026-10-29')).toMatch(/29/);
    expect(formatDateKey('2026-10-29')).toMatch(/oct/i);
  });
});
