# 0008 — Dominio compartido y cuatro capas por aplicación backend

- Estado: aceptada e implementada.
- Fecha: 2026-10-01.
- Alcance: base backend adoptada por CasePilot y estructura de CasePilot API.
- Evoluciona: [ADR 0002](0002-backend-application-owned-business-logic.md), [ADR 0006](0006-reusable-backend-baseline.md) y la convención entre contextos del [ADR 0007](0007-automated-api-architecture-validation.md).

## Contexto

La estructura `contexts/health/` convierte una capacidad técnica pequeña en una unidad con cuatro capas propias. El responsable solicita eliminar por ahora esa división y mantener un dominio más amplio por proyecto/aplicación, donde las entidades relacionadas puedan convivir. También solicita ubicar la base de datos dentro de Infrastructure.

## Decisión

Evolución de composición: el [ADR 0013](0013-resource-module-composition.md) sustituye el registro directo de Health en `AppModule` por módulos de composición por recurso. Las capas únicas, el dominio compartido y las reglas de este ADR se conservan.

- Usar una sola `application/`, `domain/`, `infrastructure/` y `presentation/` directamente bajo `src/` de cada aplicación backend. No repetir esas capas por entidad, endpoint o feature ni introducir `contexts/`.
- Compartir en Domain los modelos y contratos internos del proyecto. Las relaciones entre entidades de la misma aplicación no requieren APIs públicas por feature; conservan las reglas de capas, autorización y persistencia.
- Ubicar conexión, opciones, DataSource CLI y migraciones en `infrastructure/database/`, y configuración técnica en `infrastructure/config/`. Schemas y repositorios concretos permanecen en `infrastructure/persistence/`.
- Mantener bootstrap y composición raíz como archivos en `src/`. Componer Health directamente en `AppModule`; `DatabaseModule` sigue siendo un módulo técnico de Infrastructure.
- Evolucionar BCK-014 conservando su ID: propiedad por aplicación y capas únicas sustituye propiedad/API pública por contexto. Ajustar BCK-009 al ámbito autorizado de datos y BCK-017 a la ubicación de database.
- Conservar negocio exclusivo en Application, Domain sin comportamiento funcional, request/response concretos, repositorios de operaciones individuales y transacciones coordinadas por Application.
- Sincronizar ESLint, dependency-cruiser, ts-morph, sus regresiones y cobertura. Mantener APIs/contratos explícitos entre aplicaciones y las fronteras apps/libs.

## Alternativas

Agrupar contextos más grandes seguiría manteniendo una división que hoy no se desea. Mover solo Health dejaría normas y validadores que obligan a reintroducirla. Crear módulos NestJS por cada capa añadiría composición sin una necesidad técnica actual.

## Consecuencias

Los modelos relacionados comparten vocabulario y contratos dentro de la aplicación. Las carpetas internas pueden ordenar operaciones o responsabilidades sin convertirse en bounded contexts. La separación futura de dominios requiere una nueva decisión autorizada y sincronizada.

Cambian rutas de imports, artefactos y comandos de migraciones; los subpaths públicos del paquete se conservan. No cambia el contrato HTTP ni el esquema/historial de migraciones. Las pruebas de endpoints con PostgreSQL efímero acreditan que los bindings, registro ORM y migraciones siguen funcionando tras el traslado.

## Validación

`pnpm check:api:architecture`, `pnpm test:api`, `pnpm build:api` y `pnpm test:api:integration` pasan: 8 pruebas unitarias, 42 de validadores y 7 de endpoints/persistencia aislada. Las regresiones permiten relaciones entre modelos del mismo Domain, mantienen fronteras de capas y rechazan paths con contexts/capas repetidas o database fuera de Infrastructure. La [cobertura local](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md) conserva los límites semánticos y de acceso SQL que requieren revisión adicional. No hay cambios de UI que requieran viewport o revisión visual de accesibilidad.
