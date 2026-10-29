import { formatDateKey } from '../domain/dates.js';
import { canEditDate } from '../domain/habits.js';
import { calculateStreaks } from '../domain/streaks.js';
import DayStrip from './DayStrip.jsx';

const LONG_DATE = { day: 'numeric', month: 'long', year: 'numeric' };

const days = (count) => `${count} ${count === 1 ? 'día' : 'días'}`;

export default function HabitItem({ habit, today, onToggle }) {
  const { current, best, todayStatus } = calculateStreaks(habit.completions, today);
  const started = today >= habit.startDate;
  const editable = canEditDate(habit, today, today);
  const completed = todayStatus === 'completed';

  return (
    <li className="habit-card" data-status={todayStatus}>
      <div className="habit-header">
        <h3 className="habit-name">{habit.name}</h3>
        <span className="habit-category">{habit.category}</span>
      </div>

      <div className="habit-today">
        <p className={`today-status today-${started ? todayStatus : 'upcoming'}`}>
          {started
            ? `Hoy: ${completed ? 'Cumplido' : 'Pendiente'}`
            : `Empieza el ${formatDateKey(habit.startDate, LONG_DATE)}`}
        </p>
        <button
          type="button"
          className={`button ${completed ? 'button-secondary' : 'button-primary'}`}
          aria-pressed={completed}
          aria-label={completed ? `Desmarcar «${habit.name}» de hoy` : `Marcar «${habit.name}» como cumplido hoy`}
          disabled={!editable}
          onClick={() => onToggle(habit.id)}
        >
          {completed ? 'Desmarcar' : 'Marcar como cumplido'}
        </button>
      </div>

      <p className="habit-streaks">
        <span className="streak streak-current">Racha actual: {days(current)}</span>
        <span className="streak">Mejor racha: {days(best)}</span>
      </p>

      <DayStrip habit={habit} today={today} onToggle={onToggle} />

      <p className="habit-start">Desde el {formatDateKey(habit.startDate, LONG_DATE)}</p>
    </li>
  );
}
