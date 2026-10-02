# 0011 — Abstracciones de data access y Unit of Work compartido

- Estado: aceptada e implementada.
- Fecha: 2026-10-02.
- Alcance: librería backend abstractions y contratos/validadores de CasePilot API.
- Relacionadas: [ADR 0002](0002-backend-application-owned-business-logic.md), [ADR 0007](0007-automated-api-architecture-validation.md) y [ADR 0010](0010-shared-cqrs-contracts.md).

## Contexto

Se solicita una librería técnica con repository pattern, modelos genéricos de Entity/paginación, CRUD y Unit of Work entre diferentes repositorios. Sus firmas deben excluir objetos custom/DTOs y mecanismos ORM, manteniendo Application como propietario de operaciones y transacciones. El workspace ya contiene CQRS y capas compartidas; se conserva su implementación.

## Decisión

- Crear `@casepilot/abstractions` en `src/libs/backend/abstractions/`, con contratos y modelos independientes del framework en `dataaccess/`; Entity, PageRequest y PageResponse viven en `models/`. Entity es una interfaz genérica con ID primitivo, y el checker exige herencia/implementación explícita del símbolo real.
- Repository es una base genérica sin operaciones, con la propiedad opcional de tipos entityType. CrudRepository define getAll, getById, add, update, delete, count y getPaged, con entidad e ID genéricos. Los contratos pequeños de lectura declaran sus operaciones explícitamente. No replica opciones del ORM. BCK-009 sigue exigiendo una operación individual, incluida paginación con total; lecturas separadas se coordinan en Application.
- Incorporar [BCK-021/BCK-022](../architecture/backend-architecture-baseline-rules.md) al catálogo reutilizable y [CPA-003](../architecture/casepilot-backend-architecture.md#cpa-003--abstracciones-de-data-access-compartidas) para las identidades/entradas/selección concretas de CasePilot. Se permiten wrappers Promise/arrays y ausencia; se rechazan objetos custom, DTOs, ORM, utilitarios de objetos y genéricos no restringidos.
- UnitOfWork recibe un callback y un conjunto tipado no vacío de repositorios. Application decide operaciones/aislamiento y usa únicamente los repositorios del scope. El adaptador TypeOrmUnitOfWork se publica por la entrada separada `/typeorm`, con peer opcional 0.3.31 y fábricas de conexión/repositorios; delega a la transacción del driver y resuelve tras el commit.
- UnitOfWorkError normaliza fallos técnicos de conexión, bindings y ciclo transaccional sin revelar SQL/causas del driver (BCK-016). Los errores de Application y de repositorios emitidos por el callback se conservan; cada repositorio normaliza su frontera técnica.
- Adaptar Health a Entity y Repository, conservando guid/value y contrato HTTP. No se agrega una transacción a una sonda de lectura. Futuras escrituras compondrán su fábrica con adaptadores nuevos vinculados al manager recibido.
- ts-morph comprueba firmas heredadas, aliases, restricciones y herencia real, composición de repositorios, dependencia de UnitOfWork y usos directos de scopes/globales. ESLint protege entradas públicas y APIs transaccionales; dependency-cruiser protege la entrada pública y el ORM incluso mediante barrels. Las tres suites prueban aceptación/rechazo. El alcance de firmas sigue siendo la API, no todo el monorepo.
- Mantener tests de modelos/tipos y PostgreSQL con el paquete. La integración acredita commit/rollback de dos repositorios, fallo durante commit, scopes concurrentes y paginación de una sola sentencia. Los comandos API construyen ambas librerías del workspace antes de consumir sus declaraciones.

## Alternativas

Exponer EntityManager al handler violaría BCK-008/BCK-011. Un singleton mutable o contexto transaccional implícito ocultaría el vínculo entre operación y recursos. Un CRUD universal basado en save/findAndCount incumpliría el límite vigente. Usar modelos de igual forma sin identidad explícita permitiría que DTOs se colaran en repositorios.

## Consecuencias

Las firmas tienen un vocabulario acotado y las entidades deben declarar su contrato compartido. Los filtros complejos se expresan con primitivas o entidades/modelos de data access autorizados mediante una futura decisión sincronizada, sin crear DTOs ad hoc en firmas. El scope obliga a componer adaptadores de la app sin filtrar recursos ORM al núcleo.

Los checks acreditan propiedades delimitadas; no prueban todos los flujos de alias/casts, escapes, negocio, SQL, await ni efectos externos. Las fábricas concretas y políticas de concurrencia necesitan pruebas/revisión propias. No se promete rollback de sistemas externos ni transacciones distribuidas. API pública, uso y comandos: [README del paquete](../../src/libs/backend/abstractions/README.md); cobertura: [validación API](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md).
