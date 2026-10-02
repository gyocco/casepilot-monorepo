# 0015 — CRUD de los modelos de servicios profesionales

- Estado: aceptada e implementada.
- Fecha: 2026-10-02.
- Alcance: CasePilot API, persistencia PostgreSQL y contrato HTTP.

## Contexto

El usuario solicita la API CRUD de todos los modelos del documento de dominio, con paginación por recurso y migraciones PostgreSQL, exclusivamente para operaciones de datos. Solicita explícitamente endpoints públicos y diferir autenticación. El documento propone opciones de MVP, auditoría y efectos externos; no amplían el alcance solicitado ni reemplazan las reglas de arquitectura.

## Decisión

Implementar los 28 recursos dentro de las cuatro capas existentes, con modelos y repositorios propios de la API, un módulo de Presentation por recurso, handlers concretos y contratos CQRS compartidos. Cada recurso ofrece POST, GET por ID, PATCH, DELETE y GET paginado. Users y BusinessAccounts son globales; las demás rutas incluyen businessAccountId.

Mantener los endpoints públicos según la instrucción directa del usuario. No aceptar IDs, roles ni tenant como identidad autorizada: son datos o selectores. No hay subsistema Auth ni garantías de autorización de usuarios en este alcance. La implementación futura de autenticación verificará identidad en transporte y permisos en Application conforme a BCK-006; esta decisión no modifica ni flexibiliza el catálogo reutilizable.

Persistir datos y metadatos sin recursos externos, cálculos de facturación ni ejecución de workflows. Activity ofrece CRUD manual, sin promesa de auditoría inmutable. Agregar tenant explícito a los tres recursos originalmente subordinados (DocumentVersion, InvoiceLine, WorkflowStep) y a todas las asociaciones para reforzar FKs compuestas. Los campos comunes son UUID, timestamps y version; no incorporar soft delete.

Application selecciona cada campo, valida formatos y relaciones, coordina operaciones mediante UnitOfWork compartido y usa repositorios del scope. Un repositorio realiza una sola sentencia por operación. Los listados coordinan página/count con REPEATABLE READ; las escrituras usan SERIALIZABLE y versiones condicionadas. Versiones obsoletas y conflictos detectados durante una sentencia se traducen a 409 sin reintentos funcionales ocultos; fallas de apertura o commit conservan la normalización técnica genérica del adaptador compartido (500).

Una migración versionada crea todas las tablas antes de sus FKs para resolver ciclos. El historial y schemas son compatibles entre runtime/CLI, sin synchronize ni ejecución automática. Marcar UUIDs generados en metadata TypeORM y seleccionar gen_random_uuid mediante uuidExtension pgcrypto, con installExtensions false: PostgreSQL 18 dispone de esa función y no se instalan extensiones.

## Alternativas

- Implementar únicamente el MVP del documento: no satisface la solicitud de todos los modelos.
- Controller dinámico genérico o negocio en repositorios: no mantiene los módulos, los modelos concretos ni la coordinación explícita exigida.
- Cascadas, triggers, save/remove y recálculos implícitos: ocultan operaciones fuera de Application.
- Tokens administrativos o proveedor de identidad: diferidos por instrucción explícita.
- Object storage y envío de comunicaciones: fuera del alcance de datos.

## Consecuencias

Se agregan tipos, schemas, handlers y transportes concretos para cada recurso, con helpers técnicos y validadores compartidos dentro de su capa. Los decimales/bigints son strings en HTTP. Eliminaciones con referencias se rechazan; el consumidor elimina relaciones explícitamente.

La selección por cuenta y las FKs evitan relaciones inconsistentes, pero los endpoints públicos permiten acceso anónimo a cualquier cuenta conocida. Los flags de rol/privacidad son datos hasta implementar permisos. Los totales/saldos de facturas y los registros Activity son datos administrados por el consumidor.

Contrato, rutas, ejemplos y límites: [CRUD de servicios profesionales](../../src/apps/casepilot/casepilot-api/docs/professional-services-crud.md). [Unitarias](../../src/apps/casepilot/casepilot-api/test/unit/crud.test.ts) y [PostgreSQL/HTTP](../../src/apps/casepilot/casepilot-api/test/integration/professional-services.test.ts) acreditan comportamiento, rollback, precisión, scopes, conflictos y esquema.
