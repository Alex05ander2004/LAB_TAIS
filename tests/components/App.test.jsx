import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App.jsx';
import { STORAGE_KEY } from '../../src/storage/habitStorage.js';

const TODAY = '2026-10-29';

const saved = (habits) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, habits }));

const readSaved = () => JSON.parse(localStorage.getItem(STORAGE_KEY));

const habit = (overrides) => ({
  id: overrides.name,
  category: 'General',
  startDate: '2026-10-20',
  completions: [],
  createdAt: '2026-10-20T10:00:00.000Z',
  ...overrides,
});

async function createHabit(user, name, category = 'General') {
  await user.type(screen.getByRole('textbox', { name: 'Nombre' }), name);
  await user.type(screen.getByRole('textbox', { name: 'Categoría' }), category);
  await user.click(screen.getByRole('button', { name: 'Guardar hábito' }));
}

beforeEach(() => {
  // Solo se simula Date: los temporizadores reales siguen funcionando para user-event.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 29, 10, 0));
});

describe('App', () => {
  it('sin datos muestra la lista vacía y ningún aviso', () => {
    render(<App />);
    expect(screen.getByText('Todavía no tienes hábitos. Crea el primero con el formulario.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('restaura los hábitos guardados en orden alfabético con su estado de hoy (FR-005, FR-008)', () => {
    saved([
      habit({ name: 'Meditar', completions: [TODAY] }),
      habit({ name: 'agua' }),
      habit({ name: 'Leer', completions: ['2026-10-27', '2026-10-28'] }),
    ]);
    render(<App />);

    const items = within(screen.getByRole('list', { name: 'Mis hábitos' })).getAllByRole('listitem');
    expect(items.map((item) => within(item).getByRole('heading').textContent)).toEqual(['agua', 'Leer', 'Meditar']);
    expect(items[1]).toHaveTextContent('Hoy: Pendiente');
    expect(items[1]).toHaveTextContent('Racha actual: 2 días');
    expect(items[2]).toHaveTextContent('Hoy: Cumplido');
    expect(screen.getByText('1 de 3 cumplidos hoy')).toBeInTheDocument();
  });

  it('guarda al crear un hábito y lo conserva tras volver a montar la app', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await createHabit(user, 'Leer', 'Estudio');

    expect(readSaved()).toMatchObject({
      schemaVersion: 1,
      habits: [{ name: 'Leer', category: 'Estudio', startDate: TODAY, completions: [] }],
    });

    unmount();
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Leer' })).toBeInTheDocument();
  });

  it('guarda al marcar y desmarcar hoy', async () => {
    const user = userEvent.setup();
    saved([habit({ name: 'Leer' })]);
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Marcar «Leer» como cumplido hoy' }));
    expect(readSaved().habits[0].completions).toEqual([TODAY]);
    expect(screen.getByText('1 de 1 cumplidos hoy')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Desmarcar «Leer» de hoy' }));
    expect(readSaved().habits[0].completions).toEqual([]);
  });

  it('no guarda nada cuando el formulario es inválido', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Guardar hábito' }));
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('con datos dañados avisa, empieza vacía y sigue siendo usable (FR-009)', async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEY, '{esto no es json');
    render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Los datos guardados estaban dañados y no se pudieron leer. Empezaste con una lista vacía.',
    );
    expect(screen.getByText(/Todavía no tienes hábitos/)).toBeInTheDocument();

    await createHabit(user, 'Leer');
    expect(screen.getByRole('heading', { name: 'Leer' })).toBeInTheDocument();
    expect(readSaved().habits).toHaveLength(1);
  });

  it('avisa cuántos registros dañados se ignoraron', () => {
    saved([habit({ name: 'Leer' }), { name: '' }]);
    render(<App />);
    expect(screen.getByRole('alert')).toHaveTextContent('Se ignoró 1 registro dañado de los datos guardados.');
    expect(screen.getByRole('heading', { name: 'Leer' })).toBeInTheDocument();
  });

  it('el aviso se puede cerrar', async () => {
    const user = userEvent.setup();
    localStorage.setItem(STORAGE_KEY, 'basura');
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('no ofrece editar ni eliminar hábitos (FR-010)', () => {
    saved([habit({ name: 'Leer' })]);
    render(<App />);
    expect(screen.queryByRole('button', { name: /editar|eliminar|borrar/i })).not.toBeInTheDocument();
  });
});
