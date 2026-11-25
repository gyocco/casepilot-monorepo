# Bootstrap único — Proyecto GCP DEV + Neon PostgreSQL DEV

Este runbook documenta los **pasos manuales únicos** previos a automatizar el ambiente `development` (DEV) con Terraform y GitHub Actions vía OIDC ([ADR 0021](../../../docs/adr/0021-gcp-absolute-dev-infrastructure.md)).

> **Seguridad:** No se crean claves JSON de Service Account ni se almacenan contraseñas de base de datos en Git, en GitHub Secrets ni en `terraform.tfstate`. Todas las credenciales de Neon viven exclusivamente como versiones dentro de **Google Secret Manager**.

---

## Prerrequisitos locales del operador (solo para el bootstrap único)

- Cuenta de Google Cloud con facturación habilitada (requerida por Cloud Run / Firebase Blaze, manteniendo consumo dentro del Free Tier).
- Cuenta de [Neon](https://neon.tech) (plan Free Tier).
- CLI instaladas localmente para esta ejecución inicial: `gcloud`, `terraform` (`>= 1.9`), `psql` (o consola SQL de Neon) y acceso de administrador al repositorio en GitHub.

---

## Paso 1 — Crear el proyecto GCP DEV dedicado y Budget Alert

1. Crea un proyecto GCP dedicado y aislado de futuros QA/Prod (por ejemplo `casepilot-dev`, o un ID globalmente único como `casepilot-dev-xxxx`):
   ```bash
   gcloud projects create casepilot-dev --name="CasePilot DEV"
   ```
2. Vincula la cuenta de facturación al proyecto (necesario para habilitar Cloud Run y Firebase Hosting/Auth):
   ```bash
   gcloud billing projects link casepilot-dev --billing-account="<BILLING_ACCOUNT_ID>"
   ```
3. La alerta de presupuesto (**USD \$1 / \$5 / \$10**, equivalente a 10% / 50% / 100% de \$10/mes) puede crearse automáticamente pasando `BILLING_ACCOUNT_ID` al script del Paso 3, o manualmente en *Google Cloud Console → Billing → Budgets & alerts*.

---

## Paso 2 — Crear el proyecto Neon PostgreSQL DEV (Free Tier) y roles mínimos

1. En [Neon Console](https://console.neon.tech):
   - Crea un proyecto dedicado `casepilot-dev`.
   - Selecciona **PostgreSQL 18**.
   - Selecciona región **AWS US East (N. Virginia) — `aws-us-east-1`**, alineada geográficamente con GCP `us-east1` (latencia típica ~5–15 ms). *(Alternativa: `aws-us-east-2` con GCP `us-central1`.)*
   - Crea la base de datos `casepilot_dev`.
2. Anota los dos hostnames de la rama principal (`main`) de Neon:
   - **Host pooled (runtime Cloud Run Service):** `ep-<id>-pooler.us-east-1.aws.neon.tech`
   - **Host direct / unpooled (Cloud Run Job de migraciones):** `ep-<id>.us-east-1.aws.neon.tech`
3. Genera dos contraseñas fuertes distintas (una para `casepilot_migrator` y otra para `casepilot_app`) y ejecuta [`neon-dev-roles.sql`](neon-dev-roles.sql) contra `casepilot_dev` usando el rol propietario de Neon (sustituyendo los placeholders solo en tu sesión local, nunca en Git):
   - `casepilot_migrator`: rol DDL para ejecutar TypeORM migrations (`CREATE`/`ALTER` sobre schema `public`).
   - `casepilot_app`: rol DML mínimo (`SELECT, INSERT, UPDATE, DELETE`) con `ALTER DEFAULT PRIVILEGES FOR ROLE casepilot_migrator` para que herede permisos automáticamente en cada tabla creada por migraciones.

---

## Paso 3 — Ejecutar el bootstrap único de GCP (GCS State + WIF OIDC + `sa-terraform-dev`)

Ejecuta el script idempotente [`bootstrap-gcp.sh`](bootstrap-gcp.sh) autenticado como Owner/Admin del proyecto GCP DEV:

```bash
gcloud auth login
GCP_PROJECT_ID="casepilot-dev" \
GCP_REGION="us-east1" \
GITHUB_REPOSITORY="gyocco/casepilot-monorepo" \
BILLING_ACCOUNT_ID="<BILLING_ACCOUNT_ID>" \
bash infra/terraform/bootstrap/bootstrap-gcp.sh
```

Qué crea exactamente este script:
- Bucket GCS `gs://<GCP_PROJECT_ID>-tfstate` con versionado, *Uniform Bucket-Level Access* y prevención de acceso público.
- Workload Identity Pool `github-actions-pool` y OIDC Provider `github-actions-provider` restringidos a `assertion.repository == '<GITHUB_REPOSITORY>'`.
- Service Account `sa-terraform-dev` con binding `roles/iam.workloadIdentityUser` limitado al repositorio + GitHub Environment `dev`.
- Alerta de presupuesto mensual USD \$1 / \$5 / \$10 (si se informó `BILLING_ACCOUNT_ID`).

Guarda la salida del script (`TF_STATE_BUCKET`, `WORKLOAD_IDENTITY_POOL_NAME`, `WIF_PROVIDER`, `WIF_TERRAFORM_SA`).

---

## Paso 4 — Primer `terraform apply` y carga inicial de secretos en Secret Manager

Cloud Run v2 valida al crearse que los secretos referenciados tengan al menos una versión activa (`latest`). Por eso el primer aprovisionamiento sigue esta secuencia limpia de 2 pasos (sin exponer contraseñas a Terraform):

1. Copia el ejemplo local (archivo ignorado por Git):
   ```bash
   cp infra/terraform/envs/dev/terraform.tfvars.example infra/terraform/envs/dev/terraform.tfvars
   ```
   Completa los valores reales (`gcp_project_id`, `github_repository`, `workload_identity_pool_name`, `firebase_hosting_site_id`, `database_runtime_host`, `database_migrator_host`).
2. Inicializa Terraform contra el bucket GCS y crea primero APIs, IAM y los contenedores vacíos de Secret Manager:
   ```bash
   cd infra/terraform/envs/dev
   terraform init -backend-config="bucket=<TF_STATE_BUCKET>"
   terraform apply \
     -target=module.project_services \
     -target=module.iam \
     -target=module.secret_manager
   ```
3. Carga las contraseñas de los roles de Neon (y opcionalmente el connection string admin para operadores/agentes autorizados) en Google Secret Manager usando stdin para no dejarlas en el historial del shell ni en archivos del repo:
   ```bash
   printf '%s' '<PASSWORD_CASEPILOT_APP>' | gcloud secrets versions add neon-db-runtime-password --project="<GCP_PROJECT_ID>" --data-file=-
   printf '%s' '<PASSWORD_CASEPILOT_MIGRATOR>' | gcloud secrets versions add neon-db-migrator-password --project="<GCP_PROJECT_ID>" --data-file=-
   printf '%s' '<NEON_OWNER_CONNECTION_STRING>' | gcloud secrets versions add neon-db-owner-url --project="<GCP_PROJECT_ID>" --data-file=-
   ```
   *(Cualquier developer autorizado con `roles/secretmanager.secretAccessor` vía `var.secret_admin_members` puede leer estos secretos desde cualquier PC tras `gcloud auth login` con `gcloud secrets versions access latest --secret="<NOMBRE>" --project="<GCP_PROJECT_ID>"`.)*
4. Aplica el resto de la infraestructura DEV (Artifact Registry, Firebase Auth/Hosting, Cloud Run Job y Cloud Run Service):
   ```bash
   terraform apply
   ```
5. Obtén todos los valores no sensibles para GitHub Environment `dev`:
   ```bash
   terraform output
   ```

---

## Paso 5 — Configurar el GitHub Environment `dev` (cero secretos estáticos)

En GitHub → **Settings → Environments → New environment → `dev`**:

- **Environment secrets:** *NINGUNO requerido* (cero claves JSON de GCP, cero `FIREBASE_TOKEN`, cero contraseñas de DB).
- **Environment variables (`vars` no sensibles):**

| Variable (`vars.*`) | Origen / Ejemplo | Consumida por |
| --- | --- | --- |
| `GCP_PROJECT_ID` | `terraform output -raw gcp_project_id` | `infra-*`, `deploy-dev` |
| `GCP_REGION` | `terraform output -raw gcp_region` (`us-east1`) | `infra-*`, `deploy-dev` |
| `TF_STATE_BUCKET` | Salida de `bootstrap-gcp.sh` (`<project>-tfstate`) | `infra-plan`, `infra-apply-dev` |
| `WIF_PROVIDER` | Salida de `bootstrap-gcp.sh` | `infra-*`, `deploy-dev` |
| `WIF_TERRAFORM_SA` | Salida de `bootstrap-gcp.sh` | `infra-plan`, `infra-apply-dev` |
| `WIF_DEPLOYER_SA` | `terraform output -raw wif_deployer_sa` | `deploy-dev` |
| `WORKLOAD_IDENTITY_POOL_NAME` | Salida de `bootstrap-gcp.sh` | `infra-plan`, `infra-apply-dev` |
| `ARTIFACT_REGISTRY_REPO` | `terraform output -raw artifact_registry_repo` | `infra-*`, `deploy-dev` |
| `CLOUD_RUN_SERVICE` | `terraform output -raw cloud_run_service` | `deploy-dev` |
| `CLOUD_RUN_MIGRATE_JOB` | `terraform output -raw cloud_run_migrate_job` | `deploy-dev` |
| `DEV_API_URL` | `terraform output -raw dev_api_url` | `deploy-dev` |
| `FIREBASE_HOSTING_SITE` | `terraform output -raw firebase_hosting_site` | `infra-*`, `deploy-dev` |
| `FIREBASE_WEB_API_KEY` | `terraform output -raw firebase_web_api_key` | `deploy-dev` |
| `FIREBASE_WEB_AUTH_DOMAIN` | `terraform output -raw firebase_web_auth_domain` | `deploy-dev` |
| `FIREBASE_WEB_PROJECT_ID` | `terraform output -raw firebase_web_project_id` | `deploy-dev` |
| `FIREBASE_WEB_APP_ID` | `terraform output -raw firebase_web_app_id` | `deploy-dev` |
| `NEON_DEV_POOLED_HOST` | `ep-xxx-pooler.us-east-1.aws.neon.tech` | `infra-plan`, `infra-apply-dev` |
| `NEON_DEV_DIRECT_HOST` | `ep-xxx.us-east-1.aws.neon.tech` | `infra-plan`, `infra-apply-dev` |
| `NEON_DEV_DATABASE_NAME` | `casepilot_dev` | `infra-plan`, `infra-apply-dev` |
| `NEON_DEV_RUNTIME_USER` | `casepilot_app` | `infra-plan`, `infra-apply-dev` |
| `NEON_DEV_MIGRATOR_USER` | `casepilot_migrator` | `infra-plan`, `infra-apply-dev` |

---

## Paso 6 — Primer despliegue y verificación end-to-end en DEV remoto

1. Dispara manualmente el workflow **Deploy DEV** (`.github/workflows/deploy-dev.yml`) desde la pestaña *Actions* sobre la rama `development` (o haz merge a `development`).
2. El pipeline ejecutará en orden:
   - `quality-gate` (`backend-quality.yml` + `frontend-quality.yml`),
   - `build-and-push-api` (imagen inmutable `sha-<short_sha>` en Artifact Registry),
   - `migrate-dev` (ejecuta `casepilot-api-migrate-dev` contra el host **direct** de Neon con `--wait`),
   - `deploy-api-dev` (despliega en `casepilot-api-dev` contra el host **pooled** de Neon + smoke tests + rollback automático si falla),
   - `deploy-web-dev` (compila SPA, genera `/app-config.json` público de DEV, publica en Firebase Hosting + smoke test HTTP).
3. En Firebase Console → Authentication → Users, crea dos usuarios de prueba DEV con Email/Password (por ejemplo `dev-owner@casepilot.test` y `dev-other@casepilot.test`).
4. Abre `https://<FIREBASE_HOSTING_SITE>.web.app`:
   - Verifica redirección `/ -> /auth/login` e inicio de sesión real con Firebase Auth DEV.
   - Verifica `POST /auth/me/bootstrap` y carga de `/profile`.
   - Edita el nombre (`PATCH /auth/me`), recarga y verifica persistencia real en Neon PostgreSQL.
   - Verifica la comprobación en vivo `200 OK` (cuenta propia) y `403 FORBIDDEN_ERROR` (cuenta ajena).
