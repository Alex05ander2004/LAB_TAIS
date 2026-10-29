# Feature Specification: Seguimiento de hábitos diarios

**Feature Branch**: `001-habit-tracker`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Quiero una aplicación de seguimiento de hábitos para personas que desean construir rutinas diarias (ejercicio, lectura, estudio, etc.). La persona debe poder registrar un hábito indicando su nombre, una categoría y la fecha en que empieza. Debe poder marcar cada día si cumplió o no el hábito y ver su racha, es decir, cuántos días seguidos lleva cumpliéndolo, junto con su mejor racha. La lista de hábitos debe mostrarse ordenada y permitir distinguir cuáles ya se cumplieron hoy y cuáles no. Si faltan datos obligatorios o el nombre ya existe, la aplicación debe indicar claramente qué corregir. Los hábitos y su historial de cumplimiento deben conservarse al cerrar o recargar la página. Fuera de alcance en esta primera versión: edición y eliminación de hábitos, notificaciones, recordatorios y cuentas de usuario."

## Clarifications

### Session 2026-10-29

- Q: Should the habit category be mandatory when creating a new habit in v1, even though the project constitution only requires the name and start date? → A: Required in the form
- Q: If the current day has not been marked yet, does the habit lose its current streak immediately or remain active until the user marks it? → A: Unmarked today does not break the streak until the next day
- Q: Can users change the completion status for past or future dates, or only for today? → A: Only today can be edited

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar un hábito con validación clara (Priority: P1)

Una persona desea empezar una rutina diaria y necesita crear un nuevo hábito con nombre, categoría y fecha de inicio. La aplicación debe guiarla para completar datos obligatorios y advertir si faltan campos o si el nombre ya existe.

**Why this priority**: La creación del hábito es la base del valor del producto; sin ella no puede comenzar el seguimiento ni la racha.

**Independent Test**: Puede probarse creando un hábito válido y luego intentando guardar otro con datos incompletos o duplicados. Si la operación falla o se acepta correctamente según el caso, el flujo principal funciona y aporta valor inmediato.

**Acceptance Scenarios**:

1. **Given** una persona abre la aplicación con la intención de crear un hábito, **When** completa nombre, categoría y fecha de inicio con valores válidos, **Then** el hábito se guarda y aparece en la lista principal.
2. **Given** una persona intenta guardar un hábito sin completar un campo obligatorio o con un nombre repetido, **When** envía el formulario, **Then** la aplicación muestra un mensaje claro indicando qué corregir y no guarda el hábito.
3. **Given** una persona escribe un nombre con mayúsculas distintas al existente, **When** intenta guardar el hábito, **Then** el sistema lo considera duplicado y no permite crear dos registros equivalentes.

---

### User Story 2 - Marcar cumplimiento y ver rachas (Priority: P2)

La persona registra varios hábitos y cada día quiere indicar si los cumplió o no. La aplicación debe reflejar ese estado para cada día y calcular la racha actual y la mejor racha para cada hábito.

**Why this priority**: El seguimiento diario y la motivación por la consistencia son la razón central de la aplicación.

**Independent Test**: Puede probarse con un hábito que se marca como completado varios días consecutivos y verificando que la racha actual y la mejor racha aumentan según el historial.

**Acceptance Scenarios**:

1. **Given** una persona tiene un hábito activo, **When** marca el día actual como cumplido, **Then** el hábito se identifica como completado hoy y la racha actual se actualiza en consecuencia.
2. **Given** un hábito con varios días completos consecutivos, **When** la persona revisa la lista, **Then** la aplicación muestra la racha actual y la mejor racha correspondientes.
3. **Given** un hábito no se marcó para el día presente, **When** se visualiza en la lista, **Then** se indica claramente que aún no se cumplió hoy y la racha sigue activa hasta el inicio del siguiente día.
4. **Given** una persona intenta cambiar el estado de un día pasado o futuro, **When** intenta actualizar esa fecha, **Then** la aplicación bloquea la edición y mantiene el estado del día como de solo lectura en esta versión.

---

### User Story 3 - Persistencia local y recuperación tras recarga (Priority: P3)

La persona necesita que sus hábitos y su historial de cumplimiento sigan estando disponibles aunque recargue la página o cierre la pestaña.

**Why this priority**: La continuidad del uso sin perder datos es esencial para construir una rutina confiable y evitar fricción.

**Independent Test**: Puede probarse creando hábitos y cambios de estado, recargando la página y comprobando que la aplicación restaura la información sin intervención manual.

**Acceptance Scenarios**:

1. **Given** una persona registró varios hábitos y marcó algunos días como cumplidos, **When** recarga la página, **Then** la información sigue disponible y la lista aparece en el mismo estado.
2. **Given** el navegador no tiene información guardada o la información almacenada está dañada, **When** la aplicación inicia, **Then** continúa funcionando y muestra un estado seguro sin bloquear la experiencia.

---

### Edge Cases

- Qué ocurre si el nombre del hábito está vacío o contiene solo espacios.
- Cómo responde la aplicación si el nombre ya existe con distinta capitalización.
- Qué pasa si el almacenamiento local no tiene datos o contiene JSON corrupto.
- Qué ocurre al listar hábitos cuando algunos ya están cumplidos hoy y otros no.
- Qué ocurre si el usuario intenta marcar un día pasado o futuro en la versión inicial; la aplicación debe bloquear la edición y dejar esos días en modo de solo lectura.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a user to create a habit by entering a name, category, and start date.
- **FR-002**: The system MUST require the habit name, category, and start date before saving a new habit. The category is mandatory in v1 and must be present in the form before submission.
- **FR-003**: The system MUST treat whitespace-only text as empty and display a clear validation message when required data is missing.
- **FR-004**: The system MUST reject duplicate habit names using a case-insensitive comparison after normalizing redundant whitespace.
- **FR-005**: The system MUST present the list of habits in a stable, ordered view that distinguishes completed and uncompleted habits for the current day.
- **FR-006**: The system MUST allow a user to mark or unmark the current day for each habit as completed or not completed. In v1, only the current day can be edited; past and future dates remain read-only.
- **FR-007**: The system MUST calculate and display the current streak and the best streak for each habit based on consecutive completed days, treating an unmarked current day as pending rather than broken.
- **FR-008**: The system MUST preserve habits and completion history across page reloads and browser closes using local browser storage.
- **FR-009**: The system MUST handle missing or malformed stored data without blocking the app and must recover to a safe default state.
- **FR-010**: The system MUST keep the feature scope limited to habit tracking and exclude editing, deletion, reminders, notifications, and user accounts in this version.

### Key Entities

- **Habit**: Represents a recurring routine the user wants to track; it includes a name, category, start date, and a completion history.
- **Completion Record**: Represents the status of a habit for a specific day, indicating whether it was completed or not.
- **Streak Summary**: Represents the current consecutive sequence of completed days and the best historical sequence for a habit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a valid habit and see it appear in the main list within 30 seconds of starting the flow.
- **SC-002**: 95% of invalid submissions show a clear message indicating the exact data that must be corrected.
- **SC-003**: After reloading the page, all saved habits and daily completion states are restored without manual re-entry.
- **SC-004**: Users can determine at a glance which habits are completed today and what their current and best streak are for each one.
- **SC-005**: The app remains usable even when stored browser data is absent or malformed, with no blocking error state.

## Assumptions

- Users access the app from a single browser on a personal device and expect their habits to persist locally in that browser.
- The first version focuses on personal routine tracking and intentionally excludes user accounts, reminders, and remote synchronization.
- Habit categories are free-text labels chosen by the user, and the list is presented in Spanish.
- This release is a local-only web app with responsive behavior and no server dependency.
