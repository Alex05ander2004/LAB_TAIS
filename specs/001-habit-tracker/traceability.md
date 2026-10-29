# Tabla de trazabilidad: Seguimiento de hábitos diarios

**Branch**: `001-habit-tracker`
**Fecha**: 2026-10-29
**Fuentes**: [spec.md](spec.md), [tasks.md](tasks.md), [plan.md](plan.md)

---

## Nota sobre la organización de historias de usuario

El `spec.md` define tres historias de usuario en su sección *User Scenarios & Testing*:

- **User Story 1** (identificada aquí como **HU1 + HU2**): Registrar un hábito con validación clara. Cubre tanto el registro (FR-001, FR-002) como la validación (FR-003, FR-004).
- **User Story 2** (identificada aquí como **HU3**): Marcar cumplimiento y ver rachas (FR-005, FR-006, FR-007).
- **User Story 3** (identificada aquí como **HU4**): Persistencia local y recuperación tras recarga (FR-008, FR-009).

La historia **HU2** (validación) se extrae de la "User Story 1" del spec porque sus requisitos FR-003 y FR-004 son distintos de los de creación pura, y la descomposición por historia de usuario en `tasks.md` la trata de forma separada para facilitar la trazabilidad. Esta separación es consistente con la enunciación del trabajo académico.

---

## Tabla de trazabilidad

| Historia de usuario | Tareas relacionadas | Requisitos vinculados | Verificación esperada |
|---|---|---|---|
| **HU1** — Registrar un hábito (User Story 1 del spec, parte de registro) | T002, T003, T004, T005, T006 | FR-001, FR-002 | Hábito creado con nombre, categoría y fecha aparece en la lista; formulario conectado a la lógica de dominio (SC-001) |
| **HU2** — Validar datos de entrada (User Story 1 del spec, parte de validación) | T007, T008, T009, T010, T011 | FR-002, FR-003, FR-004 | Campos vacíos o de solo espacios generan error; nombres duplicados (cualquier capitalización, espacios redundantes) son rechazados con mensaje claro (SC-002) |
| **HU3** — Marcar cumplimiento diario y ver rachas (User Story 2 del spec) | T005, T012, T013, T014, T015, T016, T017 | FR-005, FR-006, FR-007 | Día actual se puede marcar/desmarcar; días pasados/futuros son solo lectura; racha actual y mejor racha calculadas correctamente; hoy sin marcar no rompe la racha (SC-004) |
| **HU4** — Persistencia y recuperación local (User Story 3 del spec) | T018, T019, T020, T021, T022 | FR-008, FR-009 | Datos persisten tras recarga; localStorage vacío o corrupto devuelve estado vacío sin bloquear la app (SC-003, SC-005) |

---

## Trazabilidad detallada por requisito

| Requisito | Descripción resumida | Tareas que lo implementan | Tareas que lo prueban |
|---|---|---|---|
| **FR-001** | Crear hábito con nombre, categoría y fecha | T003, T004 | T006 |
| **FR-002** | Campos nombre, categoría y fecha son obligatorios | T003, T007, T009 | T006, T010 |
| **FR-003** | Texto de solo espacios se considera vacío | T007, T009 | T010 |
| **FR-004** | Rechazar nombres duplicados (case-insensitive, espacios normalizados) | T008, T009 | T011 |
| **FR-005** | Lista ordenada, distingue cumplidos y no cumplidos hoy | T005, T015 | T024 |
| **FR-006** | Solo el día actual puede marcarse; pasados y futuros son solo lectura | T012, T013 | T016 |
| **FR-007** | Calcular y mostrar racha actual y mejor racha | T014, T015 | T017 |
| **FR-008** | Preservar datos en localStorage al recargar | T018, T020 | T021 |
| **FR-009** | Recuperarse de datos ausentes o corruptos sin bloquear la app | T019 | T022 |
| **FR-010** | Excluir edición, eliminación, notificaciones, cuentas de usuario | T001 (diseño de alcance) | T023 (verificación de no regresión) |

---

## Trazabilidad de criterios de éxito

| Criterio de éxito | Requisitos relacionados | Tareas que lo respaldan |
|---|---|---|
| **SC-001**: Crear hábito válido y verlo en la lista en menos de 30 s | FR-001, FR-002 | T003, T004, T005, T006 |
| **SC-002**: 95 % de envíos inválidos muestran mensaje claro del campo a corregir | FR-002, FR-003, FR-004 | T007, T008, T009, T010, T011 |
| **SC-003**: Todos los hábitos y estados diarios se restauran tras recargar | FR-008 | T018, T019, T020, T021 |
| **SC-004**: Usuario distingue de un vistazo qué hábitos están cumplidos hoy y sus rachas | FR-005, FR-007 | T005, T014, T015 |
| **SC-005**: App usable con datos ausentes o corruptos, sin estado de error bloqueante | FR-009 | T019, T022 |

---

## Cobertura de casos límite del spec

| Caso límite (Edge Case del spec) | Tarea de implementación | Tarea de prueba |
|---|---|---|
| Nombre vacío o de solo espacios | T007 | T010 |
| Nombre duplicado con distinta capitalización | T008 | T011 |
| localStorage sin datos | T019 | T022 |
| localStorage con JSON corrupto | T019 | T022 |
| Lista con hábitos cumplidos hoy y sin cumplir hoy | T005 | T023 |
| Intentar marcar un día pasado o futuro | T013 | T016 |

---

## Verificación de completitud

- ✅ HU1 (Registro) representada: T002, T003, T004, T005, T006
- ✅ HU2 (Validación) representada: T007, T008, T009, T010, T011
- ✅ HU3 (Cumplimiento y rachas) representada: T005, T012, T013, T014, T015, T016, T017
- ✅ HU4 (Persistencia) representada: T018, T019, T020, T021, T022
- ✅ Todos los requisitos FR-001 a FR-010 tienen al menos una tarea de implementación o verificación
- ✅ Todos los criterios de éxito SC-001 a SC-005 tienen tareas que los respaldan
- ✅ Todos los casos límite del spec tienen tarea de implementación y prueba correspondiente
- ✅ T001 (estructura de proyecto) y T023 (integración final) son transversales y cubren el conjunto completo de requisitos
- ✅ T024 (responsive y accesibilidad) cubre restricciones de la constitución no asignadas a un FR concreto
- ℹ️ T025 (documentación de decisiones) es una tarea de cierre documental sin requisito funcional asignado; su propósito es actualizar `plan.md` con las decisiones tomadas durante la implementación real
