# Roadmap, pendientes y próximos pasos de CasePilot

- Estado: fuente canónica de seguimiento y próximos pasos.
- Última actualización: 2026-11-23.
- Alcance: implementación del Bloque B (CI/CD + IaC en Google Cloud para DEV), backlog de producto/plataforma y mejoras del harness de ingeniería IA.

Este documento centraliza el estado de avance y la secuencia recomendada de trabajo. Sustituye el listado informal del `TODO.md` raíz (que ahora enlaza aquí) conforme a la regla de fuente única de [60 — Documentación](../../.agents/instructions/60-documentation.md).

---

## 1. Qué ya está completado (línea base vigente)

| Bloque | Estado | Qué existe implementado | Fuentes canónicas |
| --- | --- | --- | --- |
| **Base backend + 28 CRUDs** | Completado | `casepilot-api` (NestJS 12, TypeORM 0.3, PostgreSQL 18), 28 modelos CRUD + Health, 144 handlers organizados por operación (`BCK-023`), migraciones reversibles y validadores `TypeScript + ESLint + dependency-cruiser + ts-morph` con regresiones. | [Arquitectura backend](../architecture/casepilot-backend-architecture.md), [validación API](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md) |
| **Librerías backend compartidas** | Completado | 6 paquetes con checks propios: `@casepilot/cqrs`, `@casepilot/abstractions` (puro sin ORM), `@casepilot/persistence` (adaptador TypeORM separado), `@casepilot/exception-handler` (RFC 9457), `@casepilot/validation` y `@casepilot/auth`. | [ADR 0016](../adr/0016-reusable-backend-mechanisms.md), [ADR 0023](../adr/0023-persistence-library-and-pure-abstractions.md) |
| **Punto 0 — Decisiones previas y normativa** | Completado | Google Cloud como proveedor absoluto en DEV, modelo de autenticación Firebase + autorización en `Application`, evolución de `FRT-009` y matrices de cobertura sincronizadas. | [ADR 0021](../adr/0021-gcp-absolute-dev-infrastructure.md), [ADR 0022](../adr/0022-firebase-authentication-and-application-authorization.md), [Proveedores](../architecture/infrastructure-providers.md) |
| **Bloque A — Auth + Autorización + SPA ↔ API mínima** | Completado y verificado end-to-end | `@casepilot/auth`, tabla `user_identities`, guard global por defecto (solo `/health*` públicos), autorización en `Application` en los 28 CRUDs, `/auth/me/bootstrap`, `GET /auth/me`, `PATCH /auth/me`, OpenAPI `0.5.0`, Firebase Auth Emulator en Docker Compose + `seed:local`, controles Material en `@casepilot/pilot-ui-kit`, `/auth/login` real, `/profile` protegido con prueba en vivo `200`/`403`, integración backend completa (`persistence` 7/7 + `api` 49/49) y Playwright + axe en verde (8/8). | [ADR 0022](../adr/0022-firebase-authentication-and-application-authorization.md), [README web](../../src/apps/casepilot/casepilot-web/README.md), [README API](../../src/apps/casepilot/casepilot-api/README.md) |

---

## 2. Prioridad 0 — Cierre de verificación local del Bloque A (completado)

Verificaciones locales cerradas con Docker Desktop activo:

- [x] **Ejecutar integración backend completa con Testcontainers** (`pnpm check:backend` + `pnpm check:backend:integration`: `@casepilot/persistence` 7/7 y `casepilot-api` 49/49 en verde, incluyendo `health.test.ts`, `auth.test.ts` y `professional-services.test.ts`).
- [x] **Smoke test local end-to-end aislado (PostgreSQL + Firebase Auth Emulator + API + SPA)** (`pnpm infra:up`, `pnpm migration:api:run`, `pnpm seed:local` idempotente, API + `casepilot-web` en `http://127.0.0.1:4200`): verificados redirección `/ -> /auth/login`, login con `owner@local.test`, carga de `/profile` + membresías (`Local Workspace`, `CasePilot Local Team`), `PATCH /auth/me` con incremento de versión y persistencia tras recarga, verificación `200 OK`, rechazo `403 FORBIDDEN_ERROR` en cuenta ajena y cierre de sesión.
- [x] **Consolidar commit de cierre del entorno local** (`infra/docker/`, `tools/scripts/seed-local-users.mjs`, `package.json`, fixes de integración y documentación).

---

## 3. Prioridad 1 — BLOQUE B: CI/CD + IaC en Google Cloud para ambiente DEV mínimo y económico

Objetivo: desplegar de forma 100% automatizada el ambiente `development` (DEV) en **Google Cloud como proveedor absoluto** ([ADR 0021](../adr/0021-gcp-absolute-dev-infrastructure.md)), completamente aislado de `local`, con secreto cero en GitHub y costo mínimo.

### 3.1 Definiciones rápidas a confirmar antes de arrancar Bloque B

- [ ] **Región GCP DEV**: `us-central1` (recomendada: menor costo y cobertura de free tier) vs `southamerica-east1` (menor latencia desde Sudamérica).
- [ ] **Ahorro en Cloud SQL `db-f1-micro`**: incluir módulo opcional de **Cloud Scheduler** para apagar la instancia fuera de horario laboral en DEV (~USD \$2–4/mes) o dejarla continua (~USD \$7–10/mes).
- [ ] **Proveedores en Firebase Auth DEV**: solo Email/Password o Email/Password + Google Sign-In.

### 3.2 Iteración B1 — Paridad de CI Backend + Contenedor API + Soporte Cloud SQL Auth Proxy

- [ ] **Workflow de calidad backend (`.github/workflows/backend-quality.yml`)**:
  - Dispara en `pull_request` y `push`, con `permissions: contents: read` y `concurrency`.
  - Ejecuta `pnpm check:backend` y `pnpm check:backend:integration` (PostgreSQL efímero vía Testcontainers).
- [ ] **Script raíz unificado**: añadir `pnpm check:all` en [package.json](../../package.json) encadenando `check:backend` + `check:web`.
- [ ] **Dockerfile multi-stage de la API (`infra/docker/casepilot-api.Dockerfile`)**:
  - Basado en `node:22-slim`, instala con `pnpm install --frozen-lockfile`, compila librerías backend y `casepilot-api`, ejecuta como usuario no-root (`node`) sin `devDependencies` ni `.env`.
  - La **misma imagen inmutable** alimenta tanto el Cloud Run Service (`node dist/main.js`) como el Cloud Run Job de migraciones (`typeorm migration:run`).
- [ ] **Soporte de socket Unix de Cloud SQL Auth Proxy en `casepilot-api`**:
  - Extender `src/infrastructure/config/load-backend-config.ts` para aceptar `DATABASE_HOST=/cloudsql/<project>:<region>:<instance>` con `DATABASE_SSL=false` (el túnel mTLS del Auth Proxy de Cloud Run cifra la conexión), conservando `DATABASE_SSL=true` obligatorio para TCP remoto.
  - Cubrir con pruebas unitarias en `test/unit/configuration.test.ts` y documentar en el [README de la API](../../src/apps/casepilot/casepilot-api/README.md).

### 3.3 Iteración B2 — IaC con Terraform para GCP DEV (`infra/terraform/`)

- [ ] **Bootstrap único del proyecto GCP DEV** (documentado en `infra/terraform/bootstrap/README.md`):
  - Proyecto GCP dedicado `casepilot-dev` (aislado de futuros QA/Prod) con **Budget Alert** (USD \$5 / \$10 / \$15).
  - Bucket **GCS** con versionado y *uniform bucket-level access* para el estado remoto de Terraform.
  - **Workload Identity Pool & Provider (OIDC)** restringido por repositorio GitHub y `environment == 'dev'`.
- [ ] **Módulos reutilizables en `infra/terraform/modules/`**:
  - `project-services`: habilita solo APIs requeridas (`run`, `sqladmin`, `secretmanager`, `artifactregistry`, `firebase`, `identitytoolkit`, `firebasehosting`, `iam`, `iamcredentials`).
  - `iam`: Service Accounts separadas de mínimo privilegio (`sa-terraform-dev`, `sa-deployer-dev`, `sa-api-runtime-dev`, `sa-api-migrator-dev`).
  - `artifact-registry`: repositorio Docker con *cleanup policy* (retener últimas 5 imágenes etiquetadas y limpiar sin etiqueta > 7 días → dentro de free tier).
  - `secret-manager`: secretos `db-runtime-password` y `db-migrator-password` con IAM por secreto (nunca en Git ni en GitHub Secrets).
  - `database-cloudsql`: Cloud SQL PostgreSQL Enterprise `db-f1-micro` zonal sin HA, 10 GB HDD, base `casepilot_dev`, usuarios separados `casepilot_app` (DML mínimo) y `casepilot_migrator` (DDL) + *Cloud Scheduler* opcional de apagado nocturno.
  - `cloud-run`:
    - **Cloud Run Job** `casepilot-api-migrate-dev` (Auth Proxy + secreto `db-migrator-password` + `APP_ENV=development`).
    - **Cloud Run Service** `casepilot-api-dev` (`min_instance_count=0`, `max_instance_count=2`, `1 vCPU`, `512Mi`, Auth Proxy + secreto `db-runtime-password`, `CORS_ORIGINS` del sitio DEV, `AUTH_FIREBASE_PROJECT_ID`).
  - `firebase`: Firebase Authentication (Email/Password + Authorized Domains DEV) y Firebase Hosting site DEV.
- [ ] **Composición DEV y configuración de release**:
  - `infra/terraform/envs/dev/` (`main.tf`, `variables.tf`, `outputs.tf`, `backend.tf`).
  - `deploy/dev/firebase.json`: rewrites SPA (`** → /index.html`), headers de seguridad y `Cache-Control: no-store` para `/app-config.json`.

### 3.4 Iteración B3 — Pipelines CI/CD en GitHub Actions y gobierno de secretos

- [ ] **Configurar GitHub Environment `dev`**:
  - Solo `vars` no sensibles (`GCP_PROJECT_ID`, `GCP_REGION`, `WIF_PROVIDER`, `WIF_DEPLOYER_SA`, `WIF_TERRAFORM_SA`, `ARTIFACT_REGISTRY_REPO`, `CLOUD_RUN_SERVICE`, `CLOUD_RUN_MIGRATE_JOB`, `FIREBASE_HOSTING_SITE`, `DEV_API_URL`, configuración pública web de Firebase).
  - **Cero claves JSON de Service Account** en GitHub Secrets; secretos de DB exclusivamente en Google Secret Manager.
- [ ] **Workflows en `.github/workflows/`**:
  - `infra-plan.yml`: en PRs que toquen `infra/terraform/**`, ejecuta `terraform fmt -check`, `validate`, `tflint` y `terraform plan` vía OIDC sin aplicar.
  - `infra-apply-dev.yml`: `workflow_dispatch` o merge controlado en `dev` aplicando Terraform vía OIDC.
  - `deploy-dev.yml`:
    1. `quality-gate`: exige `backend-quality.yml` + `frontend-quality.yml` en verde.
    2. `build-and-push-api`: autentica vía OIDC y publica imagen inmutable `sha-<short_sha>` en Artifact Registry.
    3. `migrate-dev`: actualiza y ejecuta `casepilot-api-migrate-dev` con `--wait`; si falla, aborta el release antes de tocar API/SPA (`BCK-017`).
    4. `deploy-api-dev`: despliega `sha-<short_sha>` en Cloud Run Service y ejecuta smoke tests (`GET /health` `200`, `GET /health/database` `200`, `GET /auth/me` sin token `401`); si falla, vuelve tráfico a la revisión previa.
    5. `deploy-web-dev`: compila `casepilot-web`, genera `dist/browser/app-config.json` con valores públicos de DEV (sin `authEmulatorUrl`), despliega a Firebase Hosting DEV y corre smoke test HTTP.
- [ ] **Verificación end-to-end en DEV remoto**: probar login real en el dominio de Firebase Hosting DEV → `POST /auth/me/bootstrap` → `PATCH /auth/me` → comprobación `200` y `403` contra Cloud Run + Cloud SQL.

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

1. **Cierre local del Bloque A**: correr `pnpm check:backend:integration` y smoke test manual con Docker Desktop activo.
2. **Bloque B — Iteración B1**: `backend-quality.yml`, `pnpm check:all`, `casepilot-api.Dockerfile` y soporte socket Cloud SQL Auth Proxy.
3. **Bloque B — Iteración B2**: Bootstrap GCP DEV + Terraform (`infra/terraform/`) + `deploy/dev/firebase.json`.
4. **Bloque B — Iteración B3**: Workflows `infra-plan.yml`, `infra-apply-dev.yml`, `deploy-dev.yml` con OIDC + validación E2E en DEV remoto.
5. **Post-DEV**: Observabilidad (`logging`) + codegen OpenAPI + primera vertical slice de negocio (cuentas y casos) en `casepilot-web` + refinamiento de validación CQRS.
