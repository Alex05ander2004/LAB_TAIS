# Data Model: Seguimiento de hábitos diarios

**Fase**: 1 (`/speckit-plan`) | **Fecha**: 2026-10-29 | **Plan**: [plan.md](plan.md)

## Convención de fechas

Todas las fechas del modelo son **date keys**: cadenas `AAAA-MM-DD` en la **zona horaria local** del usuario (por ejemplo `2026-10-29`). No representan un instante UTC. Una date key es válida si cumple `^\d{4}-\d{2}-\d{2}$` y corresponde a un día real del calendario (se rechaza `2026-02-30`). Ver [research.md](research.md) R2.

`today` es la date key local del momento actual, calculada por `todayKey()`.

---

## Entidad: Habit

Rutina que la persona quiere seguir. Se guarda en `localStorage`.

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| `id` | string | Sí | Identificador único generado al crear (UUID). No vacío. |
| `name` | string | Sí | Se guarda recortado y con los espacios internos repetidos reducidos a uno. «No vacío tras recortar espacios» (FR-002, FR-003). Único según `normalizeName` (FR-004). |
| `category` | string | Sí | Texto libre, se guarda recortado. «No vacío tras recortar espacios» (FR-002, FR-003). |
| `startDate` | string (date key) | Sí | «Debe ser una date key válida» (FR-002). Puede ser pasada, hoy o futura. |
| `completions` | string[] (date keys) | Sí | Fechas cumplidas (Completion Record). Sin duplicados, ordenadas ascendentemente. Cada una ≥ `startDate`. Puede estar vacío. |
| `createdAt` | string (ISO 8601) | Sí | Instante de creación (`new Date().toISOString()`); solo para desempatar el orden. |

### Reglas de validación al crear (`validateHabitInput`)

Se evalúan todas a la vez y se devuelve un error por campo, para indicar el dato exacto a corregir (SC-002):

| Campo | Condición de error | Mensaje |
|---|---|---|
| `name` | Vacío o solo espacios | «Escribe el nombre del hábito.» |
| `name` | `normalizeName(name)` coincide con el de un hábito existente | «Ya existe un hábito llamado «{nombre existente}». Usa otro nombre.» |
| `category` | Vacía o solo espacios | «Escribe una categoría.» |
| `startDate` | Vacía | «Elige la fecha de inicio.» |
| `startDate` | No es una date key válida | «La fecha de inicio no es válida.» |

### Normalización de nombres (FR-004)

```text
normalizeName(name) = name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
```

«Leer», « leer » y «LEER» se consideran el mismo hábito. «Leer  libros» y «leer libros» también.

### Ciclo de vida

```text
(formulario) --validateHabitInput OK--> Habit creado (completions = [])
Habit --toggleCompletion(today)--> today agregado a completions
Habit --toggleCompletion(today) otra vez--> today quitado de completions
Habit --toggleCompletion(fecha ≠ today)--> rechazado, sin cambios (FR-006)
```

No existen transiciones de edición ni eliminación (FR-010).

---

## Entidad: Completion Record

Estado de un hábito en un día concreto. **No se guarda como objeto aparte**: se deriva de `Habit.completions`.

| Estado del día | Condición | Editable |
|---|---|---|
| `completed` | La fecha está en `completions` | Solo si la fecha es `today` |
| `not-completed` | La fecha es anterior a `today`, ≥ `startDate` y no está en `completions` | No (solo lectura) |
| `pending` | La fecha es `today` y no está en `completions` | Sí |
| `future` | La fecha es posterior a `today` | No (solo lectura) |
| `before-start` | La fecha es anterior a `startDate` | No (solo lectura) |

---

## Entidad: Streak Summary

Resumen calculado por `calculateStreaks(completions, today)`. **No se guarda**; se calcula en cada render.

| Campo | Tipo | Descripción |
|---|---|---|
| `current` | number ≥ 0 | Días consecutivos cumplidos que terminan en hoy (si hoy está cumplido) o en ayer (si hoy está pendiente). |
| `best` | number ≥ 0 | Secuencia consecutiva más larga de todo el historial. Siempre `best ≥ current`. |
| `todayStatus` | `'completed'` \| `'pending'` | Estado de hoy. `pending` no rompe la racha (FR-007). |

### Ejemplos (hoy = `2026-10-29`)

| `completions` | `current` | `best` | `todayStatus` |
|---|---|---|---|
| `[]` | 0 | 0 | pending |
| `[10-27, 10-28, 10-29]` | 3 | 3 | completed |
| `[10-27, 10-28]` | 2 | 2 | pending (la racha sigue viva) |
| `[10-26, 10-27]` | 0 | 2 | pending (ayer no se cumplió) |
| `[10-20 … 10-24, 10-28, 10-29]` | 2 | 5 | completed |

---

## Contenedor en localStorage

**Clave**: `habit-tracker`

```json
{
  "schemaVersion": 1,
  "habits": [
    {
      "id": "3f2a6c1e-8a51-4b7e-9d0e-2c1f5a7b9e10",
      "name": "Leer",
      "category": "Estudio",
      "startDate": "2026-10-20",
      "completions": ["2026-10-27", "2026-10-28"],
      "createdAt": "2026-10-20T14:05:11.000Z"
    }
  ]
}
```

Reglas de lectura (detalle en [contracts/storage-format.md](contracts/storage-format.md)):

- Clave ausente → estado vacío (`status: empty`).
- JSON inválido, raíz que no es objeto, `schemaVersion` distinto de 1 o `habits` que no es arreglo → estado vacío con aviso (`status: corrupt`).
- Hábitos individuales sin `id`, `name`, `category` o `startDate` válidos se descartan; las fechas inválidas de `completions` se ignoran → `status: partial` si se descartó algo.
- Un nombre repetido (según `normalizeName`) dentro de los datos guardados se descarta y se conserva el primero.
