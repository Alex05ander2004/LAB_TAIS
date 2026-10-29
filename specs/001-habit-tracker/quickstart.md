# Quickstart: Seguimiento de hábitos diarios

**Fase**: 1 (`/speckit-plan`) | **Plan**: [plan.md](plan.md)

Guía para ejecutar la aplicación y validar que cumple el spec. Los detalles de datos están en [data-model.md](data-model.md) y los textos de la interfaz en [contracts/ui-contract.md](contracts/ui-contract.md).

## Requisitos previos

- Node.js **20.19 o superior** (`node --version`)
- npm 10 o superior
- Para las pruebas E2E: Chromium de Playwright (`npx playwright install chromium`, una sola vez)

## Puesta en marcha

```bash
npm install
npm run dev
```

Abrir la dirección que muestra Vite (normalmente `http://localhost:5173`).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Pruebas unitarias y de componentes (Vitest) |
| `npm run test:e2e` | Pruebas de extremo a extremo (Playwright, levanta Vite solo) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de `dist/` |
| `npm run lint` | Revisión estática con ESLint |

## Escenarios de validación manual

Ejecutar con `npm run dev`. «Hoy» es la fecha local del equipo.

| # | Pasos | Resultado esperado | Requisito |
|---|---|---|---|
| 1 | Pulsar «Guardar hábito» con nombre y categoría vacíos | No se guarda; mensaje bajo cada campo y resumen «Revisa los datos marcados» | FR-002, FR-003 |
| 2 | Nombre `"   "`, categoría «Salud» | «Escribe el nombre del hábito.» | FR-003 |
| 3 | Nombre «Leer», categoría vacía | «Escribe una categoría.» | FR-002 |
| 4 | Nombre «Leer», categoría «Estudio», fecha de hoy | Aparece en «Mis hábitos» con «Hoy: Pendiente» y racha 0 | FR-001, FR-005 |
| 5 | Crear « LEER  » (mayúsculas y espacios extra) | «Ya existe un hábito llamado «Leer». Usa otro nombre.» | FR-004 |
| 6 | Pulsar «Marcar como cumplido» en «Leer» | «Hoy: Cumplido», racha actual 1, resumen «1 de 1 cumplidos hoy» | FR-006, FR-007 |
| 7 | Pulsar «Desmarcar» | Vuelve a «Hoy: Pendiente», racha 0 | FR-006 |
| 8 | Intentar pulsar un día anterior o mañana en la tira de días | Botón deshabilitado, «solo lectura» | FR-006 |
| 9 | Cargar un historial con ayer y anteayer cumplidos (ver abajo) sin marcar hoy | Racha actual 2, «Hoy: Pendiente» | FR-007 |
| 10 | Crear varios hábitos, marcar algunos y recargar | Todo se conserva | FR-008 |
| 11 | Reemplazar el valor de `habit-tracker` por `{esto no es json` y recargar | Aviso de datos dañados, lista vacía, se puede crear un hábito | FR-009 |
| 12 | DevTools → vista de dispositivo 375 × 812 | Sin scroll horizontal; botones visibles | Constitución (responsive) |

### Cargar un historial de prueba (escenario 9)

En DevTools → *Console*, ajustar las fechas a ayer y anteayer y recargar:

```js
localStorage.setItem('habit-tracker', JSON.stringify({
  schemaVersion: 1,
  habits: [{
    id: 'demo-1', name: 'Leer', category: 'Estudio',
    startDate: '2026-10-20', completions: ['2026-10-27', '2026-10-28'],
    createdAt: '2026-10-20T12:00:00.000Z'
  }]
}));
location.reload();
```

## Cobertura automatizada por requisito

| Requisito | Pruebas |
|---|---|
| FR-001 | `tests/unit/habits.test.js`, `tests/components/HabitForm.test.jsx`, E2E |
| FR-002 | `tests/unit/validation.test.js`, `tests/components/HabitForm.test.jsx`, E2E |
| FR-003 | `tests/unit/validation.test.js`, `tests/components/HabitForm.test.jsx` |
| FR-004 | `tests/unit/validation.test.js`, `tests/components/HabitForm.test.jsx`, E2E |
| FR-005 | `tests/unit/habits.test.js` (orden), `tests/components/App.test.jsx` |
| FR-006 | `tests/unit/habits.test.js`, `tests/components/HabitItem.test.jsx`, E2E |
| FR-007 | `tests/unit/streaks.test.js`, `tests/components/HabitItem.test.jsx`, E2E |
| FR-008 | `tests/unit/habitStorage.test.js`, `tests/components/App.test.jsx`, E2E |
| FR-009 | `tests/unit/habitStorage.test.js`, `tests/components/App.test.jsx`, E2E |
| FR-010 | `tests/components/App.test.jsx` (no hay controles de editar ni eliminar) |

## Resultado esperado

`npm test`, `npm run test:e2e`, `npm run build` y `npm run lint` terminan sin errores.
