import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import HabitItem from '../../src/components/HabitItem.jsx';

const TODAY = '2026-10-29';

const leer = {
  id: 'leer',
  name: 'Leer',
  category: 'Estudio',
  startDate: '2026-10-20',
  completions: ['2026-10-27', '2026-10-28'],
  createdAt: '2026-10-20T10:00:00.000Z',
};

function renderItem(habit = leer, onToggle = vi.fn()) {
  render(
    <ul>
      <HabitItem habit={habit} today={TODAY} onToggle={onToggle} />
    </ul>,
  );
  return { onToggle, card: screen.getByRole('listitem') };
}

describe('HabitItem', () => {
  it('muestra hoy como pendiente sin romper la racha (FR-007)', () => {
    const { card } = renderItem();
    expect(card).toHaveAttribute('data-status', 'pending');
    expect(within(card).getByText('Hoy: Pendiente')).toBeInTheDocument();
    expect(within(card).getByText('Racha actual: 2 días')).toBeInTheDocument();
    expect(within(card).getByText('Mejor racha: 2 días')).toBeInTheDocument();
  });

  it('muestra hoy como cumplido cuando está marcado', () => {
    const { card } = renderItem({ ...leer, completions: [...leer.completions, TODAY] });
    expect(card).toHaveAttribute('data-status', 'completed');
    expect(within(card).getByText('Hoy: Cumplido')).toBeInTheDocument();
    expect(within(card).getByText('Racha actual: 3 días')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Desmarcar «Leer» de hoy' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveTextContent('Desmarcar');
  });

  it('el botón de hoy indica su estado y llama a onToggle', async () => {
    const user = userEvent.setup();
    const { onToggle } = renderItem();
    const button = screen.getByRole('button', { name: 'Marcar «Leer» como cumplido hoy' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveTextContent('Marcar como cumplido');

    await user.click(button);
    expect(onToggle).toHaveBeenCalledWith('leer');
  });

  it('usa singular para un día de racha', () => {
    renderItem({ ...leer, completions: [TODAY] });
    expect(screen.getByText('Racha actual: 1 día')).toBeInTheDocument();
    expect(screen.getByText('Mejor racha: 1 día')).toBeInTheDocument();
  });

  it('la tira de días tiene 7 días y solo hoy es editable (FR-006)', async () => {
    const user = userEvent.setup();
    const { onToggle } = renderItem();
    const strip = screen.getByRole('group', { name: 'Últimos días de «Leer»' });
    const days = within(strip).getAllByRole('button');

    expect(days).toHaveLength(7);
    const enabled = days.filter((day) => !day.hasAttribute('disabled'));
    expect(enabled).toHaveLength(1);
    expect(enabled[0]).toHaveAccessibleName(/^Hoy, .*: pendiente$/);

    const readOnly = days.filter((day) => day.hasAttribute('disabled'));
    expect(readOnly).toHaveLength(6);
    readOnly.forEach((day) => expect(day).toHaveAccessibleName(/solo lectura$/));
    expect(readOnly.some((day) => /: cumplido, solo lectura$/.test(day.getAttribute('aria-label')))).toBe(true);
    expect(readOnly.some((day) => /: día futuro, solo lectura$/.test(day.getAttribute('aria-label')))).toBe(true);

    await user.click(readOnly[0]);
    expect(onToggle).not.toHaveBeenCalled();

    await user.click(enabled[0]);
    expect(onToggle).toHaveBeenCalledWith('leer');
  });

  it('un hábito con inicio futuro no se puede marcar todavía', () => {
    const { card } = renderItem({ ...leer, startDate: '2026-11-05', completions: [] });
    expect(within(card).getByText(/^Empieza el /)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Marcar «Leer» como cumplido hoy' })).toBeDisabled();
    const strip = screen.getByRole('group', { name: 'Últimos días de «Leer»' });
    within(strip)
      .getAllByRole('button')
      .forEach((day) => expect(day).toBeDisabled());
  });
});
