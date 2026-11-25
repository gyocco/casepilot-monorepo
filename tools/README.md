# Tools

Automatización propia del repositorio: `scripts/`, `ci/`, `frontend-architecture/` y futuros `generators/` y `codegen/`. No contiene lógica de negocio ni código ejecutado en producción.

- [`frontend-architecture/`](frontend-architecture/README.md): paquete activo del workspace que comparte reglas ESLint y verifica fuentes/configuración/grafo de SPA y UI kit. Sus regresiones multiproyecto pertenecen a `tests/architecture/frontend/`. Comandos raíz: `check:frontend:architecture`, `test:frontend:architecture` y `check:web`.
- `scripts/setup-local-env.mjs`: crea la configuración local de Docker (`infra/docker/.env`) con contraseña generada sin imprimir credenciales (`pnpm infra:env` / `pnpm infra:up`).
- `scripts/seed-local-users.mjs`: siembra de forma idempotente 4 usuarios locales verificados (`owner`, `admin`, `member`, `viewer` `@local.test`) en Firebase Auth Emulator y la API local (`pnpm seed:local`). Solo permite hosts loopback.
- `ci/`: scripts Node 22 ESM sin dependencias externas usados por GitHub Actions (`.github/workflows/deploy-dev.yml`) y probados con `pnpm test:ci-scripts`:
  - `generate-web-app-config.mjs`: genera y valida `dist/browser/app-config.json` con valores públicos no locales (`authEmulatorUrl: null`).
  - `prepare-firebase-hosting-config.mjs`: inyecta el `FIREBASE_HOSTING_SITE` sobre `deploy/dev/firebase.json` en un archivo temporal bajo `build/`.
  - `smoke-test-api.mjs`: verifica `GET /health` (`200`), `GET /health/database` (`200`) y `GET /auth/me` sin token (`401` Problem Details) con reintentos ante cold start.
  - `smoke-test-web.mjs`: verifica `GET /`, `GET /app-config.json` (`Cache-Control: no-store`, `authEmulatorUrl: null`) y rewrite SPA `GET /auth/login`.
  - `ci-scripts.test.mjs`: suite unitaria y de servidores HTTP sintéticos para los scripts anteriores.
