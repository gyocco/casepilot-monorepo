# ADR 0023 — Separación de `@casepilot/persistence` y pureza estricta de `@casepilot/abstractions`

- **Estado:** Aceptado
- **Fecha:** 2026-11-21
- **Relacionado con:** [ADR 0011](0011-data-access-abstractions.md), [ADR 0016](0016-reusable-backend-mechanisms.md), [CPA-003 y CPA-005](../architecture/casepilot-backend-architecture.md), [Arquitectura del monorepo](../architecture/monorepo-architecture.md)

## Contexto

Originalmente, los adaptadores concretos de TypeORM y PostgreSQL (`TypeOrmUnitOfWork`, `TypeOrmDataRepository`, `DatabaseConnection`, `SqlTable`, `normalizeSqlError` y helpers `sql*`) se alojaron bajo el subpath `@casepilot/abstractions/typeorm` dentro de `src/libs/backend/abstractions/`. Aunque las fronteras estáticas evitaban que `Domain` o `Application` importaran ese subpath, mantener implementaciones concretas de ORM/SQL dentro de un paquete llamado `abstractions` introducía ambigüedad semántica y acoplaba el paquete base de contratos a `peerDependencies` de `typeorm`, `devDependencies` de PostgreSQL/Testcontainers y suites de integración con Docker.

## Decisión

1. **Nuevo paquete dedicado `src/libs/backend/persistence/` (`@casepilot/persistence`):**
   - Extraer los adaptadores TypeORM/PostgreSQL a `src/libs/backend/persistence/src/typeorm/`, expuestos exclusivamente por `@casepilot/persistence/typeorm`.
   - `@casepilot/persistence` depende de `@casepilot/abstractions` (`workspace:*`) y declara `typeorm` como `peerDependency` opcional.
   - No existe una entrada raíz genérica que arrastre drivers concretos; cada futuro ORM/driver/motor (por ejemplo `pg`, Drizzle, Prisma, Redis) debe agregarse en su propia subcarpeta `src/<driver>/` con su entrada pública `./<driver>`, `peerDependency` opcional, regla ESLint aislada y pruebas propias.
   - El consumo de `@casepilot/persistence/*` está restringido exclusivamente a `Infrastructure` y composición de aplicaciones/workers backend; `Domain`, `Application`, transporte de `Presentation` y bundles cliente tienen prohibido importarlo.
2. **Intención y evolución estricta de `@casepilot/abstractions`:**
   - `@casepilot/abstractions` se limita a contratos puros, interfaces/puertos (`Entity`, `Repository`, `CrudRepository`, `ScopedDataRepository`, `UnitOfWork`, `CrudRuntime`), modelos base estructurales (`StoredEntity`, `PageRequest`, `PageResponse`, `JsonValue`), vocabulario de errores (`ApplicationError` y subclases, `PersistenceError`, `UnitOfWorkError`) y primitivas puras sin dependencias externas (`isJsonValue`, `runPersistence`), más el adaptador mínimo de Node (`@casepilot/abstractions/node`).
   - Se prohíbe incorporar implementaciones concretas de ORMs, drivers de base de datos, frameworks HTTP, proveedores cloud o lógica de negocio en `@casepilot/abstractions`. Sus verificaciones (`pnpm check:abstractions`) permanecen 100% puras y sin Docker.
   - Las pruebas de integración PostgreSQL con Testcontainers pasan a ser propiedad de `@casepilot/persistence` (`pnpm test:persistence:integration`).

## Consecuencias

- **Positivas:**
  - Dirección de dependencias limpia (`@casepilot/persistence` → `@casepilot/abstractions`).
  - `@casepilot/abstractions` queda libre de dependencias de base de datos, TypeORM y Docker, acelerando sus checks y dejando inequívoco su rol.
  - `@casepilot/persistence` ofrece un punto de extensión claro para múltiples drivers/frameworks de persistencia sin contaminar contratos puros.
- **Costes / sincronización:**
  - Se actualizan imports en `casepilot-api` (`Infrastructure` y módulos de composición), reglas ESLint/dependency-cruiser, pruebas de arquitectura, scripts raíz (`check:persistence`, `test:persistence:integration`) y documentación canónica.
