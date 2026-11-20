# CasePilot Web

SPA Angular **21.2.25 LTS**, Angular CLI **21.2.24**, Angular Material/CDK **21.2.14** y Tailwind CSS **4.3.3**. Requiere Node.js 22.12+ de la rama 22 o 24 y pnpm 10.13.1. Las dependencias están fijadas en el lockfile. Soporte/compatibilidad verificados el 2026-10-04 en [Angular](https://angular.dev/reference/releases).

La base usa standalone, OnPush, zoneless, TypeScript/templates estrictos y rutas lazy. `/` redirige a `/profile` (protegida por `authGuard`, que redirige a `/auth/login` si no hay sesión) y las rutas desconocidas llevan a `/auth/login`. `/auth/login` integra Firebase Authentication mediante `core/auth/` (usando el emulador local en `APP_ENV=local` configurado en `public/app-config.json`), y `/profile` ofrece la integración mínima SPA ↔ API (`POST /auth/me/bootstrap`, `GET /auth/me`, `PATCH /auth/me` y comprobación en vivo `200`/`403` sobre `GET /business-accounts/:id`). El layout transversal usa HTML semántico, un enlace para saltar al contenido y componentes del [UI kit](../../../libs/frontend/pilot-ui-kit/README.md). Material sustituye Ionic para esta SPA conforme al [ADR 0020](../../../../docs/adr/0020-frontend-foundation-and-theming.md) y [ADR 0022](../../../../docs/adr/0022-firebase-authentication-and-application-authorization.md); se conserva la futura compatibilidad Capacitor.

## Comandos desde la raíz

```bash
pnpm install --frozen-lockfile
pnpm dev:web
```

La app se sirve en `http://127.0.0.1:4200`. `dev:web` construye primero el kit. Si cambias componentes del kit, ejecuta `pnpm watch:ui-kit` en otro terminal. Las configuraciones públicas por ambiente se incorporarán cuando exista su contrato; ningún secreto puede llegar al bundle.

| Comando | Propósito |
| --- | --- |
| `pnpm typecheck:web` | ngc con templates estrictos y tipos de tests |
| `pnpm lint:web` | TypeScript, templates y fronteras locales |
| `pnpm test:web` | Rutas lazy, redirects y placeholder |
| `pnpm build:web` | Build de producción del kit y SPA |
| `pnpm check:frontend:architecture` | Grafo, estructura, estilos, recursos y flags |
| `pnpm test:frontend:architecture` | Regresiones permitidas/rechazadas de los validadores |
| `pnpm test:web:e2e` | Chromium, axe, teclado, móvil/escritorio y cambio de tema |
| `pnpm check:web` | Gate completo de frontend y kit |

Antes de e2e, instala Chromium una vez:

```bash
pnpm --dir src/apps/casepilot/casepilot-web exec playwright install chromium
```

Las e2e levantan y cierran su propio servidor local en 4200; detén cualquier dev server que use ese puerto. Las pruebas de cambio de tema usan la API de depuración Angular exclusivamente en el dev server de pruebas; no se expone una API global ni controles de prueba en producción. Screenshots/traces se generan en `test-results/`, ignorado por Git.

## Arquitectura

La fuente de diseño es [arquitectura frontend](../../../../docs/architecture/frontend-architecture.md); las obligaciones son [FRT-001 a FRT-012](../../../../docs/architecture/frontend-architecture-rules.md); el alcance acreditado está en [validadores frontend](../../../../tools/frontend-architecture/README.md). `app/` compone; `shell/` contiene el layout; `features/auth/` contiene rutas/páginas; `theme/` registra recursos y paletas. `core/` y `shared/` se incorporarán con capacidades transversales reales, sin carpetas vacías ni imports de features.

El frontend consume APIs NestJS y contratos: no importa backend, PostgreSQL, SDKs administrativos ni persistencia. Todas las pruebas propias permanecen en `test/`; las regresiones del gate compartido pertenecen a `tests/architecture/frontend/`.

## Temas y recursos

[casepilot.theme.ts](src/theme/casepilot.theme.ts) registra `default` y una variante de ejemplo `christmas`. [asset-names.ts](src/theme/asset-names.ts) publica nombres lógicos; los archivos están en `public/themes/`. El kit aplica colores globales y resuelve recursos por nombre con fallback al tema inicial. No se habilita un selector de tema en el login placeholder; futuras funcionalidades podrán llamar a `PilotThemeService.setTheme(id)`.

No uses colores literales ni paletas Tailwind como `bg-red-500`. Usa utilidades semánticas (`bg-surface`, `text-primary`, `border-outline`), variables CSS registradas o `PILOT_COLOR`/`PILOT_COLOR_VARIABLE` de la entrada pública del kit. Los valores de paleta se definen solo como datos de tema.

El build estático se genera en `dist/browser/`; su publicación en Firebase Hosting y las reglas de rewrite SPA se implementarán junto con la infraestructura. Proveedores y pendientes: [infraestructura](../../../../docs/architecture/infrastructure-providers.md).
