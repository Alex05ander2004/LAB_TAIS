import { describe, expect, it } from 'vitest';
import { calculateStreaks } from '../../src/domain/streaks.js';

const TODAY = '2026-10-29';

describe('calculateStreaks', () => {
  it('sin historial: racha 0 y hoy pendiente', () => {
    expect(calculateStreaks([], TODAY)).toEqual({ current: 0, best: 0, todayStatus: 'pending' });
  });

  it('cuenta los días seguidos que terminan hoy', () => {
    expect(calculateStreaks(['2026-10-27', '2026-10-28', '2026-10-29'], TODAY)).toEqual({
      current: 3,
      best: 3,
      todayStatus: 'completed',
    });
  });

  it('hoy sin marcar no rompe la racha: cuenta hasta ayer y queda pendiente (FR-007)', () => {
    expect(calculateStreaks(['2026-10-27', '2026-10-28'], TODAY)).toEqual({
      current: 2,
      best: 2,
      todayStatus: 'pending',
    });
  });

  it('si ayer no se cumplió, la racha actual es 0 aunque haya historial', () => {
    expect(calculateStreaks(['2026-10-26', '2026-10-27'], TODAY)).toEqual({
      current: 0,
      best: 2,
      todayStatus: 'pending',
    });
  });

  it('calcula la mejor racha sobre un historial con huecos', () => {
    const completions = [
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-28',
      '2026-10-29',
    ];
    expect(calculateStreaks(completions, TODAY)).toEqual({ current: 2, best: 5, todayStatus: 'completed' });
  });

  it('mantiene la racha al cruzar el fin de mes y de año', () => {
    expect(calculateStreaks(['2026-10-31', '2026-11-01'], '2026-11-01').current).toBe(2);
    expect(calculateStreaks(['2026-12-30', '2026-12-31', '2027-01-01'], '2027-01-01').current).toBe(3);
  });

  it('hábito creado y cumplido hoy: racha 1', () => {
    expect(calculateStreaks([TODAY], TODAY)).toEqual({ current: 1, best: 1, todayStatus: 'completed' });
  });

  it('ignora fechas futuras, duplicadas, desordenadas o inválidas', () => {
    const completions = ['2026-10-29', '2026-10-28', '2026-10-28', '2026-10-30', '2026-10-31', 'basura'];
    expect(calculateStreaks(completions, TODAY)).toEqual({ current: 2, best: 2, todayStatus: 'completed' });
  });

  it('la mejor racha nunca es menor que la actual', () => {
    const { current, best } = calculateStreaks(['2026-10-28', '2026-10-29'], TODAY);
    expect(best).toBeGreaterThanOrEqual(current);
  });
});
