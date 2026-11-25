# Infra

Infraestructura como código y artefactos de runtime de CasePilot. La fuente canónica de proveedores y ambientes es [Infraestructura, proveedores y ambientes](../docs/architecture/infrastructure-providers.md) ([ADR 0018](../docs/adr/0018-infrastructure-providers-and-environments.md) y [ADR 0021](../docs/adr/0021-gcp-absolute-dev-infrastructure.md)).

## Estructura

- [`docker/`](docker/README.md):
  - `compose.yaml` y `firebase/`: dependencias locales aisladas (PostgreSQL 18 en `127.0.0.1:55432` y Firebase Auth Emulator en `127.0.0.1:9099`, UI en `127.0.0.1:4000`). Comandos raíz: `pnpm infra:up`, `pnpm infra:reset`, `pnpm seed:local`.
  - [`casepilot-api.Dockerfile`](docker/casepilot-api.Dockerfile): imagen multi-stage no-root sobre `node:22-slim` para desplegar la API en Cloud Run Service y ejecutar migraciones en Cloud Run Job usando exactamente el mismo artefacto inmutable.
- `terraform/`:
  - [`bootstrap/`](terraform/bootstrap/README.md): runbook y scripts idempotentes (`bootstrap-gcp.sh`, `neon-dev-roles.sql`) para el bootstrap único del proyecto GCP DEV (GCS tfstate, WIF OIDC, `sa-terraform-dev`, Budget Alert) y los roles mínimos en Neon PostgreSQL 18 (`casepilot_app` y `casepilot_migrator`).
  - `modules/`: módulos reutilizables (`project-services`, `iam`, `artifact-registry`, `secret-manager`, `cloud-run`, `firebase`).
  - [`envs/dev/`](terraform/envs/dev/README.md): composición DEV sobre Google Cloud + Neon PostgreSQL (Free Tier).

La configuración de release de Firebase Hosting para DEV vive en [`deploy/dev/`](../deploy/dev/README.md), y la guía operativa de integración/workflows en [`docs/operations/dev-deployment-and-iac.md`](../docs/operations/dev-deployment-and-iac.md).
