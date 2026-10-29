# Contrato: formato y módulo de almacenamiento

**Ubicación**: `src/storage/habitStorage.js` | **Mecanismo**: `localStorage`

Es el **único** módulo que accede a `localStorage`. Recibe el objeto de almacenamiento como parámetro opcional (por defecto `window.localStorage`) para poder probarlo con un sustituto.

## Constantes

| Nombre | Valor |
|---|---|
| `STORAGE_KEY` | `"habit-tracker"` |
| `SCHEMA_VERSION` | `1` |

## Formato guardado (versión 1)

```json
{
  "schemaVersion": 1,
  "habits": [Habit, ...]
}
```

`Habit` según [data-model.md](../data-model.md). Las rachas **no** se guardan.

## `loadState(storage?) => { habits: Habit[], status, discarded }`

Nunca lanza excepciones.

| Situación | `habits` | `status` | Aviso al usuario |
|---|---|---|---|
| No hay valor en `STORAGE_KEY` | `[]` | `empty` | No |
| Contenedor válido | hábitos | `ok` | No |
| Contenedor válido, pero algún hábito o fecha inválido | hábitos válidos | `partial` (`discarded` = cantidad descartada) | Sí: «Se ignoraron N registros dañados…» |
| JSON inválido | `[]` | `corrupt` | Sí: «Los datos guardados estaban dañados…» |
| Raíz no es objeto, falta `habits`, o no es arreglo | `[]` | `corrupt` | Sí |
| `schemaVersion` distinto de `1` | `[]` | `corrupt` | Sí |
| `localStorage` no disponible (lanza al leer) | `[]` | `unavailable` | Sí: «No se puede acceder al almacenamiento…» |

Saneamiento de cada hábito: se exige `id`, `name` y `category` como texto no vacío, `startDate` como date key válida y `createdAt` como texto (si falta, se usa `""`). En `completions` se descartan elementos que no sean date keys válidas, duplicados y fechas anteriores a `startDate`, y se ordenan. Si dos hábitos tienen el mismo `normalizeName`, se conserva el primero.

## `saveState(habits, storage?) => boolean`

Serializa `{ schemaVersion: SCHEMA_VERSION, habits }` con `JSON.stringify` y lo escribe en `STORAGE_KEY`. Devuelve `true` si se guardó y `false` si `localStorage` lanzó un error (cuota llena o acceso bloqueado). No lanza excepciones.

## Cuándo se llama

- `loadState`: una vez, al montar la aplicación.
- `saveState`: después de cada cambio de estado (crear hábito, marcar o desmarcar hoy). Nunca en lecturas.
