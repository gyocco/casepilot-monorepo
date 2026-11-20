# CasePilot Monorepo

Monorepo de CasePilot. `src/apps/` agrupa las aplicaciones ejecutables y desplegables por producto; `src/libs/` agrupa las capacidades técnicas reutilizables por runtime: backend, frontend y mobile. La fuente detallada de estructura y límites es [Arquitectura del monorepo](docs/architecture/monorepo-architecture.md).

## Estado actual

La API contiene una base NestJS/TypeScript con TypeORM, migraciones (Health, 28 modelos de servicios profesionales y `user_identities`), autenticación Bearer vía [`@casepilot/auth`](src/libs/backend/auth/README.md) y autorización en Application. La librería [CQRS](src/libs/backend/cqrs/README.md) proporciona bases Request/Response y Handler; [abstractions](src/libs/backend/abstractions/README.md) proporciona errores puros, Entity, paginación, repositorios genéricos y UnitOfWork con adaptador TypeORM separado. La [SPA](src/apps/casepilot/casepilot-web/README.md) implementa Angular 21 LTS, TypeScript, Material y Tailwind, con autenticación Firebase (emulador en `local`) y pantalla mínima de perfil y verificación de autorización. El [UI kit](src/libs/frontend/pilot-ui-kit/README.md) proporciona componentes reutilizables, tokens CSS globales y recursos por nombre. Mobile conserva la futura composición Capacitor y sigue pendiente. Decisiones: [ADR 0019](docs/adr/0019-angular-spa.md), [ADR 0020](docs/adr/0020-frontend-foundation-and-theming.md), [ADR 0021](docs/adr/0021-gcp-absolute-dev-infrastructure.md) y [ADR 0022](docs/adr/0022-firebase-authentication-and-application-authorization.md).

Los proveedores elegidos son Firebase Authentication, Google Cloud Run para la API, Firebase Hosting para la SPA, Neon PostgreSQL inicialmente y GitHub Actions. Cloud SQL for PostgreSQL puede ser un destino futuro o el proveedor de otros ambientes, con configuración independiente por ambiente y persistencia agnóstica al proveedor. El montaje remoto y su automatización están pendientes; decisiones y ejemplo DEV/QA/Prod en [Infraestructura, proveedores y ambientes](docs/architecture/infrastructure-providers.md).

El backend usa un dominio compartido por aplicación y las capas `application/`, `domain/`, `infrastructure/` y `presentation/` directamente bajo su `src/`. La conexión, DataSource y migraciones viven en `infrastructure/database/`. Decisión: [ADR 0008](docs/adr/0008-application-wide-backend-layers.md).

Application de la API agrupa sus casos de uso por recurso y operación, con archivos handler/request/response obligatorios y datos/reglas reutilizados en `<recurso>/shared/`, conforme a [BCK-023](docs/architecture/backend-architecture-baseline-rules.md#bck-023--application-organizada-por-recurso-y-operacion), [CPA-001](docs/architecture/casepilot-backend-architecture.md#cpa-001--application-de-la-api-organizada-por-recurso) y al [ADR 0017](docs/adr/0017-operation-organized-application.md). Health vive en `application/health/get-health-check-objects/`; los 28 recursos CRUD usan la misma estructura.

Los casos de uso implementan `Handler<Request, Response>` de `@casepilot/cqrs`, con modelos que heredan de sus bases y ejecución directa. Regla [CPA-002](docs/architecture/casepilot-backend-architecture.md#cpa-002--contratos-cqrs-compartidos-e-invocacion-directa) y [ADR 0010](docs/adr/0010-shared-cqrs-contracts.md).

Los repositorios usan `@casepilot/abstractions` con firmas acotadas a primitivos, entidades y modelos de data access. Application coordina transacciones mediante UnitOfWork y repositorios del scope conforme a [BCK-021/BCK-022](docs/architecture/backend-architecture-baseline-rules.md), [CPA-003](docs/architecture/casepilot-backend-architecture.md#cpa-003--abstracciones-de-data-access-compartidas) y [ADR 0011](docs/adr/0011-data-access-abstractions.md).

## Estructura

La [librería exception-handler](src/libs/backend/exception-handler/README.md) aporta manejo HTTP global NestJS con Problem Details y detalle configurable por ambiente sobre los errores puros de abstractions. CasePilot API integra el filtro según el [ADR 0012](docs/adr/0012-configurable-http-error-handler.md).

```text
.
├── .agents/                         # instrucciones y skills para agentes
├── src/
│   ├── apps/
│   │   └── casepilot/
│   │       ├── casepilot-api/       # backend desplegable
│   │       ├── casepilot-mobile/    # aplicación Ionic/Capacitor
│   │       └── casepilot-web/       # aplicación Angular/TypeScript/Material
│   └── libs/
│       ├── backend/                 # capacidades server-side compartidas
│       │   ├── abstractions/       # errores, modelos, repositorios y UnitOfWork
│       │   ├── cqrs/               # Request, Response y Handler reutilizables
│       │   └── exception-handler/  # filtro HTTP NestJS de errores compartidos
│       ├── frontend/
│       │   └── pilot-ui-kit/        # UI reusable
│       └── mobile/                  # adaptadores y capacidades mobile
├── docs/
│   ├── README.md                   # índice de documentación
│   ├── architecture/
│   │   └── monorepo-architecture.md # estructura y límites
│   └── adr/
│       └── 0001-local-postgresql.md # decisión del entorno PostgreSQL local
├── infra/                          # infraestructura y artefactos de runtime
├── tests/                          # pruebas que cruzan límites del monorepo
├── tools/                          # scripts, generadores y codegen
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .editorconfig
└── README.md
```

`contracts/openapi/casepilot-api.yaml` contiene el contrato HTTP inicial. `deploy/` y `.github/workflows/` se incorporarán cuando exista un despliegue o pipeline real. No se crean módulos vacíos solo para completar un árbol.

## Límites de arquitectura

- `src/apps/` contiene bootstrap, configuración, composición y features específicas de cada aplicación. Las reglas de negocio permanecen en la app o módulo que las posee.
- `src/libs/` contiene capacidades técnicas generales con una API clara y consumidores reales o planificados. Las librerías no importan desde aplicaciones ni contienen reglas de negocio específicas de CasePilot.
- `src/libs/backend/` solo se consume desde procesos server-side; no debe llegar a bundles web o mobile.
- `src/libs/frontend/` contiene UI reusable; `src/libs/mobile/` aísla capacidades y diferencias de plataforma con fallback web cuando corresponda.
- `contracts/` contendrá contratos entre clientes, servicios y procesos, independientes del framework y del proveedor de persistencia.
- La UI consume APIs y contratos tipados; no accede directamente a persistencia.
- No se usa Supabase ni se instala Nx. El workspace usa patrones pnpm y scripts explícitos.

## Workspace y comandos

`pnpm-workspace.yaml` incluye aplicaciones en `src/apps/*/*`, librerías en `src/libs/backend/*`, `src/libs/frontend/*` y `src/libs/mobile/*`, y `tools/frontend-architecture`. Cada proyecto conserva manifest, fuentes y pruebas; Testcontainers pertenece a API y abstractions. `tests/architecture/frontend/` contiene regresiones multiproyecto ejecutadas por el paquete de tooling; `tests/` global no es un paquete de producto.

Para ejecutar la API local desde la raíz:

```bash
pnpm install --frozen-lockfile
pnpm infra:up
pnpm migration:api:run
pnpm dev:api
```

Responde en `http://127.0.0.1:3000/health` y `http://127.0.0.1:3000/health/database`. Configuración por entorno, migraciones y verificaciones: [README de la API](src/apps/casepilot/casepilot-api/README.md).

Los scripts de la web apuntan a `src/apps/casepilot/casepilot-web/`:

```bash
pnpm dev:web
pnpm lint:web
pnpm build:web
pnpm check:web
```

La web se sirve en `http://127.0.0.1:4200`; antes de e2e instala Chromium como indica su README. `check:web` verifica kit/SPA, reglas FRT, sus regresiones y e2e móvil/escritorio con axe. Fuentes: [arquitectura frontend](docs/architecture/frontend-architecture.md), [catálogo FRT](docs/architecture/frontend-architecture-rules.md) y [cobertura](tools/frontend-architecture/README.md). El [workflow frontend](.github/workflows/frontend-quality.yml) ejecutará ese mismo gate al incorporarse a GitHub; no realiza despliegues. La API dispone de `lint:api`, `typecheck:api`, `build:api`, `test:api` y `test:api:integration`.

`pnpm check:cqrs` verifica tipos, lint, pruebas y build de CQRS; `pnpm build:cqrs` y `pnpm test:cqrs` permiten ejecutar pasos separados. Los scripts de verificaciones/tests/build de la API compilan primero sus declaraciones, también desde la carpeta API.

`pnpm check:abstractions` verifica tipos, lint, errores, modelos y build; `pnpm build:abstractions`/`pnpm test:abstractions` ejecutan pasos separados. `pnpm test:abstractions:integration` usa PostgreSQL efímero y requiere Docker para comprobar transacciones entre repositorios, rollback/commit y scopes concurrentes. La API construye las librerías antes de consumir sus declaraciones.

`pnpm check:api:architecture` ejecuta TypeScript, ESLint, dependency-cruiser y ts-morph. `pnpm test:api:architecture` prueba sus validadores y forma parte de `test:api`. Cobertura y límites: [guía de validación de la API](src/apps/casepilot/casepilot-api/docs/architecture-validation.md).

`pnpm check:exception-handler` verifica tipos, lint, unitarias, HTTP NestJS y build de la librería de errores, sin Docker. `pnpm build:exception-handler` y `pnpm test:exception-handler` ejecutan pasos separados. La API también construye esta librería antes de sus verificaciones.

Para preparar las declaraciones compartidas que consume el editor, usa `pnpm build:contracts` después de instalar dependencias. Si editas las librerías, `pnpm watch:contracts` construye primero los tres paquetes y mantiene sus declaraciones actualizadas. La configuración versionada de VS Code selecciona el directorio ESLint de cada paquete y ofrece TypeScript 5.9.3 del workspace. Procedimiento y diagnóstico de `no-unsafe-*`: [guía de validación](src/apps/casepilot/casepilot-api/docs/architecture-validation.md#vs-code-y-lint-con-tipos).

`pnpm test:api:integration` delega en `casepilot-api/test/integration/`, junto a las unitarias de ese proyecto, con PostgreSQL efímero creado por Testcontainers. Requiere Docker, sin arrancar Compose ni usar la base persistente local. Comandos y aislamiento: [README de integración](src/apps/casepilot/casepilot-api/test/integration/README.md). `tests/` global se reserva para suites de varios proyectos; la guía de estructura define esa convención.

## Dependencias locales

Con Docker Desktop/Engine activo, desde la raíz:

```bash
pnpm infra:up
pnpm infra:status
pnpm infra:down
```

El entorno inicia PostgreSQL en `127.0.0.1:55432`, genera una contraseña local en un archivo ignorado por Git y conserva los datos al apagarlo. Los requisitos, variables, conexión de la API y demás comandos están en [Dependencias locales de CasePilot](infra/docker/README.md).

## Documentación

- [Índice de documentación](docs/README.md)
- [Arquitectura del monorepo](docs/architecture/monorepo-architecture.md)
- [Instrucciones para agentes](AGENTS.md)
- [Infraestructura](infra/README.md)
- [Pruebas transversales](tests/README.md)
- [Herramientas](tools/README.md)

El backend es NestJS/TypeScript con TypeORM. No se crean proyectos ni archivos de configuración .NET.

La validación backend estructural y los parsers HTTP se mantienen en [validation](src/libs/backend/validation/README.md), con pnpm check:validation, pnpm build:validation y pnpm test:validation. Los mecanismos SQL/errores/runtime compartidos se documentan en [abstractions](src/libs/backend/abstractions/README.md) y [ADR 0016](docs/adr/0016-reusable-backend-mechanisms.md).
