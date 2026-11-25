# 0021 — Infraestructura DEV en Google Cloud + Neon PostgreSQL (Free Tier)

- Estado: aceptada; IaC Terraform, Dockerfile multi-stage, scripts CI/CD y workflows implementados y validados localmente (2026-11-24); pendiente ejecución del bootstrap único remoto con credenciales GCP/Neon del operador.
- Fecha: 2026-11-20 (revisión: 2026-11-24).
- Alcance: ambiente DEV remoto de CasePilot, separación local vs DEV y gestión de secretos.
- Relacionada con: [ADR 0018](0018-infrastructure-providers-and-environments.md).

## Contexto

El [ADR 0018](0018-infrastructure-providers-and-environments.md) eligió Firebase Authentication, Cloud Run, Firebase Hosting y GitHub Actions, con Neon PostgreSQL inicialmente y Cloud SQL como opción por ambiente. Para el ambiente DEV automatizado se prioriza minimizar al máximo el costo recurrente apuntando a tiers gratuitos reales (~USD \$0/mes en uso DEV), concentrando cómputo, hosting, identidad, registro de imágenes y secretos en **Google Cloud** y adoptando **Neon PostgreSQL (Free Tier)** para la base de datos de DEV, manteniendo una separación estricta entre el ambiente `local` (PC del desarrollador) y `development` (DEV remoto).

## Decisión

1. **Stack DEV económico (Google Cloud + Neon PostgreSQL Free Tier)**:
   - Identidad: **Firebase Authentication** (free tier hasta 50.000 MAU).
   - SPA Angular: **Firebase Hosting** (free allowance Spark/Blaze con CDN, HTTPS y rewrites SPA).
   - API NestJS y migraciones coordinadas: **Google Cloud Run** (Service con `min-instances=0` y Cloud Run Job dedicado para `typeorm migration:run` usando la misma imagen inmutable).
   - Registro de imágenes: **Artifact Registry** con política de limpieza automática (< 0.5 GB).
   - Base de datos: **Neon PostgreSQL (Free Tier)** con *scale-to-zero*, conexión PostgreSQL estándar sobre TLS (`DATABASE_SSL=true`, `DATABASE_SSL_REJECT_UNAUTHORIZED=true`), endpoint **pooled** para el runtime `Cloud Run Service` (`casepilot_app`, DML mínimo) y endpoint **direct (unpooled)** para el `Cloud Run Job` de migraciones (`casepilot_migrator`, DDL).
   - Secretos: **Google Secret Manager** almacena las credenciales de Neon y las inyecta directamente en Cloud Run Service/Job mediante IAM por secreto.
   - CI/CD: **GitHub Actions** autenticando contra Google Cloud exclusivamente mediante **Workload Identity Federation (OIDC)** sin claves JSON estáticas.
2. **Separación de ambientes**:
   - `local` opera 100% en la PC local con Docker Compose (PostgreSQL 18 + Firebase Auth Emulator) sin credenciales ni tráfico hacia el proyecto GCP DEV ni hacia Neon DEV.
   - `test` opera con PostgreSQL efímero (Testcontainers) y verificadores deterministas sin acceso a red ni a recursos remotos.
   - `development` (DEV) vive en un proyecto GCP dedicado y un proyecto/branch Neon DEV dedicado, aislados de futuros ambientes QA y producción.
3. **Independencia del proveedor de persistencia**:
   - La configuración y las migraciones de PostgreSQL permanecen agnósticas al proveedor conforme al [ADR 0018](0018-infrastructure-providers-and-environments.md). **Cloud SQL for PostgreSQL** sigue siendo una opción aceptada para QA/producción o migración futura sin modificar Domain, Application ni repositorios.

## Alternativas consideradas

- Cloud SQL for PostgreSQL Enterprise `db-f1-micro` en DEV: unifica todo bajo Google Cloud, pero genera costo base mensual (~USD \$7–10/mes continuo, o ~USD \$2–4/mes con apagado programado) que se evita en DEV usando Neon Free Tier.
- PostgreSQL autogestionado en Compute Engine `e2-micro`: puede entrar en Always Free, pero agrega administración manual de sistema operativo, backups, parches y red.
- Claves JSON de Service Account en GitHub Secrets: descartado por riesgo de rotación y exposición; reemplazado por OIDC/Workload Identity Federation.

## Consecuencias

- Todo el ambiente DEV apunta a **costo ~USD \$0/mes** dentro de los free tiers de Google Cloud (Cloud Run, Firebase Auth/Hosting, Artifact Registry, Secret Manager) y Neon PostgreSQL.
- Al conectar por TCP estándar con TLS (`DATABASE_SSL=true`) hacia Neon, DEV no requiere Cloud SQL Auth Proxy ni socket Unix (ese soporte queda reservado para cuando QA/Prod adopten Cloud SQL).
- Se introduce Neon como proveedor administrado de PostgreSQL en DEV; sus credenciales y endpoints se gobiernan exclusivamente desde Google Secret Manager e IaC, nunca en el repositorio ni en GitHub Secrets.
- El Bloque B deja implementados y validados localmente `infra/terraform/` (módulos + `envs/dev/` + `bootstrap/`), `infra/docker/casepilot-api.Dockerfile`, `deploy/dev/firebase.json`, `tools/ci/` y los workflows `.github/workflows/{backend-quality,frontend-quality,infra-plan,infra-apply-dev,deploy-dev}.yml` ([guía operativa DEV](../operations/dev-deployment-and-iac.md)). Los recursos remotos se crearán al ejecutar el bootstrap del operador; este ADR no afirma que el proyecto GCP DEV ni Neon DEV ya estén provisionados en la nube.
