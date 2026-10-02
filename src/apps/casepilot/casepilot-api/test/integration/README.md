# Pruebas de integración de CasePilot API

Esta suite pertenece al paquete API y vive junto a sus unitarias en `test/`. La ubicación se determina por propietario; la [guía del monorepo](../../../../../../docs/architecture/monorepo-architecture.md) reserva `tests/` global para suites de varios proyectos. Decisión: [ADR 0005](../../../../../../docs/adr/0005-project-owned-tests.md).

## Endpoints de CasePilot API

`health.test.ts` prueba HTTP real sobre la app NestJS completa, con su query, repositorio y TypeORM. Usa el módulo PostgreSQL de Testcontainers; no reemplaza providers, no usa mocks de persistencia ni reproduce el esquema con `synchronize`.

Requisitos: Node.js 22.12 o superior, pnpm 10.13.1 y Docker con contenedores Linux. Docker debe poder descargar las imágenes PostgreSQL y Ryuk la primera vez. No se necesita iniciar la API ni ejecutar `infra:up`.

Desde la raíz del repositorio:

```bash
pnpm install --frozen-lockfile
pnpm test:api:integration
```

Verificaciones del paquete propietario:

```bash
pnpm lint:api
pnpm typecheck:api
pnpm build:api
pnpm test:api
```

Desde la carpeta de la API también se puede ejecutar `pnpm test:integration`.

La integración compila fuentes y pruebas con `tsconfig.test.json`. Los tests importan los puntos de composición del mismo paquete, sin sustituir providers. El runner nativo de Node descubre todos los `*.test.js` bajo `build/test/test/integration/`, sin glob expansion del shell. Las unitarias de Application/configuración viven en `test/unit/` y se ejecutan con `pnpm test:api`; ese comando no inicia Docker.

## Aislamiento y ciclo de vida

- La fixture crea un contenedor nuevo `postgres:18-bookworm`, del mismo major/debian que el entorno de desarrollo, con base y contraseña aleatorias. No configura nombres ni puertos host fijos, bind mounts, volúmenes persistentes o container reuse.
- Toda conexión se construye exclusivamente con `getHost()`, `getPort()`, `getDatabase()`, `getUsername()` y `getPassword()` del contenedor creado por la fixture. No se carga `loadBackendConfig`, `.env`, `DATABASE_URL` ni configuración de Compose. `APP_ENV` y `DATABASE_*` del proceso no seleccionan una base para estas pruebas.
- La API recibe una configuración explícita `environment: test` y escucha en un puerto HTTP asignado por el sistema. Se aplica el historial real de migraciones con la misma fábrica de opciones de runtime/CLI; no se habilita sincronización automática.
- Una suite comparte su contenedor para reducir el coste de arranque, pero restablece los objetos técnicos antes de cada caso. Los casos que revierten el esquema lo restauran en `finally`. La prueba de dependencia caída tiene un contenedor independiente, detenido antes de arrancar su API.
- Los hooks cierran la app HTTP y los pools antes de eliminar el contenedor y sus volúmenes anónimos. El setup también limpia recursos si falla después de crearlos. Se conserva el reaper Ryuk para terminaciones inesperadas. No se desactiva limpieza ni se ignoran fallos de Docker.
- Los casos de una suite se ejecutan en serie para evitar carreras sobre sus fixtures. Las peticiones concurrentes se ejercitan explícitamente en su caso. Los puertos y bases aleatorios permiten ejecutar distintas suites/procesos sin usar el estado de desarrollo.
- Los timeouts de arranque, hooks, requests y casos son explícitos. La disponibilidad la espera el módulo PostgreSQL de Testcontainers; no se usan sleeps arbitrarios ni reintentos para ocultar fallos.

**`casepilot-local-postgres-1`, su base y su volumen son exclusivamente de desarrollo. No se leen, escriben, migran, revierten ni apagan desde esta suite.** No existe fallback a ese servicio si Docker o Testcontainers falla.

## Cobertura inicial

| Escenario | Resultado comprobado |
| --- | --- |
| `GET /health` | `200`, JSON exacto `{ status: 'ok' }`, `Cache-Control: no-store`. |
| `GET /health/database` | `200`, objetos leídos desde PostgreSQL migrado y contrato HTTP sin campos internos. |
| Valores distintos y varios objetos | Datos actuales, orden por GUID y persistencia sin mutaciones tras el GET. |
| Tabla vacía | `200` y colección vacía. |
| Peticiones simultáneas | Todas devuelven el contrato esperado. |
| Tabla ausente | `500` con UnexpectedError; `/health` continúa en `200`; reaplicar la migración recupera la lectura. |
| PostgreSQL detenido antes del arranque HTTP | La API arranca; `/health` devuelve `200`; accesos repetidos a `/health/database` devuelven `500`. |

Los 500 se verifican con `application/problem+json`, type/title/status/instance/code y código UNEXPECTED_ERROR. Con detalle habilitado incluyen el mensaje genérico y stack de UnexpectedError, sin causas, SQL ni datos del driver. La normalización global y ambos modos se prueban también sin Docker en [test/unit/error-handling.test.ts](../unit/error-handling.test.ts) y en la [integración NestJS de la librería](../../../../../libs/backend/exception-handler/test/integration/nestjs.test.ts). Contrato actualizado: [ADR 0012](../../../../../../docs/adr/0012-configurable-http-error-handler.md).

Las credenciales efímeras no se imprimen ni se copian al repositorio. Las fixtures de objetos son datos sintéticos deterministas, nunca volcados ni datos personales.

## Docker local en Windows y CI

El lanzador `test/run-integration-tests.mjs` usa el mismo Node del proceso, sin shell, y hereda la configuración Docker. En Windows, con Docker local/named pipe y sin override explícito, configura `TESTCONTAINERS_HOST_OVERRIDE=127.0.0.1` solo en el proceso hijo. Esto evita el caso en que `localhost` resuelve únicamente a `::1` y Docker publica puertos IPv4. Los endpoints Docker remotos definidos mediante `DOCKER_HOST` y un `TESTCONTAINERS_HOST_OVERRIDE` explícito se respetan. Si un runtime remoto se configura por otros mecanismos, especificar su host accesible mediante ese override.

En CI se ejecuta el mismo comando con Docker accesible y sin variables de conexión a la base del producto. Ryuk permanece habilitado. El primer pull puede tardar más; cachear imágenes reduce ese coste, sin reutilizar contenedores ni datos entre ejecuciones. Este cambio no instala un workflow ni provisiona servicios remotos.

Testcontainers y su módulo PostgreSQL están fijados en `12.0.0` (MIT), compatibles con el Node 22.12 disponible; las versiones posteriores exigen Node 22.22. Son dependencias de desarrollo del paquete API y no forman parte del runtime desplegable de la API. Se mantiene el runner de Node y `fetch`, que ya ofrecen hooks, assertions y transporte HTTP; no se agregan Jest, Vitest o Supertest para duplicar esas capacidades.

Decisión: [ADR 0004](../../../../../../docs/adr/0004-isolated-endpoint-tests.md), complementado por el ADR 0005 para ubicación y propiedad. Referencias consultadas el 2026-09-30: [módulo PostgreSQL](https://node.testcontainers.org/modules/postgresql/), [ciclo de vida de contenedores](https://node.testcontainers.org/features/containers/), [testing en NestJS](https://docs.nestjs.com/fundamentals/testing), [runner de Node 22.12](https://nodejs.org/download/release/v22.12.0/docs/api/test.html).
