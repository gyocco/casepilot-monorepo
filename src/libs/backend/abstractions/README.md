# Abstracciones backend (`@casepilot/abstractions`)

Paquete ESM privado `@casepilot/abstractions`. API y futuros workers comparten **contratos puros, modelos base de datos, paginación y vocabulario de errores** sin mover negocio ni detalles de implementación de infraestructura a esta librería. La entrada principal no carga TypeORM, drivers de base de datos, NestJS, Node ni proveedores externos. Los errores viven en `src/errors.ts`; las fuentes de paginación y `Entity`/`StoredEntity` están en `src/dataaccess/models/`.

Normativa: [BCK-009 a BCK-011 y BCK-021/BCK-022](../../../../docs/architecture/backend-architecture-baseline-rules.md), adopción [CPA-003 y CPA-005](../../../../docs/architecture/casepilot-backend-architecture.md#cpa-003--abstracciones-de-data-access-compartidas), [ADR 0011](../../../../docs/adr/0011-data-access-abstractions.md) y [ADR 0023](../../../../docs/adr/0023-persistence-library-and-pure-abstractions.md).

## Intención y evolución

- **Qué pertenece aquí:** interfaces/puertos (`Entity`, `Repository`, `CrudRepository`, `ScopedDataRepository`, `UnitOfWork`, `CrudRuntime`), modelos base estructurales (`StoredEntity`, `PageRequest`, `PageResponse`, `JsonValue`), vocabulario de errores (`ApplicationError` y subclases, `PersistenceError`, `UnitOfWorkError`) y primitivas puras sin dependencias externas (`isJsonValue`, `runPersistence`).
- **Qué NO pertenece aquí:** implementaciones concretas de ORMs, SQL, drivers de base de datos, frameworks HTTP, proveedores cloud ni lógica de negocio. Los adaptadores concretos de persistencia (por ejemplo TypeORM/PostgreSQL) viven en [`@casepilot/persistence`](../persistence/README.md), que depende de `@casepilot/abstractions` y nunca al revés.
- **Cómo debe evolucionar:** cuando aparezca un nuevo contrato compartido de dominio/aplicación que deba ser independiente del runtime y del motor, se agrega a `@casepilot/abstractions` con pruebas unitarias puras. Cualquier implementación concreta o adaptador de framework/driver debe vivir en su paquete de capacidad dedicado en `src/libs/backend/` (como `persistence`, `auth`, `exception-handler`, `validation` o `logging`), evitando que `@casepilot/abstractions` acumule dependencias de infraestructura o suites de integración externas.

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

`getPaged` requiere una única operación de lectura que obtenga items y total, también para una página vacía/fuera de rango. La [prueba PostgreSQL en `@casepilot/persistence`](../persistence/test/integration/unit-of-work.test.ts) muestra una sentencia con total y colección. Si el adaptador necesita dos consultas, Application coordina las lecturas y construye PageResponse; no usa findAndCount para ocultarlas. Las escrituras individuales usan insert/update/delete sin cascadas ni transacciones propias. No se proporciona una implementación CRUD universal que copie opciones del ORM.

## Adaptadores concretos

- **Persistencia (TypeORM / futuros drivers):** vive en [`@casepilot/persistence`](../persistence/README.md) (`@casepilot/persistence/typeorm`), no en `@casepilot/abstractions`. Solo `Infrastructure`/composición importa ese paquete.
- **Runtime Node (`@casepilot/abstractions/node`):** exporta únicamente `systemCrudRuntime` sobre el puerto puro `CrudRuntime` (UUID/fecha mediante `node:crypto`). No se reexporta desde la raíz y solo se consume en `Infrastructure`/composición.

## Verificación

Desde la raíz:

```bash
pnpm check:abstractions
pnpm check:api:architecture
pnpm test:api
pnpm build:api
```

`check:abstractions` ejecuta tipos, lint, pruebas puras de modelos/tipos, [errores compartidos](test/unit/errors.test.ts), política de persistencia y build — sin requerir Docker ni drivers de base de datos. Las pruebas de integración PostgreSQL pertenecen a [`@casepilot/persistence`](../persistence/README.md) (`pnpm test:persistence:integration`).

El [gate estático de la API](../../../apps/casepilot/casepilot-api/docs/architecture-validation.md) verifica sus fuentes, incluidas declaraciones sin imports; no certifica automáticamente futuros workers u otras librerías. Esos consumidores deben incorporar el checker antes de declarar la misma cobertura. Imports privados a src/dist están prohibidos; solo se usan las entradas públicas raíz y `/node`.

## Mecanismos reutilizables puros

La entrada pura incorpora `StoredEntity`, `JsonValue`/`isJsonValue`, `CrudRuntime`, `ScopedDataRepository`, `PersistenceError`/`PersistenceErrorReason`, `ConflictError` y `runPersistence`. `isJsonValue` valida estructuras JSON con profundidad configurable y rechaza ciclos, números no finitos y objetos ajenos a JSON. `StoredEntity` solo declara identidad/timestamps/version; Application asigna valores. `ScopedDataRepository` recibe un scope primitivo, sin conocer cuentas del producto. `runPersistence` exige una función de traducción suministrada por Application, conserva errores ajenos y no decide resultados funcionales. `PersistenceError` admite `cause` y distingue `invalid-data` de `unavailable`; `cause` no se serializa al cliente.

[Pruebas unitarias](test/unit/persistence.test.ts) verifican `runPersistence` y `systemCrudRuntime`; [arquitectura](test/unit/architecture.test.ts) verifica pureza, rechazo de adaptadores de persistencia/ORM y prohibición de imports desde apps. Decisiones: [ADR 0016](../../../../docs/adr/0016-reusable-backend-mechanisms.md) y [ADR 0023](../../../../docs/adr/0023-persistence-library-and-pure-abstractions.md).
