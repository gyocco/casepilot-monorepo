# 0021 — Google Cloud como proveedor absoluto en DEV

- Estado: aceptada; aprovisionamiento remoto pendiente (Bloque B).
- Fecha: 2026-11-20.
- Alcance: ambiente DEV remoto de CasePilot, separación local vs DEV y gestión de secretos.
- Relacionada con: [ADR 0018](0018-infrastructure-providers-and-environments.md).

## Contexto

El [ADR 0018](0018-infrastructure-providers-and-environments.md) eligió Firebase Authentication, Cloud Run, Firebase Hosting y GitHub Actions, con Neon PostgreSQL inicialmente y Cloud SQL como opción por ambiente. El usuario define ahora adoptar **Google Cloud como proveedor absoluto** para el ambiente DEV automatizado, priorizando tiers gratuitos o las opciones administradas más económicas posibles, y manteniendo una separación estricta entre el ambiente `local` (PC del desarrollador) y `development` (DEV en Google Cloud).

## Decisión

1. **Google Cloud como proveedor único en DEV**:
   - Identidad: **Firebase Authentication** (free tier hasta 50.000 MAU).
   - SPA Angular: **Firebase Hosting** (free allowance Spark/Blaze con CDN, HTTPS y rewrites SPA).
   - API NestJS y migraciones coordinadas: **Google Cloud Run** (Service con `min-instances=0` y Cloud Run Job dedicado para `typeorm migration:run` usando la misma imagen inmutable).
   - Registro de imágenes: **Artifact Registry** con política de limpieza automática (< 0.5 GB).
   - Base de datos: **Cloud SQL for PostgreSQL** Enterprise `db-f1-micro` zonal sin HA (opción administrada más económica de GCP, con soporte opcional de apagado programado fuera de horario en DEV).
   - Secretos: **Google Secret Manager** inyectados directamente en Cloud Run Service/Job mediante IAM por secreto.
   - CI/CD: **GitHub Actions** autenticando contra Google Cloud exclusivamente mediante **Workload Identity Federation (OIDC)** sin claves JSON estáticas.
2. **Separación de ambientes**:
   - `local` opera 100% en la PC local con Docker Compose (PostgreSQL 18 + Firebase Auth Emulator) sin credenciales ni tráfico hacia el proyecto GCP DEV.
   - `test` opera con PostgreSQL efímero (Testcontainers) y verificadores deterministas sin acceso a red ni a GCP.
   - `development` (DEV) vive en un proyecto GCP dedicado, aislado de futuros ambientes QA y producción.
3. **Independencia del proveedor de persistencia**:
   - La configuración y las migraciones de PostgreSQL permanecen agnósticas al proveedor conforme al [ADR 0018](0018-infrastructure-providers-and-environments.md). Cloud SQL Auth Proxy (socket Unix en Cloud Run) se encapsula en configuración/despliegue sin acoplar Domain ni Application.

## Alternativas consideradas

- Mantener Neon PostgreSQL en DEV: conserva free tier con scale-to-zero, pero introduce un proveedor fuera de Google Cloud.
- PostgreSQL autogestionado en Compute Engine `e2-micro`: puede entrar en Always Free, pero agrega administración manual de sistema operativo, backups, parches y red.
- Claves JSON de Service Account en GitHub Secrets: descartado por riesgo de rotación y exposición; reemplazado por OIDC/Workload Identity Federation.

## Consecuencias

- Todo el stack remoto de DEV queda unificado bajo IAM, billing y gobierno de Google Cloud.
- Cloud SQL `db-f1-micro` es el único recurso de DEV con costo base mensual (~USD \$7–10/mes continuo, reducible con schedule de apagado); los demás recursos operan dentro de los límites gratuitos en uso DEV.
- La implementación de Terraform, Dockerfile y pipelines de despliegue se ejecutará en una iteración posterior (Bloque B); este ADR no acredita recursos remotos ya provisionados.
