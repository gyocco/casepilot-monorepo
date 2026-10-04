# Infra

Infraestructura como código y artefactos de runtime. Las áreas previstas son `terraform/`, `kubernetes/`, `helm/` y `docker/`. No se agregan configuraciones de proveedor ni secretos sin una decisión y un entorno documentados.

## Proveedores y automatización

La fuente canónica es [Infraestructura, proveedores y ambientes](../docs/architecture/infrastructure-providers.md). Se eligieron Firebase Authentication, Google Cloud Run para la API, Firebase Hosting para la SPA Angular/TypeScript, Neon PostgreSQL inicialmente y GitHub Actions. Cloud SQL for PostgreSQL podrá sustituir a Neon o usarse en otros ambientes, con conexión y persistencia independientes del proveedor; por ejemplo, DEV con Neon y QA/Prod con Cloud SQL.

El aprovisionamiento remoto, los recursos y los pipelines se implementarán en una tarea futura. Las áreas previstas no constituyen herramientas de infraestructura como código ya seleccionadas. Decisiones: [ADR 0018](../docs/adr/0018-infrastructure-providers-and-environments.md) y [ADR 0019](../docs/adr/0019-angular-spa.md).

## Desarrollo local

[Dependencias locales de CasePilot](docker/README.md) contiene el entorno Docker Compose. Actualmente provee PostgreSQL con almacenamiento persistente en `127.0.0.1:55432`. Desde la raíz, `pnpm infra:up` crea la configuración local si hace falta y arranca las dependencias.
