# Prompts de la Fase 1 (Persona 1) — App "Seguimiento de hábitos"

Ejecutar **en orden** en el chat de GitHub Copilot (modo Agente) dentro de VS Code, con la carpeta `LAB_TAIS` abierta.
Tomar una captura de cada paso: el comando con su prompt y el archivo generado.

> Antes: en VS Code, abrir Copilot Chat → elegir **Agent** y escribir `/speckit-` para comprobar que aparecen los comandos.

---

## 1) `/speckit-constitution`  (Figuras: comando + `.specify/memory/constitution.md`)

```
/speckit-constitution Define la constitución de una aplicación web sencilla de seguimiento de hábitos diarios con estos principios:
1. Simplicidad de alcance: la app solo registra hábitos, permite marcarlos como cumplidos cada día y muestra su racha. No incluye backend, cuentas de usuario, notificaciones ni funciones ajenas al seguimiento de hábitos.
2. Validación de datos: el nombre del hábito y la fecha de inicio son obligatorios; un texto con solo espacios se considera vacío; no se permiten dos hábitos con el mismo nombre (sin distinguir mayúsculas).
3. Persistencia local: los datos se guardan en el navegador (localStorage) y se restauran al recargar; datos ausentes o dañados no deben bloquear la aplicación.
4. Modularidad y claridad: lógica de negocio en funciones puras separadas de la interfaz y del almacenamiento; interfaz en español.
5. Calidad verificable: cada requisito debe tener criterios de aceptación observables y cada funcionalidad, pruebas automatizadas que la comprueben.
Restricciones de producto: diseño responsive, funcionamiento sin servidor y fechas tratadas en la zona horaria local del usuario.
Define también puertas de calidad que deben cumplirse antes de dar por terminada una especificación o una implementación.
```

## 2) `/speckit-specify`  (Figuras: prompt + `specs/001-.../spec.md`)

Solo el **qué** y el **para quién**; sin mencionar tecnologías.

```
/speckit-specify Quiero una aplicación de seguimiento de hábitos para personas que desean construir rutinas diarias (ejercicio, lectura, estudio, etc.).
La persona debe poder registrar un hábito indicando su nombre, una categoría y la fecha en que empieza. Debe poder marcar cada día si cumplió o no el hábito y ver su racha, es decir, cuántos días seguidos lleva cumpliéndolo, junto con su mejor racha. La lista de hábitos debe mostrarse ordenada y permitir distinguir cuáles ya se cumplieron hoy y cuáles no.
Si faltan datos obligatorios o el nombre ya existe, la aplicación debe indicar claramente qué corregir. Los hábitos y su historial de cumplimiento deben conservarse al cerrar o recargar la página.
Fuera de alcance en esta primera versión: edición y eliminación de hábitos, notificaciones, recordatorios y cuentas de usuario.
```

> Nota: deliberadamente **no** se define qué pasa con la racha si hoy aún no se marcó ni si se pueden marcar días pasados o futuros. Esos puntos son los que debe detectar `/speckit-clarify`.

## 3) `/speckit-clarify`  (Figuras: pregunta de ambigüedad + requisito actualizado)

```
/speckit-clarify
```

Responder las preguntas que haga Copilot. Respuestas sugeridas si pregunta por lo anterior:
- **Racha con hoy sin marcar:** la racha no se rompe hasta que termine el día; cuenta los días consecutivos cumplidos hasta ayer más hoy si ya se marcó.
- **Días pasados o futuros:** solo se puede marcar el día actual; no se permiten días futuros ni editar días pasados.

Anotar qué ambigüedad detectó y cómo se actualizó el requisito (se cita en la sección 3.2 D del informe).

---

## Después (para el commit — lo ejecutan ustedes)

Revisar `git status` y confirmar que existen `.specify/memory/constitution.md`, `specs/001-*/spec.md` y `specs/001-*/checklists/requirements.md`.
