# Contrato: API de dominio

**Ubicación**: `src/domain/` | **Tipo**: funciones puras (sin React, sin DOM, sin `localStorage`)

Todas las funciones reciben la fecha de hoy como parámetro (`today`, date key local) en lugar de leer el reloj. Ninguna modifica sus argumentos: devuelven objetos nuevos.

## `dates.js`

| Función | Firma | Resultado |
|---|---|---|
| `todayKey` | `(now?: Date) => string` | Date key local de `now` (por defecto, el momento actual). |
| `isValidDateKey` | `(value: unknown) => boolean` | `true` solo para `AAAA-MM-DD` que existe en el calendario. |
| `addDays` | `(key: string, days: number) => string` | Date key desplazada `days` días (negativo hacia atrás), en calendario local. |
| `compareDateKeys` | `(a: string, b: string) => number` | Negativo, 0 o positivo según el orden cronológico. |
| `formatDateKey` | `(key: string, options?) => string` | Texto en español para mostrar (p. ej. «jue 29 oct»). |

## `validation.js`

| Función | Firma | Resultado |
|---|---|---|
| `normalizeName` | `(name: string) => string` | `trim` + espacios colapsados + minúsculas (`es`). |
| `validateHabitInput` | `(input: {name, category, startDate}, existing: Habit[]) => { valid: boolean, errors: { name?, category?, startDate? } }` | Un mensaje por campo inválido (ver [data-model.md](../data-model.md)). `valid` es `true` solo si no hay errores. |

## `habits.js`

| Función | Firma | Resultado |
|---|---|---|
| `createHabit` | `(input, existing: Habit[], meta: { id, createdAt }) => { ok: true, habit } \| { ok: false, errors }` | Valida con `validateHabitInput`; si pasa, devuelve un `Habit` con `name` y `category` limpios y `completions: []`. |
| `isCompletedOn` | `(habit, dateKey) => boolean` | `true` si `dateKey` está en `completions`. |
| `canEditDate` | `(habit, dateKey, today) => boolean` | `true` solo si `dateKey === today` y `today >= habit.startDate`. |
| `toggleCompletion` | `(habit, dateKey, today) => { ok: true, habit } \| { ok: false, error }` | Agrega o quita `today` de `completions`. Rechaza fechas pasadas, futuras o anteriores al inicio (FR-006). |
| `getDayStatus` | `(habit, dateKey, today) => 'completed' \| 'not-completed' \| 'pending' \| 'future' \| 'before-start'` | Estado de un día para mostrarlo. |
| `sortHabits` | `(habits: Habit[]) => Habit[]` | Copia ordenada por nombre (`es`, sin distinguir mayúsculas ni acentos) y luego por `createdAt`. |

## `streaks.js`

| Función | Firma | Resultado |
|---|---|---|
| `calculateStreaks` | `(completions: string[], today: string) => { current, best, todayStatus }` | Regla de [research.md](../research.md) R3. Ignora fechas futuras. |

## Garantías verificadas por pruebas

- Ninguna función de `src/domain/` importa `react` ni accede a `window`, `document` o `localStorage`.
- `toggleCompletion` con una fecha distinta de `today` devuelve `ok: false` y el hábito original no cambia.
- `calculateStreaks` con hoy sin marcar y ayer marcado devuelve `current > 0` y `todayStatus: 'pending'`.
