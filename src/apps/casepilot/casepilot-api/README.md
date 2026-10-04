# CasePilot API

API REST NestJS/TypeScript con TypeORM y PostgreSQL. Es el host backend inicial de CasePilot; comparte un dominio y cuatro capas para todos sus modelos y casos de uso. Las [reglas backend](../../../../docs/architecture/backend-architecture-baseline-rules.md) y la [arquitectura](../../../../docs/architecture/backend-architecture-baseline.md) son obligatorias por la [adopción particular de CasePilot](../../../../docs/architecture/casepilot-backend-architecture.md).

## Arranque local

Requisitos: Node.js **22.12 o superior**, pnpm **10.13.1** y Docker con contenedores Linux. Desde la raíz del monorepo:

```bash
pnpm install --frozen-lockfile
pnpm infra:up
pnpm migration:api:run
pnpm dev:api
```

La API escucha en `http://127.0.0.1:3000`; PostgreSQL en `127.0.0.1:55432`. No necesitas copiar la contraseña: exclusivamente en `APP_ENV=local`, la API lee `infra/docker/.env`, creado por `infra:up`. No se arranca la API dentro de Compose.

Para ejecutar el build:

```bash
pnpm build:api
pnpm start:api
```

`dev:api` usa watch. Ctrl+C cierra el proceso y su pool. Los artefactos `dist/` y `build/` están ignorados por Git.

## Health checks y contrato

Antes de las sondas, la API también implementa los **28 recursos de servicios profesionales** con POST, GET por ID, PATCH, DELETE y GET paginado. Los endpoints son públicos según la decisión del usuario; autenticación queda diferida. Las rutas, ejemplos, versiones, formatos y límites están en [CRUD de servicios profesionales](docs/professional-services-crud.md) y el contrato completo en [OpenAPI](../../../../contracts/openapi/casepilot-api.yaml). Solo se persisten datos y metadatos de documentos; no se accede a archivos ni servicios externos.


| Endpoint | Respuesta | Recorrido |
| --- | --- | --- |
| `GET /health` | `200`, `{ "status": "ok" }` | Controller y respuesta técnica HTTP. No ejecuta Application ni inicializa PostgreSQL. |
| `GET /health/database` | `200`, `{ "status": "ok", "objects": [{ "guid": "…", "value": "…" }] }` | Controller → query Application → contrato de repositorio Domain → implementación Infrastructure → SELECT TypeORM/PostgreSQL. |
| `GET /health/database` con persistencia inaccesible | `500`, Problem Details con `code: "UNEXPECTED_ERROR"` | Error técnico normalizado → UnexpectedError compartido → filtro global; sin credenciales, SQL ni detalles del driver. |

Ambos endpoints devuelven `Cache-Control: no-store`. Una tabla vacía produce `200` con `objects: []`; el endpoint profundo comprueba que la tabla es consultable. Es una sonda técnica pública, sin autenticación ni reglas de producto. El simple sirve para liveness; el profundo puede utilizarse para readiness. No comprueban proveedores que todavía no existen.

El contrato externo versionado vive en [contracts/openapi/casepilot-api.yaml](../../../../contracts/openapi/casepilot-api.yaml). No se sirve Swagger UI. Los modelos HTTP son explícitos y no exponen entidades TypeORM.

## Capas y composición

```text
src/
├── main.ts / create-app.ts / app.module.ts
├── api.module.ts                   # registro de módulos de composición por recurso
├── application/
│   └── health/
│       └── get-health-check-objects/ # GetHealthCheckObjectsRequest/Handler/Response
├── domain/
│   ├── entities/                   # HealthCheckObject: datos, sin lógica
│   └── repositories/               # contrato getAll y error técnico
├── infrastructure/
│   ├── config/                     # carga y validación técnica por entorno
│   ├── database/                   # conexión, DataSource CLI y migraciones
│   └── persistence/
│       ├── schemas/                # EntitySchema TypeORM separado de Domain
│       └── repositories/           # implementación: un SELECT, sin transacción
└── presentation/
    └── health/
        ├── health.module.ts        # controller y bindings de Health
        ├── health.controller.ts    # rutas y delegación a Application
        └── health-http.response.ts # modelos HTTP exitosos
```

`GetHealthCheckObjectsHandler.execute(request)` recibe exactamente un request, incluso sin campos, y devuelve un response concreto. Application elige y mapea los datos de salida. Domain/Application no importan NestJS, TypeORM ni APIs del proceso. Los factories de composición inyectan dependencias sin decoradores en esas capas.

## Manejo global de errores

`AppModule` registra [`@casepilot/exception-handler/nestjs`](../../../libs/backend/exception-handler/README.md) con su política de ambiente. Health usa UnexpectedError de [`@casepilot/abstractions`](../../../libs/backend/abstractions/README.md) y el mapeo estándar a 500, sin error ni mapping propios. El filtro global captura errores del ciclo HTTP y devuelve `application/problem+json` según [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html), con type/title/status/instance/code. Instance es una URN UUID por ocurrencia; no contiene URL ni query string. UnexpectedError/ValidationError/NotFoundError/ForbiddenError/UnauthorizedError se traducen a 500/400/404/403/401. Application consume el vocabulario puro desde abstractions; exception-handler lo reexporta por compatibilidad y el adaptador `/nestjs` pertenece a transporte/composición.

`API_ERROR_DETAILS=false` omite detail, stack y errors. Con true se exponen mensajes, stack y detalles explícitos de errores tipados y mensajes seleccionados de 4xx de Nest. Health expone únicamente el mensaje genérico de UnexpectedError y su stack; nunca datos del driver. Las causas de proveedor, errores desconocidos y 5xx de Nest siguen sanitizados. No colocar secretos ni SQL en mensajes/detalles seleccionados. Configuración y ejemplos del paquete: su README; evolución del contrato Health: [ADR 0012](../../../../docs/adr/0012-configurable-http-error-handler.md). OpenAPI 0.3.0 reemplaza el 503/DATABASE_UNAVAILABLE anterior por 500/UNEXPECTED_ERROR.

Los modelos Request/Response de Application heredan de las bases correspondientes de [`@casepilot/cqrs`](../../../libs/backend/cqrs/README.md). Cada `<Operation>Handler`, en `.handler.ts`, implementa `Handler<OperationRequest, OperationResponse>` y devuelve una Promise; `Handler` se importa como tipo y las bases como valores por la entrada pública. El controller llama directamente a `handler.execute(request)`. Regla [CPA-002](../../../../docs/architecture/casepilot-backend-architecture.md#cpa-002--contratos-cqrs-compartidos-e-invocacion-directa) y [ADR 0010](../../../../docs/adr/0010-shared-cqrs-contracts.md).

Application se organiza por recurso y operación según [BCK-023](../../../../docs/architecture/backend-architecture-baseline-rules.md#bck-023--application-organizada-por-recurso-y-operacion), [CPA-001](../../../../docs/architecture/casepilot-backend-architecture.md#cpa-001--application-de-la-api-organizada-por-recurso) y el [ADR 0017](../../../../docs/adr/0017-operation-organized-application.md). Cada carpeta `application/<recurso>/<operacion>/` contiene `<operacion>.handler.ts`, `<operacion>.request.ts` y `<operacion>.response.ts`, con las clases concretas declaradas y exportadas allí. Los datos auxiliares exclusivos permanecen con el request; los modelos de datos, mappers y reglas reutilizados van a `<recurso>/shared/`. Los colaboradores de producto entre recursos conservan `application/shared/`. No se crean carpetas `commands`/`queries` ni archivos sueltos en Application o la raíz de un recurso.

```text
application/activities/
├── create-activity/
│   ├── create-activity.handler.ts
│   ├── create-activity.request.ts  # CreateActivityRequest y CreateActivityData
│   └── create-activity.response.ts # CreateActivityResponse compone ActivityResponse
├── get-activity/                   # mismo trío obligatorio
├── update-activity/
├── delete-activity/
├── list-activities/
└── shared/
    ├── activity.response.ts        # ActivityResponse y su mapper reutilizados
    └── activity.rules.ts           # campos, orden y reglas de relaciones
```

El gate verifica existencia del trío, declaraciones concretas, identidad de los modelos usados por el handler y dependencias de shared. No se conservan archivos `.models.ts` que agrupen contratos de distintas operaciones. Los modelos auxiliares usados solo por una operación, como HealthCheckObjectResponse, permanecen junto a ella. Elegir qué datos o reglas deben compartirse conserva revisión semántica.

La conexión se inicializa al primer acceso a datos, comparte la inicialización entre llamadas concurrentes y permite un nuevo intento después de un fallo. El arranque HTTP no necesita una conexión disponible. Esto no elimina la obligación de configurar correctamente las credenciales antes de arrancar. No se crean transacciones de casos de uso, escrituras, hooks ni cascadas en esta query.

Los helpers de conexión/configuración tienen un único consumidor y permanecen en Infrastructure de esta API; no se llena `libs/backend` con código específico de CasePilot. Los nuevos modelos y operaciones se incorporan a las mismas cuatro capas, sin crear contextos ni repetir capas por feature. `DatabaseModule` compone únicamente el mecanismo técnico de conexión, registrado una vez como global por `AppModule`. Las capas compartidas se conservan según el [ADR 0008](../../../../docs/adr/0008-application-wide-backend-layers.md); la composición por recurso evoluciona según el [ADR 0013](../../../../docs/adr/0013-resource-module-composition.md).

## Agregar endpoints sin modificar AppModule

`AppModule` configura la conexión y el filtro global de errores, e importa `ApiModule`. `ApiModule` es el registro explícito de módulos de composición. `HealthModule`, su controller y sus responses HTTP conviven en `presentation/health/`, según [CPA-004](../../../../docs/architecture/casepilot-backend-architecture.md#cpa-004--presentation-organizada-por-modulo-de-recurso) y el [ADR 0014](../../../../docs/adr/0014-resource-organized-presentation.md). El módulo reúne las factories de repositorio/handler; esos detalles ya no pertenecen a la raíz.

1. Para una operación de un recurso existente, crea `application/<recurso>/<operacion>/` con su Request/Handler/Response en los tres archivos obligatorios del mismo prefijo. Extrae datos/reglas usados por varias operaciones a `<recurso>/shared/`. Agrega la ruta en su controller y los bindings nuevos en el módulo de ese recurso. No cambia `AppModule` ni `ApiModule`.
2. Si agregas otro controller del mismo recurso, inclúyelo en `controllers` de ese módulo.
3. Para un recurso nuevo, crea `presentation/<recurso>/<recurso>.module.ts` y coloca sus controllers/modelos HTTP en esa carpeta. Registra el módulo una sola vez en `imports` de `api.module.ts`. Por ejemplo, Cases tendrá `presentation/cases/cases.module.ts` y el registro será `imports: [HealthModule, CasesModule]`. Sus siguientes endpoints solo afectan a Cases.
4. Si otro módulo necesita un handler, expórtalo desde su módulo propietario e importa ese módulo en el consumidor; no dupliques sus providers. Los contratos internos siguen compartidos por la aplicación.

Los módulos agrupan composición, sin mover ni repetir Application/Domain/Infrastructure/Presentation. Solo el archivo de módulo importa Domain/Infrastructure para los bindings; controllers y modelos HTTP mantienen sus restricciones y no importan módulos de composición. Los bindings usan factories porque los handlers son clases puras y las interfaces TypeScript no existen en runtime; no se añaden decoradores Nest al núcleo para reducir líneas. El registro usa imports estáticos, sin escaneo de archivos ni registro automático por nombres. Los schemas/migraciones nuevos siguen registrándose en `infrastructure/database/create-data-source-options.ts`, compartido por runtime y CLI.

## Configuración por entorno

`APP_ENV` acepta `local`, `test`, `development`, `staging` y `production`. Se selecciona con la variable del proceso, después con `.env` de la app; sin selección explícita se usa `local`, salvo `NODE_ENV=production`, que exige selección explícita. `.env.<APP_ENV>` no puede cambiar el entorno seleccionado.

Precedencia de menor a mayor:

1. Valores por defecto.
2. `infra/docker/.env`, exclusivamente para `local` y variables locales PostgreSQL.
3. `casepilot-api/.env`.
4. `casepilot-api/.env.<APP_ENV>`.
5. Variables del proceso inyectadas por shell, runtime o secret manager.

Puedes copiar `.env.example` a `.env` para overrides locales. Los archivos con valores reales no se versionan. Fuera de `local` se exigen datos propios de conexión y no se consultan credenciales Docker. En despliegues se inyecta explícitamente `APP_ENV` junto con la configuración del destino. La configuración preparada no provisiona infraestructura remota.

| Variable | Uso y valor por defecto |
| --- | --- |
| `API_HOST` / `API_PORT` | `127.0.0.1:3000` en local/test; `0.0.0.0:3000` en otros entornos. |
| `API_ERROR_DETAILS` | Booleano estricto `true`/`false`. Default true en local/test/development, false en staging/production. Permite override con la precedencia existente. |
| `CORS_ORIGINS` | Lista de origins HTTP/HTTPS separados por coma, sin paths; vacía = sin cabeceras CORS. Ejemplo local: `http://localhost:5173`. Sin wildcard ni cookies CORS. |
| `DATABASE_URL` | URL `postgresql://usuario:password@host:puerto/base`; si existe reemplaza los cinco campos discretos. Codificar componentes especiales; sin query parameters. |
| `DATABASE_HOST` / `DATABASE_PORT` | Host/puerto; local lee el puerto Docker, otros entornos usan `5432` si no se especifica. |
| `DATABASE_NAME` / `DATABASE_USER` / `DATABASE_PASSWORD` | Credenciales server-side; local utiliza las variables `CASEPILOT_POSTGRES_*` de Docker como fallback. |
| `DATABASE_SCHEMA` | `public`; identificador minúsculo validado. Un schema alternativo debe existir antes de migrar. |
| `DATABASE_SSL` | `false` en local/test; `true` fuera de esos entornos. Con TLS se verifica siempre el certificado. |
| `DATABASE_SSL_CA_FILE` | Ruta absoluta a la CA del proveedor; exige TLS. No se utiliza `rejectUnauthorized: false`. |
| `DATABASE_CONNECT_TIMEOUT_MS` / `DATABASE_QUERY_TIMEOUT_MS` | `3000` cada uno. Límite de conexión, de ejecución servidor y de consulta cliente. |
| `DATABASE_POOL_SIZE` | `5` conexiones por proceso; ajustar según réplicas y capacidad del servidor. |

La misma carga de configuración y fábrica de opciones se usan en runtime y CLI. No se imprimen valores de configuración ni SQL en requests. El bootstrap devuelve un mensaje genérico si la configuración o el puerto impiden iniciar.

## Esquema y migraciones

La migración `1790899200000-create-professional-services.ts` agrega las 28 tablas de producto, índices y FKs compuestas por cuenta. Tiene down reversible, probado en PostgreSQL efímero. El mismo comando de migración aplica ambos pasos. Las escrituras de producto usan versiones optimistas y scopes transaccionales coordinados desde Application; los detalles están en [la guía CRUD](docs/professional-services-crud.md).


La migración `1790726400000-create-health-check-object.ts` crea `"HealthCheckObject"` con `"Guid"` (`uuid`, PK, default `gen_random_uuid()`) y `"Value"` (`text`, NOT NULL). Incluye una fila técnica determinista: Guid `00000000-0000-4000-8000-000000000001`, Value `CasePilot API`. No necesita instalar extensiones en PostgreSQL 18.

```bash
pnpm migration:api:show
pnpm migration:api:run
```

Se registra el historial en `casepilot_api_migrations`. `synchronize: false` y `migrationsRun: false` en todos los entornos: el arranque del servidor no modifica el esquema. Las migraciones son un paso explícito coordinado, nunca por request ni por réplica. En otro entorno se inyecta su configuración antes de ejecutar el mismo comando.

Para generar una migración desde el schema actualizado, desde la carpeta de la API:

```bash
pnpm migration:generate src/infrastructure/database/migrations/NombreDeMigracion
```

Revisar el SQL generado y registrar su clase en `create-data-source-options.ts` antes de ejecutarla. La migración inicial tiene `down`; `pnpm migration:revert` desde esta app elimina la tabla y sus datos y se usa únicamente cuando se desea explícitamente revertirla. En un futuro release se pueden inyectar credenciales de migración distintas de las de runtime usando los mismos nombres de variables.

## Verificaciones

Desde la raíz:

```bash
pnpm lint:api
pnpm check:api:architecture
pnpm test:api:architecture
pnpm typecheck:api
pnpm build:api
pnpm test:api
pnpm test:api:integration
```

Los scripts `dev`, `build`, `typecheck`, `lint`, `test`, `test:integration`, `test:architecture`, `check:dependencies` y `check:structure` coordinan `build:contracts` antes de consumir CQRS, abstractions y exception-handler. Se usan declaraciones/ESM construidas del workspace, sin paths a fuentes externas ni imports privados. Para verificar los paquetes: `pnpm check:cqrs`, `pnpm check:abstractions` y `pnpm check:exception-handler` desde la raíz. La [librería abstractions](../../../libs/backend/abstractions/README.md) tiene integración propia mediante `pnpm test:abstractions:integration`, con Docker/PostgreSQL efímero.

VS Code consume esas mismas declaraciones, pero no ejecuta `build:contracts` automáticamente. Desde la raíz, `pnpm build:contracts` las prepara y `pnpm watch:contracts` las actualiza al editar las librerías. Fuentes de API/librerías usan `projectService` con el mismo `tsconfig.json` del editor; tests y herramientas conservan el proyecto explícito `tsconfig.test.json`. Configuración del editor, pruebas de lint con tipos y recuperación de diagnósticos desactualizados: [VS Code y lint con tipos](docs/architecture-validation.md#vs-code-y-lint-con-tipos).

Las pruebas usan el runner nativo de Node. Las unitarias de esta app cubren configuración con archivos temporales sintéticos, query, responses vacíos y errores. Los full endpoint tests viven en [test/integration/](test/integration/README.md), junto a `test/unit/`: Testcontainers crea PostgreSQL efímero y la API escucha en un puerto dinámico. Aplican las migraciones reales y cubren HTTP, datos, concurrencia, dependencia caída y recuperación. No cargan configuración local ni utilizan la base/volumen de desarrollo; no requieren `infra:up` ni `APP_ENV=local`.

El paquete API conserva sus exports de composición `@casepilot/casepilot-api/bootstrap`, `/database` y `/config`, con declaraciones del build. Sus pruebas locales importan composición desde las fuentes del mismo paquete. Testcontainers y su módulo PostgreSQL son devDependencies de la API; no pertenecen al runtime desplegable. Lint y type-check de API cubren fuentes, unitarias, integración y el lanzador. No existe un paquete externo para estas pruebas.

`pnpm check:api:architecture` ejecuta TypeScript, ESLint, dependency-cruiser y ts-morph, con fallo ante infracciones. Verifica fronteras/ciclos y contratos estructurales de commands/queries, además de patrones seleccionados de persistencia. `pnpm test:api:architecture` prueba los validadores y también forma parte de `pnpm test:api`. La [guía de validación arquitectónica de esta API](docs/architecture-validation.md) documenta comandos locales, cobertura por regla BCK, límites y cómo añadir checks. No requiere Docker ni configuración de runtime. Negocio, SQL, scopes y garantías de comportamiento siguen requiriendo pruebas y revisión de la skill backend. Este cambio no incluye UI, por lo que viewport, navegación y accesibilidad visual no aplican.

## Dependencias

Versiones directas fijadas y lockfile pnpm: NestJS `12.1.2`, TypeORM `0.3.31`, `pg` `8.23.1`, TypeScript `5.9.3`. Se usa ESM nativo y decoradores compilados por TypeScript. TypeORM 0.3 permite el Node 22.12 disponible; la línea 1.x requiere actualizar ese runtime. Se eligió 0.3.31 tras revisar los avisos de seguridad de la rama. NestJS, TypeORM, pg y reflect-metadata utilizan MIT; RxJS, Apache-2.0.

No se añaden bus CQRS, adaptadores TypeORM Nest, Swagger o validador de DTOs sin un consumidor o caso de uso que los necesite. Nest compone el repositorio propio sobre TypeORM. Health implementa Entity<string> (id adapta guid) y su contrato extiende Repository de abstractions; no cambia el esquema ni HTTP. CrudRepository es una interfaz pura, sin implementación universal ni opciones ORM. Las transacciones del CRUD usan UnitOfWork y repositorios nuevos del scope. Decisiones: [ADR 0003](../../../../docs/adr/0003-base-api-and-health-checks.md) y [ADR 0011](../../../../docs/adr/0011-data-access-abstractions.md).

## Mecanismos backend compartidos

[ADR 0016](../../../../docs/adr/0016-reusable-backend-mechanisms.md) extrae SQL/conexión diferida/runtime a abstractions, metadata a cqrs y validación/parsers HTTP a validation. build:contracts construye los cuatro paquetes propietarios. El contenido restante de application/shared son políticas de CasePilot (límites, errores funcionales, referencias/cronología y scope), no copias de mecanismos genéricos. Domain/Application consume entradas puras; /typeorm y /node pertenecen a Infrastructure/composición y validation/nestjs a Presentation.
