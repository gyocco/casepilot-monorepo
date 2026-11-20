# Infraestructura, proveedores y ambientes de CasePilot

- Estado: decisiones aceptadas; autenticación local/emulador implementada, aprovisionamiento remoto pendiente.
- Fecha: 2026-10-04.
- Revisión: 2026-11-20.
- Alcance: identidad, API, SPA, PostgreSQL y CI/CD de CasePilot.
- Decisiones: [ADR 0018](../adr/0018-infrastructure-providers-and-environments.md), [ADR 0019](../adr/0019-angular-spa.md), [ADR 0021](../adr/0021-gcp-absolute-dev-infrastructure.md) y [ADR 0022](../adr/0022-firebase-authentication-and-application-authorization.md).

Este documento es la fuente canónica de los proveedores elegidos y de la independencia de PostgreSQL por ambiente. Según el [ADR 0021](../adr/0021-gcp-absolute-dev-infrastructure.md), el ambiente DEV remoto adopta **Google Cloud como proveedor absoluto** (Firebase Authentication, Cloud Run, Firebase Hosting, Cloud SQL for PostgreSQL `db-f1-micro`, Artifact Registry y Secret Manager), conservando la portabilidad PostgreSQL hacia Neon u otros destinos definida en el [ADR 0018](../adr/0018-infrastructure-providers-and-environments.md). El montaje de los servicios remotos y su automatización con GitHub Actions se implementarán en una tarea futura (Bloque B). La autenticación Firebase y la autorización en `Application` están implementadas con aislamiento completo para `local` (emulador) y `test` ([ADR 0022](../adr/0022-firebase-authentication-and-application-authorization.md)).

## Proveedores elegidos

| Responsabilidad | Decisión | Aplicación y alcance |
| --- | --- | --- |
| Autenticación | Firebase Authentication | Identidad de usuarios, email/contraseña, proveedores sociales y recuperación de contraseña. La integración concreta se implementará después. |
| Backend API | Google Cloud Run | API NestJS/TypeScript, empaquetada como imagen de contenedor. PostgreSQL es un servicio separado del contenedor de la API. |
| Frontend SPA | Firebase Hosting | Publicación del build estático de la SPA Angular/TypeScript, con configuración de rutas del cliente. |
| Base de datos inicial | Neon PostgreSQL | Proveedor inicial para los ambientes remotos que se configuren con Neon. |
| Base de datos futura o de otros ambientes | Google Cloud SQL for PostgreSQL | Destino posible de migración desde Neon y opción para QA/producción. Ambos proveedores deben poder coexistir en ambientes diferentes. |
| CI/CD | GitHub Actions | Verificación, builds, aprovisionamiento y despliegues futuros, con configuración y credenciales separadas por ambiente. |

La SPA usa Angular 21 LTS y TypeScript, Material mediante `pilot-ui-kit` y Tailwind CSS, conforme al [ADR 0020](../adr/0020-frontend-foundation-and-theming.md). La compatibilidad futura con Capacitor y las fronteras apps/libs siguen vigentes. La política está en [20 — Frontend y plataforma](../../.agents/instructions/20-frontend-platform.md); la [arquitectura frontend](frontend-architecture.md) define la base implementada.

## Identidad y acceso a datos

El cliente se autentica con Firebase Authentication mediante un adaptador de cliente. La API verificará el Firebase ID token y transformará la identidad verificada en datos internos tipados; los permisos sobre cuentas, equipos y recursos seguirán perteneciendo a Application. Los SDKs del proveedor se encapsulan en las fronteras técnicas, fuera de Domain/Application. El SDK administrativo y las credenciales administrativas permanecen exclusivamente en backend, fuera del bundle cliente.

La UI consume la API NestJS y sus contratos. No se conecta directamente a Neon ni a Cloud SQL. Usuarios de producto, cuentas y permisos pertenecen a CasePilot y su persistencia PostgreSQL; la autenticación del proveedor no sustituye esa autorización.

## PostgreSQL independiente del proveedor

La configuración de conexión y el uso de PostgreSQL deben permitir cambiar de Neon a Cloud SQL y de Cloud SQL a Neon sin modificar casos de uso, modelos, contratos HTTP ni repositorios por una diferencia de proveedor. El backend mantiene TypeORM y el driver PostgreSQL como mecanismos técnicos existentes.

- Host, puerto, nombre de base, credenciales, schema, TLS, CA, pool y timeouts se inyectan por ambiente mediante configuración externa. No se fijan endpoints ni nombres de proveedor en el negocio.
- Runtime y CLI de migraciones usan la misma carga de configuración y fábrica de opciones. Las diferencias entre destinos se expresan en la configuración del ambiente y en sus recursos de conectividad.
- Un proxy, conector o mecanismo de autenticación específico de Cloud SQL, si se necesita, se encapsula en Infrastructure/composición o en infraestructura de despliegue. No obliga a cambiar puertos internos ni SQL de negocio. Su implementación y configuración deben verificarse antes de habilitarlo.
- El esquema, las migraciones y las consultas permanecen compatibles con PostgreSQL en ambos destinos. Las versiones, extensiones, permisos y funcionalidades necesarias se comprueban en los dos proveedores antes de incorporarlas.
- Los límites de conexiones se ajustan por ambiente, considerando el pool de cada proceso y el escalado de Cloud Run. La conexión de runtime y la usada para migraciones pueden requerir endpoints y usuarios distintos sin duplicar el historial de migraciones.
- Los secretos se inyectan únicamente en backend y CI/CD; no se versionan ni se imprimen en logs. TLS mantiene verificación de certificados.

La API ya dispone de configuración genérica `DATABASE_*`, conexión PostgreSQL y una fábrica compartida de opciones, con `synchronize: false` y `migrationsRun: false`. Su contrato vigente y precedencia están en el [README de la API](../../src/apps/casepilot/casepilot-api/README.md). Esto no acredita todavía una integración remota probada con Neon o Cloud SQL.

Actualmente `DATABASE_URL` admite una URL PostgreSQL sin query parameters. Una URL de proveedor con parámetros como `sslmode` debe expresarse mediante los campos de conexión y las opciones TLS soportadas, o requerirá una ampliación explícita y probada del parser; no se acepta copiarla sin revisar su compatibilidad.

## Configuración por ambiente

La elección del proveedor es independiente en cada ambiente. Esta matriz es un ejemplo admitido, no un inventario de recursos provisionados ni una asignación definitiva de QA/producción:

| Ambiente de despliegue | `APP_ENV` actual | PostgreSQL | Identidad | Estado |
| --- | --- | --- | --- | --- |
| LOCAL | `local` | Docker Compose local | Firebase Auth Emulator local | Implementado; aislado de GCP DEV. |
| Pruebas aisladas | `test` | PostgreSQL efímero con Testcontainers | Verificador determinista in-memory | Implementado; sin red ni recursos remotos. |
| DEV | `development` | Cloud SQL `db-f1-micro` (GCP) | Firebase Authentication (proyecto GCP DEV) | Proveedor GCP elegido ([ADR 0021](../adr/0021-gcp-absolute-dev-infrastructure.md)); aprovisionamiento pendiente. |
| QA | `staging` | Cloud SQL / Neon (por ambiente) | Firebase Authentication (proyecto dedicado) | Ejemplo posible; aprovisionamiento pendiente. |
| Prod | `production` | Cloud SQL | Firebase Authentication (proyecto dedicado) | Ejemplo posible; aprovisionamiento pendiente. |

QA es una etiqueta de despliegue; el runtime actual usa `staging` y no admite `APP_ENV=qa`. Los ambientes deben aislar bases, credenciales, configuración de identidad, URLs y permisos. La configuración pública de Angular puede variar por build o mediante una configuración de runtime explícita; en ambos casos solo contiene valores públicos.

## Cambio de proveedor y migración de datos

Cambiar la configuración selecciona otra base: no mueve datos ni conserva automáticamente el estado del destino anterior. Para una base vacía se aplican las mismas migraciones versionadas. Para mover una base con datos se prepara un procedimiento explícito que incluya:

1. Verificar versiones PostgreSQL, schema, extensiones, roles y permisos del destino.
2. Preparar backup, transferencia de datos y tratamiento de las escrituras durante el cambio.
3. Validar datos, historial de migraciones y comportamiento de la API en el destino.
4. Cambiar la configuración del ambiente y comprobar conexión, TLS, transacciones y consultas.
5. Definir recuperación y tratamiento de los datos escritos tras el cambio. Volver al proveedor anterior también requiere reconciliar esos datos.

La independencia de proveedor reduce cambios de código; no implica una migración instantánea ni sin interrupciones. El mismo criterio aplica en ambas direcciones.

## Automatización futura con GitHub Actions

En una tarea futura se montarán los servicios y se automatizarán los siguientes pasos por ambiente:

1. Ejecutar lint, type-check, build, pruebas y validaciones de arquitectura aplicables, usando PostgreSQL efímero para integración.
2. Construir la imagen de API y el build de la SPA Angular, con artefactos identificables por versión.
3. Aprovisionar/configurar recursos, identidad, conectividad y secretos de cada ambiente mediante automatización versionada. La herramienta de infraestructura como código y el registro de imágenes se elegirán al implementar.
4. Ejecutar las migraciones como un paso coordinado de release, separado del arranque de las réplicas.
5. Desplegar la API en Cloud Run y la SPA en Firebase Hosting; comprobar health checks y recorridos de autenticación/API.
6. Aplicar las protecciones y autorizaciones de despliegue correspondientes y registrar el procedimiento de recuperación.

Los workflows vivirán en `.github/workflows/`; la infraestructura en `infra/`; la configuración de release en `deploy/`; los scripts transversales necesarios en `tools/ci/`. Para acceso a Google Cloud se priorizarán credenciales temporales mediante OIDC/Workload Identity Federation; la configuración concreta de permisos se hará al montar la infraestructura. El [workflow frontend](../../.github/workflows/frontend-quality.yml) solo verifica calidad; no provisiona ni despliega. Los workflows de infraestructura y release siguen pendientes.

## Evidencia y pendientes

Los checks backend existentes verifican fronteras y propiedades delimitadas de la API; no prueban selección de proveedores por ambiente ni portabilidad remota. La base Angular/kit y sus checks están implementados; el workflow de calidad está definido y aún debe verificarse en GitHub. Firebase Authentication, Cloud Run, Hosting, aprovisionamiento y workflows de release todavía requieren implementación y verificaciones propias. La compatibilidad Neon/Cloud SQL se acreditará mediante pruebas contra ambos destinos, además de las pruebas PostgreSQL locales existentes; los detalles de esa ejecución se definirán sin usar la base de producción para pruebas.

## Referencias

- [Arquitectura del monorepo](monorepo-architecture.md), [adopción backend](casepilot-backend-architecture.md) y [cobertura actual de validadores](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md).
- [Firebase Authentication](https://firebase.google.com/docs/auth) y [validación de ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens).
- [Cloud Run](https://docs.cloud.google.com/run/docs/overview) y [Firebase Hosting](https://firebase.google.com/docs/hosting).
- [Conexión PostgreSQL de Neon](https://neon.com/docs/connect/connect-from-any-app) y [Cloud SQL desde Cloud Run](https://docs.cloud.google.com/sql/docs/postgres/connect-run).
- [GitHub Actions con OIDC hacia Google Cloud](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-google-cloud-platform).

Referencias técnicas consultadas el 2026-10-04. Cuotas y precios no forman parte de estas decisiones y deben comprobarse al aprovisionar.
