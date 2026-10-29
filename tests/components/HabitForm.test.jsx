import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import HabitForm from '../../src/components/HabitForm.jsx';
import { createHabit } from '../../src/domain/habits.js';

const TODAY = '2026-10-29';

const existing = [
  {
    id: 'h1',
    name: 'Leer',
    category: 'Estudio',
    startDate: '2026-10-01',
    completions: [],
    createdAt: '2026-10-01T10:00:00.000Z',
  },
];

// El formulario no valida por su cuenta: delega en el dominio, igual que useHabits.
const domainOnCreate = () =>
  vi.fn((input) => createHabit(input, existing, { id: 'x', createdAt: '2026-10-29T12:00:00.000Z' }));

function setup(onCreate = domainOnCreate()) {
  const user = userEvent.setup();
  render(<HabitForm today={TODAY} onCreate={onCreate} />);
  return {
    user,
    onCreate,
    name: screen.getByRole('textbox', { name: 'Nombre' }),
    category: screen.getByRole('textbox', { name: 'Categoría' }),
    startDate: screen.getByLabelText('Fecha de inicio'),
    submit: screen.getByRole('button', { name: 'Guardar hábito' }),
  };
}

describe('HabitForm', () => {
  it('tiene nombre accesible y propone hoy como fecha de inicio', () => {
    const { startDate } = setup();
    expect(screen.getByRole('form', { name: 'Nuevo hábito' })).toBeInTheDocument();
    expect(startDate).toHaveValue(TODAY);
  });

  it('con los campos vacíos muestra un mensaje por campo y un resumen', async () => {
    const { user, name, category, startDate, submit } = setup();
    await user.clear(startDate);
    await user.click(submit);

    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(category).toHaveAttribute('aria-invalid', 'true');
    expect(startDate).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Escribe el nombre del hábito.');
    expect(category).toHaveAccessibleDescription('Escribe una categoría.');
    expect(startDate).toHaveAccessibleDescription('Elige la fecha de inicio.');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Revisa los datos marcados: nombre, categoría, fecha de inicio.',
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('trata un nombre de solo espacios como vacío', async () => {
    const { user, name, category, submit } = setup();
    await user.type(name, '    ');
    await user.type(category, 'Salud');
    await user.click(submit);

    expect(name).toHaveAccessibleDescription('Escribe el nombre del hábito.');
    expect(category).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('alert')).toHaveTextContent('Revisa los datos marcados: nombre.');
  });

  it('envía los datos válidos, confirma y limpia el formulario', async () => {
    const { user, onCreate, name, category, startDate, submit } = setup();
    await user.type(name, 'Correr');
    await user.type(category, 'Salud');
    await user.click(submit);

    expect(onCreate).toHaveBeenCalledWith({ name: 'Correr', category: 'Salud', startDate: TODAY });
    expect(screen.getByRole('status')).toHaveTextContent('Hábito «Correr» guardado.');
    expect(name).toHaveValue('');
    expect(category).toHaveValue('');
    expect(startDate).toHaveValue(TODAY);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rechaza un duplicado con otras mayúsculas y espacios y conserva lo escrito', async () => {
    const { user, name, category, submit } = setup();
    await user.type(name, ' LEER ');
    await user.type(category, 'Estudio');
    await user.click(submit);

    expect(name).toHaveAccessibleDescription('Ya existe un hábito llamado «Leer». Usa otro nombre.');
    expect(name).toHaveValue(' LEER ');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('quita el error de un campo cuando se corrige', async () => {
    const { user, name, submit } = setup();
    await user.click(submit);
    expect(name).toHaveAttribute('aria-invalid', 'true');

    await user.type(name, 'L');
    expect(name).not.toHaveAttribute('aria-invalid');
  });
});
