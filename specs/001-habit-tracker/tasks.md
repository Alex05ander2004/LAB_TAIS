---

description: "Lista de tareas para implementar el seguimiento de hábitos diarios"
---

# Tasks: Seguimiento de hábitos diarios

**Input**: Design documents from `/specs/001-habit-tracker/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Incluidas. La constitución (principio V) exige pruebas automatizadas para cada funcionalidad y el plan define pruebas unitarias y de componentes (Vitest + React Testing Library) y de extremo a extremo (Playwright).

**Organization**: Tareas agrupadas por historia de usuario del spec para poder implementarlas y probarlas por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia del spec: US1 = Registrar un hábito con validación clara (P1), US2 = Marcar cumplimiento y ver rachas (P2), US3 = Persistencia local y recuperación tras recarga (P3)

## Path Conventions

Proyecto único en la raíz del repositorio: `src/`, `tests/` (ver *Project Structure* en [plan.md](plan.md)).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar el proyecto React + Vite y sus herramientas

- [ ] T001 Crear package.json con `"type": "module"`, scripts `dev`, `build`, `preview`, `lint`, `test` (`vitest run`), `test:watch` y `test:e2e` (`playwright test`), `engines.node` `>=20.19`, y dependencias react, react-dom, vite, @vitejs/plugin-react, vitest, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, @playwright/test, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh y globals en package.json
- [ ] T002 [P] Crear .gitignore en la raíz con node_modules/, dist/, coverage/, test-results/, playwright-report/, playwright/.cache/, *.log, .env* y .DS_Store en .gitignore
- [ ] T003 [P] Configurar Vite con el plugin de React y Vitest (`environment: 'jsdom'`, `setupFiles: ['./tests/setup.js']`, incluir `tests/unit` y `tests/components`, excluir `tests/e2e`) en vite.config.js
- [ ] T004 [P] Configurar Playwright con `testDir: 'tests/e2e'`, proyecto Chromium, `baseURL` `http://localhost:5173` y `webServer` que ejecute `npm run dev -- --port 5173 --strictPort` en playwright.config.js
- [ ] T005 [P] Configurar ESLint (flat config con @eslint/js, react-hooks, react-refresh y globals de navegador; ignorar dist/ y playwright-report/) en eslint.config.js
- [ ] T006 Crear index.html con `lang="es"`, `<meta name="viewport">`, título «Seguimiento de hábitos» y `<div id="root">`, y src/main.jsx que monta `<App />` en modo estricto e importa src/styles.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fechas locales, «hoy» y estructura base de la pantalla, que usan las tres historias

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase

- [ ] T007 [P] Crear la configuración de pruebas (matchers de jest-dom, `cleanup` y `localStorage.clear()` después de cada prueba) en tests/setup.js
- [ ] T008 [P] Escribir pruebas unitarias de fechas: `todayKey` usa la fecha local y no UTC (p. ej. 2026-10-29 23:30 local sigue siendo `2026-10-29`), `isValidDateKey` acepta `2026-10-29` y rechaza `2026-02-30`, `29/10/2026`, `''` y valores que no son texto, `addDays` cruza fin de mes y de año, `compareDateKeys` ordena cronológicamente, en tests/unit/dates.test.js
- [ ] T009 Implementar `todayKey`, `isValidDateKey`, `addDays`, `compareDateKeys` y `formatDateKey` (español) según contracts/domain-api.md en src/domain/dates.js
- [ ] T010 Implementar el hook `useToday` que devuelve la date key local y la recalcula cada 30 s y en los eventos `focus` y `visibilitychange` (research.md R8) en src/hooks/useToday.js
- [ ] T011 Crear el esqueleto de la pantalla (encabezado h1 «Seguimiento de hábitos», secciones «Nuevo hábito» y «Mis hábitos») en src/App.jsx y los estilos base *mobile first* (variables de color con contraste AA, tipografía del sistema, foco visible, dos columnas desde 720 px) en src/styles.css

**Checkpoint**: Base lista; `npm run dev` muestra la pantalla vacía y `npm test` ejecuta las pruebas de fechas

---

## Phase 3: User Story 1 - Registrar un hábito con validación clara (Priority: P1) 🎯 MVP

**Goal**: Crear hábitos con nombre, categoría y fecha de inicio, con mensajes claros por campo y rechazo de duplicados

**Independent Test**: Crear «Leer / Estudio / hoy» y verlo en la lista; intentar guardar con campos vacíos, con solo espacios y con « LEER » y comprobar que no se guarda y que cada mensaje indica el dato a corregir

### Tests for User Story 1 ⚠️

> Escribir estas pruebas primero y comprobar que fallan antes de implementar

- [ ] T012 [P] [US1] Escribir pruebas unitarias de `normalizeName` y `validateHabitInput`: nombre vacío o «solo espacios» → «Escribe el nombre del hábito.»; categoría vacía o solo espacios → «Escribe una categoría.»; fecha vacía → «Elige la fecha de inicio.»; fecha inválida → «La fecha de inicio no es válida.»; « LEER » y «leer» frente a «Leer» → «Ya existe un hábito llamado «Leer». Usa otro nombre.»; varios errores a la vez; datos válidos → `valid: true`, en tests/unit/validation.test.js
- [ ] T013 [P] [US1] Escribir pruebas unitarias de `createHabit` (devuelve `name` recortado y con espacios colapsados, `category` recortada, `completions: []`, usa `id` y `createdAt` recibidos, no modifica la lista existente, devuelve `errors` si la validación falla) y de `sortHabits` (alfabético en español sin distinguir mayúsculas ni acentos, empate por `createdAt`, no modifica el arreglo original) en tests/unit/habits.test.js
- [ ] T014 [P] [US1] Escribir pruebas de componente del formulario: envío vacío muestra los tres mensajes, marca `aria-invalid` y muestra el resumen `role="alert"`; un envío válido llama a `onCreate`, muestra «Hábito «Leer» guardado.», limpia los campos y deja la fecha en hoy; un duplicado devuelto por `onCreate` se muestra bajo el nombre, en tests/components/HabitForm.test.jsx

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implementar `normalizeName` (`trim`, `replace(/\s+/g, ' ')`, `toLocaleLowerCase('es')`) y `validateHabitInput` con los mensajes exactos de data-model.md en src/domain/validation.js
- [ ] T016 [US1] Implementar `createHabit(input, existing, { id, createdAt })` y `sortHabits(habits)` según contracts/domain-api.md en src/domain/habits.js (depende de T015)
- [ ] T017 [US1] Implementar el hook `useHabits` con el estado en memoria y la acción `addHabit(input)` que genera `id` con `crypto.randomUUID()` (con respaldo) y `createdAt`, llama a `createHabit` y devuelve `{ ok, errors }` en src/hooks/useHabits.js
- [ ] T018 [P] [US1] Implementar `HabitForm` con etiquetas «Nombre», «Categoría» y «Fecha de inicio», botón «Guardar hábito», errores por campo con `aria-describedby` y `aria-invalid`, resumen `role="alert"` y confirmación `role="status"` según contracts/ui-contract.md en src/components/HabitForm.jsx
- [ ] T019 [US1] Implementar `HabitList` (lista accesible «Mis hábitos», estado vacío «Todavía no tienes hábitos. Crea el primero con el formulario.», hábitos ordenados con `sortHabits`) y la tarjeta básica `HabitItem` (nombre en h3, categoría y fecha de inicio) en src/components/HabitList.jsx y src/components/HabitItem.jsx
- [ ] T020 [US1] Conectar `useToday`, `useHabits`, `HabitForm` y `HabitList` en src/App.jsx y añadir los estilos del formulario, mensajes de error y tarjetas en src/styles.css

**Checkpoint**: US1 funciona por sí sola: se crean hábitos y los errores son claros (en memoria)

---

## Phase 4: User Story 2 - Marcar cumplimiento y ver rachas (Priority: P2)

**Goal**: Marcar o desmarcar solo el día de hoy, ver qué hábitos están cumplidos hoy y su racha actual y mejor racha

**Independent Test**: Con un hábito creado, marcarlo hoy y ver «Hoy: Cumplido» y racha 1; desmarcarlo; comprobar que los días anteriores y mañana están deshabilitados; con historial de ayer y anteayer, hoy sin marcar muestra racha 2 y «Pendiente»

### Tests for User Story 2 ⚠️

- [ ] T021 [P] [US2] Escribir pruebas unitarias de `calculateStreaks` con los ejemplos de data-model.md (historial vacío, tres días seguidos hasta hoy, hoy pendiente con ayer cumplido, ayer sin cumplir, mejor racha con huecos), más fin de mes, hábito creado hoy y fechas futuras ignoradas, en tests/unit/streaks.test.js
- [ ] T022 [P] [US2] Añadir pruebas unitarias de `toggleCompletion` (marca y desmarca hoy; rechaza ayer, mañana y hoy anterior a `startDate` con `ok: false` sin modificar el hábito original; mantiene `completions` ordenado y sin duplicados), `canEditDate`, `isCompletedOn` y `getDayStatus` (los cinco estados) en tests/unit/habits.test.js
- [ ] T023 [P] [US2] Escribir pruebas de componente de la tarjeta: muestra «Hoy: Pendiente» o «Hoy: Cumplido» y `data-status`, el botón tiene `aria-pressed` y llama a `onToggle`, muestra «Racha actual» y «Mejor racha», la tira de días tiene 7 botones y solo hoy está habilitado, y un hábito con inicio futuro muestra «Empieza el …» con el botón deshabilitado, en tests/components/HabitItem.test.jsx

### Implementation for User Story 2

- [ ] T024 [P] [US2] Implementar `calculateStreaks(completions, today)` que devuelve `{ current, best, todayStatus }` con la regla de research.md R3 (hoy sin marcar es `pending` y no rompe la racha) en src/domain/streaks.js
- [ ] T025 [US2] Implementar `isCompletedOn`, `canEditDate`, `toggleCompletion(habit, dateKey, today)` y `getDayStatus` según contracts/domain-api.md en src/domain/habits.js
- [ ] T026 [US2] Añadir la acción `toggleToday(habitId)` al hook, usando el `today` recibido de `useToday` y `toggleCompletion`, en src/hooks/useHabits.js
- [ ] T027 [P] [US2] Implementar `DayStrip` con los 5 días anteriores, hoy y mañana como botones; solo hoy habilitado y el resto `disabled` con nombre accesible «{fecha}: {estado}, solo lectura», en src/components/DayStrip.jsx
- [ ] T028 [US2] Completar `HabitItem` con el estado de hoy, botón «Marcar como cumplido» / «Desmarcar» con `aria-pressed`, rachas y `DayStrip`, y añadir el resumen «{c} de {n} cumplidos hoy» en `HabitList`, con sus estilos, en src/components/HabitItem.jsx, src/components/HabitList.jsx y src/styles.css

**Checkpoint**: US1 y US2 funcionan juntas: se marca hoy y las rachas se actualizan

---

## Phase 5: User Story 3 - Persistencia local y recuperación tras recarga (Priority: P3)

**Goal**: Conservar hábitos e historial al recargar y seguir funcionando si `localStorage` falta o está dañado

**Independent Test**: Crear y marcar hábitos, recargar y ver el mismo estado; poner texto inválido en la clave `habit-tracker`, recargar y ver el aviso, la lista vacía y poder crear un hábito

### Tests for User Story 3 ⚠️

- [ ] T029 [P] [US3] Escribir pruebas unitarias del almacenamiento con un `localStorage` simulado: clave ausente → `empty`; guardar y leer devuelve lo mismo con `schemaVersion: 1`; JSON inválido, raíz no objeto, `habits` no arreglo y `schemaVersion` distinto de 1 → `corrupt` con `[]`; hábitos sin campos obligatorios se descartan → `partial` con `discarded`; fechas inválidas, duplicadas o anteriores al inicio en `completions` se ignoran; nombres repetidos conservan el primero; `getItem` que lanza → `unavailable`; `setItem` que lanza → `saveState` devuelve `false`, en tests/unit/habitStorage.test.js
- [ ] T030 [P] [US3] Escribir pruebas de componente de la aplicación completa: restaura hábitos guardados al montar; guarda tras crear y tras marcar; con datos dañados muestra el aviso, la lista vacía y permite crear un hábito; el aviso se cierra con «Cerrar aviso»; la lista se muestra en orden alfabético; no existen controles para editar ni eliminar (FR-010), en tests/components/App.test.jsx

### Implementation for User Story 3

- [ ] T031 [US3] Implementar `STORAGE_KEY` (`"habit-tracker"`), `SCHEMA_VERSION` (`1`), `loadState(storage)` que nunca lanza y devuelve `{ habits, status, discarded }`, y `saveState(habits, storage)` que devuelve `true`/`false`, según contracts/storage-format.md, en src/storage/habitStorage.js
- [ ] T032 [P] [US3] Implementar `StorageNotice` con `role="alert"`, los textos de contracts/ui-contract.md y el botón «Cerrar aviso» en src/components/StorageNotice.jsx
- [ ] T033 [US3] Integrar la persistencia: `useHabits` carga con `loadState` al iniciar, guarda con `saveState` después de cada cambio (no en lecturas) y expone el aviso; mostrar `StorageNotice` bajo el título en src/hooks/useHabits.js y src/App.jsx

**Checkpoint**: Las tres historias funcionan y los datos sobreviven a una recarga

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación de extremo a extremo, diseño responsive y documentación de ejecución

- [ ] T034 Escribir pruebas de extremo a extremo con la fecha fijada mediante `page.clock`: validación de campos vacíos, creación, duplicado con mayúsculas y espacios, marcar y desmarcar hoy, días pasados y futuros deshabilitados, racha con historial precargado y hoy pendiente, persistencia tras recarga, aviso con datos dañados y vista 375 × 812 sin scroll horizontal, en tests/e2e/habit-tracker.spec.js
- [ ] T035 [P] Revisar el diseño responsive y la accesibilidad básica a 320, 375, 768 y 1280 px (sin scroll horizontal, objetivos táctiles ≥ 44 px, foco visible, contraste AA) y ajustar src/styles.css
- [ ] T036 [P] Crear README.md en la raíz con requisitos, comandos de ejecución y pruebas y la estructura del proyecto
- [ ] T037 Ejecutar la validación de quickstart.md: `npm test`, `npm run test:e2e`, `npm run build` y `npm run lint` sin errores

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias
- **Foundational (Phase 2)**: Depende de Setup; bloquea todas las historias
- **US1 (Phase 3)**: Depende de Foundational
- **US2 (Phase 4)**: Depende de Foundational; usa `useHabits` y `HabitItem` de US1 (T017, T019)
- **US3 (Phase 5)**: Depende de Foundational; persiste el estado de `useHabits` (T017, T026)
- **Polish (Phase 6)**: Depende de las tres historias

### User Story Dependencies

- **US1 (P1)**: Independiente; es el MVP
- **US2 (P2)**: Necesita un hábito creado (US1), pero su lógica (`streaks.js`, `toggleCompletion`) se prueba sola con datos fijos
- **US3 (P3)**: Su módulo `habitStorage.js` se prueba solo; la integración (T033) necesita `useHabits` de US1 y US2

### Within Each User Story

- Pruebas primero (deben fallar) → dominio → hook → componentes → integración en App
- Dependencias clave: T009 → T010, T015 → T016 → T017; T024 y T025 → T026 → T028; T031 → T033; T029 y T030 necesitan T031 y T033 para pasar

### Parallel Opportunities

- Setup: T002, T003, T004 y T005 en paralelo tras T001
- Foundational: T007 y T008 en paralelo
- US1: T012, T013 y T014 en paralelo; T015 y T018 en paralelo
- US2: T021, T022 y T023 en paralelo; T024 y T027 en paralelo
- US3: T029 y T030 en paralelo; T032 en paralelo con T031
- Polish: T035 y T036 en paralelo

---

## Parallel Example: User Story 2

```bash
# Pruebas de US2 a la vez:
Task: "Pruebas unitarias de calculateStreaks en tests/unit/streaks.test.js"
Task: "Pruebas de toggleCompletion y getDayStatus en tests/unit/habits.test.js"
Task: "Pruebas de componente de HabitItem en tests/components/HabitItem.test.jsx"

# Implementación independiente de US2 a la vez:
Task: "calculateStreaks en src/domain/streaks.js"
Task: "DayStrip en src/components/DayStrip.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 (Setup) y Phase 2 (Foundational)
2. Completar Phase 3 (US1)
3. **Validar**: crear hábitos válidos e inválidos con `npm run dev` y `npm test`

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → registro y validación (MVP)
3. US2 → marcado de hoy y rachas
4. US3 → persistencia y recuperación
5. Polish → E2E, responsive, README y validación final

---

## Notes

- 37 tareas: Setup 6, Foundational 5, US1 9, US2 8, US3 5, Polish 4
- Las tareas [P] tocan archivos distintos y no dependen de tareas pendientes
- La etiqueta [USx] enlaza cada tarea con su historia del spec
- Marcar cada tarea como `[X]` al completarla
