import HabitForm from './components/HabitForm.jsx';
import HabitList from './components/HabitList.jsx';
import StorageNotice from './components/StorageNotice.jsx';
import { useHabits } from './hooks/useHabits.js';
import { useToday } from './hooks/useToday.js';

export default function App() {
  const today = useToday();
  const { habits, addHabit, toggleToday, notice, dismissNotice } = useHabits(today);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Seguimiento de hábitos</h1>
        <p className="app-subtitle">Registra tus rutinas, márcalas cada día y sigue tus rachas.</p>
      </header>

      <StorageNotice notice={notice} onDismiss={dismissNotice} />

      <main className="app-layout">
        <section className="panel" aria-labelledby="new-habit-title">
          <h2 id="new-habit-title">Nuevo hábito</h2>
          <HabitForm today={today} onCreate={addHabit} />
        </section>

        <section className="panel" aria-labelledby="habit-list-title">
          <h2 id="habit-list-title">Mis hábitos</h2>
          <HabitList habits={habits} today={today} onToggle={toggleToday} />
        </section>
      </main>
    </div>
  );
}
