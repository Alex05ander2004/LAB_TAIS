import { describe, expect, it } from 'vitest';
import {
  canEditDate,
  createHabit,
  getDayStatus,
  isCompletedOn,
  sortHabits,
  toggleCompletion,
} from '../../src/domain/habits.js';

const meta = { id: 'nuevo-id', createdAt: '2026-10-29T15:00:00.000Z' };

const habit = (overrides) => ({
  id: 'h',
  name: 'Hábito',
  category: 'General',
  startDate: '2026-10-01',
  completions: [],
  createdAt: '2026-10-01T10:00:00.000Z',
  ...overrides,
});

describe('createHabit', () => {
  it('crea un hábito limpio con historial vacío', () => {
    const result = createHabit(
      { name: '  Leer   libros ', category: ' Estudio ', startDate: '2026-10-29' },
      [],
      meta,
    );

    expect(result).toEqual({
      ok: true,
      habit: {
        id: 'nuevo-id',
        name: 'Leer libros',
        category: 'Estudio',
        startDate: '2026-10-29',
        completions: [],
        createdAt: '2026-10-29T15:00:00.000Z',
      },
    });
  });

  it('devuelve los errores y no crea nada si la validación falla', () => {
    const existing = [habit({ name: 'Leer' })];
    const result = createHabit({ name: 'leer', category: '', startDate: '2026-10-29' }, existing, meta);

    expect(result.ok).toBe(false);
    expect(result.errors.name).toMatch(/Ya existe/);
    expect(result.errors.category).toBe('Escribe una categoría.');
    expect(result.habit).toBeUndefined();
  });

  it('no modifica la lista existente', () => {
    const existing = [habit({ name: 'Leer' })];
    const snapshot = structuredClone(existing);
    createHabit({ name: 'Correr', category: 'Salud', startDate: '2026-10-29' }, existing, meta);
    expect(existing).toEqual(snapshot);
  });
});

describe('sortHabits', () => {
  it('ordena alfabéticamente en español sin distinguir mayúsculas ni acentos', () => {
    const habits = [
      habit({ id: '1', name: 'meditar' }),
      habit({ id: '2', name: 'Árbol' }),
      habit({ id: '3', name: 'Correr' }),
      habit({ id: '4', name: 'agua' }),
    ];
    expect(sortHabits(habits).map((h) => h.name)).toEqual(['agua', 'Árbol', 'Correr', 'meditar']);
  });

  it('desempata por fecha de creación', () => {
    const habits = [
      habit({ id: 'b', name: 'Leer', createdAt: '2026-10-02T00:00:00.000Z' }),
      habit({ id: 'a', name: 'leer', createdAt: '2026-10-01T00:00:00.000Z' }),
    ];
    expect(sortHabits(habits).map((h) => h.id)).toEqual(['a', 'b']);
  });

  it('no modifica el arreglo original', () => {
    const habits = [habit({ id: '1', name: 'Z' }), habit({ id: '2', name: 'A' })];
    sortHabits(habits);
    expect(habits.map((h) => h.id)).toEqual(['1', '2']);
  });
});

describe('marcado del día (FR-006)', () => {
  const TODAY = '2026-10-29';
  const base = habit({ id: 'leer', name: 'Leer', startDate: '2026-10-20', completions: ['2026-10-27'] });

  it('marca hoy y mantiene el historial ordenado', () => {
    const result = toggleCompletion(base, TODAY, TODAY);
    expect(result.ok).toBe(true);
    expect(result.habit.completions).toEqual(['2026-10-27', TODAY]);
    expect(isCompletedOn(result.habit, TODAY)).toBe(true);
  });

  it('desmarca hoy si ya estaba marcado', () => {
    const marked = toggleCompletion(base, TODAY, TODAY).habit;
    const result = toggleCompletion(marked, TODAY, TODAY);
    expect(result.ok).toBe(true);
    expect(result.habit.completions).toEqual(['2026-10-27']);
    expect(isCompletedOn(result.habit, TODAY)).toBe(false);
  });

  it('no modifica el hábito original', () => {
    const snapshot = structuredClone(base);
    toggleCompletion(base, TODAY, TODAY);
    expect(base).toEqual(snapshot);
  });

  it.each([
    ['ayer', '2026-10-28'],
    ['un día ya cumplido', '2026-10-27'],
    ['mañana', '2026-10-30'],
  ])('rechaza editar %s', (_label, date) => {
    const result = toggleCompletion(base, date, TODAY);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Solo puedes marcar o desmarcar el día de hoy.');
    expect(result.habit).toBeUndefined();
    expect(base.completions).toEqual(['2026-10-27']);
  });

  it('rechaza marcar hoy si el hábito todavía no empieza', () => {
    const upcoming = habit({ startDate: '2026-11-05' });
    const result = toggleCompletion(upcoming, TODAY, TODAY);
    expect(result).toEqual({ ok: false, error: 'Este hábito empieza más adelante; todavía no se puede marcar.' });
  });

  it('canEditDate solo permite hoy y desde la fecha de inicio', () => {
    expect(canEditDate(base, TODAY, TODAY)).toBe(true);
    expect(canEditDate(base, '2026-10-28', TODAY)).toBe(false);
    expect(canEditDate(base, '2026-10-30', TODAY)).toBe(false);
    expect(canEditDate(habit({ startDate: TODAY }), TODAY, TODAY)).toBe(true);
    expect(canEditDate(habit({ startDate: '2026-10-30' }), TODAY, TODAY)).toBe(false);
  });

  it('getDayStatus devuelve los cinco estados', () => {
    expect(getDayStatus(base, '2026-10-27', TODAY)).toBe('completed');
    expect(getDayStatus(base, '2026-10-28', TODAY)).toBe('not-completed');
    expect(getDayStatus(base, TODAY, TODAY)).toBe('pending');
    expect(getDayStatus(base, '2026-10-30', TODAY)).toBe('future');
    expect(getDayStatus(base, '2026-10-19', TODAY)).toBe('before-start');
    expect(getDayStatus({ ...base, completions: [TODAY] }, TODAY, TODAY)).toBe('completed');
  });
});
