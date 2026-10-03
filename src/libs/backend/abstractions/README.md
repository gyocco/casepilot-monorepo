# Abstracciones backend

Paquete ESM privado `@casepilot/abstractions`. API y futuros workers comparten errores puros, contratos de datos, repositorios y transacciones sin mover negocio a la librería. La entrada principal no carga TypeORM, Node, Nest ni proveedores. Los errores viven en `src/errors.ts`; las fuentes de paginación y Entity están en `src/dataaccess/models/`. Las pruebas pertenecen a este paquete.

Normativa: [BCK-009 a BCK-011 y BCK-021/BCK-022](../../../../docs/architecture/backend-architecture-baseline-rules.md), adopción [CPA-003](../../../../docs/architecture/casepilot-backend-architecture.md#cpa-003--abstracciones-de-data-access-compartidas) y [ADR 0011](../../../../docs/adr/0011-data-access-abstractions.md).

## API pública

| Contrato | Comportamiento |
| --- | --- |
| `ApplicationError` | Base de errores tipados con code, mensaje, cause opcional y detalles explícitos; sin status HTTP ni dependencia de transporte. |
| `UnexpectedError`, `ValidationError`, `ConflictError`, `NotFoundError`, `ForbiddenError`, `UnauthorizedError` | Vocabulario compartido para Application. Sus códigos son UNEXPECTED_ERROR, VALIDATION_ERROR, CONFLICT_ERROR, NOT_FOUND_ERROR, FORBIDDEN_ERROR y UNAUTHORIZED_ERROR. UnauthroizedError es alias de UnauthorizedError. |
| `ApplicationErrorOptions`, `ErrorDetail` | Opciones de cause y detalles seleccionados con message, code y pointer opcionales; nunca copiar datos privados del proveedor. |
| `Entity<TId>` | Interfaz de datos con `readonly id`, implementada/heredada explícitamente. ID: string, number o bigint. Sin negocio. |
| `Repository<TEntity>` | Base sin operaciones obligatorias. `readonly entityType?: TEntity` conserva el tipo de entidad; no requiere una propiedad de runtime. Los contratos especializados declaran sus operaciones. |
| `CrudRepository<TEntity, TId>` | Extiende Repository. `getAll()` devuelve `Promise<readonly TEntity[]>`; `getById(id)` devuelve entidad o null; `add(entity)` devuelve void; `update(entity)`/`delete(id)` devuelven boolean (fila afectada); `count()` devuelve número; `getPaged(request)` devuelve PageResponse. |
| `PageRequest` | Constructor `(pageNumber = 1, pageSize = 20, sortBy?, sortDirection = 'asc')`; offset calculado. Valida enteros positivos y offset seguro. El adaptador valida/traduce sortBy mediante una lista permitida, con orden estable. Application determina límites funcionales/tamaño máximo. |
| `PageResponse<TEntity>` | Constructor `(request, items, totalCount)`; pageNumber, pageSize, items readonly, totalCount, totalPages, hasNextPage y hasPreviousPage. Copia/congela la colección, sin congelar las entidades. Total cero implica cero páginas; una página fuera del rango conserva el total, sin siguiente página. |
| `UnitOfWork<TRepositories>` | `execute<TResult>(work, isolation?): Promise<TResult>`; el callback recibe el conjunto tipado de repositorios y el resultado se entrega después del commit. |
| `TransactionIsolation` | Unión primitiva de READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ y SERIALIZABLE; soporte efectivo depende del driver. |
| `UnitOfWorkError` | Error técnico sanitizado de conexión, bindings o ciclo transaccional, sin SQL/causa del driver. Los errores del callback conservan su contrato. |

Los modelos de página solo realizan validación/cálculos técnicos. Los modelos del producto, DTOs y requests/responses de casos de uso no pertenecen a la librería.

Application decide cuándo emitir los errores compartidos. Por ejemplo, Health normaliza la indisponibilidad de persistencia con `new UnexpectedError()` y su mensaje genérico. El [adaptador exception-handler](../exception-handler/README.md) los traduce a HTTP y controla la exposición del detalle por ambiente; su entrada pura reexporta los mismos constructores por compatibilidad. Esta librería no depende del adaptador. Decisión: [ADR 0012](../../../../docs/adr/0012-configurable-http-error-handler.md).

```typescript
import { PageRequest, type CrudRepository, type Entity, type UnitOfWork } from '@casepilot/abstractions';

class Order implements Entity<string> {
  constructor(public readonly id: string, public readonly customerId: string) {}
}
class Customer implements Entity<string> {
  constructor(public readonly id: string, public readonly name: string) {}
}
interface OrderRepository extends CrudRepository<Order> {
  getByCustomerId(customerId: string): Promise<readonly Order[]>;
}
interface CustomerRepository extends CrudRepository<Customer> {
  getAll(): Promise<readonly Customer[]>;
}
interface Repositories {
  readonly orders: OrderRepository;
  readonly customers: CustomerRepository;
}

// Dentro de un handler de Application; el resultado real es su Response concreto.
async function operations(uow: UnitOfWork<Repositories>): Promise<string> {
  return uow.execute(async scope => {
    await scope.customers.add(new Customer('customer', 'Name'));
    await scope.orders.add(new Order('order', 'customer'));
    const page = await scope.orders.getPaged(new PageRequest(1, 10));
    return page.items[0]?.id ?? '';
  }, 'READ COMMITTED');
}
```

Las firmas de operaciones admiten primitivos, entidades reales, PageRequest/PageResponse, arrays de tipos permitidos y Promise en retornos. No admiten DTOs, objetos anónimos, Record, Partial, Date, callbacks, tipos ORM ni genéricos sin restricciones. Entity es estructural para TypeScript; el gate de la API exige además herencia/implementación explícita del símbolo real. No basta con tener una propiedad id. Esa restricción se aplica al tipo de cada parámetro/retorno, sin prohibir las relaciones o propiedades estructurales internas de una entidad.

`getPaged` requiere una única operación de lectura que obtenga items y total, también para una página vacía/fuera de rango. La [prueba PostgreSQL](test/integration/unit-of-work.test.ts) muestra una sentencia con total y colección. Si el adaptador necesita dos consultas, Application coordina las lecturas y construye PageResponse; no usa findAndCount para ocultarlas. Las escrituras individuales usan insert/update/delete sin cascadas ni transacciones propias. No se proporciona una implementación CRUD universal que copie opciones del ORM.

## Adaptador TypeORM

`@casepilot/abstractions/typeorm` exporta `TypeOrmUnitOfWork`. Es una entrada separada solo para Infrastructure/composición. Requiere el peer opcional TypeORM **0.3.31** instalado por el consumidor. Su constructor recibe una fábrica asíncrona de DataSource y una fábrica de repositorios que recibe el EntityManager transaccional:

```typescript
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';

// En composición/Infrastructure. Estos adaptadores y sus schemas son de la app.
const uow = new TypeOrmUnitOfWork<Repositories>(
  () => connection.getDataSource(),
  manager => ({
    orders: new TypeOrmOrderRepository(manager),
    customers: new TypeOrmCustomerRepository(manager),
  }),
);
```

Cada fábrica crea adaptadores nuevos usando únicamente ese manager. Los adaptadores nunca guardan managers en un singleton ni usan repositorios globales dentro del callback. Se esperan todas las operaciones; los repositorios del scope no se retornan, capturan ni reutilizan después, y no se anidan Unit of Work. El mecanismo delega a DataSource.transaction: espera callback y commit, revierte al fallar y libera el QueryRunner. No reintenta conflictos ni traduce decisiones de negocio. Normaliza fallos técnicos de conexión/bindings/commit como UnitOfWorkError y conserva los errores del callback, que los repositorios deben normalizar en su propia frontera según BCK-016. Véase [implementación oficial fijada de EntityManager.transaction](https://github.com/typeorm/typeorm/blob/0.3.31/src/entity-manager/EntityManager.ts).

No hay transacción de producto nueva en Health: su lectura solo adopta Entity/Repository. Los consumidores de escritura registran sus fábricas y puertos de UnitOfWork en la app, como el CRUD de CasePilot. El mecanismo compartido está implementado y probado; una fábrica concreta sigue requiriendo pruebas/revisión de su vínculo al manager y SQL. Efectos externos y atomicidad distribuida requieren un diseño propio.

## Verificación

Desde la raíz:

```bash
pnpm check:abstractions
pnpm test:abstractions:integration
pnpm check:api:architecture
pnpm test:api
pnpm build:api
```

`check:abstractions` ejecuta tipos, lint, pruebas de modelos/tipos, [errores compartidos](test/unit/errors.test.ts) y build. La integración exige Docker y usa únicamente PostgreSQL 18 efímero de Testcontainers, con credenciales generadas, tablas propias, teardown y sin `.env`/base de desarrollo. Acredita commit de dos repositorios, rollback por callback/error SQL, fallo de commit diferido, scopes concurrentes y CRUD/paginación de una sentencia. El lanzador mantiene el fallback IPv4 de Docker Desktop Windows.

El [gate estático de la API](../../../apps/casepilot/casepilot-api/docs/architecture-validation.md) verifica sus fuentes, incluidas declaraciones sin imports; no certifica automáticamente futuros workers u otras librerías. Esos consumidores deben incorporar el checker antes de declarar la misma cobertura. Imports privados a src/dist están prohibidos; solo se usan las entradas públicas raíz, /typeorm y /node.

## Mecanismos reutilizables extraídos de la API

La entrada pura incorpora StoredEntity, JsonValue/isJsonValue, CrudRuntime, ScopedDataRepository, PersistenceError/PersistenceErrorReason, ConflictError y runPersistence. isJsonValue valida estructuras JSON con profundidad configurable y rechaza ciclos, números no finitos y objetos ajenos a JSON. StoredEntity solo declara identidad/timestamps/version; Application asigna valores. ScopedDataRepository recibe un scope primitivo, sin conocer cuentas del producto. runPersistence exige una función de traducción suministrada por Application, conserva errores ajenos y no decide resultados funcionales. PersistenceError admite cause y distingue invalid-data de unavailable; cause no se serializa al cliente.

La entrada pública /typeorm añade SqlTable/SqlColumn, conversión de filas/valores, normalizeSqlError, TypeOrmDataRepository y DatabaseConnection. SqlTable configura tabla, nombres de columnas de identidad/version/scope, columnas inmutables y mapper. El repositorio ejecuta una sentencia parametrizada por método sin transacciones propias, relaciones ocultas ni referencias a business_account_id. normalizeSqlError conserva cause e identidad de errores ya normalizados. DatabaseConnection comparte inicialización concurrente, permite reintentar una conexión fallida y espera la inicialización antes de cerrar; onModuleDestroy puede usarse estructuralmente desde NestJS sin importar NestJS en el adaptador.

La entrada pública /node exporta systemCrudRuntime sobre el puerto puro CrudRuntime. No se reexportan adaptadores desde la raíz. Solo Infrastructure/composición importa /typeorm o /node; Domain/Application consume la raíz. Ninguna entrada importa apps.

[Pruebas unitarias](test/unit/persistence.test.ts) verifican clasificación, cause, conversiones y políticas distintas. [Arquitectura](test/unit/architecture.test.ts) verifica pureza, dependencia de apps y prohibición de transacciones/lecturas compuestas en el repositorio compartido. [Integración PostgreSQL](test/integration/unit-of-work.test.ts) usa un inventario ajeno a CasePilot con columnas personalizadas, scoping, versiones, JSON, parámetros, rollback y tablas globales. El contrato no acredita que cualquier mapper/configuración futura esté libre de negocio: requiere revisión del consumidor. Decisión: [ADR 0016](../../../../docs/adr/0016-reusable-backend-mechanisms.md).
