# 0010 — Bases Request/Response y Handler compartido con invocación directa

- Estado: aceptada e implementada.
- Fecha: 2026-10-02.
- Alcance: librería CQRS, Application y validadores de CasePilot API.
- Relacionadas: [ADR 0002](0002-backend-application-owned-business-logic.md), [ADR 0003](0003-base-api-and-health-checks.md), [ADR 0007](0007-automated-api-architecture-validation.md) y [ADR 0009](0009-resource-organized-application.md).

## Contexto

La API utiliza clases puras con request/response concretos y ejecución directa, pero no comparte contratos de ejecución o bases para esos modelos. Se solicita uniformar la estructura con una librería reutilizable, manteniendo la facilidad de depuración y prueba de llamadas directas.

## Decisión

- Crear el paquete ESM privado `@casepilot/cqrs` en `src/libs/backend/cqrs/`, sin dependencias de runtime. Su entrada pública exporta las clases abstractas `Request` y `Response` y la interfaz `Handler<TRequest extends Request, TResponse extends Response>`.
- Usar un único Handler para commands y queries, con `execute(request): Promise<Response>`. Las bases tienen marcas protegidas distintas declaradas solo para tipos; no ejecutan validación, negocio ni I/O. Los modelos concretos heredan de ellas y conservan su responsabilidad estructural.
- Registrar [CPA-002](../architecture/casepilot-backend-architecture.md#cpa-002--contratos-cqrs-compartidos-e-invocacion-directa): clases `<Operation>Handler` en archivos `.handler.ts`, implementación explícita del contrato real, herencia Request/Response y coincidencia de sus tipos concretos. Handler se importa como tipo y las bases como valores por la entrada pública.
- Renombrar Health a `GetHealthCheckObjectsHandler` y adaptar su Request, Response y response de items. Actualizar composición, controller, filtro y pruebas, conservando endpoints, persistencia y contrato HTTP.
- Mantener los casos de uso y modelos concretos en Application organizada por recurso. Commands/queries conservan su diferencia de comportamiento, sin interfaces o bases separadas ni negocio en la librería.
- Ampliar ts-morph para comprobar símbolos, herencia directa/indirecta, nombres y firmas; ESLint comprueba imports y dependency-cruiser la entrada pública. Probar aliases/reexports, contratos locales falsos, modelos con igual forma, herencia ausente y nomenclatura anterior.
- Conservar fuentes, pruebas de tipos/ejecución y README con la librería. El manifest API declara `workspace:*` y sus scripts construyen primero las declaraciones CQRS. El lockfile y scripts raíz coordinan ambos paquetes.

## Alternativas

`CqrsModule` introduciría mensajes, registro y adaptadores de despacho que la llamada directa todavía no requiere. Un dispatcher propio añadiría routing y resolución antes de existir esa necesidad. Interfaces locales estructurales no exigen herencia de los modelos compartidos; separar CommandHandler/QueryHandler duplicaría una firma común.

## Consecuencias

Los handlers se construyen con dependencias explícitas y se invocan directamente desde tests, HTTP u otros adaptadores. Las bases Request/Response son valores ESM sin dependencias externas; Handler se elimina al compilar. Los constructores derivados llaman a `super()`; las marcas protegidas no se serializan.

La librería garantiza tipos y estructura; negocio, permisos, queries sin escrituras y alcance transaccional siguen requiriendo revisión y pruebas. Un dispatcher o middleware futuro puede envolver los handlers, previa decisión y sincronización de CPA-002. Los consumidores construyen la librería antes de compilar o analizar sus declaraciones, coordinado por los scripts API.

Comandos y cobertura: [README CQRS](../../src/libs/backend/cqrs/README.md) y [validación API](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md).

## Validación

Pasan `pnpm check:cqrs`, `pnpm check:api:architecture`, `pnpm test:api`, `pnpm build:api` y `pnpm test:api:integration`: 2 pruebas de ejecución y pruebas de tipos de CQRS, 8 unitarias de API, 53 de validadores y 7 de endpoints/persistencia con PostgreSQL efímero. Se valida la instalación offline con lockfile congelado, enlaces locales y `git diff --check`. No hay cambios de UI que requieran viewport o revisión visual de accesibilidad.
