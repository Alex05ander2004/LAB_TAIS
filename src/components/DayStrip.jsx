import { addDays, formatDateKey } from '../domain/dates.js';
import { canEditDate, getDayStatus } from '../domain/habits.js';

const DAYS_BEFORE = 5;
const DAYS_AFTER = 1;

const STATUS_LABELS = {
  completed: 'cumplido',
  'not-completed': 'no cumplido',
  pending: 'pendiente',
  future: 'día futuro',
  'before-start': 'antes del inicio',
};

const STATUS_MARKS = {
  completed: '✓',
  'not-completed': '✕',
  pending: '•',
  future: '',
  'before-start': '–',
};

// Días cercanos a hoy. Solo hoy es editable; el resto es de solo lectura (FR-006).
export default function DayStrip({ habit, today, onToggle }) {
  const days = [];
  for (let offset = -DAYS_BEFORE; offset <= DAYS_AFTER; offset += 1) {
    days.push(addDays(today, offset));
  }

  return (
    <div className="day-strip" role="group" aria-label={`Últimos días de «${habit.name}»`}>
      {days.map((day) => {
        const status = getDayStatus(habit, day, today);
        const editable = canEditDate(habit, day, today);
        const isToday = day === today;
        const longDate = formatDateKey(day, { weekday: 'long', day: 'numeric', month: 'long' });
        const label = isToday
          ? `Hoy, ${longDate}: ${STATUS_LABELS[status]}`
          : `${longDate}: ${STATUS_LABELS[status]}, solo lectura`;

        return (
          <button
            key={day}
            type="button"
            className={`day day-${status}${isToday ? ' day-today' : ''}`}
            disabled={!editable}
            aria-label={label}
            aria-pressed={isToday && editable ? status === 'completed' : undefined}
            title={editable ? 'Hoy' : 'Solo lectura: solo se puede marcar el día de hoy'}
            onClick={() => onToggle(habit.id)}
          >
            <span className="day-weekday" aria-hidden="true">
              {formatDateKey(day, { weekday: 'narrow' })}
            </span>
            <span className="day-number" aria-hidden="true">
              {Number(day.slice(8))}
            </span>
            <span className="day-mark" aria-hidden="true">
              {STATUS_MARKS[status]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
