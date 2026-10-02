# Arquitectura particular del backend de CasePilot

- Estado: adoptada; API NestJS/TypeORM con dominio compartido y sondas Health implementadas.
- Fecha: 2026-10-01.
- Revisión: 2026-10-02.
- Alcance: todo backend de CasePilot, incluidos APIs, workers, schedulers, adaptadores y librerías backend.
- Decisiones: [ADR 0002](../adr/0002-backend-application-owned-business-logic.md), [ADR 0003](../adr/0003-base-api-and-health-checks.md), [ADR 0006](../adr/0006-reusable-backend-baseline.md), [ADR 0008](../adr/0008-application-wide-backend-layers.md), [ADR 0009](../adr/0009-resource-organized-application.md) y [ADR 0010](../adr/0010-shared-cqrs-contracts.md).

## Adopción de la arquitectura base

CasePilot adopta íntegramente la [arquitectura base backend NestJS/TypeORM](backend-architecture-baseline.md) y todas las reglas activas del [catálogo obligatorio](backend-architecture-baseline-rules.md). Los IDs BCK-001 a BCK-022 permanecen activos; BCK-014 evoluciona a propiedad por aplicación y capas únicas, BCK-009 al ámbito autorizado de relaciones y BCK-017 sitúa database en Infrastructure según el ADR 0008. BCK-021/BCK-022 añaden firmas acotadas de repositorios y UnitOfWork con scopes tipados según el ADR 0011. La base es reutilizable por otros proyectos que la adopten explícitamente; su presencia no impone esta arquitectura a proyectos ajenos.

Este documento registra decisiones particulares y evidencia implementada. No mantiene una copia del catálogo ni permite excepciones locales: las decisiones específicas deben ser compatibles con toda regla activa. Nuevas restricciones de producto se documentan explícitamente sin redefinir una regla de la base.

La [skill backend](../../.agents/skills/backend-architecture/SKILL.md) aplica esta adopción en CasePilot. Los demás productos pueden tener su propio documento de arquitectura y ADR de adopción.

## Propietarios y composición actuales

El host inicial es [CasePilot API](../../src/apps/casepilot/casepilot-api/README.md), una aplicación con composición NestJS y TypeORM como adaptador de persistencia. Mantiene una única `application/`, `domain/`, `infrastructure/` y `presentation/` bajo `src/`, sin división por contextos. Domain/Application mantienen contratos y modelos independientes del framework. `AppModule` construye los handlers y enlaza los puertos con sus implementaciones.

La API posee `HealthCheckObject`, su contrato de repositorio, query, schema y transporte en esas capas compartidas:

- `GET /health` responde desde el controller sin Application ni acceso a PostgreSQL.
- `GET /health/database` construye el request, ejecuta la query, obtiene entidades por su contrato de repositorio y devuelve el response HTTP mapeado.
- El repositorio TypeORM realiza un SELECT sobre `HealthCheckObject(Guid, Value)`. La migración crea esa tabla y una fila técnica.
- Fallos de persistencia producen `503` sanitizado; la sonda simple sigue disponible. La conexión es diferida y se libera al cerrar el proceso.

Los comandos, variables, versiones y definición detallada del host tienen su fuente canónica en el README de la API y el ADR 0003. Los nuevos modelos y casos de uso se incorporan a las mismas capas. Health es una capacidad técnica, sin contexto ni módulo de composición propio.

El [ADR 0012](../adr/0012-configurable-http-error-handler.md) incorpora la [librería exception-handler](../../src/libs/backend/exception-handler/README.md): vocabulario de errores puro y adaptador HTTP NestJS separado. El filtro global reemplaza el filtro específico de Health, conserva su 503 sanitizado y adopta Problem Details para todos los errores HTTP. La configuración de API controla el detalle por ambiente; Application sigue interpretando errores sin conocer HTTP conforme a BCK-008/BCK-016. La cobertura de imports/privacidad y sus límites se registran en la guía de validación de la API y el README de la librería.

## CPA-001 — Application de la API organizada por recurso

**CasePilot API DEBE organizar el contenido de `src/application/` por recurso, entidad o responsabilidad lógica, conservando una sola capa Application.** Esta restricción particular complementa BCK-014 y se registra en el [ADR 0009](../adr/0009-resource-organized-application.md); no amplía el catálogo reutilizable a otros proyectos.

- Cada command/query, sus requests, responses, errores y colaboradores específicos pertenecen a `application/<recurso>/`, por ejemplo `health/`, `users/`, `orders/` o `payments/`. Los archivos no se colocan directamente en la raíz de `application/`.
- NO se crean carpetas llamadas `commands` o `queries` en ningún nivel de Application, tampoco dentro de un recurso. La distinción se conserva en el comportamiento exigido por BCK-013; los handlers usan la nomenclatura común y el sufijo `.handler.ts` conforme a CPA-002.
- Dentro de un recurso se PUEDEN agrupar los archivos de una operación en su propia subcarpeta. Los contratos o colaboradores realmente compartidos pueden tener una responsabilidad explícita, como `application/ports/` o `application/shared/`; no se duplican capas ni se crean bounded contexts.
- No se crean carpetas de recursos futuros sin implementación. Health vive actualmente en `application/health/`; `users/`, `orders/` y `payments/` son ejemplos.

**Verificación:** el gate estructural rechaza archivos de Application sin agrupación y carpetas `commands`/`queries`, incluso sin imports. Las firmas BCK-004/BCK-005 se analizan en toda Application, incluidos recursos y subcarpetas de operaciones. La correspondencia semántica entre contenido y recurso, y la necesidad de colaboradores compartidos, requieren revisión. La evidencia y límites se mantienen en la [guía de validación de la API](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md).

<a id="cpa-002--contratos-cqrs-compartidos-e-invocacion-directa"></a>

## CPA-002 — Contratos CQRS compartidos e invocación directa

**Todo caso de uso de CasePilot API DEBE declarar una clase `<Operation>Handler` en el archivo correspondiente `<operation>.handler.ts` (nombre de operación en kebab-case), que implemente explícitamente `Handler<OperationRequest, OperationResponse>` de `@casepilot/cqrs`. Sus modelos Request y Response DEBEN heredar de las bases compartidas de esa librería.** Esta regla particular complementa BCK-004/BCK-005/BCK-008/BCK-013/BCK-015; no obliga a otros proyectos que adopten la base. Decisión: [ADR 0010](../adr/0010-shared-cqrs-contracts.md).

- `Handler<TRequest extends Request, TResponse extends Response>` es el único contrato de ejecución para commands y queries. Su firma es `execute(request: OperationRequest): Promise<OperationResponse>`, pública y de instancia; no requiere el keyword `async` si devuelve una Promise.
- Todos los modelos de Application con sufijo `Request` o `Response`, incluidos responses anidados, extienden la base correspondiente de `@casepilot/cqrs`, directamente o mediante una base compartida que conserve su herencia. Request y Response usan marcas protegidas distintas, sin campos emitidos, para evitar que un objeto de igual forma sustituya el contrato. Los constructores solo inicializan estructura y llaman a `super()`.
- La cláusula `implements` declara exactamente un contrato `Handler` real de la librería y exactamente dos clases concretas cuyos símbolos coinciden con el request y el response de `execute`. Se admiten aliases de import, namespaces y reexports del mismo símbolo; interfaces locales, aliases locales del contrato especializado y contratos heredados no sustituyen esa declaración explícita.
- Las clases concretas y el negocio permanecen en `application/<recurso>/`. La nomenclatura común es `GetHealthCheckObjectsHandler`, no `GetHealthCheckObjectsQuery`; no se crean abstracciones distintas para commands y queries. La separación de lectura/escritura sigue siendo de comportamiento conforme a BCK-013.
- `Handler` se importa como tipo; `Request` y `Response` se importan como valores para la herencia. Todo consumo de la librería usa su entrada pública `@casepilot/cqrs`, sin deep imports ni rutas relativas a sus internals.
- Presentation invoca directamente `handler.execute(request)`. Application no incorpora dispatcher, bus, decoradores Nest ni middleware de despacho. Una incorporación futura requiere decisión documentada y sincronización de esta regla, preservando el contrato y la independencia del núcleo.

**Verificación:** TypeScript acredita las restricciones genéricas y marcas; ts-morph verifica identidad de las bases, herencia, nomenclatura, tipos y retorno Promise en toda Application; ESLint verifica imports de tipos del Handler y entrada pública; dependency-cruiser verifica la frontera pública en el grafo analizado. Mutaciones en queries, delegación real y semántica de modelos/colaboradores conservan revisión y pruebas de comportamiento. Alcance y regresiones: [cobertura local](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md).

## CPA-003 — Abstracciones de data access compartidas

**Los contratos de repositorio de CasePilot API DEBEN extender Repository o CrudRepository de `@casepilot/abstractions`; sus entidades DEBEN heredar o implementar explícitamente Entity de ese paquete.** Los puertos y adaptadores de transacciones implementan el UnitOfWork real. Decisión: [ADR 0011](../adr/0011-data-access-abstractions.md); complementa BCK-009/BCK-010/BCK-011/BCK-021/BCK-022.

- Entity, PageRequest y PageResponse pertenecen a `src/libs/backend/abstractions/src/dataaccess/models/`. La lista cerrada de modelos de operaciones es PageRequest y PageResponse; sus identidades se verifican por símbolo, no por forma o nombre.
- Los contratos específicos son interfaces en `domain/repositories/`, con nombres terminados en Repository. Los adaptadores son clases en `infrastructure/persistence/repositories/` que implementan esos contratos. El scanner también selecciona declaraciones terminadas en Repository y herederos del contrato compartido en el resto de las fuentes de la API, sin limitarse a paths.
- Repository es el contrato base tipado de una entidad, sin operaciones obligatorias; su propiedad opcional entityType conserva el parámetro genérico sin requerir estado de runtime. CrudRepository define getAll, getById, add, update, delete, count y getPaged con entidad/ID genéricos. Las operaciones custom respetan BCK-021. Un contrato pequeño de lectura puede extender Repository y declarar explícitamente sus lecturas sin exponer escrituras.
- La entrada principal es pura y no depende del ORM. El adaptador técnico TypeOrmUnitOfWork se importa exclusivamente por `@casepilot/abstractions/typeorm` desde Infrastructure/composición. Domain/Application solo consumen la entrada principal. No se usan deep imports ni rutas relativas a internals.
- El scope genérico de UnitOfWork es un conjunto no vacío con propiedades nombradas de repositorios. Su fábrica construye adaptadores nuevos usando exclusivamente el EntityManager transaccional. No se exponen managers ni modelos ORM al callback de Application.
- `getPaged` incluye total e items solo si el adaptador realiza una operación de lectura individual, por ejemplo una consulta parametrizada con total y página. Si requiere dos lecturas, Application coordina `getAll`/lectura especializada y `count` y construye PageResponse; no se implementa con findAndCount. El orden es determinista y los campos de sort se traducen mediante una lista permitida.

**Verificación:** TypeScript valida los genéricos; ts-morph valida contratos, herencia explícita, firmas heredadas y usos directos de repositorios/UnitOfWork; ESLint y dependency-cruiser protegen entradas públicas y la frontera ORM. Las pruebas PostgreSQL del paquete abstractions acreditan commit/rollback entre repositorios y aislamiento de scopes concurrentes. Fábricas, escapes, SQL, una sola operación y concurrencia funcional siguen requiriendo revisión. Comandos y límites: [README del paquete](../../src/libs/backend/abstractions/README.md) y [cobertura API](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md).

## Decisiones de entorno y persistencia

El entorno de desarrollo utiliza PostgreSQL persistente en Docker conforme al [ADR 0001](../adr/0001-local-postgresql.md). Runtime y CLI comparten la fábrica DataSource en `infrastructure/database/`; las migraciones son explícitas, con `synchronize: false` y `migrationsRun: false`. La carga y validación técnica de configuración reside en `infrastructure/config/`.

Las pruebas utilizan PostgreSQL efímero exclusivo de Testcontainers, sin leer credenciales, migrar, consultar ni apagar la base de desarrollo. El aislamiento técnico decidido en el [ADR 0004](../adr/0004-isolated-endpoint-tests.md) se conserva; la propiedad y ubicación actuales se registran en el [ADR 0005](../adr/0005-project-owned-tests.md).

CasePilot excluye Supabase conforme a las instrucciones del repositorio. Esa restricción del producto no forma parte de la base reutilizable. Otros entornos tienen configuración preparada; no existen recursos de producción provisionados por esta documentación.

## Estructura y pruebas del proyecto

Las carpetas globales, la diferencia entre raíz del paquete y fuente interna, y la ubicación de pruebas se definen exclusivamente en [monorepo-architecture.md](monorepo-architecture.md). Esta arquitectura adopta esas convenciones, sin mantener una guía paralela de organización del monorepo.

La API posee sus suites `test/unit/` y `test/integration/`. Los endpoints se ejercitan mediante HTTP real sobre NestJS, query, repositorio y PostgreSQL migrado. Requisitos, ciclo de vida y escenarios: [README de integración](../../src/apps/casepilot/casepilot-api/test/integration/README.md).

## Evolución y verificaciones

Nuevas audiencias pueden usar adaptadores HTTP distintos en el mismo host. Un nuevo despliegue o una extracción de negocio requiere una decisión de frontera compatible con la base y la estructura del repositorio; no convierte negocio en una librería técnica general ni autoriza importar una app desde otra.

La API tiene TypeScript estricto, ESLint con tipos, dependency-cruiser para dependencias y ts-morph para contratos de handlers, además de build y pruebas de configuración/Application y endpoints Health. La [guía local de validación arquitectónica](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md) es la fuente canónica de comandos y cobertura por ID; la decisión se registra en el [ADR 0007](../adr/0007-automated-api-architecture-validation.md). Esos checks no acreditan automáticamente todo el catálogo: negocio, scopes, SQL y garantías de comportamiento requieren revisión explícita. Se incorporarán pruebas de autorización, rollback y conflictos cuando los casos de uso los necesiten.
