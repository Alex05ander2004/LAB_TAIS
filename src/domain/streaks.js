import { addDays, compareDateKeys, isValidDateKey } from './dates.js';

// Racha actual y mejor racha a partir del historial (FR-007).
// Si hoy no está marcado, queda "pending" y la racha se cuenta hasta ayer:
// un día actual sin marcar no rompe la racha hasta que termina.
export function calculateStreaks(completions, today) {
  const done = new Set(completions.filter((day) => isValidDateKey(day) && day <= today));
  const todayStatus = done.has(today) ? 'completed' : 'pending';

  let current = 0;
  let cursor = todayStatus === 'completed' ? today : addDays(today, -1);
  while (done.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let best = 0;
  let run = 0;
  let previous = null;
  for (const day of [...done].sort(compareDateKeys)) {
    run = previous && addDays(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }

  return { current, best, todayStatus };
}
