# Implementation Plan: Seguimiento de hábitos diarios

**Branch**: `001-habit-tracker` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-habit-tracker/spec.md`

**Entrada del usuario (`/speckit-plan`)**: Usar React con Vite y JavaScript para la interfaz, y CSS simple con diseño responsive. Guardar los datos en localStorage dentro de un único módulo de almacenamiento que use un contenedor JSON con número de versión (schemaVersion) y recupere un estado vacío si los datos faltan o están dañados. Poner las reglas de negocio (validación, nombre duplicado, marcado del día actual y cálculo de racha actual y mejor racha) en funciones puras separadas de los componentes. Usar la fecha local del usuario para determinar «hoy». Pruebas unitarias y de componentes con Vitest y React Testing Library. Pruebas de extremo a extremo con Playwright.

## Summary

Aplicación web de una sola página, solo cliente, para registrar hábitos (nombre, categoría y fecha de inicio), marcar o desmarcar el cumplimiento del día actual y ver la racha actual y la mejor racha de cada hábito. Los datos se guardan en `localStorage` dentro de un contenedor JSON versionado (`schemaVersion`) que se valida al cargar y, si falta o está dañado, se sustituye por un estado vacío sin bloquear la interfaz.

El enfoque técnico separa tres capas: **dominio** (funciones puras de validación, normalización de nombres, marcado del día y cálculo de rachas), **almacenamiento** (un único módulo que lee, valida y escribe el contenedor) e **interfaz** (componentes React que solo muestran datos y delegan las reglas al dominio). «Hoy» se calcula siempre como fecha local `AAAA-MM-DD`, nunca a partir de UTC.

## Technical Context

**Language/Version**: JavaScript (ES2022, módulos ES) con JSX; Node.js ≥ 20.19 para las herramientas de desarrollo

**Primary Dependencies**: React 19.3, React DOM 19.3, Vite 8.3 con `@vitejs/plugin-react` 6.1

**Storage**: `localStorage` del navegador, clave única `habit-tracker`, contenedor `{ schemaVersion: 1, habits: [...] }` (ver [data-model.md](data-model.md))

**Testing**: Vitest 5 + jsdom + React Testing Library 16 + `@testing-library/user-event` (unitarias y de componentes); Playwright 1.64 con Chromium (extremo a extremo)

**Target Platform**: Navegadores modernos de escritorio y móvil (últimas versiones de Chrome, Edge, Firefox y Safari); servida como sitio estático

**Project Type**: Aplicación web de una sola página (solo frontend, sin backend)

**Performance Goals**: Interacción inmediata (< 100 ms al marcar o crear) con decenas de hábitos y algunos años de historial; registrar un hábito en menos de 30 s (SC-001)

**Constraints**: Sin servidor, sin autenticación y sin servicios externos en tiempo de ejecución; funciona sin conexión una vez cargada; interfaz en español; usable desde 320 px de ancho sin scroll horizontal; fechas en zona horaria local

**Scale/Scope**: Un usuario por navegador; decenas de hábitos; 1 pantalla con formulario, aviso de almacenamiento y lista

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / puerta | Cómo lo cumple el plan | Estado |
|---|---|---|
| I. Alcance mínimo | Solo registro, marcado del día actual y rachas. Sin edición, eliminación, recordatorios, notificaciones ni cuentas (FR-010). Sin backend. | ✅ Pasa |
| II. Validación de datos | `validateHabitInput` exige nombre, categoría y fecha válida; trata los espacios como vacío; `normalizeName` detecta duplicados sin distinguir mayúsculas y colapsando espacios. Se valida antes de persistir. La categoría obligatoria es más estricta que la constitución y viene del spec aclarado (FR-002). | ✅ Pasa |
| III. Persistencia local y tolerancia a fallos | Un único módulo `src/storage/habitStorage.js` con `try/catch`, verificación de `schemaVersion` y saneamiento de cada hábito. Ante datos ausentes, dañados o inesperados devuelve un estado vacío seguro y la app sigue usable. | ✅ Pasa |
| IV. Modularidad y claridad | `src/domain/` no importa React ni `localStorage`; `src/storage/` no importa componentes; los componentes no contienen reglas de negocio. Interfaz en español. | ✅ Pasa |
| V. Calidad verificable | Cada FR tiene al menos una prueba automatizada (unitaria, de componente o E2E). Ver mapa en [quickstart.md](quickstart.md). | ✅ Pasa |
| Restricciones: responsive, sin servidor, fecha local | CSS propio con diseño *mobile first*; build estático; `todayKey()` usa `getFullYear/getMonth/getDate` locales. | ✅ Pasa |
| Restricción: «sin dependencias externas» | Se interpreta como ausencia de servicios externos en tiempo de ejecución (CDN, APIs, servidores). React y Vite son dependencias de compilación incluidas en el paquete final; la app corre sin red. Justificado en *Complexity Tracking*. | ✅ Pasa con justificación |

**Re-check post-diseño (tras Phase 1)**: el modelo de datos, los contratos y la guía de validación mantienen las mismas fronteras de capa y no agregan funciones fuera de alcance. Sin violaciones nuevas.

## Project Structure

### Documentation (this feature)

```text
specs/001-habit-tracker/
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Phase 0: decisiones técnicas (/speckit-plan)
├── data-model.md        # Phase 1: entidades, validaciones y almacenamiento (/speckit-plan)
├── quickstart.md        # Phase 1: guía de ejecución y validación (/speckit-plan)
├── contracts/           # Phase 1: contratos de dominio, almacenamiento e interfaz (/speckit-plan)
│   ├── domain-api.md
│   ├── storage-format.md
│   └── ui-contract.md
├── checklists/
│   └── requirements.md  # Checklist de calidad del spec (fase 1)
└── tasks.md             # Phase 2 (/speckit-tasks; no lo crea /speckit-plan)
```

### Source Code (repository root)

```text
index.html                      # Punto de entrada de Vite (lang="es")
package.json                    # Scripts: dev, build, preview, test, test:e2e, lint
vite.config.js                  # Vite + configuración de Vitest (jsdom)
playwright.config.js            # Playwright: servidor de Vite y Chromium
eslint.config.js

src/
├── main.jsx                    # Monta <App /> en #root
├── App.jsx                     # Composición de la pantalla
├── styles.css                  # Estilos responsive
├── domain/                     # Funciones puras (sin React ni localStorage)
│   ├── dates.js                # todayKey, addDays, isValidDateKey, formato
│   ├── validation.js           # normalizeName, validateHabitInput
│   ├── habits.js               # createHabit, toggleCompletion, isCompletedOn, sortHabits
│   └── streaks.js              # calculateStreaks
├── storage/
│   └── habitStorage.js         # STORAGE_KEY, SCHEMA_VERSION, loadState, saveState
├── hooks/
│   ├── useToday.js             # Fecha local de hoy, se actualiza al cambiar el día
│   └── useHabits.js            # Conecta dominio y almacenamiento con el estado de React
└── components/
    ├── HabitForm.jsx           # Formulario con mensajes de error por campo
    ├── HabitList.jsx           # Lista ordenada y resumen de cumplidos hoy
    ├── HabitItem.jsx           # Estado de hoy, botón de marcado y rachas
    ├── DayStrip.jsx            # Días cercanos en solo lectura
    └── StorageNotice.jsx       # Aviso de datos recuperados o no guardados

tests/
├── setup.js                    # jest-dom y limpieza de localStorage
├── unit/                       # Dominio y almacenamiento
├── components/                 # React Testing Library
└── e2e/                        # Playwright
```

**Structure Decision**: Proyecto único en la raíz del repositorio (sin `frontend/` ni `backend/`), porque la aplicación es solo cliente. Las tres capas exigidas por la constitución se reflejan en `src/domain/`, `src/storage/` y `src/components/`; `src/hooks/` es la única pieza que conecta dominio y almacenamiento con React. Las pruebas viven fuera de `src/` y se separan por tipo para poder ejecutarlas por separado.

## Decisiones clave

Detalle y alternativas en [research.md](research.md).

1. **Fecha local como cadena `AAAA-MM-DD`**: todas las fechas del dominio son cadenas locales. Nunca se usa `toISOString()` para obtener «hoy», porque en UTC−5 cambiaría de día a las 19:00.
2. **Racha con hoy pendiente (FR-007)**: si hoy está marcado, la racha actual cuenta hacia atrás desde hoy; si no, cuenta desde ayer y hoy se muestra como «pendiente». La racha solo queda en 0 si ayer tampoco se cumplió. La mejor racha es la secuencia consecutiva más larga del historial.
3. **Solo hoy es editable (FR-006)**: `toggleCompletion` rechaza cualquier fecha distinta de hoy; la interfaz muestra los días cercanos deshabilitados y en solo lectura.
4. **Contenedor versionado**: `{ schemaVersion: 1, habits: [...] }`. Una versión desconocida, un JSON inválido o una forma inesperada se tratan como datos dañados; los hábitos individuales inválidos se descartan.
5. **Orden estable (FR-005)**: alfabético por nombre (`localeCompare` en español, sin distinguir mayúsculas ni acentos) y, en empate, por fecha de creación. El orden no cambia al marcar, para que la lista no «salte».
6. **Cambio de día con la app abierta**: `useToday` vuelve a calcular la fecha cada 30 s y al recuperar el foco, de modo que «hoy» no se queda desactualizado tras la medianoche.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| React + Vite (dependencias de compilación) frente a «sin dependencias externas» | Decisión del equipo indicada en la entrada de `/speckit-plan`; facilita componentes reutilizables y pruebas con React Testing Library | JavaScript sin framework obliga a manipular el DOM a mano y no se integra con la estrategia de pruebas de componentes elegida. La app final sigue sin depender de servicios externos en ejecución. |
