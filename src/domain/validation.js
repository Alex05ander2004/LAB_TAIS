import { isValidDateKey } from './dates.js';

export const MESSAGES = {
  nameRequired: 'Escribe el nombre del hábito.',
  nameDuplicate: (existingName) => `Ya existe un hábito llamado «${existingName}». Usa otro nombre.`,
  categoryRequired: 'Escribe una categoría.',
  startDateRequired: 'Elige la fecha de inicio.',
  startDateInvalid: 'La fecha de inicio no es válida.',
};

const asText = (value) => (typeof value === 'string' ? value : '');

// Recorta y reduce los espacios internos repetidos a uno solo.
export function cleanText(value) {
  return asText(value).trim().replace(/\s+/g, ' ');
}

// Clave de comparación para detectar nombres duplicados (FR-004).
export function normalizeName(name) {
  return cleanText(name).toLocaleLowerCase('es');
}

export function findDuplicate(name, existing) {
  const key = normalizeName(name);
  return existing.find((habit) => normalizeName(habit.name) === key);
}

export function validateHabitInput(input = {}, existing = []) {
  const errors = {};
  const name = cleanText(input.name);
  const category = cleanText(input.category);
  const startDate = asText(input.startDate).trim();

  if (!name) {
    errors.name = MESSAGES.nameRequired;
  } else {
    const duplicate = findDuplicate(name, existing);
    if (duplicate) errors.name = MESSAGES.nameDuplicate(duplicate.name);
  }

  if (!category) {
    errors.category = MESSAGES.categoryRequired;
  }

  if (!startDate) {
    errors.startDate = MESSAGES.startDateRequired;
  } else if (!isValidDateKey(startDate)) {
    errors.startDate = MESSAGES.startDateInvalid;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
