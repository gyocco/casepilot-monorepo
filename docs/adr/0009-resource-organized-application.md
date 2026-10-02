# 0009 — Application organizada por recurso en CasePilot API

- Estado: aceptada e implementada; las bases y nomenclatura común de handlers evolucionan mediante el [ADR 0010](0010-shared-cqrs-contracts.md).
- Fecha: 2026-10-02.
- Alcance: organización interna de Application y validadores de CasePilot API.
- Evoluciona: la ubicación de handlers del [ADR 0007](0007-automated-api-architecture-validation.md); conserva las capas únicas del [ADR 0008](0008-application-wide-backend-layers.md).

## Contexto

Application agrupa los casos de uso por tipo técnico en `commands/` y `queries/`. El responsable solicita agruparlos por recurso o entidad, de modo que las operaciones y modelos de usuarios, órdenes o pagos se encuentren juntos. El scanner de firmas busca actualmente solo en esas dos carpetas y dejaría de verificar los handlers al moverlos.

## Decisión

- Registrar la regla particular [CPA-001](../architecture/casepilot-backend-architecture.md#cpa-001--application-de-la-api-organizada-por-recurso): contenido bajo `application/<recurso>/`, sin archivos sueltos en la raíz ni carpetas `commands`/`queries` en ningún nivel. Se permiten subcarpetas por operación y responsabilidades compartidas explícitas.
- Trasladar la query Health, su request y su response a `application/health/`, actualizando composición, transporte y pruebas. Crear otros recursos solo cuando tengan contenido real.
- Conservar commands/queries como contratos y comportamientos: request/response concretos, negocio exclusivo en Application y queries sin mutación. Los recursos no tienen capas propias ni fronteras de contexto.
- Analizar firmas en toda `src/application/` y verificar la organización con el checker de paths existente. Probar recursos distintos, operaciones anidadas, ubicaciones anteriores rechazadas y selección del handler Health real.
- Mantener ESLint y dependency-cruiser sobre toda Application; adaptar sus fixtures a recursos para acreditar que las restricciones de núcleo y capas siguen aplicando.
- Sincronizar ejemplos, instrucciones, README y cobertura. La base reutilizable admite esta organización conforme a BCK-014; CPA-001 pertenece a esta API.

## Alternativas

Mantener carpetas globales por tipo obliga a recorrer varios lugares para trabajar en un recurso. Introducir `users/commands/` y `users/queries/` conserva esa separación técnica. Repetir las cuatro capas por recurso contradice la decisión de capas únicas. Las tres alternativas quedan descartadas.

## Consecuencias

Las operaciones de cada recurso quedan juntas y siguen compartiendo Domain y puertos internos. El traslado cambia imports internos; los endpoints, contratos HTTP, persistencia y exports de composición mantienen su comportamiento.

El análisis de paths acredita agrupación y ausencia de carpetas prohibidas en fuentes incluidas en TypeScript. Elegir un recurso lógico correcto y justificar código compartido conserva revisión semántica; el nombre de una carpeta no lo demuestra.

## Validación

Pasan `pnpm check:api:architecture`, `pnpm test:api`, `pnpm build:api` y `pnpm test:api:integration`: 8 pruebas unitarias, 44 de validadores y 7 de endpoints/persistencia con PostgreSQL efímero. Se verifican también enlaces locales y `git diff --check`. No hay cambios de UI que requieran viewport o revisión visual de accesibilidad. La [cobertura local](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md) conserva los límites estáticos y la revisión semántica pendiente para cada nueva elección de recurso.
