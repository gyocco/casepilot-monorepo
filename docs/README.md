# Documentación de CasePilot

## Documentos disponibles

- [Arquitectura del monorepo](architecture/monorepo-architecture.md): organización de `src/apps/` y `src/libs/`, responsabilidades por runtime, dirección de dependencias y ubicación de contratos, tests, infraestructura y CI/CD.
- [Arquitectura base backend](architecture/backend-architecture-baseline.md): diseño NestJS/TypeORM reutilizable con negocio exclusivo en Application, adoptable por múltiples proyectos.
- [Reglas obligatorias de la arquitectura base backend](architecture/backend-architecture-baseline-rules.md): catálogo obligatorio para cada proyecto adoptante, con IDs estables.
- [Arquitectura particular de CasePilot](architecture/casepilot-backend-architecture.md): adopción íntegra de la base, decisiones específicas y verificaciones implementadas.
- [Skill de arquitectura backend](../.agents/skills/backend-architecture/SKILL.md): procedimiento obligatorio de diseño, implementación y revisión contra todas las reglas vigentes.
- [Skill de sincronización de reglas](../.agents/skills/architecture-rules-sync/SKILL.md): alta, modificación y retiro de reglas, con fuentes canónicas, cobertura, ESLint/dependency-cruiser/ts-morph y pruebas coordinados.
- [README del monorepo](../README.md): estado actual, mapa breve, workspace y comandos raíz.
- [README de CasePilot API](../src/apps/casepilot/casepilot-api/README.md): arranque NestJS/TypeORM, entornos, endpoints de salud, migraciones y verificaciones.
- [Validación de arquitectura de CasePilot API](../src/apps/casepilot/casepilot-api/docs/architecture-validation.md): comandos ESLint/dependency-cruiser/ts-morph, cobertura BCK, pruebas y límites.
- [ADR 0007 — Validación automatizada de la API](adr/0007-automated-api-architecture-validation.md): herramientas y convenciones verificables del paquete API.
- [ADR 0008 — Dominio compartido y capas por aplicación](adr/0008-application-wide-backend-layers.md): elimina la división por contextos y ubica database/configuración en Infrastructure.
- [ADR 0009 — Application por recurso](adr/0009-resource-organized-application.md): agrupa los casos de uso por recurso, con regla CPA-001 y validación de firmas en toda Application.
- [ADR 0010 — Request, Response y Handler compartidos](adr/0010-shared-cqrs-contracts.md): librería CQRS, invocación directa y regla CPA-002 para modelos y handlers de Application.
- [Librería CQRS](../src/libs/backend/cqrs/README.md): API pública, ejemplos, límites y comandos de `@casepilot/cqrs`.
- [Librería de errores](../src/libs/backend/exception-handler/README.md): errores puros y filtro HTTP NestJS configurable con Problem Details.
- [ADR 0012 — Manejo HTTP de errores](adr/0012-configurable-http-error-handler.md): contrato uniforme y control del detalle por ambiente.
- [Librería de abstracciones](../src/libs/backend/abstractions/README.md): Entity, paginación, Repository/CrudRepository y UnitOfWork con adaptador transaccional TypeORM separado.
- [ADR 0011 — Abstracciones de data access](adr/0011-data-access-abstractions.md): BCK-021/BCK-022, CPA-003, firmas acotadas y scopes transaccionales tipados.
- [Contrato HTTP inicial](../contracts/openapi/casepilot-api.yaml): respuestas de las sondas simples y de PostgreSQL.
- [Decisión de la API base y health checks](adr/0003-base-api-and-health-checks.md): composición pura, conexión diferida y configuración coordinada.
- [Infraestructura](../infra/README.md): alcance de infraestructura y artefactos de runtime.
- [Dependencias locales de CasePilot](../infra/docker/README.md): Docker Compose, PostgreSQL local, conexión y comandos.
- [Decisión de PostgreSQL local](adr/0001-local-postgresql.md): versión, puerto, persistencia y límites del entorno.
- [Decisión de arquitectura backend](adr/0002-backend-application-owned-business-logic.md): lógica exclusiva en Application y consecuencias de contratos, repositorios y transacciones.
- [Pruebas transversales](../tests/README.md): pruebas que cruzan aplicaciones, servicios y contratos.
- [Pruebas de endpoints aisladas](adr/0004-isolated-endpoint-tests.md): PostgreSQL con Testcontainers, migraciones reales y separación completa de la base local.
- [ADR 0005 — Pruebas con el proyecto propietario](adr/0005-project-owned-tests.md): suites locales por proyecto y `/tests` exclusivamente transversal.
- [ADR 0006 — Base backend reutilizable](adr/0006-reusable-backend-baseline.md): base normativa y adopción particular.
- [README de integración de la API](../src/apps/casepilot/casepilot-api/test/integration/README.md): requisitos, comandos, aislamiento y escenarios Health.
- [Herramientas](../tools/README.md): automatización propia del repositorio.
- [Instrucciones para agentes](../.agents/README.md): políticas y skills de trabajo.

## Áreas futuras

Las siguientes áreas se crearán cuando exista contenido real, siguiendo la guía de estructura:

- `product/`: visión, requisitos y alcance.
- `project-management/`: roadmap, hitos y seguimiento.
- `development/`: instalación, comandos y calidad.
- `operations/`: despliegue, entornos, observabilidad e incidentes.
- `reference/`: APIs, variables, contratos y comandos de consulta.

La documentación específica de una aplicación o librería vive en su README local. Cada tema transversal mantiene una fuente canónica y se enlaza desde este índice.
