# Informe de laboratorio — Fases 3.3 y 3.4
## Proyecto: Seguimiento de hábitos diarios
### LAB_TAIS | Ingeniería de Sistemas

---

> **Nota sobre el informe original**: No se tuvo acceso al archivo de instrucciones del docente ni al informe base del curso durante la elaboración de este documento. Los títulos de sección y la estructura académica siguen las convenciones habituales de un informe de Ingeniería de Sistemas. Si el informe original del profesor establece una numeración, estilo o estructura diferente, este documento debe ajustarse antes de su entrega.

---

## 3.3 FASE 2: Planificación técnica (Plan)

### Objetivo de la fase

La planificación técnica tiene como propósito traducir los requisitos funcionales de la especificación hacia una propuesta de solución concreta: definir las tecnologías a emplear, organizar la arquitectura de la aplicación, establecer el modelo de datos, delinear la estrategia de almacenamiento y pruebas, e identificar los riesgos y decisiones pendientes antes de comenzar la implementación. El artefacto principal de esta fase es el archivo `plan.md`.

### Procedimiento realizado

1. Se leyó en su totalidad el archivo `specs/001-habit-tracker/spec.md`, que contiene los diez requisitos funcionales (FR-001 a FR-010), los tres escenarios de usuario, los cinco criterios de éxito (SC-001 a SC-005) y los casos límite del sistema.
2. Se revisó la constitución del proyecto en `.specify/memory/constitution.md` (versión 1.1.0), que establece los principios de simplicidad de alcance, validación de datos, persistencia local, modularidad y calidad verificable.
3. Se verificó la ausencia de código de implementación en el repositorio. En consecuencia, las decisiones tecnológicas se formularon como propuestas, y no como decisiones tomadas.
4. Se creó el archivo `specs/001-habit-tracker/plan.md` con once secciones que cubren desde el objetivo hasta los riesgos técnicos.

### Decisiones tecnológicas y justificación

Dado que no existe implementación en el repositorio al momento de este informe, todas las decisiones tecnológicas constituyen propuestas fundamentadas en los principios de la constitución y en los requisitos del `spec.md`.

| Tecnología | Rol en el sistema | Justificación |
|---|---|---|
| HTML5 | Estructura de la interfaz de usuario | Estándar web, permite semántica accesible sin dependencias externas |
| CSS3 con diseño responsive | Presentación y adaptabilidad de pantalla | Soporte nativo de media queries; cumple la restricción de diseño responsive sin bibliotecas adicionales |
| JavaScript (ES2020+) con módulos ES | Lógica de negocio, interfaz e integración con localStorage | Lenguaje nativo del navegador; los módulos ES permiten separar responsabilidades sin paso de compilación obligatorio |
| API localStorage del navegador | Persistencia de datos del usuario | API nativa; cubre directamente los requisitos FR-008 y FR-009 sin dependencias de terceros |
| Vitest o Jest (propuesto) | Pruebas unitarias e integración | Compatibles con módulos ES; permiten probar funciones puras de dominio de forma aislada |

Se descartaron frameworks frontend (React, Vue, Svelte) porque el principio I de la constitución establece simplicidad de alcance y ausencia de dependencias externas. Igualmente, TypeScript se consideró opcional para versiones futuras, dado que añade complejidad de configuración innecesaria para la escala de v1.

### Arquitectura y organización de componentes

Se propone una arquitectura de **tres capas separadas** en el cliente, alineada con el principio IV de la constitución (la lógica de negocio debe vivir en funciones puras separadas de la interfaz y del almacenamiento):

**Capa de interfaz (UI):** `index.html`, `css/main.css`, `js/ui.js`. Responsable del renderizado, la gestión de eventos y la visualización de mensajes de error. No contiene reglas de negocio.

**Capa de dominio (lógica de negocio):** `js/habits.js`, `js/streaks.js`, `js/validation.js`. Contiene funciones puras para crear hábitos, validar entradas, marcar el día actual, calcular rachas y detectar duplicados. No accede al DOM ni a localStorage.

**Capa de persistencia (storage):** `js/storage.js`. Encapsula la lectura y escritura en localStorage con manejo defensivo de errores, de modo que datos ausentes o corruptos no bloqueen la aplicación (FR-009).

El flujo de información es unidireccional: la UI llama al dominio; el dominio no llama a la UI; `storage.js` es invocado por la UI luego de cada operación de escritura y al iniciar la aplicación.

### Artefactos generados

- `specs/001-habit-tracker/plan.md`: documento de planificación técnica con once secciones, incluyendo objetivo, alcance, tecnologías propuestas, arquitectura, modelo de datos, estrategia de almacenamiento, validaciones, pruebas, accesibilidad y riesgos.

### Resultado de la planificación

La fase produjo una propuesta técnica coherente con los requisitos del `spec.md` y con los principios de la constitución. Se identificaron cinco decisiones que permanecen pendientes y deben resolverse durante la implementación: el formato del identificador único de hábito, el nombre de la clave en localStorage, el framework de pruebas definitivo, el criterio de ordenación de la lista y el tratamiento del cambio de día cuando la aplicación está abierta a medianoche. La ausencia de eliminación de hábitos se registra como deuda técnica para una versión futura (v2), no como decisión pendiente de implementación en v1.

---

## 3.4 FASE 3: Organización de tareas (Tasks)

### Objetivo de la fase

La organización de tareas traduce el plan técnico en unidades de trabajo verificables, ordenadas por dependencias y clasificadas por historia de usuario. El propósito es proporcionar una guía clara para la implementación, de manera que cada tarea tenga un criterio observable de finalización, un requisito funcional que la respalde y una relación explícita con la historia de usuario a la que pertenece. El artefacto principal es `tasks.md`.

### Procedimiento realizado

1. Se identificaron las historias de usuario del `spec.md` y se les asignaron los identificadores HU1 (registro de hábitos), HU2 (validación de datos), HU3 (cumplimiento diario y rachas) y HU4 (persistencia y recuperación).

   > **Nota sobre la correspondencia con el spec**: el `spec.md` define tres historias de usuario ("User Story 1", "User Story 2" y "User Story 3"). La "User Story 1" engloba tanto el registro (FR-001, FR-002) como las validaciones de datos (FR-003, FR-004). En este informe esas dos capacidades se desglosan en HU1 y HU2 respectivamente, para facilitar la trazabilidad entre tareas y requisitos. Esta separación no modifica los requisitos originales del spec; solo organiza el trabajo de implementación con mayor granularidad.
2. Se identificaron los requisitos funcionales vinculados a cada historia: HU1 → FR-001, FR-002; HU2 → FR-002, FR-003, FR-004; HU3 → FR-005, FR-006, FR-007; HU4 → FR-008, FR-009.
3. Se descompusieron las funcionalidades en tareas atómicas pero no excesivamente pequeñas, agrupando actividades relacionadas cuando compartían el mismo contexto funcional.
4. Se organizaron las tareas en seis bloques: preparación técnica, registro de hábitos, validaciones, cumplimiento y rachas, persistencia, e integración y pruebas generales.
5. Se establecieron las dependencias entre tareas para garantizar que ninguna tarea de implementación aparezca antes de las que la preceden lógicamente.
6. Se incluyeron tareas de prueba para cada caso de aceptación y caso límite identificado en el `spec.md`.

### Criterios utilizados para descomponer y ordenar las tareas

- **Atomicidad útil**: cada tarea produce un resultado verificable por sí misma, sin dividirse en pasos tan pequeños que pierdan significado por separado.
- **Separación por capa**: las tareas de dominio, interfaz y persistencia se separaron para respetar la arquitectura propuesta.
- **Cobertura de pruebas**: toda funcionalidad implementada tiene al menos una tarea de prueba correspondiente.
- **Orden de dependencias**: las tareas que producen funcionalidades que otras necesitan aparecen antes en la lista. Por ejemplo, T002 (modelo de datos) precede a T003 (función de creación), que precede a T004 (formulario de interfaz).
- **Sin tareas completadas ficticiamente**: ninguna tarea fue marcada como terminada, porque no existe evidencia de implementación en el repositorio.

### Cantidad total de tareas y distribución por historia de usuario

El archivo `tasks.md` contiene **25 tareas**, distribuidas de la siguiente manera:

| Historia de usuario | Tareas | Cantidad |
|---|---|---|
| HU1 — Registro de hábitos | T003, T004, T005, T006 | 4 |
| HU2 — Validación de datos | T007, T008, T009, T010, T011 | 5 |
| HU3 — Cumplimiento y rachas | T012, T013, T014, T015, T016, T017 | 6 |
| HU4 — Persistencia y recuperación | T018, T019, T020, T021, T022 | 5 |
| Preparación técnica (transversal) | T001, T002 | 2 |
| Integración y pruebas generales (transversal) | T023, T024, T025 | 3 |
| **Total** | | **25** |

Por tipo de actividad:

| Tipo | Cantidad |
|---|---|
| Implementación | 14 |
| Prueba | 8 |
| Integración | 2 |
| Documentación | 1 |
| **Total** | **25** |

### Dependencias principales

Las dependencias más relevantes que determinan el orden de ejecución son:

- **T001 → T002**: el modelo de datos solo puede definirse sobre la estructura de archivos creada.
- **T002 → T003, T018**: tanto la creación de hábitos como la escritura en localStorage dependen del modelo de datos.
- **T003, T007 → T009**: la conexión de validaciones con el formulario requiere que existan tanto la función de creación como las funciones de validación.
- **T003, T002 → T014**: el cálculo de rachas depende del modelo `completionHistory` definido en T002.
- **T018, T019 → T020**: la integración de persistencia requiere que ambas funciones (lectura y escritura) estén implementadas.
- **T006, T011, T017, T020, T022 → T023**: la integración final depende de que todas las funcionalidades individuales estén al menos prototipadas.

### Relación entre historias, actividades y requisitos

Cada tarea de `tasks.md` incluye el identificador de la historia de usuario a la que pertenece y el o los requisitos funcionales del `spec.md` que permite verificar. Esta trazabilidad se documenta en detalle en el archivo `specs/001-habit-tracker/traceability.md`.

La tabla de trazabilidad confirma que todos los requisitos FR-001 a FR-010 y todos los criterios de éxito SC-001 a SC-005 tienen al menos una tarea que los respaldan, y que todos los casos límite del spec tienen una tarea de implementación y una de prueba correspondientes.

### Artefactos generados y resultado de la fase

Los artefactos producidos en la fase de organización de tareas son:

- `specs/001-habit-tracker/tasks.md`: 25 tareas organizadas en 6 bloques, con identificadores T001–T025, criterios verificables, dependencias y clasificación por tipo.
- `specs/001-habit-tracker/traceability.md`: tabla de trazabilidad que vincula cada historia de usuario con sus tareas, requisitos y criterios de éxito.

La organización de tareas garantiza una ruta de implementación coherente con la arquitectura propuesta en `plan.md` y completamente respaldada en los requisitos del `spec.md`. Ninguna funcionalidad fuera del alcance definido en FR-010 fue incluida como tarea.

---

## Tabla de trazabilidad

El archivo completo de trazabilidad se encuentra en:

**`specs/001-habit-tracker/traceability.md`**

A continuación se reproduce la tabla principal:

| Historia de usuario | Tareas relacionadas | Requisitos vinculados | Verificación esperada |
|---|---|---|---|
| **HU1** — Registrar un hábito | T002, T003, T004, T005, T006 | FR-001, FR-002 | Hábito con nombre, categoría y fecha aparece en la lista; formulario conectado a la lógica de dominio (SC-001) |
| **HU2** — Validar datos de entrada | T007, T008, T009, T010, T011 | FR-002, FR-003, FR-004 | Campos vacíos/solo espacios y nombres duplicados son rechazados con mensaje claro por campo (SC-002) |
| **HU3** — Marcar cumplimiento y ver rachas | T005, T012, T013, T014, T015, T016, T017 | FR-005, FR-006, FR-007 | Día actual marcable; pasados/futuros solo lectura; rachas calculadas correctamente; hoy sin marcar no rompe racha (SC-004) |
| **HU4** — Persistencia y recuperación local | T018, T019, T020, T021, T022 | FR-008, FR-009 | Datos persisten tras recarga; localStorage vacío o corrupto devuelve estado vacío sin error bloqueante (SC-003, SC-005) |

---

## Limitaciones y observaciones

- No se tuvo acceso al informe original del curso ni a las instrucciones del docente. La estructura de este documento sigue convenciones académicas generales y puede requerir ajustes de formato o numeración.
- No existe código de implementación en el repositorio. Todas las decisiones tecnológicas en `plan.md` son propuestas y deben verificarse contra la implementación real una vez que esta se produzca.
- Las tareas en `tasks.md` no han sido ejecutadas. Ninguna fue marcada como completada porque no hay evidencia de trabajo realizado.
- La tarea T025 establece explícitamente que `plan.md` debe actualizarse con las decisiones concretas tomadas durante la implementación.
