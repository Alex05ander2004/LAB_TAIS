import { expect, test } from '@playwright/test';

// Fecha fija: jueves 29 de octubre de 2026, 10:00 en Lima (UTC−5).
const NOW = new Date('2026-10-29T10:00:00-05:00');
const TODAY = '2026-10-29';
const STORAGE_KEY = 'habit-tracker';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NOW);
});

async function createHabit(page, name, category) {
  await page.getByRole('textbox', { name: 'Nombre' }).fill(name);
  await page.getByRole('textbox', { name: 'Categoría' }).fill(category);
  await page.getByRole('button', { name: 'Guardar hábito' }).click();
}

async function seed(page, habits) {
  await page.addInitScript(
    ([key, value]) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem(key, value);
        sessionStorage.setItem('seeded', '1');
      }
    },
    [STORAGE_KEY, JSON.stringify({ schemaVersion: 1, habits })],
  );
}

const habitCard = (page, name) =>
  page.getByRole('listitem').filter({ has: page.getByRole('heading', { name, exact: true }) });

test('valida los campos obligatorios y los nombres duplicados (US1)', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Fecha de inicio').fill('');
  await page.getByRole('button', { name: 'Guardar hábito' }).click();

  await expect(page.getByRole('alert')).toHaveText('Revisa los datos marcados: nombre, categoría, fecha de inicio.');
  await expect(page.getByText('Escribe el nombre del hábito.')).toBeVisible();
  await expect(page.getByText('Escribe una categoría.')).toBeVisible();
  await expect(page.getByText('Elige la fecha de inicio.')).toBeVisible();

  await page.getByLabel('Fecha de inicio').fill(TODAY);
  await createHabit(page, '   ', 'Salud');
  await expect(page.getByText('Escribe el nombre del hábito.')).toBeVisible();

  await createHabit(page, 'Leer', 'Estudio');
  await expect(page.getByRole('status')).toHaveText('Hábito «Leer» guardado.');
  await expect(habitCard(page, 'Leer')).toContainText('Hoy: Pendiente');

  await createHabit(page, '  LEER  ', 'Estudio');
  await expect(page.getByText('Ya existe un hábito llamado «Leer». Usa otro nombre.')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(1);
});

test('marca y desmarca solo el día de hoy y actualiza la racha (US2)', async ({ page }) => {
  await page.goto('/');
  await createHabit(page, 'Correr', 'Salud');
  const card = habitCard(page, 'Correr');

  await card.getByRole('button', { name: 'Marcar «Correr» como cumplido hoy' }).click();
  await expect(card).toContainText('Hoy: Cumplido');
  await expect(card).toContainText('Racha actual: 1 día');
  await expect(page.getByText('1 de 1 cumplidos hoy')).toBeVisible();

  await card.getByRole('button', { name: 'Desmarcar «Correr» de hoy' }).click();
  await expect(card).toContainText('Hoy: Pendiente');
  await expect(card).toContainText('Racha actual: 0 días');

  const days = card.getByRole('group', { name: 'Últimos días de «Correr»' }).getByRole('button');
  await expect(days).toHaveCount(7);
  await expect(days.nth(0)).toBeDisabled();
  await expect(days.nth(4)).toBeDisabled();
  await expect(days.nth(5)).toBeEnabled();
  await expect(days.nth(6)).toBeDisabled();
  await expect(days.nth(6)).toHaveAccessibleName(/día futuro, solo lectura$/);
});

test('hoy sin marcar no rompe la racha de días anteriores (FR-007)', async ({ page }) => {
  await seed(page, [
    {
      id: 'leer',
      name: 'Leer',
      category: 'Estudio',
      startDate: '2026-10-20',
      completions: ['2026-10-22', '2026-10-23', '2026-10-24', '2026-10-27', '2026-10-28'],
      createdAt: '2026-10-20T15:00:00.000Z',
    },
  ]);
  await page.goto('/');
  const card = habitCard(page, 'Leer');

  await expect(card).toContainText('Hoy: Pendiente');
  await expect(card).toContainText('Racha actual: 2 días');
  await expect(card).toContainText('Mejor racha: 3 días');

  await card.getByRole('button', { name: 'Marcar «Leer» como cumplido hoy' }).click();
  await expect(card).toContainText('Racha actual: 3 días');
});

test('conserva hábitos y estados tras recargar (US3, FR-008)', async ({ page }) => {
  await page.goto('/');
  await createHabit(page, 'Meditar', 'Bienestar');
  await createHabit(page, 'Agua', 'Salud');
  await habitCard(page, 'Meditar').getByRole('button', { name: /Marcar «Meditar»/ }).click();

  await page.reload();

  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Agua', 'Meditar']);
  await expect(habitCard(page, 'Meditar')).toContainText('Hoy: Cumplido');
  await expect(habitCard(page, 'Agua')).toContainText('Hoy: Pendiente');

  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
  expect(stored.schemaVersion).toBe(1);
  expect(stored.habits).toHaveLength(2);
});

test('con datos dañados avisa y la app sigue usable (US3, FR-009)', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '{esto no es json'), STORAGE_KEY);
  await page.goto('/');

  await expect(page.getByRole('alert')).toContainText('Los datos guardados estaban dañados');
  await expect(page.getByText(/Todavía no tienes hábitos/)).toBeVisible();

  await createHabit(page, 'Leer', 'Estudio');
  await expect(habitCard(page, 'Leer')).toBeVisible();
});

test('en un celular de 375 × 812 no hay scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await createHabit(page, 'Un hábito con un nombre bastante largo para la pantalla', 'Productividad');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  // En móvil la lista queda debajo del formulario: se desplaza hasta ella y el botón debe caber entero.
  const toggle = page.getByRole('listitem').getByRole('button', { name: /Marcar «Un hábito/ });
  await toggle.scrollIntoViewIfNeeded();
  await expect(toggle).toBeInViewport({ ratio: 1 });

  const days = page.getByRole('group', { name: /Últimos días/ }).getByRole('button');
  await expect(days.last()).toBeInViewport({ ratio: 1 });

  const box = await toggle.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expect(page.getByRole('button', { name: 'Guardar hábito' })).toBeVisible();
});
