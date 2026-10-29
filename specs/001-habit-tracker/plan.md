# Plan de implementación: Seguimiento de hábitos diarios

**Branch**: `001-habit-tracker`
**Fecha**: 2026-10-29
**Spec**: [spec.md](spec.md)
**Constitución**: [constitution.md](../../.specify/memory/constitution.md)
**Estado**: Propuesta de planificación — pendiente de implementación

---

## 1. Objetivo y resumen de la solución

El objetivo es construir una aplicación web local que permita a una persona registrar hábitos diarios, marcar su cumplimiento cada día, visualizar su racha actual y su mejor racha, y conservar toda esa información en el navegador sin necesidad de servidor.

La solución es una aplicación de una sola página (SPA) que opera completamente en el cliente. No requiere autenticación, conexión a internet ni persistencia remota. El almacenamiento se realiza en `localStorage` del navegador. La interfaz se presenta en español y debe funcionar de forma adecuada en dispositivos móviles, tabletas y escritorios.

El alcance se limita al registro, validación, seguimiento diario y persistencia de hábitos. Quedan fuera de esta versión la edición, eliminación, notificaciones, recordatorios y cuentas de usuario.

---

## 2. Alcance y restricciones

### En alcance (v1)

| Capacidad | Requisito relacionado |
|---|---|
| Registrar un hábito con nombre, categoría y fecha de inicio | FR-001, FR-002 |
| Validar campos obligatorios y rechazar entradas vacías o de solo espacios | FR-002, FR-003 |
| Rechazar nombres duplicados (insensible a mayúsculas, con normalización de espacios) | FR-004 |
| Mostrar la lista de hábitos distinguiendo cumplidos y no cumplidos hoy | FR-005 |
| Marcar o desmarcar el día actual como cumplido | FR-006 |
| Calcular y mostrar la racha actual y la mejor racha de cada hábito | FR-007 |
| Preservar hábitos e historial de cumplimiento al recargar o cerrar el navegador | FR-008 |
| Recuperarse de datos ausentes o corruptos en localStorage | FR-009 |

### Fuera de alcance (v1)

- Edición y eliminación de hábitos
- Marcado de días pasados o futuros (FR-006, FR-010)
- Notificaciones y recordatorios
- Cuentas de usuario y sincronización remota
- Estadísticas avanzadas, gráficas o exportación de datos

### Restricciones técnicas

- Funcionamiento completamente en el navegador, sin servidor
- Almacenamiento exclusivo en `localStorage`
- Fechas tratadas en la zona horaria local del usuario
- Interfaz en español
- Diseño responsive (móvil, tableta, escritorio)

---

## 3. Tecnologías utilizadas y justificación

> **Nota**: No existe código de implementación en el repositorio al momento de este plan. Las tecnologías descritas a continuación son **propuestas** basadas en la constitución del proyecto, los requisitos del `spec.md` y el principio de simplicidad de alcance definido en el principio I de la constitución. Ninguna ha sido verificada como implementada.

### Tecnologías principales propuestas

| Tecnología | Rol | Justificación |
|---|---|---|
| HTML5 | Estructura de la interfaz | Estándar web, sin dependencias externas, permite semántica accesible |
| CSS3 con diseño responsive | Presentación y adaptación de pantalla | Soporte nativo de media queries; cumple la restricción de diseño responsive sin bibliotecas adicionales |
| JavaScript (ES2020+) | Lógica de negocio, interfaz e integración con localStorage | Lenguaje nativo del navegador; permite separar lógica en módulos ES sin compilación obligatoria |
| localStorage API | Persistencia de datos | API nativa del navegador; cumple directamente los requisitos FR-008 y FR-009 sin dependencias de terceros |

### Alternativas consideradas

- **Framework frontend (React, Vue, Svelte)**: No se propone para v1 porque la constitución establece simplicidad de alcance y ausencia de dependencias externas. Un framework añade un paso de compilación que no es necesario para la complejidad actual.
- **IndexedDB**: Capacidad superior a la necesaria; `localStorage` es suficiente para el volumen de datos de esta aplicación.
- **TypeScript**: Puede adoptarse en iteraciones futuras para mayor seguridad de tipos, pero no es un requisito de v1 y añadiría fricción en el arranque.

### Herramientas de prueba propuestas

| Herramienta | Rol | Justificación |
|---|---|---|
| Vitest o Jest | Pruebas unitarias de la lógica de negocio | Compatibles con módulos ES; permiten aislar funciones puras de la interfaz |
| Testing Library o simulación manual | Pruebas de integración de la interfaz | Verificación de flujos completos sin servidor |

---

## 4. Arquitectura propuesta

> **Todo lo descrito en esta sección es una propuesta**. No existe código implementado que confirme esta estructura.

La arquitectura sigue un modelo de **tres capas separadas** en el cliente, de acuerdo con el principio IV de la constitución (modularidad y claridad):

```
┌────────────────────────────────────────────────────┐
│                   Interfaz (UI)                    │
│  index.html + css/main.css + js/ui.js              │
│  Renderizado de la lista, formulario, rachas       │
└────────────────┬───────────────────────────────────┘
                 │ llama a
┌────────────────▼───────────────────────────────────┐
│            Lógica de negocio (Domain)              │
│  js/habits.js   — gestión y validación de hábitos  │
│  js/streaks.js  — cálculo de rachas                │
│  js/validation.js — reglas de validación           │
│  (funciones puras, sin acceso a DOM ni storage)    │
└────────────────┬───────────────────────────────────┘
                 │ llama a
┌────────────────▼───────────────────────────────────┐
│           Capa de persistencia (Storage)           │
│  js/storage.js  — lectura y escritura en           │
│                   localStorage con manejo          │
│                   defensivo de errores             │
└────────────────────────────────────────────────────┘
```

**Flujo principal:**

1. Al cargar la página, `storage.js` lee y deserializa los datos de `localStorage`. Si los datos están ausentes o corruptos, devuelve una lista vacía (FR-009).
2. La capa de dominio (`habits.js`, `streaks.js`) recibe los datos y expone funciones para crear hábitos, validar entradas, marcar el día actual y calcular rachas.
3. `ui.js` consume las funciones de dominio, actualiza el DOM y llama a `storage.js` después de cada operación de escritura.
4. No existe dependencia inversa: `storage.js` y `habits.js` no importan módulos de interfaz.

---

## 5. Organización de módulos y responsabilidades

> **Propuesta** — sin implementación verificada.

| Módulo | Responsabilidad | Depende de |
|---|---|---|
| `index.html` | Estructura semántica, puntos de montaje de la UI | — |
| `css/main.css` | Estilos responsive, estados visuales (cumplido/pendiente) | — |
| `js/validation.js` | Validar campos obligatorios, texto vacío o solo espacios, duplicados | — |
| `js/habits.js` | Crear hábito, agregar registro de cumplimiento, exponer lista ordenada | `validation.js` |
| `js/streaks.js` | Calcular racha actual y mejor racha a partir del historial | — |
| `js/storage.js` | Serializar/deserializar en localStorage, recuperación segura | — |
| `js/ui.js` | Renderizar lista, formulario, mensajes de error, eventos del usuario | `habits.js`, `streaks.js`, `storage.js` |

---

## 6. Modelo de datos del hábito

> **Propuesta** basada en las entidades definidas en el `spec.md` (sección *Key Entities*).

### Habit (Hábito)

```json
{
  "id": "string — identificador único generado al crear",
  "name": "string — nombre del hábito (obligatorio, normalizado)",
  "category": "string — categoría libre elegida por el usuario (obligatoria en v1)",
  "startDate": "string — fecha de inicio en formato ISO 8601 (YYYY-MM-DD)",
  "completionHistory": ["YYYY-MM-DD", "..."]
}
```

### Completion Record (Registro de cumplimiento)

Representado como un arreglo de fechas ISO 8601 dentro de `completionHistory`. Cada fecha presente indica que el hábito fue completado ese día. La ausencia de una fecha indica que no fue completado o no fue marcado.

### Streak Summary (Resumen de racha)

Calculado dinámicamente a partir de `completionHistory`. No se persiste en localStorage para evitar inconsistencias.

```json
{
  "currentStreak": "número entero — días consecutivos cumplidos hasta hoy (o ayer si hoy no está marcado)",
  "bestStreak": "número entero — mayor racha histórica consecutiva"
}
```

**Regla de racha actual (FR-007):** Si el día actual no ha sido marcado, la racha se cuenta hasta el día anterior más reciente marcado de forma consecutiva. El día actual sin marcar no rompe la racha hasta que comienza el día siguiente.

### Estructura de almacenamiento en localStorage

```json
{
  "habits": [
    {
      "id": "uuid-o-timestamp",
      "name": "Ejercicio",
      "category": "Salud",
      "startDate": "2026-10-01",
      "completionHistory": ["2026-10-01", "2026-10-02", "2026-10-04"]
    }
  ]
}
```

Clave en localStorage: `habitTrackerData` (propuesta; sujeta a decisión final de implementación).

---

## 7. Estrategia de almacenamiento y recuperación con localStorage

### Escritura

Después de cada operación que modifique el estado (crear hábito, marcar/desmarcar día), se serializa el estado completo con `JSON.stringify` y se escribe en la clave de localStorage.

### Lectura y recuperación defensiva (FR-009)

Al iniciar la aplicación:

```
1. Intentar leer la clave de localStorage.
2. Si no existe → devolver estado inicial vacío (lista de hábitos = []).
3. Si existe → intentar deserializar con JSON.parse dentro de un bloque try/catch.
4. Si la deserialización falla o el resultado no tiene la estructura esperada
   → devolver estado inicial vacío y opcionalmente limpiar la clave corrupta.
5. Si la deserialización tiene éxito → validar que cada hábito tenga los campos
   mínimos esperados; descartar entradas malformadas.
6. Devolver la lista saneada al resto de la aplicación.
```

Este flujo garantiza que la aplicación no lanza errores no capturados por datos corruptos (SC-005).

### Consideraciones de volumen

Para uso personal de un solo navegador, `localStorage` tiene capacidad suficiente (típicamente 5 MB por origen). No se requiere compresión ni paginación en v1.

---

## 8. Validaciones y manejo de errores

| Regla | Requisito | Comportamiento esperado |
|---|---|---|
| Nombre obligatorio | FR-002, FR-003 | Mostrar mensaje de error; no guardar |
| Categoría obligatoria | FR-002 | Mostrar mensaje de error; no guardar |
| Fecha de inicio obligatoria | FR-002 | Mostrar mensaje de error; no guardar |
| Nombre con solo espacios se considera vacío | FR-003 | Tratar como campo vacío; mostrar error |
| Nombre duplicado (insensible a mayúsculas, espacios normalizados) | FR-004 | Mostrar mensaje indicando el conflicto; no guardar |
| Solo el día actual puede marcarse | FR-006 | Días pasados y futuros en modo solo lectura; bloquear interacción |
| Datos corruptos en localStorage | FR-009 | Recuperar a estado vacío; no lanzar error al usuario |

**Normalización de nombres para duplicados (FR-004):**
`nombre.trim().replace(/\s+/g, ' ').toLowerCase()`

Los mensajes de error deben ser visibles, claros e indicar exactamente qué campo corregir (SC-002).

---

## 9. Estrategia de pruebas funcionales y técnicas

> **Propuesta** — no se han ejecutado pruebas. Esta sección describe los casos que deben cubrirse, derivados directamente de los escenarios de aceptación y casos límite del `spec.md`.

### Pruebas unitarias de la capa de dominio

| Caso de prueba | Requisito | Historia |
|---|---|---|
| Crear hábito con datos válidos → aparece en lista | FR-001 | HU1 |
| Intentar guardar sin nombre → error | FR-002, FR-003 | HU2 |
| Intentar guardar sin categoría → error | FR-002 | HU2 |
| Intentar guardar sin fecha de inicio → error | FR-002 | HU2 |
| Nombre con solo espacios → tratado como vacío | FR-003 | HU2 |
| Nombre duplicado (misma capitalización) → rechazado | FR-004 | HU2 |
| Nombre duplicado (distinta capitalización) → rechazado | FR-004 | HU2 |
| Nombre duplicado (espacios redundantes) → rechazado | FR-004 | HU2 |
| Marcar día actual como cumplido | FR-006 | HU3 |
| Desmarcar día actual | FR-006 | HU3 |
| Intentar marcar día pasado → bloqueado | FR-006 | HU3 |
| Racha actual con varios días consecutivos | FR-007 | HU3 |
| Racha actual con día de hoy sin marcar (no se rompe) | FR-007 | HU3 |
| Mejor racha calculada correctamente | FR-007 | HU3 |
| Datos guardados persisten tras recarga | FR-008 | HU4 |
| localStorage vacío → estado inicial vacío | FR-009 | HU4 |
| localStorage con JSON corrupto → estado inicial vacío | FR-009 | HU4 |

### Pruebas de integración de la interfaz

- Lista muestra hábitos distinguiendo cumplidos y no cumplidos hoy (FR-005, SC-004)
- Mensajes de error son visibles para cada campo incorrecto (SC-002)
- Aplicación no bloquea con datos ausentes (SC-005)

---

## 10. Consideraciones de interfaz responsive y accesibilidad

### Responsive

- El diseño debe adaptarse a pantallas de al menos 320 px de ancho.
- En móvil: lista y formulario en columna única.
- En tableta y escritorio: puede usarse una disposición de dos columnas o tarjetas.
- Los controles de marcado del día deben ser fáciles de activar con el dedo en pantalla táctil.

### Accesibilidad

- Usar elementos HTML semánticos (`<form>`, `<button>`, `<label>`, `<input>`, `<ul>`, `<li>`).
- Asociar etiquetas con sus campos (`<label for="...">` o `aria-label`).
- Los mensajes de error deben asociarse a sus campos mediante `aria-describedby` o `aria-live` para lectores de pantalla.
- El contraste de colores debe cumplir WCAG 2.1 AA como mínimo.
- La interfaz debe ser operable con teclado.

> La validación completa de accesibilidad requiere pruebas manuales con tecnologías de asistencia y revisión por expertos; este plan solo establece las bases estructurales.

---

## 11. Riesgos técnicos y decisiones pendientes

| Ítem | Descripción | Estado |
|---|---|---|
| Formato de ID de hábito | Se propone un identificador único (UUID o timestamp). La estrategia exacta no está definida. | Decisión pendiente |
| Clave de localStorage | El nombre de la clave (`habitTrackerData`) es una propuesta; puede cambiarse durante la implementación. | Decisión pendiente |
| Framework de pruebas | Vitest o Jest; no hay configuración en el repositorio al momento de este plan. | Decisión pendiente |
| Estrategia de ordenación de la lista | El spec indica orden estable y distinción entre cumplidos/pendientes. El criterio de ordenación exacto (por nombre, por categoría, por fecha de creación) no está especificado. | Decisión pendiente |
| Gestión del cambio de día | Si la aplicación está abierta a medianoche, puede mostrar un día incorrecto como "hoy". Un mecanismo de refresco periódico sería conveniente pero no está en el alcance definido. | Riesgo menor; a decidir |
| Eliminación futura de hábitos | La ausencia de eliminación puede generar acumulación de datos con el tiempo. Se anticipa como deuda técnica para v2. | Fuera de alcance en v1 |
