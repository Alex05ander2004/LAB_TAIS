import { useCallback, useState } from 'react';
import { createHabit, toggleCompletion } from '../domain/habits.js';
import { loadState, saveState } from '../storage/habitStorage.js';

const NOTICE_STATUSES = ['corrupt', 'partial', 'unavailable'];

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function initialState(storage) {
  const { habits, status, discarded } = loadState(storage);
  return {
    habits,
    notice: NOTICE_STATUSES.includes(status) ? { status, discarded } : null,
  };
}

// Conecta las reglas del dominio y el almacenamiento con el estado de React.
// Carga una vez al iniciar y guarda después de cada cambio (nunca en lecturas).
export function useHabits(today, storage) {
  const [initial] = useState(() => initialState(storage));
  const [habits, setHabits] = useState(initial.habits);
  const [notice, setNotice] = useState(initial.notice);

  const commit = useCallback(
    (next) => {
      setHabits(next);
      if (!saveState(next, storage)) {
        // Si el almacenamiento no está disponible ya se avisó al iniciar.
        setNotice((current) => (current?.status === 'unavailable' ? current : { status: 'save-failed' }));
      }
    },
    [storage],
  );

  const addHabit = useCallback(
    (input) => {
      const result = createHabit(input, habits, {
        id: generateId(),
        createdAt: new Date().toISOString(),
      });
      if (result.ok) {
        commit([...habits, result.habit]);
      }
      return result;
    },
    [habits, commit],
  );

  const toggleToday = useCallback(
    (habitId) => {
      const target = habits.find((habit) => habit.id === habitId);
      if (!target) return { ok: false };

      const result = toggleCompletion(target, today, today);
      if (result.ok) {
        commit(habits.map((habit) => (habit.id === habitId ? result.habit : habit)));
      }
      return result;
    },
    [habits, today, commit],
  );

  const dismissNotice = useCallback(() => setNotice(null), []);

  return { habits, addHabit, toggleToday, notice, dismissNotice };
}
