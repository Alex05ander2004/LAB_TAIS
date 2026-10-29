# Contrato: interfaz de usuario

**Ubicación**: `src/components/`, `src/App.jsx` | **Idioma**: español

Este contrato fija los textos, roles y etiquetas accesibles que usan las pruebas de componentes y de extremo a extremo. Cambiarlos obliga a actualizar las pruebas.

## Pantalla única

```text
┌───────────────────────────────────────────┐
│ Seguimiento de hábitos            (h1)    │
│ [Aviso de almacenamiento, si aplica]      │
├───────────────────────────────────────────┤
│ Nuevo hábito                     (h2)     │
│ Nombre      [______________]              │
│ Categoría   [______________]              │
│ Fecha de inicio [AAAA-MM-DD]              │
│ [Guardar hábito]                          │
├───────────────────────────────────────────┤
│ Mis hábitos                      (h2)     │
│ 1 de 2 cumplidos hoy                      │
│ ┌ Leer · Estudio ───────────────────────┐ │
│ │ Hoy: Pendiente   [Marcar como cumplido]│ │
│ │ Racha actual: 2 días · Mejor racha: 5  │ │
│ │ [L][M][X][J][V][S hoy][D] (solo lectura)│ │
│ └────────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

En pantallas de 720 px o más, el formulario y la lista se muestran en dos columnas. En móvil, en una sola columna sin scroll horizontal desde 320 px.

## Formulario (`HabitForm`)

| Elemento | Rol / etiqueta accesible |
|---|---|
| Formulario | `form` con nombre «Nuevo hábito» |
| Campo nombre | `textbox` «Nombre» |
| Campo categoría | `textbox` «Categoría» |
| Campo fecha | etiqueta «Fecha de inicio», `input type="date"`, valor inicial = hoy |
| Botón | `button` «Guardar hábito» |
| Error de un campo | Texto bajo el campo, enlazado con `aria-describedby`; el campo lleva `aria-invalid="true"` |
| Resumen | `role="alert"` con «Revisa los datos marcados: …» cuando hay errores |
| Éxito | `role="status"` con «Hábito «{nombre}» guardado.»; el formulario se limpia y la fecha vuelve a hoy |

Los mensajes exactos de error están en [data-model.md](../data-model.md).

## Lista (`HabitList`, `HabitItem`, `DayStrip`)

| Elemento | Rol / texto |
|---|---|
| Lista vacía | «Todavía no tienes hábitos. Crea el primero con el formulario.» |
| Resumen | «{c} de {n} cumplidos hoy» |
| Lista | `list` «Mis hábitos»; cada hábito es un `listitem` con su nombre como encabezado (h3) |
| Estado de hoy | «Hoy: Cumplido» o «Hoy: Pendiente» (o «Empieza el {fecha}» si aún no inicia); la tarjeta tiene `data-status="completed"` o `"pending"` |
| Botón de hoy | `button` con `aria-pressed`; texto «Marcar como cumplido» o «Desmarcar»; nombre accesible «Marcar «{nombre}» como cumplido hoy» / «Desmarcar «{nombre}» de hoy» |
| Rachas | «Racha actual: {n} día(s)» y «Mejor racha: {n} día(s)» |
| Tira de días | 5 días anteriores, hoy y mañana. Cada día es un `button`; solo hoy está habilitado. Los demás tienen `disabled` y nombre accesible «{fecha}: {estado}, solo lectura». |

## Aviso de almacenamiento (`StorageNotice`)

Se muestra con `role="alert"` bajo el título cuando `loadState` devuelve `corrupt`, `partial` o `unavailable`, o cuando `saveState` devuelve `false`. Tiene un botón «Cerrar aviso». La aplicación sigue usable mientras se muestra.

| Caso | Texto |
|---|---|
| `corrupt` | «Los datos guardados estaban dañados y no se pudieron leer. Empezaste con una lista vacía.» |
| `partial` | «Se ignoraron {n} registros dañados de los datos guardados.» (con n = 1: «Se ignoró 1 registro dañado de los datos guardados.»). Cuenta hábitos descartados y fechas inválidas quitadas del historial. |
| `unavailable` | «No se puede acceder al almacenamiento del navegador. Los cambios no se guardarán.» |
| Fallo al guardar | «No se pudo guardar el último cambio en este navegador.» |
