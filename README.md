# Seguimiento de hábitos

Aplicación web local para registrar hábitos diarios, marcar su cumplimiento y ver la racha actual y la mejor racha. Funciona solo en el navegador (sin servidor ni cuentas) y guarda los datos en `localStorage`.

Proyecto desarrollado con [GitHub Spec Kit](https://github.com/github/spec-kit) siguiendo *Spec-Driven Development*. Los artefactos están en [`specs/001-habit-tracker/`](specs/001-habit-tracker/) y la constitución en [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

## Requisitos

- Node.js 20.19 o superior
- npm 10 o superior

## Ejecutar

```bash
npm install
npm run dev
```

Abrir la dirección que muestra Vite (normalmente `http://localhost:5173`).

## Pruebas y verificación

| Comando | Qué hace |
|---|---|
| `npm test` | Pruebas unitarias y de componentes (Vitest + React Testing Library) |
| `npx playwright install chromium` | Descarga el navegador para las pruebas E2E (una sola vez) |
| `npm run test:e2e` | Pruebas de extremo a extremo (Playwright; levanta Vite automáticamente) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run lint` | Revisión estática con ESLint |

La guía de validación manual está en [`specs/001-habit-tracker/quickstart.md`](specs/001-habit-tracker/quickstart.md).

## Estructura

```text
src/
├── domain/        Reglas de negocio puras: fechas locales, validación, hábitos y rachas
├── storage/       Único acceso a localStorage (contenedor con schemaVersion)
├── hooks/         useToday (fecha local de hoy) y useHabits (estado + persistencia)
├── components/    Interfaz React: formulario, lista, tarjeta, tira de días y aviso
├── App.jsx
└── styles.css
tests/
├── unit/          Dominio y almacenamiento
├── components/    Componentes y aplicación completa
└── e2e/           Playwright
```
