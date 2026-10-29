import { compareDateKeys, isValidDateKey } from '../domain/dates.js';
import { normalizeName } from '../domain/validation.js';

// Único módulo que accede a localStorage (constitución, principio III).
export const STORAGE_KEY = 'habit-tracker';
export const SCHEMA_VERSION = 1;

const isNonEmptyText = (value) => typeof value === 'string' && value.trim() !== '';
const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

function defaultStorage() {
  // En algunos navegadores el simple acceso a window.localStorage lanza (modo privado, cookies bloqueadas).
  return globalThis.localStorage;
}

// Devuelve el hábito saneado y cuántos datos se descartaron, o null si no es recuperable.
function sanitizeHabit(raw) {
  if (
    !isPlainObject(raw) ||
    !isNonEmptyText(raw.id) ||
    !isNonEmptyText(raw.name) ||
    !isNonEmptyText(raw.category) ||
    !isValidDateKey(raw.startDate)
  ) {
    return null;
  }

  const rawCompletions = Array.isArray(raw.completions) ? raw.completions : [];
  const completions = [
    ...new Set(rawCompletions.filter((day) => isValidDateKey(day) && day >= raw.startDate)),
  ].sort(compareDateKeys);

  return {
    habit: {
      id: raw.id,
      name: raw.name,
      category: raw.category,
      startDate: raw.startDate,
      completions,
      createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
    },
    discarded: rawCompletions.length - completions.length,
  };
}

export function loadState(storage) {
  let raw;
  try {
    raw = (storage ?? defaultStorage()).getItem(STORAGE_KEY);
  } catch {
    return { habits: [], status: 'unavailable', discarded: 0 };
  }

  if (raw === null || raw === undefined) {
    return { habits: [], status: 'empty', discarded: 0 };
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { habits: [], status: 'corrupt', discarded: 0 };
  }

  if (!isPlainObject(data) || data.schemaVersion !== SCHEMA_VERSION || !Array.isArray(data.habits)) {
    return { habits: [], status: 'corrupt', discarded: 0 };
  }

  const habits = [];
  const seenNames = new Set();
  let discarded = 0;

  for (const entry of data.habits) {
    const result = sanitizeHabit(entry);
    const nameKey = result && normalizeName(result.habit.name);
    if (!result || seenNames.has(nameKey)) {
      discarded += 1;
      continue;
    }
    seenNames.add(nameKey);
    habits.push(result.habit);
    discarded += result.discarded;
  }

  return { habits, status: discarded > 0 ? 'partial' : 'ok', discarded };
}

export function saveState(habits, storage) {
  try {
    (storage ?? defaultStorage()).setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, habits }));
    return true;
  } catch {
    return false;
  }
}
