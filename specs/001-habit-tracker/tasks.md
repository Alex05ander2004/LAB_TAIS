# Organización de tareas: Seguimiento de hábitos diarios

**Branch**: `001-habit-tracker`
**Fecha**: 2026-10-29
**Plan**: [plan.md](plan.md)
**Spec**: [spec.md](spec.md)
**Estado**: Planificación — ninguna tarea ha sido ejecutada ni marcada como completada

---

## Convenciones

- **HU**: Historia de usuario (HU1 = Registrar hábito, HU2 = Validar datos, HU3 = Marcar cumplimiento y rachas, HU4 = Persistencia y recuperación)
- **FR**: Requisito funcional del `spec.md`
- **Tipo**: `impl` = implementación, `prueba` = prueba funcional/técnica, `doc` = documentación, `integ` = integración
- **Estado**: Todas las tareas están en estado **pendiente**

---

## Bloque 0 — Preparación técnica

### T001 — Definir la estructura de carpetas y archivos del proyecto

| Campo | Valor |
|---|---|
| **HU relacionada** | Transversal |
| **Requisitos vinculados** | FR-010 (alcance limitado), constitución principio IV (modularidad) |
| **Dependencias** | Ninguna |
| **Tipo** | impl |
| **Criterio de finalización** | Existe la estructura de carpetas propuesta en `plan.md` (sección 4 y 5): `index.html`, `css/main.css`, `js/validation.js`, `js/habits.js`, `js/streaks.js`, `js/storage.js`, `js/ui.js` |

**Descripción**: Crear la estructura de directorios y los archivos vacíos (esqueleto) del proyecto siguiendo la arquitectura de tres capas propuesta en el `plan.md`. Definir también la configuración base del framework de pruebas (Vitest o Jest).

---

### T002 — Definir el modelo de datos y la clave de localStorage

| Campo | Valor |
|---|---|
| **HU relacionada** | HU1, HU4 |
| **Requisitos vinculados** | FR-001, FR-008 |
| **Dependencias** | T001 |
| **Tipo** | impl |
| **Criterio de finalización** | Existe un tipo o estructura documentada para `Habit` con los campos `id`, `name`, `category`, `startDate` y `completionHistory`. La clave de localStorage está definida como constante en `storage.js`. |

**Descripción**: Implementar la definición del modelo `Habit` (como clase, objeto tipado o esquema) y las constantes de configuración de almacenamiento. Establecer el formato de `completionHistory` (arreglo de fechas ISO 8601).

---

## Bloque 1 — HU1: Registro de hábitos

### T003 — Implementar la función de creación de un hábito válido

| Campo | Valor |
|---|---|
| **HU relacionada** | HU1 |
| **Requisitos vinculados** | FR-001, FR-002 |
| **Dependencias** | T002 |
| **Tipo** | impl |
| **Criterio de finalización** | Existe una función en `habits.js` que recibe nombre, categoría y fecha de inicio y devuelve un objeto `Habit` válido con un `id` único generado. |

**Descripción**: Implementar la función pura `createHabit(name, category, startDate)` en la capa de dominio. No debe incluir lógica de interfaz ni de almacenamiento.

---

### T004 — Implementar la interfaz del formulario de registro

| Campo | Valor |
|---|---|
| **HU relacionada** | HU1 |
| **Requisitos vinculados** | FR-001, FR-002 |
| **Dependencias** | T003 |
| **Tipo** | impl |
| **Criterio de finalización** | El formulario en `index.html` / `ui.js` permite ingresar nombre, categoría y fecha de inicio. El botón de guardar es funcional y llama a la lógica de dominio. |

**Descripción**: Construir el formulario HTML con sus tres campos y el botón de guardar. Conectar el evento de envío con la función `createHabit` y la actualización de la lista visible.

---

### T005 — Implementar la visualización de la lista de hábitos

| Campo | Valor |
|---|---|
| **HU relacionada** | HU1, HU3 |
| **Requisitos vinculados** | FR-005 |
| **Dependencias** | T003, T004 |
| **Tipo** | impl |
| **Criterio de finalización** | La lista muestra todos los hábitos guardados en un orden estable. Cada elemento distingue visualmente si el hábito ya fue cumplido hoy o no. |

**Descripción**: Implementar en `ui.js` la función de renderizado de la lista de hábitos. Aplicar los estilos CSS necesarios para diferenciar hábitos cumplidos y no cumplidos hoy (FR-005). Mantener la lista ordenada de forma estable.

---

### T006 — Probar el flujo de registro de un hábito válido

| Campo | Valor |
|---|---|
| **HU relacionada** | HU1 |
| **Requisitos vinculados** | FR-001, FR-002 |
| **Dependencias** | T003, T004, T005 |
| **Tipo** | prueba |
| **Criterio de finalización** | Existe una prueba que crea un hábito con nombre, categoría y fecha de inicio válidos y verifica que aparece en la lista (escenario de aceptación 1 de la HU1 del spec). |

**Descripción**: Escribir la prueba del escenario de aceptación principal: "Given una persona completa todos los campos válidos, When envía el formulario, Then el hábito aparece en la lista".

---

## Bloque 2 — HU2: Validación de datos

### T007 — Implementar validaciones de campos obligatorios y texto vacío

| Campo | Valor |
|---|---|
| **HU relacionada** | HU2 |
| **Requisitos vinculados** | FR-002, FR-003 |
| **Dependencias** | T002 |
| **Tipo** | impl |
| **Criterio de finalización** | Existe una función en `validation.js` que detecta campos vacíos o con solo espacios en nombre, categoría y fecha de inicio, y devuelve los mensajes de error correspondientes. |

**Descripción**: Implementar `validateHabitInput(name, category, startDate)` en `validation.js`. La función debe aplicar `trim()` y verificar longitud para detectar textos de solo espacios. Debe devolver un objeto o lista de errores por campo.

---

### T008 — Implementar validación de nombres duplicados

| Campo | Valor |
|---|---|
| **HU relacionada** | HU2 |
| **Requisitos vinculados** | FR-004 |
| **Dependencias** | T007 |
| **Tipo** | impl |
| **Criterio de finalización** | Existe una función en `validation.js` o `habits.js` que compara el nombre nuevo con los existentes usando `trim().replace(/\s+/g,' ').toLowerCase()` y devuelve un error si hay coincidencia. |

**Descripción**: Implementar `isDuplicateName(name, existingHabits)`. La normalización debe aplicarse tanto al nombre nuevo como a cada nombre en la lista existente antes de comparar.

---

### T009 — Conectar validaciones con el formulario y mostrar mensajes de error

| Campo | Valor |
|---|---|
| **HU relacionada** | HU2 |
| **Requisitos vinculados** | FR-002, FR-003, FR-004 |
| **Dependencias** | T007, T008, T004 |
| **Tipo** | impl |
| **Criterio de finalización** | Cuando el formulario se envía con datos inválidos o duplicados, la interfaz muestra un mensaje claro indicando el campo que debe corregirse y no guarda el hábito. |

**Descripción**: Integrar las funciones de `validation.js` con el manejador de envío del formulario en `ui.js`. Implementar la visualización de mensajes de error junto a cada campo. Los mensajes deben ser accesibles (asociados al campo mediante `aria-describedby` o equivalente).

---

### T010 — Probar validación de campos obligatorios y texto de solo espacios

| Campo | Valor |
|---|---|
| **HU relacionada** | HU2 |
| **Requisitos vinculados** | FR-002, FR-003 |
| **Dependencias** | T007, T009 |
| **Tipo** | prueba |
| **Criterio de finalización** | Existen pruebas que verifican: (a) nombre vacío → error, (b) categoría vacía → error, (c) fecha vacía → error, (d) nombre con solo espacios → tratado como vacío. |

**Descripción**: Escribir pruebas unitarias para `validateHabitInput` cubriendo los casos de campos vacíos y texto compuesto exclusivamente por espacios en cada campo obligatorio.

---

### T011 — Probar validación de nombres duplicados

| Campo | Valor |
|---|---|
| **HU relacionada** | HU2 |
| **Requisitos vinculados** | FR-004 |
| **Dependencias** | T008, T009 |
| **Tipo** | prueba |
| **Criterio de finalización** | Existen pruebas que verifican: (a) nombre exactamente igual → rechazado, (b) mismo nombre con distinta capitalización → rechazado, (c) mismo nombre con espacios redundantes → rechazado (escenarios 2 y 3 de HU1 del spec). |

**Descripción**: Escribir pruebas unitarias para `isDuplicateName` cubriendo los tres casos del spec: capitalización distinta, espacios redundantes y nombre idéntico.

---

## Bloque 3 — HU3: Cumplimiento diario y rachas

### T012 — Implementar el marcado y desmarcado del día actual

| Campo | Valor |
|---|---|
| **HU relacionada** | HU3 |
| **Requisitos vinculados** | FR-006 |
| **Dependencias** | T003 |
| **Tipo** | impl |
| **Criterio de finalización** | Existe una función en `habits.js` que agrega o elimina la fecha del día actual en `completionHistory` de un hábito dado. La función no modifica fechas pasadas ni futuras. |

**Descripción**: Implementar `toggleCompletion(habit, date)` en `habits.js`. La función debe verificar que la fecha recibida es la del día actual antes de modificar el historial. Si la fecha es pasada o futura, debe devolver el hábito sin cambios o lanzar un error controlado.

---

### T013 — Implementar la restricción de edición de días pasados y futuros

| Campo | Valor |
|---|---|
| **HU relacionada** | HU3 |
| **Requisitos vinculados** | FR-006 |
| **Dependencias** | T012 |
| **Tipo** | impl |
| **Criterio de finalización** | La interfaz muestra los días pasados en modo solo lectura. El botón o control de marcado para días pasados y futuros está deshabilitado o no existe. |

**Descripción**: Implementar en `ui.js` la lógica de renderizado que deshabilita la interacción para fechas distintas al día actual. Usar atributo `disabled` o eliminación del evento según el diseño adoptado.

---

### T014 — Implementar el cálculo de racha actual y mejor racha

| Campo | Valor |
|---|---|
| **HU relacionada** | HU3 |
| **Requisitos vinculados** | FR-007 |
| **Dependencias** | T002 |
| **Tipo** | impl |
| **Criterio de finalización** | Existe una función en `streaks.js` que recibe `completionHistory` y la fecha actual, y devuelve `{ currentStreak, bestStreak }`. Si hoy no está marcado, la racha actual se calcula hasta el último día consecutivo completado antes de hoy. |

**Descripción**: Implementar `calculateStreaks(completionHistory, today)` en `streaks.js`. La función debe ordenar las fechas, calcular secuencias consecutivas y aplicar la regla del spec: "hoy sin marcar no rompe la racha hasta el inicio del siguiente día" (aclaración de la sesión 2026-10-29 del spec).

---

### T015 — Mostrar racha actual y mejor racha en la lista

| Campo | Valor |
|---|---|
| **HU relacionada** | HU3 |
| **Requisitos vinculados** | FR-007, FR-005 |
| **Dependencias** | T014, T005 |
| **Tipo** | impl |
| **Criterio de finalización** | Cada elemento de la lista muestra la racha actual y la mejor racha del hábito correspondiente, actualizadas al marcar o desmarcar el día actual. |

**Descripción**: Integrar `calculateStreaks` en el renderizado de cada ítem de la lista en `ui.js`. Las rachas deben actualizarse dinámicamente tras cada cambio de estado.

---

### T016 — Probar marcado del día actual y restricción de días pasados/futuros

| Campo | Valor |
|---|---|
| **HU relacionada** | HU3 |
| **Requisitos vinculados** | FR-006 |
| **Dependencias** | T012, T013 |
| **Tipo** | prueba |
| **Criterio de finalización** | Existen pruebas que verifican: (a) marcar hoy agrega la fecha al historial, (b) desmarcar hoy la elimina, (c) intentar marcar un día pasado no modifica el historial (escenario 4 de HU2 del spec). |

**Descripción**: Escribir pruebas unitarias para `toggleCompletion` cubriendo el marcado exitoso del día actual, el desmarcado y el bloqueo para fechas pasadas y futuras.

---

### T017 — Probar el cálculo de rachas

| Campo | Valor |
|---|---|
| **HU relacionada** | HU3 |
| **Requisitos vinculados** | FR-007 |
| **Dependencias** | T014 |
| **Tipo** | prueba |
| **Criterio de finalización** | Existen pruebas que verifican: (a) racha correcta con varios días consecutivos, (b) racha correcta cuando hoy no está marcado (no se rompe), (c) mejor racha calculada correctamente sobre historial con interrupciones (escenarios 1, 2 y 3 de HU2 del spec). |

**Descripción**: Escribir pruebas unitarias para `calculateStreaks` con distintos estados del historial: racha continua, día de hoy sin marcar, mejor racha con interrupciones.

---

## Bloque 4 — HU4: Persistencia y recuperación

### T018 — Implementar la escritura de datos en localStorage

| Campo | Valor |
|---|---|
| **HU relacionada** | HU4 |
| **Requisitos vinculados** | FR-008 |
| **Dependencias** | T002 |
| **Tipo** | impl |
| **Criterio de finalización** | Existe una función en `storage.js` que serializa la lista de hábitos con `JSON.stringify` y la escribe en la clave definida de localStorage. |

**Descripción**: Implementar `saveHabits(habits)` en `storage.js`. La función se invoca después de cada operación que modifica el estado (crear hábito, marcar/desmarcar día).

---

### T019 — Implementar la lectura y recuperación defensiva desde localStorage

| Campo | Valor |
|---|---|
| **HU relacionada** | HU4 |
| **Requisitos vinculados** | FR-008, FR-009 |
| **Dependencias** | T018 |
| **Tipo** | impl |
| **Criterio de finalización** | Existe una función en `storage.js` que lee la clave de localStorage, intenta deserializar con `JSON.parse` dentro de un `try/catch`, y devuelve un arreglo vacío si los datos no existen, están corruptos o no tienen la estructura esperada. |

**Descripción**: Implementar `loadHabits()` en `storage.js` siguiendo el flujo defensivo descrito en el `plan.md` (sección 7). La función no debe lanzar excepciones al código llamante.

---

### T020 — Integrar la persistencia con el ciclo de vida de la aplicación

| Campo | Valor |
|---|---|
| **HU relacionada** | HU4 |
| **Requisitos vinculados** | FR-008 |
| **Dependencias** | T018, T019, T012, T003 |
| **Tipo** | integ |
| **Criterio de finalización** | Al crear un hábito o marcar el día, `saveHabits` se invoca automáticamente. Al cargar la página, `loadHabits` recupera el estado previo y la lista se renderiza con los datos guardados. |

**Descripción**: Conectar `storage.js` con `ui.js` para que toda operación de escritura persista el estado y la inicialización de la aplicación cargue el estado guardado. Verificar que no se llama a `saveHabits` innecesariamente (por ejemplo, en lecturas puras).

---

### T021 — Probar la persistencia del estado tras recarga

| Campo | Valor |
|---|---|
| **HU relacionada** | HU4 |
| **Requisitos vinculados** | FR-008 |
| **Dependencias** | T018, T019, T020 |
| **Tipo** | prueba |
| **Criterio de finalización** | Existe una prueba que simula guardar hábitos y marcas de cumplimiento, y verifica que `loadHabits` devuelve el mismo estado (escenario 1 de HU3 del spec). |

**Descripción**: Escribir una prueba de integración para el ciclo guardar → recargar → leer, usando un mock de `localStorage`.

---

### T022 — Probar la recuperación ante datos ausentes o corruptos

| Campo | Valor |
|---|---|
| **HU relacionada** | HU4 |
| **Requisitos vinculados** | FR-009 |
| **Dependencias** | T019 |
| **Tipo** | prueba |
| **Criterio de finalización** | Existen pruebas que verifican: (a) `loadHabits` con localStorage vacío devuelve `[]`, (b) `loadHabits` con JSON corrupto devuelve `[]` sin lanzar error (escenario 2 de HU3 y caso límite del spec). |

**Descripción**: Escribir pruebas unitarias para `loadHabits` con localStorage vacío y con un valor corrupto (cadena que no es JSON válido).

---

## Bloque 5 — Integración y pruebas generales

### T023 — Integrar los módulos y verificar el flujo completo de la aplicación

| Campo | Valor |
|---|---|
| **HU relacionada** | HU1, HU2, HU3, HU4 |
| **Requisitos vinculados** | FR-001 a FR-009 |
| **Dependencias** | T006, T011, T017, T020, T022 |
| **Tipo** | integ |
| **Criterio de finalización** | La aplicación completa puede ejecutarse en un navegador: permite crear un hábito, validar errores, marcar el día, ver rachas y recargar conservando los datos, sin errores en consola. |

**Descripción**: Integrar todos los módulos en `index.html` y `js/ui.js`. Verificar que no existen dependencias circulares ni errores de importación. Realizar una revisión manual del flujo end-to-end.

---

### T024 — Verificar el diseño responsive y la accesibilidad básica

| Campo | Valor |
|---|---|
| **HU relacionada** | Transversal |
| **Requisitos vinculados** | FR-005, FR-006, constitución principios IV y V |
| **Dependencias** | T023 |
| **Tipo** | prueba |
| **Criterio de finalización** | La aplicación es usable en pantallas desde 320 px de ancho. Los campos del formulario tienen etiquetas asociadas. Los mensajes de error son accesibles. El contraste visual es legible. |

**Descripción**: Revisar la interfaz en las herramientas de desarrollo del navegador a anchos de 320, 768 y 1280 px. Verificar semántica HTML (etiquetas, `for`, roles). Ejecutar una comprobación básica de contraste.

---

### T025 — Documentar el resultado del plan y las decisiones tomadas durante la implementación

| Campo | Valor |
|---|---|
| **HU relacionada** | Transversal |
| **Requisitos vinculados** | Constitución principio V |
| **Dependencias** | T023 |
| **Tipo** | doc |
| **Criterio de finalización** | Las decisiones pendientes señaladas en `plan.md` (sección 11) están resueltas y documentadas: formato de ID, clave de localStorage, framework de pruebas y criterio de ordenación de la lista. |

**Descripción**: Actualizar `plan.md` con las decisiones tomadas durante la implementación para mantener coherencia entre la documentación y el código producido.

---

## Resumen de tareas

| ID | Descripción breve | HU | Tipo |
|---|---|---|---|
| T001 | Estructura de carpetas y archivos | Transversal | impl |
| T002 | Modelo de datos y clave de localStorage | HU1, HU4 | impl |
| T003 | Función de creación de hábito | HU1 | impl |
| T004 | Interfaz del formulario de registro | HU1 | impl |
| T005 | Visualización de la lista de hábitos | HU1, HU3 | impl |
| T006 | Prueba: registro de hábito válido | HU1 | prueba |
| T007 | Validaciones de campos obligatorios y texto vacío | HU2 | impl |
| T008 | Validación de nombres duplicados | HU2 | impl |
| T009 | Conexión de validaciones con formulario y mensajes de error | HU2 | impl |
| T010 | Prueba: campos obligatorios y solo espacios | HU2 | prueba |
| T011 | Prueba: nombres duplicados | HU2 | prueba |
| T012 | Marcado y desmarcado del día actual | HU3 | impl |
| T013 | Restricción de edición de días pasados y futuros | HU3 | impl |
| T014 | Cálculo de racha actual y mejor racha | HU3 | impl |
| T015 | Mostrar rachas en la lista | HU3 | impl |
| T016 | Prueba: marcado del día actual y restricción de días | HU3 | prueba |
| T017 | Prueba: cálculo de rachas | HU3 | prueba |
| T018 | Escritura en localStorage | HU4 | impl |
| T019 | Lectura y recuperación defensiva de localStorage | HU4 | impl |
| T020 | Integración de persistencia con el ciclo de vida | HU4 | integ |
| T021 | Prueba: persistencia tras recarga | HU4 | prueba |
| T022 | Prueba: datos ausentes o corruptos | HU4 | prueba |
| T023 | Integración y flujo completo | HU1–HU4 | integ |
| T024 | Diseño responsive y accesibilidad básica | Transversal | prueba |
| T025 | Documentar decisiones de implementación | Transversal | doc |

**Total de tareas: 25**

### Distribución por historia de usuario

| HU | Tareas | Cantidad |
|---|---|---|
| HU1 — Registro de hábitos | T003, T004, T005, T006 | 4 |
| HU2 — Validaciones | T007, T008, T009, T010, T011 | 5 |
| HU3 — Cumplimiento y rachas | T012, T013, T014, T015, T016, T017 | 6 |
| HU4 — Persistencia y recuperación | T018, T019, T020, T021, T022 | 5 |
| Preparación técnica (transversal) | T001, T002 | 2 |
| Integración y pruebas generales (transversal) | T023, T024, T025 | 3 |
| **Total** | | **25** |

### Distribución por tipo de actividad

| Tipo | Tareas | Cantidad |
|---|---|---|
| Implementación | T001, T002, T003, T004, T005, T007, T008, T009, T012, T013, T014, T015, T018, T019 | 14 |
| Prueba | T006, T010, T011, T016, T017, T021, T022, T024 | 8 |
| Integración | T020, T023 | 2 |
| Documentación | T025 | 1 |
