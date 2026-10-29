import { compareDateKeys } from './dates.js';
import { cleanText, validateHabitInput } from './validation.js';

export const TOGGLE_ERRORS = {
  notToday: 'Solo puedes marcar o desmarcar el día de hoy.',
  notStarted: 'Este hábito empieza más adelante; todavía no se puede marcar.',
};

const nameCollator = new Intl.Collator('es', { sensitivity: 'base' });

export function createHabit(input, existing, { id, createdAt }) {
  const { valid, errors } = validateHabitInput(input, existing);
  if (!valid) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    habit: {
      id,
      name: cleanText(input.name),
      category: cleanText(input.category),
      startDate: input.startDate.trim(),
      completions: [],
      createdAt,
    },
  };
}

// Orden estable (FR-005): por nombre y, en empate, por fecha de creación.
// No depende del estado de hoy, para que la lista no cambie de orden al marcar.
export function sortHabits(habits) {
  return [...habits].sort(
    (a, b) => nameCollator.compare(a.name, b.name) || a.createdAt.localeCompare(b.createdAt),
  );
}

export function isCompletedOn(habit, dateKey) {
  return habit.completions.includes(dateKey);
}

// FR-006: solo el día actual es editable, y nunca antes de la fecha de inicio.
export function canEditDate(habit, dateKey, today) {
  return dateKey === today && today >= habit.startDate;
}

export function toggleCompletion(habit, dateKey, today) {
  if (dateKey !== today) {
    return { ok: false, error: TOGGLE_ERRORS.notToday };
  }
  if (!canEditDate(habit, dateKey, today)) {
    return { ok: false, error: TOGGLE_ERRORS.notStarted };
  }

  const completions = isCompletedOn(habit, dateKey)
    ? habit.completions.filter((day) => day !== dateKey)
    : [...habit.completions, dateKey].sort(compareDateKeys);

  return { ok: true, habit: { ...habit, completions } };
}

export function getDayStatus(habit, dateKey, today) {
  if (dateKey > today) return 'future';
  if (dateKey < habit.startDate) return 'before-start';
  if (isCompletedOn(habit, dateKey)) return 'completed';
  return dateKey === today ? 'pending' : 'not-completed';
}
