# Roadmap, pendientes y próximos pasos de CasePilot

- Estado: fuente canónica de seguimiento y próximos pasos.
- Última actualización: 2026-11-24.
- Alcance: implementación del Bloque B (CI/CD + IaC en Google Cloud + Neon PostgreSQL Free Tier para DEV), backlog de producto/plataforma y mejoras del harness de ingeniería IA.

Este documento centraliza el estado de avance y la secuencia recomendada de trabajo. Sustituye el listado informal del `TODO.md` raíz (que ahora enlaza aquí) conforme a la regla de fuente única de [60 — Documentación](../../.agents/instructions/60-documentation.md).

---

## 1. Qué ya está completado (línea base vigente)

| Bloque | Estado | Qué existe implementado | Fuentes canónicas |
| --- | --- | --- | --- |
| **Base backend + 28 CRUDs** | Completado | `casepilot-api` (NestJS 12, TypeORM 0.3, PostgreSQL 18), 28 modelos CRUD + Health, 144 handlers organizados por operación (`BCK-023`), migraciones reversibles y validadores `TypeScript + ESLint + dependency-cruiser + ts-morph` con regresiones. | [Arquitectura backend](../architecture/casepilot-backend-architecture.md), [validación API](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md) |
| **Librerías backend compartidas** | Completado | 6 paquetes con checks propios: `@casepilot/cqrs`, `@casepilot/abstractions` (puro sin ORM), `@casepilot/persistence` (adaptador TypeORM separado), `@casepilot/exception-handler` (RFC 9457), `@casepilot/validation` y `@casepilot/auth`. | [ADR 0016](../adr/0016-reusable-backend-mechanisms.md), [ADR 0023](../adr/0023-persistence-library-and-pure-abstractions.md) |
| **Punto 0 — Decisiones previas y normativa** | Completado | Stack DEV en Google Cloud + Neon PostgreSQL Free Tier, modelo de autenticación Firebase + autorización en `Application`, evolución de `FRT-009` y matrices de cobertura sincronizadas. | [ADR 0021](../adr/0021-gcp-absolute-dev-infrastructure.md), [ADR 0022](../adr/0022-firebase-authentication-and-application-authorization.md), [Proveedores](../architecture/infrastructure-providers.md) |
| **Bloque A — Auth + Autorización + SPA ↔ API mínima** | Completado y verificado end-to-end | `@casepilot/auth`, tabla `user_identities`, guard global por defecto (solo `/health*` públicos), autorización en `Application` en los 28 CRUDs, `/auth/me/bootstrap`, `GET /auth/me`, `PATCH /auth/me`, OpenAPI `0.5.0`, Firebase Auth Emulator en Docker Compose + `seed:local`, controles Material en `@casepilot/pilot-ui-kit`, `/auth/login` real, `/profile` protegido con prueba en vivo `200`/`403`, integración backend completa (`persistence` 7/7 + `api` 49/49) y Playwright + axe en verde (8/8). | [ADR 0022](../adr/0022-firebase-authentication-and-application-authorization.md), [README web](../../src/apps/casepilot/casepilot-web/README.md), [README API](../../src/apps/casepilot/casepilot-api/README.md) |
| **Bloque B — CI/CD + IaC DEV (GCP + Neon Free Tier)** | Código/IaC/CI/CD implementado y validado localmente (pendiente bootstrap remoto) | `pnpm check:all`, `backend-quality.yml`, `casepilot-api.Dockerfile` (verificado con migraciones + runtime no-root), compatibilidad Cloud Run `PORT` y PgBouncer/Neon (`DATABASE_STATEMENT_TIMEOUT_ENABLED`), Terraform (`infra/terraform/modules/*`, `envs/dev/`, `bootstrap/` validado con `terraform fmt`/`validate` + `tflint`), `deploy/dev/firebase.json`, scripts `tools/ci/*` con pruebas y workflows `infra-plan.yml`, `infra-apply-dev.yml` y `deploy-dev.yml`. | [Operación DEV](../operations/dev-deployment-and-iac.md), [Bootstrap DEV](../../infra/terraform/bootstrap/README.md), [ADR 0021](../adr/0021-gcp-absolute-dev-infrastructure.md) |

---

## 2. Prioridad 0 — Cierre de verificación local del Bloque A (completado)

Verificaciones locales cerradas con Docker Desktop activo:

- [x] **Ejecutar integración backend completa con Testcontainers** (`pnpm check:backend` + `pnpm check:backend:integration`: `@casepilot/persistence` 7/7 y `casepilot-api` 49/49 en verde, incluyendo `health.test.ts`, `auth.test.ts` y `professional-services.test.ts`).
- [x] **Smoke test local end-to-end aislado (PostgreSQL + Firebase Auth Emulator + API + SPA)** (`pnpm infra:up`, `pnpm migration:api:run`, `pnpm seed:local` idempotente, API + `casepilot-web` en `http://127.0.0.1:4200`): verificados redirección `/ -> /auth/login`, login con `owner@local.test`, carga de `/profile` + membresías (`Local Workspace`, `CasePilot Local Team`), `PATCH /auth/me` con incremento de versión y persistencia tras recarga, verificación `200 OK`, rechazo `403 FORBIDDEN_ERROR` en cuenta ajena y cierre de sesión.
- [x] **Consolidar commit de cierre del entorno local** (`infra/docker/`, `tools/scripts/seed-local-users.mjs`, `package.json`, fixes de integración y documentación).

---

## 3. Prioridad 1 — BLOQUE B: CI/CD + IaC en Google Cloud + Neon PostgreSQL (Free Tier) para DEV

Objetivo: desplegar de forma 100% automatizada el ambiente `development` (DEV) con **Google Cloud** (Cloud Run, Firebase Auth/Hosting, Artifact Registry, Secret Manager) + **Neon PostgreSQL (Free Tier)** ([ADR 0021](../adr/0021-gcp-absolute-dev-infrastructure.md)), completamente aislado de `local`, con secreto cero en GitHub y costo objetivo ~USD \$0/mes.

### 3.1 Definiciones adoptadas (parametrizables en `terraform.tfvars`)

- [x] **Región GCP DEV y región Neon DEV**: default `us-east1` en GCP (free tier) alineada con Neon `aws-us-east-1` (parametrizable mediante `var.gcp_region` / hosts de Neon en `terraform.tfvars`).
- [x] **Gestión del proyecto Neon DEV**: proyecto/base/roles creados una vez en Neon mediante [`infra/terraform/bootstrap/neon-dev-roles.sql`](../../infra/terraform/bootstrap/neon-dev-roles.sql); contraseñas almacenadas exclusivamente en Google Secret Manager (`neon-db-runtime-password` y `neon-db-migrator-password`), evitando API keys de Neon en CI y contraseñas en `terraform.tfstate`.
- [x] **Proveedores en Firebase Auth DEV**: Email/Password habilitado por defecto (`enable_email_password_auth = true`); Google Sign-In parametrizado y opcional (`enable_google_auth = false` por defecto).

### 3.2 Iteración B1 — Paridad de CI Backend + Contenedor API + Compatibilidad Neon TLS (completada)

- [x] **Workflow de calidad backend ([`.github/workflows/backend-quality.yml`](../../.github/workflows/backend-quality.yml))**:
  - Dispara en `pull_request`, `push`, `workflow_dispatch` y `workflow_call`, con `permissions: contents: read` y `concurrency`.
  - Ejecuta `pnpm check:backend`, `pnpm test:ci-scripts` y `pnpm check:backend:integration` (PostgreSQL efímero vía Testcontainers).
- [x] **Script raíz unificado**: añadido `pnpm check:all` en [package.json](../../package.json) encadenando `check:backend` + `check:web`, más `pnpm test:ci-scripts`.
- [x] **Dockerfile multi-stage de la API ([`infra/docker/casepilot-api.Dockerfile`](../../infra/docker/casepilot-api.Dockerfile) + [`.dockerignore`](../../.dockerignore))**:
  - Basado en `node:22-slim`, instala con `pnpm install --frozen-lockfile --filter @casepilot/casepilot-api...`, compila librerías backend y `casepilot-api`, empaqueta con `pnpm deploy --prod` y ejecuta como usuario no-root (`node`) sin `devDependencies` ni `.env`.
  - Verificado localmente con PostgreSQL 18: la **misma imagen inmutable** ejecuta tanto las migraciones TypeORM (`Cloud Run Job`) como el servidor HTTP en puerto `8080` (`Cloud Run Service`).
- [x] **Configuración TLS, Cloud Run `PORT` y endpoints Neon en `casepilot-api`**:
  - Soporta `PORT` de Cloud Run como fallback de `API_PORT`, resolución de `findApplicationRoot()` en contenedores sin `tsconfig.json`, y `DATABASE_STATEMENT_TIMEOUT_ENABLED=false` para compatibilidad con poolers en modo transacción (`Neon -pooler` / PgBouncer) manteniendo `query_timeout` y TLS estricto (`rejectUnauthorized: true`).
  - Cubierto en `test/unit/configuration.test.ts` y documentado en el [README de la API](../../src/apps/casepilot/casepilot-api/README.md).

### 3.3 Iteración B2 — IaC con Terraform para GCP + Neon DEV (`infra/terraform/`) (código listo; bootstrap remoto pendiente)

- [x] **Runbook y scripts de bootstrap único** ([`infra/terraform/bootstrap/README.md`](../../infra/terraform/bootstrap/README.md), [`bootstrap-gcp.sh`](../../infra/terraform/bootstrap/bootstrap-gcp.sh), [`neon-dev-roles.sql`](../../infra/terraform/bootstrap/neon-dev-roles.sql)):
  - Automatizan GCS state bucket (versionado + UBLA + public access prevention), WIF Pool & OIDC Provider restringido al repo y `environment == 'dev'`, `sa-terraform-dev`, Budget Alert (\$1/\$5/\$10) y roles `casepilot_app` (DML mínimo con `ALTER DEFAULT PRIVILEGES`) + `casepilot_migrator` (DDL) en Neon.
- [x] **Módulos reutilizables en `infra/terraform/modules/`** (`project-services`, `iam`, `artifact-registry`, `secret-manager`, `cloud-run`, `firebase`):
  - Sin `sqladmin.googleapis.com` en DEV; IAM mínimo incluyendo `roles/firebaseauth.viewer` en `sa-api-runtime-dev` para `verifyIdToken(token, true)` por ADC; cleanup policy en Artifact Registry (últimas 5 etiquetadas + borrado sin etiqueta > 7 días); aislamiento estricto por secreto en Secret Manager; Cloud Run Job (`direct`) + Cloud Run Service (`pooled`, `min=0`, `max=2`, `1 vCPU`, `512Mi`).
- [x] **Composición DEV y configuración de release**:
  - `infra/terraform/envs/dev/` (`versions.tf`, `backend.tf`, `variables.tf`, `main.tf`, `outputs.tf`, `terraform.tfvars.example`, `.tflint.hcl`, `README.md`), validada con `terraform fmt -check`, `terraform validate` (providers `google`/`google-beta` 6.50.0) y `tflint`.
  - [`deploy/dev/firebase.json`](../../deploy/dev/firebase.json): rewrites SPA (`** → /index.html`), headers de seguridad, caché inmutable para assets y `Cache-Control: no-store` para `/app-config.json`.
- [ ] **Ejecutar bootstrap único remoto en GCP DEV + Neon DEV** *(requiere cuenta/credenciales del operador)*: crear proyecto GCP + proyecto Neon, correr `neon-dev-roles.sql`, correr `bootstrap-gcp.sh`, primer `terraform apply` y cargar versiones iniciales en Secret Manager.

### 3.4 Iteración B3 — Pipelines CI/CD en GitHub Actions y gobierno de secretos (workflows listos; activación remota pendiente)

- [x] **Scripts CI/CD verificables en `tools/ci/`**:
  - `generate-web-app-config.mjs`, `prepare-firebase-hosting-config.mjs`, `smoke-test-api.mjs`, `smoke-test-web.mjs` + suite `ci-scripts.test.mjs` (`pnpm test:ci-scripts`).
- [x] **Workflows en `.github/workflows/`**:
  - [`infra-plan.yml`](../../.github/workflows/infra-plan.yml): `terraform fmt -check`, `validate`, `tflint` y `terraform plan` vía OIDC sin aplicar.
  - [`infra-apply-dev.yml`](../../.github/workflows/infra-apply-dev.yml): `workflow_dispatch` y push/merge controlado a `development` sobre `infra/terraform/**` vía OIDC con concurrencia exclusiva.
  - [`deploy-dev.yml`](../../.github/workflows/deploy-dev.yml): `quality-gate` (`backend-quality` + `frontend-quality`) → `build-and-push-api` (`sha-<short_sha>` + digest inmutable) → `migrate-dev` (`--wait`, aborta release si falla) → `deploy-api-dev` (smoke tests + rollback automático a revisión previa si falla) → `deploy-web-dev` (build SPA + `/app-config.json` sin emulador + deploy Firebase Hosting vía OIDC sin `FIREBASE_TOKEN` + smoke test HTTP).
- [ ] **Configurar GitHub Environment `dev` en el repositorio remoto** *(requiere permisos admin en GitHub)*: cargar únicamente las `vars` no sensibles listadas en [`infra/terraform/bootstrap/README.md`](../../infra/terraform/bootstrap/README.md) (cero claves JSON en GitHub Secrets).
- [ ] **Verificación end-to-end en DEV remoto** *(tras bootstrap y primer `deploy-dev.yml`)*: probar login real en `https://<FIREBASE_HOSTING_SITE>.web.app` → `POST /auth/me/bootstrap` → `PATCH /auth/me` → comprobación `200` y `403` contra Cloud Run + Neon PostgreSQL.

---

## 4. Prioridad 2 — Backlog de producto y plataforma (post-Bloque B)

Elementos expresamente diferidos hasta tener DEV desplegado y automatizado:

1. **Mejora de validación en CQRS** *(pendiente histórico de `TODO.md`)*:
   - Evaluar un mecanismo declarativo/tipado por `*Request` apoyado en `@casepilot/validation` que reduzca código repetitivo en los 144 handlers sin romper `BCK-004`, `BCK-006` ni `BCK-008`.
2. **Integración funcional completa SPA ↔ API**:
   - Generar tipos/cliente TypeScript deterministas desde [contracts/openapi/casepilot-api.yaml](../../contracts/openapi/casepilot-api.yaml) (`tools/codegen/`) y validar conformidad OpenAPI en `test/integration/`.
   - Construir vertical slices de negocio en `casepilot-web` (selector de `BusinessAccount`, `ExternalParty`, `Case`, `Task`, `Deadline`, `Invoice`/`Payment`, gestión de `Member` y roles) ampliando `@casepilot/pilot-ui-kit` a demanda.
   - Evaluar carga diferida de `firebase/auth` para reducir el bundle inicial de `casepilot-web` bajo el umbral de advertencia de `500 kB` (actualmente ~`560 kB`, límite de error `750 kB`).
3. **Observabilidad (`src/libs/backend/logging/`)**:
   - Reemplazar el `.gitkeep` actual por logging JSON estructurado compatible con Google Cloud Logging, `correlationId`/trace-id por request y redacción automática de PII/tokens/secretos.
4. **Capacidades de producto futuras**:
   - Almacenamiento binario de documentos en Google Cloud Storage (signed URLs, límites de tamaño/MIME, aislamiento por cuenta).
   - Adaptadores de envío de correo (`src/libs/backend/email/`) y generación de PDF (`src/libs/backend/pdf/`) cuando exista un caso de uso real.
   - Registro automático de auditoría en `Activity` para operaciones sensibles.
5. **Aplicación móvil (`src/apps/casepilot/casepilot-mobile/` y `src/libs/mobile/`)**:
   - Definir ADR de estrategia Capacitor + adaptadores de plataforma con fallback web y montar sus propios gates antes de declarar cobertura.
6. **Ambientes QA y Producción**:
   - Replicar `infra/terraform/envs/{qa,prod}` con proyectos GCP separados, protecciones de rama/aprobación en GitHub Environments, alta disponibilidad/backups en PostgreSQL y verificación de portabilidad entre Cloud SQL y Neon.

---

## 5. Prioridad 3 — Evolución del AI Harness Engineering (transversal / incremental)

Mejoras identificadas durante la auditoría de `.agents/` y validadores, aplicables de forma incremental sin bloquear producto:

- [ ] **Paridad y descubribilidad de skills**:
  - Añadir frontmatter YAML (`name`, `description`) a [feature-delivery/SKILL.md](../../.agents/skills/feature-delivery/SKILL.md) y [mobile-first-ui/SKILL.md](../../.agents/skills/mobile-first-ui/SKILL.md) para que los runtimes agénticos las indexen automáticamente.
  - Crear `frontend-architecture/SKILL.md` como espejo de [backend-architecture/SKILL.md](../../.agents/skills/backend-architecture/SKILL.md).
  - Desacoplar [90-workflow.md](../../.agents/instructions/90-workflow.md) de menciones a herramientas concretas (`apply_patch`).
- [ ] **Meta-validador del harness (`tools/harness-check`)**:
  - Verificar automáticamente en CI: cero enlaces Markdown rotos en `AGENTS.md`/`.agents/`/`docs/`, frontmatter válido en todas las `SKILL.md`, correspondencia entre `pnpm-workspace.yaml` y paquetes existentes, y trazabilidad bidireccional de IDs `BCK-*`/`CPA-*`/`FRT-*` con sus matrices de cobertura.
- [ ] **Optimización de contexto y productividad agéntica**:
  - Incorporar `AGENTS.md` locales por paquete (`casepilot-api`, `casepilot-web`, `pilot-ui-kit`, `libs/backend`) para *progressive disclosure*.
  - Añadir generadores deterministas en `tools/generators/` (por ejemplo `gen:api:operation` y `gen:web:feature`) conformes a `BCK-023` y `FRT-002`.
  - Incorporar secret scanning (`gitleaks`) en CI/hooks locales (`lefthook`) y una skill/rúbrica de revisión semántica dedicada a las reglas no verificables estáticamente (`BCK-001`, `BCK-006`, `BCK-007`, `BCK-013`, `BCK-018`).

---

## 6. Orden recomendado de próximas iteraciones

1. **Bloque B — Iteración B1**: `backend-quality.yml`, `pnpm check:all`, `casepilot-api.Dockerfile` y verificación de conexión TLS/endpoints Neon (`pooled` vs `direct`).
2. **Bloque B — Iteración B2**: Bootstrap GCP DEV + Neon DEV (Free Tier) + Terraform (`infra/terraform/`) + `deploy/dev/firebase.json`.
3. **Bloque B — Iteración B3**: Workflows `infra-plan.yml`, `infra-apply-dev.yml`, `deploy-dev.yml` con OIDC + validación E2E en DEV remoto (Cloud Run + Neon PostgreSQL).
4. **Post-DEV**: Observabilidad (`logging`) + codegen OpenAPI + primera vertical slice de negocio (cuentas y casos) en `casepilot-web` + refinamiento de validación CQRS.
