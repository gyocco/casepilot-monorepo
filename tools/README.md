# Tools

Automatización propia del repositorio: `scripts/`, `generators/` y `codegen/`. No contiene lógica de negocio ni código ejecutado en producción.

[`frontend-architecture/`](frontend-architecture/README.md) es un paquete activo del workspace: comparte reglas ESLint y verifica fuentes/configuración/grafo de SPA y UI kit. Sus regresiones multiproyecto pertenecen a `tests/architecture/frontend/`. Comandos raíz: `check:frontend:architecture`, `test:frontend:architecture` y `check:web`.

`scripts/setup-local-env.mjs` usa las APIs estándar de Node.js para crear la configuración local de Docker con una contraseña generada. Se ejecuta mediante `pnpm infra:env` o automáticamente desde `pnpm infra:up`; conserva los archivos existentes y no imprime credenciales. Consulta [Dependencias locales de CasePilot](../infra/docker/README.md).
