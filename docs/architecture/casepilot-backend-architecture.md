# Arquitectura particular del backend de CasePilot

- Estado: adoptada; API NestJS/TypeORM y contexto técnico Health implementados.
- Fecha: 2026-10-01.
- Alcance: todo backend de CasePilot, incluidos APIs, workers, schedulers, adaptadores y librerías backend.
- Decisiones: [ADR 0002](../adr/0002-backend-application-owned-business-logic.md), [ADR 0003](../adr/0003-base-api-and-health-checks.md) y [ADR 0006](../adr/0006-reusable-backend-baseline.md).

## Adopción de la arquitectura base

CasePilot adopta íntegramente la [arquitectura base backend NestJS/TypeORM](backend-architecture-baseline.md) y todas las reglas activas del [catálogo obligatorio](backend-architecture-baseline-rules.md). Los IDs BCK-001 a BCK-020 conservan sus exigencias. La base es reutilizable por otros proyectos que la adopten explícitamente; su presencia no impone esta arquitectura a proyectos ajenos.

Este documento registra decisiones particulares y evidencia implementada. No mantiene una copia del catálogo ni permite excepciones locales: las decisiones específicas deben ser compatibles con toda regla activa. Nuevas restricciones de producto se documentan explícitamente sin redefinir una regla de la base.

La [skill backend](../../.agents/skills/backend-architecture/SKILL.md) aplica esta adopción en CasePilot. Los demás productos pueden tener su propio documento de arquitectura y ADR de adopción.

## Propietarios y composición actuales

El host inicial es [CasePilot API](../../src/apps/casepilot/casepilot-api/README.md), un monolito modular con composición NestJS y TypeORM como adaptador de persistencia. Domain/Application mantienen contratos y modelos independientes del framework. La composición construye los handlers y enlaza los puertos con sus implementaciones.

El contexto técnico Health posee `HealthCheckObject`, su contrato de repositorio, query, schemas y transporte:

- `GET /health` responde desde el controller sin Application ni acceso a PostgreSQL.
- `GET /health/database` construye el request, ejecuta la query, obtiene entidades por su contrato de repositorio y devuelve el response HTTP mapeado.
- El repositorio TypeORM realiza un SELECT sobre `HealthCheckObject(Guid, Value)`. La migración crea esa tabla y una fila técnica.
- Fallos de persistencia producen `503` sanitizado; la sonda simple sigue disponible. La conexión es diferida y se libera al cerrar el proceso.

Los comandos, variables, versiones y definición detallada del host tienen su fuente canónica en el README de la API y el ADR 0003. No se crean otros contextos ni paquetes de negocio hasta que exista una necesidad real.

## Decisiones de entorno y persistencia

El entorno de desarrollo utiliza PostgreSQL persistente en Docker conforme al [ADR 0001](../adr/0001-local-postgresql.md). Runtime y CLI comparten la fábrica DataSource; las migraciones son explícitas, con `synchronize: false` y `migrationsRun: false`.

Las pruebas utilizan PostgreSQL efímero exclusivo de Testcontainers, sin leer credenciales, migrar, consultar ni apagar la base de desarrollo. El aislamiento técnico decidido en el [ADR 0004](../adr/0004-isolated-endpoint-tests.md) se conserva; la propiedad y ubicación actuales se registran en el [ADR 0005](../adr/0005-project-owned-tests.md).

CasePilot excluye Supabase conforme a las instrucciones del repositorio. Esa restricción del producto no forma parte de la base reutilizable. Otros entornos tienen configuración preparada; no existen recursos de producción provisionados por esta documentación.

## Estructura y pruebas del proyecto

Las carpetas globales, la diferencia entre raíz del paquete y fuente interna, y la ubicación de pruebas se definen exclusivamente en [monorepo-architecture.md](monorepo-architecture.md). Esta arquitectura adopta esas convenciones, sin mantener una guía paralela de organización del monorepo.

La API posee sus suites `test/unit/` y `test/integration/`. Los endpoints se ejercitan mediante HTTP real sobre NestJS, query, repositorio y PostgreSQL migrado. Requisitos, ciclo de vida y escenarios: [README de integración](../../src/apps/casepilot/casepilot-api/test/integration/README.md).

## Evolución y verificaciones

Nuevas audiencias pueden usar adaptadores HTTP distintos en el mismo host. Un nuevo despliegue o una extracción de negocio requiere una decisión de frontera compatible con la base y la estructura del repositorio; no convierte negocio en una librería técnica general ni autoriza importar una app desde otra.

La API tiene TypeScript estricto, ESLint con tipos, dependency-cruiser para dependencias y ts-morph para contratos de handlers, además de build y pruebas de configuración/Application y endpoints Health. La [guía local de validación arquitectónica](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md) es la fuente canónica de comandos y cobertura por ID; la decisión se registra en el [ADR 0007](../adr/0007-automated-api-architecture-validation.md). Esos checks no acreditan automáticamente todo el catálogo: negocio, scopes, SQL y garantías de comportamiento requieren revisión explícita. Se incorporarán pruebas de autorización, rollback y conflictos cuando los casos de uso los necesiten.
