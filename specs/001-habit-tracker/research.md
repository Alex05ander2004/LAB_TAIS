# Research: Seguimiento de hábitos diarios

**Fase**: 0 (`/speckit-plan`) | **Fecha**: 2026-10-29 | **Plan**: [plan.md](plan.md)

El *Technical Context* del plan no dejó marcadores `NEEDS CLARIFICATION`: la tecnología la fijó la entrada de `/speckit-plan`. Este documento registra las decisiones que quedaban abiertas y las prácticas elegidas para cada tecnología.

---

## R1. Herramientas de interfaz y compilación

- **Decision**: React 19 con Vite 8 y JavaScript (JSX), sin TypeScript. CSS propio en un único archivo.
- **Rationale**: Vite ofrece servidor de desarrollo inmediato y build estático sin configuración; React permite componentes pequeños y probarlos con React Testing Library. Un solo archivo CSS basta para una pantalla.
- **Alternatives considered**: JavaScript sin framework (manipulación manual del DOM, peor para pruebas de componentes); TypeScript (más seguridad de tipos, pero fuera de lo pedido para v1); bibliotecas de estilos como Tailwind (dependencia innecesaria para una pantalla).

## R2. Representación de fechas y cálculo de «hoy»

- **Decision**: Toda fecha del dominio es una cadena local `AAAA-MM-DD` («date key»). `todayKey(now)` usa `getFullYear()`, `getMonth()` y `getDate()` del objeto `Date`. Para sumar o restar días se construye `new Date(y, m - 1, d)` y se usa `setDate`, que respeta el calendario local.
- **Rationale**: `toISOString()` devuelve UTC; en Perú (UTC−5) la fecha cambiaría a las 19:00 y rompería las rachas. Las cadenas `AAAA-MM-DD` se comparan y ordenan como texto, son legibles en `localStorage` y no dependen de la hora.
- **Alternatives considered**: Guardar *timestamps* (dependen de la zona horaria al leerlos); `Date` UTC a medianoche (se desplaza un día al mostrarla en local); bibliotecas como date-fns o Day.js (no hacen falta para sumar días y formatear).
- **Validación**: una date key es válida si cumple `^\d{4}-\d{2}-\d{2}$` y, al reconstruir la fecha local, devuelve los mismos año, mes y día (descarta `2026-02-30`).

## R3. Cálculo de racha actual y mejor racha (FR-007)

- **Decision**:
  - El historial es un conjunto de date keys cumplidas.
  - **Racha actual**: si hoy está cumplido, se cuentan días consecutivos hacia atrás desde hoy. Si no, se cuentan desde ayer y el estado de hoy es `pending`. Si ayer tampoco está cumplido, la racha es 0.
  - **Mejor racha**: se ordenan las fechas y se recorre la lista midiendo la secuencia consecutiva más larga (diferencia de un día calendario local).
  - Las rachas no se guardan: se calculan en cada render a partir del historial.
- **Rationale**: Es la regla aclarada en el spec («un día actual sin marcar no rompe la racha hasta que termina el día»). Calcular en vez de guardar evita inconsistencias entre historial y racha.
- **Alternatives considered**: Romper la racha en cuanto hoy no está marcado (contradice la aclaración); guardar contadores de racha (se desincronizan al desmarcar).

## R4. Edición restringida al día actual (FR-006)

- **Decision**: `toggleCompletion(habit, date, today)` devuelve `{ ok: false, error }` si `date !== today` o si `today` es anterior a `startDate`. La interfaz muestra los 5 días anteriores, hoy y mañana como botones; solo el de hoy está habilitado y el resto queda `disabled` con la indicación «Solo lectura».
- **Rationale**: El bloqueo vive en el dominio (no se puede saltar desde la interfaz) y además es visible para el usuario, lo que permite comprobar el caso de día pasado o futuro.
- **Alternatives considered**: Ocultar los días pasados (no se puede comprobar el bloqueo); permitir editar ayer (fuera de lo aclarado).

## R5. Fecha de inicio futura

- **Decision**: Se acepta una fecha de inicio futura. Mientras hoy sea anterior a la fecha de inicio, el hábito se muestra como «Empieza el …» y el botón de marcar está deshabilitado.
- **Rationale**: El spec habla de «la fecha en que empieza», lo que admite planificar un hábito. Marcar cumplimientos antes del inicio no tendría sentido.
- **Alternatives considered**: Rechazar fechas futuras (restringe un caso de uso razonable que el spec no prohíbe).

## R6. Persistencia en localStorage (FR-008, FR-009)

- **Decision**: Un único módulo `src/storage/habitStorage.js` con la clave `habit-tracker` y el contenedor `{ schemaVersion: 1, habits: [...] }`.
  - `loadState(storage)` nunca lanza: devuelve `{ habits, status }`, donde `status` es `empty` (no hay datos), `ok`, `partial` (se descartaron hábitos inválidos), `corrupt` (JSON inválido, versión desconocida o forma inesperada) o `unavailable` (el navegador bloquea el acceso).
  - `saveState(habits, storage)` devuelve `true` o `false` en vez de lanzar.
  - Al detectar datos dañados se avisa al usuario y se empieza con una lista vacía; el siguiente guardado reemplaza los datos dañados.
- **Rationale**: Centralizar el acceso permite probar todos los casos de datos dañados con un `localStorage` simulado. `schemaVersion` permite migraciones futuras sin adivinar el formato.
- **Alternatives considered**: IndexedDB (capacidad innecesaria y API asíncrona); guardar un arreglo sin versión (no distingue un formato antiguo de uno dañado); borrar la clave al detectar daño (se pierde la evidencia antes de que el usuario vea el aviso).

## R7. Identificadores y orden de la lista

- **Decision**: `id` con `crypto.randomUUID()` (con un respaldo basado en tiempo y número aleatorio si no existe). La lista se ordena alfabéticamente por nombre con `localeCompare('es', { sensitivity: 'base' })` y, en empate, por `createdAt`.
- **Rationale**: Un UUID no se repite aunque se creen dos hábitos en el mismo milisegundo. El orden alfabético es estable (no cambia al marcar) y predecible; la distinción entre cumplidos y pendientes la dan el estado visual de cada tarjeta y el resumen «X de N cumplidos hoy» (FR-005, SC-004).
- **Alternatives considered**: Agrupar en «Pendientes» y «Cumplidos» (la tarjeta salta de grupo al marcar); ordenar por fecha de creación (menos útil para encontrar un hábito).

## R8. Cambio de día con la aplicación abierta

- **Decision**: El hook `useToday` recalcula `todayKey()` cada 30 s y en los eventos `focus` y `visibilitychange`. Si cambió, actualiza el estado y la interfaz se vuelve a dibujar con el nuevo «hoy».
- **Rationale**: Sin esto, una pestaña abierta desde el día anterior permitiría marcar ayer como si fuera hoy y mostraría rachas incorrectas.
- **Alternatives considered**: Programar un temporizador exacto a medianoche (falla si el equipo se suspende); no hacer nada (riesgo señalado en la planificación).

## R9. Estrategia de pruebas

- **Decision**:
  - **Unitarias (Vitest)**: dominio y almacenamiento, con fechas fijas pasadas como parámetro y un `localStorage` simulado.
  - **Componentes (Vitest + jsdom + React Testing Library + user-event)**: formulario, lista y App completa; la fecha se fija con `vi.useFakeTimers({ toFake: ['Date'] })` y `vi.setSystemTime`.
  - **Extremo a extremo (Playwright + Chromium)**: flujo completo en el navegador real (crear, validar, marcar, recargar, datos dañados y vista móvil 375 × 812), con la fecha fijada mediante `page.clock`.
- **Rationale**: Las funciones puras se prueban rápido y sin navegador; los componentes verifican mensajes y accesibilidad; Playwright confirma `localStorage` real y diseño responsive.
- **Alternatives considered**: Jest (requiere más configuración con Vite y módulos ES); Cypress (más pesado que Playwright para un único navegador).

## R10. Accesibilidad básica

- **Decision**: `<label>` asociado a cada campo, mensajes de error enlazados con `aria-describedby` y `aria-invalid`, resumen de errores en una región `role="alert"`, botón de marcado con `aria-pressed`, contraste AA y foco visible.
- **Rationale**: SC-002 pide indicar con claridad el dato exacto a corregir, también para lectores de pantalla.
- **Alternatives considered**: Solo bordes de color (no indica qué corregir y no es accesible).
