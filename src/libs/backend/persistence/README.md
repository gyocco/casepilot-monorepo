# Persistencia backend (`@casepilot/persistence`)

Paquete ESM privado `@casepilot/persistence`. Reúne los **adaptadores técnicos reutilizables de persistencia** (conexión, transacciones, repositorios SQL parametrizados y normalización de errores del driver) organizados por motor/framework, implementando los contratos puros definidos en [`@casepilot/abstractions`](../abstractions/README.md).

Normativa: [BCK-008 a BCK-011, BCK-015, BCK-016](../../../../docs/architecture/backend-architecture-baseline-rules.md), [CPA-003 y CPA-005](../../../../docs/architecture/casepilot-backend-architecture.md) y [ADR 0023](../../../../docs/adr/0023-persistence-library-and-pure-abstractions.md).

## Propósito y límites

- **Qué pertenece aquí:** implementaciones concretas y genéricas de persistencia que implementan contratos de `@casepilot/abstractions` (`UnitOfWork`, `ScopedDataRepository`, `PersistenceError`, `UnitOfWorkError`, etc.) sin conocer tablas, cuentas, entidades ni reglas de negocio de CasePilot.
- **Qué NO pertenece aquí:**
  - contratos puros, modelos base o vocabulario de errores (pertenecen a `@casepilot/abstractions`);
  - esquemas concretos, tablas de producto, migraciones, repositorios de dominio ni políticas CRUD (pertenecen a la app consumidora en `src/apps/`);
  - lógica de negocio o imports desde `src/apps/`, `@nestjs/*` o transporte HTTP.
- **Consumidores permitidos:** exclusivamente `Infrastructure` y composición de aplicaciones/workers backend. **Nunca** `Domain`, `Application`, transportes de `Presentation` ni bundles web/mobile.

## API pública

Este paquete no expone una entrada raíz genérica; cada adaptador de driver/ORM tiene su propia entrada pública para evitar arrastrar drivers innecesarios al consumidor.

### `@casepilot/persistence/typeorm` (`src/typeorm/`)

Adaptador TypeORM + PostgreSQL. Requiere el peer opcional `typeorm` **0.3.31** instalado por el consumidor.

| Símbolo | Responsabilidad |
| --- | --- |
| `TypeOrmUnitOfWork` | Implementa `UnitOfWork<TRepositories>` delegando en `DataSource.transaction`, creando repositorios nuevos ligados al `EntityManager` transaccional y sanitizando fallos técnicos como `UnitOfWorkError`. |
| `DatabaseConnection` | Envoltorio de `DataSource` con inicialización diferida compartida, reintento tras fallo y cierre ordenado (`onModuleDestroy` usable estructuralmente desde NestJS sin importar NestJS). |
| `TypeOrmDataRepository` | Clase base abstracta para `ScopedDataRepository<TEntity>` con una sentencia SQL parametrizada por operación, sin transacciones propias ni referencias a tablas del producto. |
| `SqlTable`, `SqlColumn` | Configuración declarativa de tabla, columnas de identidad/versión/scope, columnas inmutables y mapper de fila a entidad. |
| `normalizeSqlError` | Clasifica códigos PostgreSQL (`23505`, `23503`, `23502`, `40001`, `40P01`, etc.) a `PersistenceError` conservando `cause` e identidad de errores ya normalizados. |
| `isRow`, `sqlRows`, `sqlString`, `sqlInteger`, `sqlBoolean`, `sqlTimestamp`, `sqlDate`, `sqlJson`, `sqlChoice` | Helpers de conversión y validación técnica de filas SQL a valores primitivos/JSON. |

```typescript
import { TypeOrmUnitOfWork } from '@casepilot/persistence/typeorm';

// En Infrastructure o composición de módulo. Los repositorios y schemas concretos viven en la app.
const uow = new TypeOrmUnitOfWork<Repositories>(
  () => connection.getDataSource(),
  manager => ({
    orders: new TypeOrmOrderRepository(manager),
    customers: new TypeOrmCustomerRepository(manager),
  }),
);
```

## Cómo debe evolucionar este módulo

Cuando el backend necesite soportar un nuevo ORM, driver o motor de almacenamiento (por ejemplo `pg` directo, Drizzle, Prisma, Redis, Firestore, etc.):

1. **Subcarpeta y entrada pública propia:** crea `src/<driver>/index.ts` y expón `"./<driver>"` en `package.json` (`exports`). No mezcles dos drivers en la misma entrada ni agregues una entrada raíz que importe drivers concretos.
2. **Peer dependency opcional:** declara el paquete del nuevo driver en `peerDependencies` con `peerDependenciesMeta.<driver>.optional = true`, de modo que los consumidores de `@casepilot/persistence/typeorm` no queden obligados a instalar otros drivers.
3. **Aislamiento por driver:** añade una regla dedicada en `eslint.config.mjs` para `src/<driver>/**/*.ts` que permita solo `@casepilot/abstractions`, el driver específico y módulos locales dentro de `src/<driver>/`. Prohibido importar desde `src/apps/`, `@nestjs/*` u otra subcarpeta de driver.
4. **Sincronización de fronteras:** actualiza las reglas de entrada pública de los consumidores (`eslint.config.mjs`, `dependency-cruiser.config.mjs` y sus pruebas de arquitectura) para permitir `@casepilot/persistence/<driver>` únicamente en `Infrastructure`/composición.
5. **Pruebas propias:** agrega pruebas unitarias y de integración en `test/` usando modelos ajenos a CasePilot.

## Verificación

Desde la raíz del monorepo:

```bash
pnpm check:persistence
pnpm test:persistence:integration
```

`pnpm check:persistence` ejecuta `build:contracts`, typecheck, lint, pruebas unitarias/arquitectura y build. `pnpm test:persistence:integration` requiere Docker y usa PostgreSQL 18 efímero mediante Testcontainers para acreditar commit/rollback entre repositorios, fallo de commit diferido, scopes concurrentes y CRUD/paginación parametrizada.
