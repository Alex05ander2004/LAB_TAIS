# Constitución de la aplicación de seguimiento de hábitos

<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles: I. Alcance mínimo y enfoque; II. Validación de datos; III. Persistencia local y tolerancia a fallos; IV. Modularidad y claridad; V. Calidad verificable
- Added sections: Restricciones del producto; Puertas de calidad
- Removed sections: None
- Follow-up TODOs: none
-->

## Core Principles

### I. Alcance mínimo y enfoque

La aplicación solo registra hábitos, permite marcarlos como cumplidos cada día y muestra su racha actual. No incluye backend, cuentas de usuario, notificaciones, sincronización remota ni ninguna funcionalidad ajena al seguimiento de hábitos. Cualquier cambio de alcance debe mantenerse alineado con este objetivo y solo puede introducirse cuando sea necesario para registrar, validar o visualizar hábitos.

### II. Validación de datos
El nombre del hábito y la fecha de inicio son obligatorios. Un texto compuesto solo por espacios se considera vacío. Antes de guardar o mostrar una entrada, la aplicación debe validar que el nombre no esté vacío y que la fecha de inicio sea válida. No se permiten dos hábitos con el mismo nombre si se comparan sin distinguir mayúsculas y con normalización de espacios redundantes. La validación debe ejecutarse antes de persistir cualquier dato nuevo.

### III. Persistencia local y tolerancia a fallos
Los datos se guardan en el navegador mediante localStorage y se restauran al recargar la aplicación. Si faltan datos, están corruptos o tienen un formato inesperado, la aplicación debe seguir funcionando sin bloquear la interfaz ni detener la experiencia. Las entradas inválidas deben ignorarse o reemplazarse por un estado seguro, y la recuperación debe ser automática y transparente para el usuario.

### IV. Modularidad y claridad
La lógica de negocio debe vivir en funciones puras y separadas de la interfaz y del almacenamiento. Los componentes de la interfaz no deben incluir reglas complejas de negocio ni lógica de persistencia. La interfaz debe estar en español y cada módulo debe ser legible, pequeño y reutilizable. La capa de dominio debe depender de almacenamiento e interfaz solo de forma controlada, y no al revés.

### V. Calidad verificable
Cada requisito debe tener criterios de aceptación observables y cada funcionalidad debe contar con pruebas automatizadas que la validen. La implementación no se considera terminada si no existe evidencia ejecutable de que el comportamiento principal y los casos límite funcionan. Los cambios en requisitos deben acompañarse de pruebas equivalentes que los verifiquen.

## Restricciones del producto
La aplicación debe ser responsive y usable en móvil, tableta y escritorio. Debe funcionar sin servidor ni autenticación. Las fechas deben tratarse en la zona horaria local del usuario y no deben interpretarse como UTC salvo la conversión necesaria de entrada y salida del navegador. La experiencia debe priorizar simplicidad, claridad y funcionamiento local sin dependencias externas.

## Puertas de calidad
Antes de dar por terminada una especificación o una implementación, deben cumplirse estas puertas de calidad:

- Requisito verificable: cada requisito debe tener una condición observable y medible.
- Cobertura funcional: las pruebas automatizadas cubren el flujo principal, la validación de datos y los casos límite.
- Integridad del dato: el nombre y la fecha de inicio son obligatorios; los duplicados con distinta capitalización se rechazan; los textos vacíos o de espacios solo se consideran vacíos.
- Persistencia defensiva: localStorage se maneja con recuperación segura ante ausencias, cadenas corruptas o datos inesperados.
- Modularidad: la lógica de negocio está separada del almacenamiento y de la interfaz.
- Idioma y accesibilidad: la interfaz se presenta en español y sigue un diseño responsive.
- Revisión de cumplimiento: cada cambio se evalúa contra esta constitución y la especificación; si un cambio rompe un principio, debe corregirse antes del cierre.

## Governance
La constitución gobierna el desarrollo del proyecto y prevalece sobre prácticas no documentadas. Cualquier expansión del alcance, cambio de principio o modificación funcional debe documentarse explícitamente, validarse con evidencia y revisarse antes de cerrarse. Los cambios en la constitución no pueden dejar requisitos sin criterio verificable ni introducir funcionalidades fuera del alcance definido.

La versión debe seguir la regla de SemVer: mayor por cambios incompatibles de principio o redefiniciones de normas, menor por nuevas secciones o ampliaciones materiales, y parche por aclaraciones, correcciones o refinamientos no semánticos. Las enmiendas requieren revisión de cumplimiento para confirmar que no se degrada el propósito del producto ni se rompen las puertas de calidad.

La aplicación no puede considerarse terminada si un requisito es ambiguo, si no existe evidencia automatizada de su comportamiento o si una decisión de diseño contradice este documento. La constitución se aplica tanto a la especificación como a la implementación.

**Version**: 1.1.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29
