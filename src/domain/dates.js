// Fechas del dominio como "date keys" locales (AAAA-MM-DD).
// Nunca se usa toISOString() para obtener el día: devolvería la fecha UTC.

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value) => String(value).padStart(2, '0');

function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toLocalDate(key) {
  const [, year, month, day] = DATE_KEY_PATTERN.exec(key);
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function todayKey(now = new Date()) {
  return toKey(now);
}

export function isValidDateKey(value) {
  if (typeof value !== 'string' || !DATE_KEY_PATTERN.test(value)) {
    return false;
  }
  // Descarta fechas inexistentes como 2026-02-30, que Date desplazaría a marzo.
  return toKey(toLocalDate(value)) === value;
}

export function addDays(key, days) {
  const date = toLocalDate(key);
  date.setDate(date.getDate() + days);
  return toKey(date);
}

export function compareDateKeys(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function formatDateKey(key, options = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat('es', options).format(toLocalDate(key));
}
