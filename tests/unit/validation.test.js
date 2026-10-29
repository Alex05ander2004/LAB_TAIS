import { describe, expect, it } from 'vitest';
import { MESSAGES, normalizeName, validateHabitInput } from '../../src/domain/validation.js';

const existing = [
  {
    id: 'h1',
    name: 'Leer',
    category: 'Estudio',
    startDate: '2026-10-01',
    completions: [],
    createdAt: '2026-10-01T10:00:00.000Z',
  },
];

const valid = { name: 'Correr', category: 'Salud', startDate: '2026-10-29' };

describe('normalizeName', () => {
  it('recorta, colapsa espacios y pasa a minúsculas', () => {
    expect(normalizeName('  Leer   Libros  ')).toBe('leer libros');
    expect(normalizeName('LEER')).toBe('leer');
    expect(normalizeName('Ñandú')).toBe('ñandú');
  });

  it('trata tabulaciones y saltos de línea como espacios', () => {
    expect(normalizeName('Leer\t\nlibros')).toBe('leer libros');
  });
});

describe('validateHabitInput', () => {
  it('acepta datos completos y válidos', () => {
    expect(validateHabitInput(valid, existing)).toEqual({ valid: true, errors: {} });
  });

  it.each([[''], ['   '], ['\t \n']])('rechaza un nombre vacío o de solo espacios (%j)', (name) => {
    const result = validateHabitInput({ ...valid, name }, existing);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe('Escribe el nombre del hábito.');
  });

  it.each([[''], ['    ']])('rechaza una categoría vacía o de solo espacios (%j)', (category) => {
    const result = validateHabitInput({ ...valid, category }, existing);
    expect(result.valid).toBe(false);
    expect(result.errors.category).toBe('Escribe una categoría.');
  });

  it('rechaza una fecha de inicio vacía', () => {
    const result = validateHabitInput({ ...valid, startDate: '' }, existing);
    expect(result.errors.startDate).toBe('Elige la fecha de inicio.');
  });

  it.each([['2026-02-30'], ['29/10/2026'], ['mañana']])('rechaza una fecha inválida (%s)', (startDate) => {
    const result = validateHabitInput({ ...valid, startDate }, existing);
    expect(result.errors.startDate).toBe('La fecha de inicio no es válida.');
  });

  it.each([['Leer'], ['leer'], ['LEER'], ['  leer  '], [' LEER ']])(
    'rechaza el duplicado %j sin distinguir mayúsculas ni espacios',
    (name) => {
      const result = validateHabitInput({ ...valid, name }, existing);
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('Ya existe un hábito llamado «Leer». Usa otro nombre.');
    },
  );

  it('detecta duplicados con espacios internos repetidos', () => {
    const withTwoWords = [{ ...existing[0], name: 'Leer libros' }];
    const result = validateHabitInput({ ...valid, name: 'leer    LIBROS' }, withTwoWords);
    expect(result.errors.name).toMatch(/Ya existe un hábito llamado «Leer libros»/);
  });

  it('devuelve un error por cada campo inválido a la vez', () => {
    const result = validateHabitInput({ name: ' ', category: '', startDate: '' }, existing);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({
      name: MESSAGES.nameRequired,
      category: MESSAGES.categoryRequired,
      startDate: MESSAGES.startDateRequired,
    });
  });

  it('tolera valores ausentes sin lanzar', () => {
    const result = validateHabitInput({}, []);
    expect(Object.keys(result.errors)).toEqual(['name', 'category', 'startDate']);
  });
});
