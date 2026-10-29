import { isCompletedOn, sortHabits } from '../domain/habits.js';
import HabitItem from './HabitItem.jsx';

export default function HabitList({ habits, today, onToggle }) {
  if (habits.length === 0) {
    return <p className="empty-state">Todavía no tienes hábitos. Crea el primero con el formulario.</p>;
  }

  const completedToday = habits.filter((habit) => isCompletedOn(habit, today)).length;

  return (
    <>
      <p className="list-summary">
        {completedToday} de {habits.length} cumplidos hoy
      </p>
      <ul className="habit-list" aria-label="Mis hábitos">
        {sortHabits(habits).map((habit) => (
          <HabitItem key={habit.id} habit={habit} today={today} onToggle={onToggle} />
        ))}
      </ul>
    </>
  );
}
