import { describe, expect, it } from 'vitest';
import { loadState, saveState, SCHEMA_VERSION, STORAGE_KEY } from '../../src/storage/habitStorage.js';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    raw: data,
  };
}

const throwingStorage = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

const leer = {
  id: 'h1',
  name: 'Leer',
  category: 'Estudio',
  startDate: '2026-10-20',
  completions: ['2026-10-27', '2026-10-28'],
  createdAt: '2026-10-20T10:00:00.000Z',
};

const stored = (value) => memoryStorage({ [STORAGE_KEY]: JSON.stringify(value) });

describe('constantes', () => {
  it('usan la clave y la versión del contrato', () => {
    expect(STORAGE_KEY).toBe('habit-tracker');
    expect(SCHEMA_VERSION).toBe(1);
  });
});

describe('saveState + loadState', () => {
  it('sin datos guardados devuelve un estado vacío', () => {
    expect(loadState(memoryStorage())).toEqual({ habits: [], status: 'empty', discarded: 0 });
  });

  it('guarda un contenedor versionado y lo recupera igual (FR-008)', () => {
    const storage = memoryStorage();
    expect(saveState([leer], storage)).toBe(true);

    expect(JSON.parse(storage.raw.get(STORAGE_KEY))).toEqual({ schemaVersion: 1, habits: [leer] });
    expect(loadState(storage)).toEqual({ habits: [leer], status: 'ok', discarded: 0 });
  });

  it('no guarda las rachas, solo el historial', () => {
    const storage = memoryStorage();
    saveState([leer], storage);
    expect(storage.raw.get(STORAGE_KEY)).not.toMatch(/streak|racha/i);
  });
});

describe('loadState con datos dañados (FR-009)', () => {
  it.each([
    ['JSON inválido', '{esto no es json'],
    ['texto plano', 'hola'],
    ['null', 'null'],
    ['un número', '42'],
    ['un arreglo en la raíz', JSON.stringify([leer])],
    ['sin habits', JSON.stringify({ schemaVersion: 1 })],
    ['habits no es arreglo', JSON.stringify({ schemaVersion: 1, habits: 'x' })],
    ['versión desconocida', JSON.stringify({ schemaVersion: 2, habits: [leer] })],
    ['sin versión', JSON.stringify({ habits: [leer] })],
  ])('%s → estado vacío "corrupt" sin lanzar', (_label, raw) => {
    const storage = memoryStorage({ [STORAGE_KEY]: raw });
    expect(loadState(storage)).toEqual({ habits: [], status: 'corrupt', discarded: 0 });
  });

  it('descarta hábitos sin campos obligatorios válidos y avisa con "partial"', () => {
    const result = loadState(
      stored({
        schemaVersion: 1,
        habits: [
          leer,
          { ...leer, id: 'h2', name: '   ' },
          { ...leer, id: 'h3', name: 'Correr', category: 7 },
          { ...leer, id: 'h4', name: 'Nadar', startDate: '2026-02-30' },
          { ...leer, id: '', name: 'Meditar' },
          'no soy un hábito',
          null,
        ],
      }),
    );
    expect(result.status).toBe('partial');
    expect(result.discarded).toBe(6);
    expect(result.habits).toEqual([leer]);
  });

  it('limpia el historial: quita fechas inválidas, duplicadas y anteriores al inicio, y ordena', () => {
    const result = loadState(
      stored({
        schemaVersion: 1,
        habits: [
          {
            ...leer,
            completions: ['2026-10-28', 'ayer', '2026-10-27', '2026-10-28', '2026-10-01', 5],
          },
        ],
      }),
    );
    expect(result.status).toBe('partial');
    expect(result.discarded).toBe(4);
    expect(result.habits[0].completions).toEqual(['2026-10-27', '2026-10-28']);
  });

  it('acepta un hábito sin historial ni createdAt rellenando valores seguros', () => {
    const { completions: _c, createdAt: _d, ...minimal } = leer;
    const result = loadState(stored({ schemaVersion: 1, habits: [minimal] }));
    expect(result.status).toBe('ok');
    expect(result.habits[0]).toEqual({ ...minimal, completions: [], createdAt: '' });
  });

  it('conserva el primero de dos nombres duplicados', () => {
    const result = loadState(stored({ schemaVersion: 1, habits: [leer, { ...leer, id: 'h2', name: ' LEER ' }] }));
    expect(result.habits.map((h) => h.id)).toEqual(['h1']);
    expect(result.discarded).toBe(1);
  });

  it('si el navegador bloquea localStorage devuelve "unavailable" sin lanzar', () => {
    expect(loadState(throwingStorage)).toEqual({ habits: [], status: 'unavailable', discarded: 0 });
  });
});

describe('saveState con errores', () => {
  it('devuelve false en vez de lanzar si no se puede escribir', () => {
    expect(saveState([leer], throwingStorage)).toBe(false);
  });
});
