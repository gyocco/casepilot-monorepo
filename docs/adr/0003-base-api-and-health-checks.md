# 0003 — API base NestJS y sondas de salud

- Estado: aceptada e implementada.
- Fecha: 2026-09-30.
- Relacionadas: [ADR 0001](0001-local-postgresql.md), [ADR 0002](0002-backend-application-owned-business-logic.md).

## Contexto

Evolución del contrato: el [ADR 0012](0012-configurable-http-error-handler.md) reemplaza el body 503 inicial por Problem Details y un filtro global configurable. Health utiliza posteriormente UnexpectedError y el status estándar 500, sin mapping específico; su recorrido se conserva.

La API deja de ser un placeholder. Se solicita un backend REST con TypeORM, configuración local/futura y dos sondas: respuesta HTTP sin acceso a datos y lectura completa de una tabla técnica `HealthCheckObject(Guid, Value)`. La separación y todas las [reglas backend](../architecture/backend-architecture-baseline-rules.md) continúan vigentes.

## Decisión

- Implementar el host en `src/apps/casepilot/casepilot-api`, con NestJS 12.1.2, TypeORM 0.3.31, PostgreSQL y ESM nativo. Los engines de TypeORM 1.x requieren Node 22.13 o posterior; la rama 0.3.31 mantiene compatibilidad con el Node 22.12 instalado y contiene las correcciones de seguridad de su rama. TypeScript 5.9.3 mantiene compatibilidad con el lint con tipos.
- Componer los providers con módulos/factories Nest. El handler es una clase pura de Application con un único Request y un único Response; el contrato de repositorio y entidad son clases/tipos de Domain sin comportamiento funcional. No se requiere un bus CQRS para ejecutar commands/queries.
- Mantener EntitySchema y repositorio TypeORM en Infrastructure. `getAll` realiza una sola lectura y un mapeo estructural; no tiene transacciones, cascadas ni efectos externos.
- Abrir el DataSource al primer acceso a datos, con inicialización concurrente compartida y cierre del pool al apagar la app. `/health` puede arrancar y responder sin PostgreSQL; `/health/database` prueba la lectura y traduce fallos a `503` sin filtrar información privada.
- Cargar archivos `.env` mediante Node y validar la configuración. Solo `local` obtiene fallback de `infra/docker/.env`; los otros entornos requieren credenciales propias e inyección explícita. TLS verifica certificados, con CA configurable. Runtime y CLI usan la misma fábrica de opciones.
- Crear la tabla y una fila exclusivamente técnica mediante una migración versionada. Desactivar `synchronize`, migraciones automáticas y creación de extensiones; ejecutar migraciones como paso explícito. No se implementa una transacción de caso de uso para un SELECT.
- Mantener helpers con un consumidor junto a la API y publicar el contrato HTTP en `contracts/openapi/casepilot-api.yaml`. Las librerías generales continúan sin negocio de CasePilot.

## Alternativas consideradas

La inicialización de persistencia durante el bootstrap haría depender el arranque de la sonda HTTP simple de PostgreSQL. El DataSource diferido satisface la independencia requerida. `@nestjs/typeorm`, un bus CQRS y Swagger agregan mecanismos que este flujo todavía no necesita; la composición Nest y TypeORM siguen sus APIs públicas sin esas dependencias adicionales.

## Consecuencias y validación

El arranque exige configuración válida aunque la conexión se difiera. El probe profundo verifica lectura de su tabla, no la salud de todas las capacidades futuras. La infraestructura Docker local no representa un despliegue de producción. Los demás entornos tienen configuración preparada, sin recursos remotos provisionados.

Lint comprueba las fronteras de imports actuales; las reglas restantes requieren revisión explícita. La validación inicial usó un schema aleatorio en PostgreSQL local. Ese recurso queda reemplazado por PostgreSQL efímero con Testcontainers según el [ADR 0004](0004-isolated-endpoint-tests.md). Desde el [ADR 0005](0005-project-owned-tests.md), unitarias y endpoints pertenecen a `casepilot-api/test/`. La adopción de la base reutilizable se documenta según el [ADR 0006](0006-reusable-backend-baseline.md). La base de desarrollo no se utiliza para pruebas. No se verifican UI, identidad, transacciones de negocio ni proveedores ausentes.

Comandos y variables canónicos: [README de la API](../../src/apps/casepilot/casepilot-api/README.md).

## Referencias técnicas

Consultadas el 2026-09-30: [NestJS: inicio](https://docs.nestjs.com/first-steps), [TypeORM 0.3: DataSource](https://v0.typeorm.io/docs/data-source/data-source-options/), [release TypeORM 0.3.31](https://github.com/typeorm/typeorm/releases/tag/0.3.31), [Node.js 22.12: runner de pruebas](https://nodejs.org/download/release/v22.12.0/docs/api/test.html). Los engines y licencias se verificaron además en los manifests publicados en npm; no se toman los ejemplos oficiales como autorización para romper reglas.
