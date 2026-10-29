# Tabla de trazabilidad: Seguimiento de hábitos diarios

**Branch**: `001-habit-tracker` | **Fecha**: 2026-10-29
**Fuentes**: [spec.md](spec.md), [plan.md](plan.md), [tasks.md](tasks.md), [quickstart.md](quickstart.md)

Las historias usan la misma numeración que el `spec.md`: US1 (P1), US2 (P2) y US3 (P3).

## Historias de usuario

| Historia | Tareas | Requisitos | Verificación esperada |
|---|---|---|---|
| **US1** — Registrar un hábito con validación clara | T012–T020 | FR-001, FR-002, FR-003, FR-004, FR-005 (lista) | Un hábito válido aparece en la lista; los campos vacíos, de solo espacios o duplicados se rechazan con un mensaje por campo (SC-001, SC-002) |
| **US2** — Marcar cumplimiento y ver rachas | T021–T028 | FR-005, FR-006, FR-007 | Solo hoy se marca o desmarca; los demás días son de solo lectura; racha actual y mejor racha correctas; hoy sin marcar no rompe la racha (SC-004) |
| **US3** — Persistencia local y recuperación tras recarga | T029–T033 | FR-008, FR-009 | Los datos sobreviven a una recarga; datos ausentes o dañados llevan a un estado vacío con aviso, sin bloquear (SC-003, SC-005) |
| Transversal | T001–T011, T034–T037 | FR-010, constitución | Estructura, fechas locales, E2E, diseño responsive y validación final |

## Requisitos

| Requisito | Tareas que lo implementan | Tareas que lo prueban |
|---|---|---|
| **FR-001** Crear hábito con nombre, categoría y fecha | T016, T017, T018, T020 | T013, T014, T034 |
| **FR-002** Nombre, categoría y fecha obligatorios | T015, T018 | T012, T014, T034 |
| **FR-003** Solo espacios cuenta como vacío; mensaje claro | T015, T018 | T012, T014 |
| **FR-004** Rechazar duplicados (sin distinguir mayúsculas, espacios normalizados) | T015, T016 | T012, T014, T034 |
| **FR-005** Lista estable y ordenada que distingue cumplidos hoy | T016 (`sortHabits`), T019, T028 | T013, T023, T030 |
| **FR-006** Solo el día actual es editable | T025, T026, T027, T028 | T022, T023, T034 |
| **FR-007** Racha actual y mejor racha; hoy sin marcar queda pendiente | T024, T028 | T021, T023, T034 |
| **FR-008** Conservar datos al recargar | T031, T033 | T029, T030, T034 |
| **FR-009** Recuperarse de datos ausentes o dañados | T031, T032, T033 | T029, T030, T034 |
| **FR-010** Sin edición, eliminación, recordatorios, notificaciones ni cuentas | Alcance de todas las tareas | T030 |

## Criterios de éxito

| Criterio | Requisitos | Tareas |
|---|---|---|
| **SC-001** Crear un hábito y verlo en la lista en menos de 30 s | FR-001, FR-002 | T018, T020, T034 |
| **SC-002** Los envíos inválidos indican el dato exacto a corregir | FR-002, FR-003, FR-004 | T012, T014, T015, T018 |
| **SC-003** Todo se restaura tras recargar | FR-008 | T029, T030, T033, T034 |
| **SC-004** Se ve de un vistazo qué está cumplido hoy y las rachas | FR-005, FR-007 | T023, T028 |
| **SC-005** Usable con datos ausentes o dañados | FR-009 | T029, T030, T032, T034 |
