# Validación automatizada de arquitectura de CasePilot API

- Estado: implementada para esta API.
- Fecha: 2026-10-01.
- Revisión: 2026-10-02.
- Normativa: [catálogo BCK vigente](../../../../../docs/architecture/backend-architecture-baseline-rules.md), adoptado por la [arquitectura particular de CasePilot](../../../../../docs/architecture/casepilot-backend-architecture.md).
- Decisión de herramientas y convenciones verificables: [ADR 0007](../../../../../docs/adr/0007-automated-api-architecture-validation.md).
- Organización vigente y evolución de BCK-009/BCK-014/BCK-017: [ADR 0008](../../../../../docs/adr/0008-application-wide-backend-layers.md).
- Organización de Application por recurso, regla particular [CPA-001](../../../../../docs/architecture/casepilot-backend-architecture.md#cpa-001--application-de-la-api-organizada-por-recurso): [ADR 0009](../../../../../docs/adr/0009-resource-organized-application.md).

- Contratos CQRS, herencia y nomenclatura de handlers, regla particular [CPA-002](../../../../../docs/architecture/casepilot-backend-architecture.md#cpa-002--contratos-cqrs-compartidos-e-invocacion-directa): [ADR 0010](../../../../../docs/adr/0010-shared-cqrs-contracts.md).

Este documento describe la cobertura ejecutable; no reemplaza el catálogo ni convierte un check verde en evidencia de cumplimiento completo. Las herramientas son dependencias de desarrollo del paquete API y no se importan desde el producto.

## Comandos

Requisitos: dependencias instaladas con `pnpm install --frozen-lockfile`. Los scripts de la API que necesitan tipos construyen primero `@casepilot/cqrs` y `@casepilot/abstractions`, consumiendo sus declaraciones ESM del workspace. Verificado con Node.js 22.12.0 y pnpm 10.13.1. Los checks estáticos y sus pruebas no necesitan Docker, PostgreSQL, archivos `.env` ni una API en ejecución.

Desde la raíz del monorepo:

```bash
pnpm check:api:architecture
pnpm test:api:architecture
```

Desde `src/apps/casepilot/casepilot-api/`:

```bash
pnpm check:architecture
pnpm test:architecture
```

`check:architecture` ejecuta secuencialmente **type-check → ESLint → dependency-cruiser → ts-morph** y termina con código distinto de cero ante el primer fallo. Este es el comando completo que debe usarse como gate local o en CI: el compilador nativo verifica los tipos y caminos de retorno con la configuración NodeNext del proyecto, y los otros mecanismos agregan restricciones arquitectónicas.

Para diagnosticar un mecanismo por separado, desde la API:

| Comando | Alcance |
| --- | --- |
| `pnpm typecheck` | Fuentes, tests, herramientas y configuraciones; sin emitir archivos. |
| `pnpm lint` | ESLint con tipos y reglas arquitectónicas; cero warnings permitidos. |
| `pnpm check:dependencies` | Grafo de imports/exports alcanzable desde todo `src/`. |
| `pnpm check:structure` | Ubicación de capas/database, agrupación de Application por recurso, firmas, símbolos de modelos, retornos explícitos y llamadas directas a handlers. No sustituye `typecheck`. |
| `pnpm test:architecture` | Pruebas de los tres mecanismos con ejemplos válidos e inválidos. |

`pnpm test:api` también ejecuta estas pruebas después de las unitarias existentes. Los builds y endpoints continúan verificándose con `pnpm build:api` y `pnpm test:api:integration`; únicamente integración necesita Docker y PostgreSQL efímero de Testcontainers. No se incorpora un workflow remoto: cualquier pipeline puede invocar estos mismos comandos después de instalar el lockfile.

## Responsabilidad de cada mecanismo

### ESLint

[eslint.config.mjs](../eslint.config.mjs) mantiene `recommendedTypeChecked`, imports restringidos en Domain/Application/Presentation y las reglas generales de calidad de TypeScript. Agrega detección de:

- Uso directo de `process` y `fetch` en Domain/Application.
- CPA-002: imports/reexports nombrados de `Handler` como tipos, permitiendo las bases runtime `Request`/`Response`; rechazo de imports/reexports privados de CQRS por paquete o ruta relativa.
- Llamadas a `transaction`, `startTransaction`, `commitTransaction` y `rollbackTransaction` desde repositorios, mediante miembros ordinarios o literales computados.
- Llamadas ordinarias o computadas literales a `findAndCount` y `findAndCountBy` en repositorios, incluidos archivos `.repository.ts` de Infrastructure.
- CPA-003: entradas públicas de abstractions y rechazo del adaptador `/typeorm` desde Domain/Application. El grafo complementa los selectores locales, incluyendo barrels.
- Opciones literales `cascade: true`, cascadas con arrays no vacíos, `lazy: true`, `onDelete: 'CASCADE'` y eliminación de huérfanos en `persistence/schemas/`, `entities/` y `models/`.
- `synchronize: true` literal bajo `src/infrastructure/database/`.

Las directivas inline de ESLint están deshabilitadas y los warnings hacen fallar el comando. Una supresión no autoriza incumplir el catálogo. Estos selectores detectan sintaxis concreta: opciones calculadas, aliases de métodos, callbacks transaccionales y configuración construida dinámicamente requieren verificaciones adicionales y revisión. Un objeto con esos nombres en las carpetas ORM se interpreta como configuración de persistencia.

### dependency-cruiser

[dependency-cruiser.config.mjs](../dependency-cruiser.config.mjs) verifica fuentes TypeScript antes de compilarlas, incluidos imports exclusivamente de tipos. Usa `tsconfig.json`, `exportsFields: ['exports']` y condiciones de tipos/ESM para resolver la entrada pública del workspace sin aliases a fuentes externas. Prioriza `types`/`typings` en manifests que no usan exports. Conserva dependencias externas visibles sin recorrer sus internals de `node_modules`.

Valida ciclos, imports irresolubles, dependencias de desarrollo desde runtime, fronteras entre capas y acceso a Node desde el núcleo. Domain/Application no pueden alcanzar Infrastructure, Presentation, configuración o composición mediante barrels intermedios. La lista de frameworks/proveedores reconocidos incluye NestJS, TypeORM, pg, React, Ionic, Capacitor y SDKs AWS/Azure; un proveedor nuevo requiere actualizar y probar esta detección.

Los checks de capas se aplican a `src/domain/`, `src/application/`, `src/infrastructure/` y `src/presentation/`, incluidos database y configuración bajo Infrastructure. Los modelos relacionados pueden importarse dentro del mismo Domain y desde Application sin un `public.ts` por feature. La regla anterior `BCK-014-context-public-api` se retira conforme al ADR 0008. `AppModule` mantiene la composición raíz fuera del núcleo.

CPA-002 permite el index público de CQRS y rechaza dependencias directas de Application hacia otros módulos de `libs/backend/cqrs/src/` o `dist/`. La resolución del paquete real se verifica con el gate sobre la API; las fixtures acreditan entrada pública y deep imports. Los imports internos del propio index siguen permitidos.

La API puede consumir librerías backend y contratos; no otra app, librerías cliente, tests ni herramientas. El análisis comienza en esta API: no acredita todas las dependencias del monorepo ni que una librería general carezca de negocio. La propiedad de tablas y ausencia de acceso SQL a persistencia privada de otras aplicaciones requieren revisión.

CPA-003 permite el index principal de abstractions y el index `/typeorm` desde Infrastructure. Rechaza módulos privados directos; BCK-008 impide que Domain/Application alcancen el adaptador transaccional mediante barrels, incluso si no importa un driver directamente. Fixtures y resolución real acreditan ambas entradas del workspace. El lint propio del paquete mantiene su entrada principal independiente de TypeORM/Node/proveedores.

BCK-008 también impide el adaptador `@casepilot/exception-handler/nestjs` en Domain/Application: ESLint rechaza imports/reexports directos y dependency-cruiser rechaza el directorio de su adaptador mediante dependencias alcanzables, incluyendo barrels. Los errores de la entrada principal pura están permitidos. Regresiones: [eslint.test.ts](../test/architecture/eslint.test.ts) y [dependencies.test.ts](../test/architecture/dependencies.test.ts). El [lint de la librería](../../../../libs/backend/exception-handler/eslint.config.mjs), con [tests propios](../../../../libs/backend/exception-handler/test/unit/architecture.test.ts), protege su entrada pura (BCK-008) y rechaza imports de apps (BCK-015). No se modifica el catálogo normativo ni los scanners ts-morph: no hay nuevos handlers, repositorios ni contratos transaccionales.

El [handler HTTP compartido](../../../../libs/backend/exception-handler/README.md) aporta evidencia de BCK-016 mediante [unitarias de normalización](../../../../libs/backend/exception-handler/test/unit/problem-details.test.ts) e [integración NestJS](../../../../libs/backend/exception-handler/test/integration/nestjs.test.ts). Verifican status/body Problem Details, errores síncronos/asíncronos, guards/pipes, routing y ausencia de causas/propiedades privadas en respuestas. La [prueba de composición API](../test/unit/error-handling.test.ts) verifica ambos modos y el mapeo Health a 503 sin base; [la integración Health](../test/integration/health.test.ts) acredita el 503 sanitizado ante PostgreSQL caído/tabla ausente. [Configuración](../test/unit/configuration.test.ts) prueba defaults, overrides, precedencia y booleanos inválidos de API_ERROR_DETAILS. `pnpm check:exception-handler` ejecuta los checks del paquete propietario sin Docker. El contenido seguro de mensajes intencionalmente expuestos y el logging de cada consumidor siguen requiriendo revisión.

### ts-morph

[source-layout-rules.ts](../tools/architecture/source-layout-rules.ts) verifica los paths de las fuentes incluidas en el proyecto TypeScript, incluso archivos sin imports: BCK-014 exige las cuatro carpetas compartidas directamente bajo `src/`, sin `contexts/` ni capas repetidas; BCK-017 exige que las carpetas database estén directamente bajo Infrastructure. Admite archivos de bootstrap/composición en la raíz y no analiza tests ni archivos excluidos del proyecto. No determina semánticamente el contenido de un archivo mal nombrado ni la propiedad de tablas.

El mismo checker aplica CPA-001 a toda `src/application/`: requiere al menos una subcarpeta por recurso o responsabilidad lógica y rechaza carpetas llamadas `commands` o `queries` en cualquier nivel, sin distinguir mayúsculas. No usa una lista cerrada de recursos. Admite subcarpetas por operación y responsabilidades compartidas explícitas, como `ports/` o `shared/`. Comprueba la estructura de los paths, no la correspondencia semántica entre un archivo y su recurso.

[use-case-rules.ts](../tools/architecture/use-case-rules.ts) analiza las clases en toda `src/application/`, incluidos recursos y subcarpetas de operaciones. Reconoce clases con sufijo `Command`, `Query` o `Handler`, además de clases que declaren `execute`. Los archivos `.command.ts`, `.query.ts` y `.handler.ts` deben declarar su handler; requests/responses y errores no se interpretan como handlers por compartir carpeta.

Para cada operación, el handler declara un método público de instancia `execute`, con un único parámetro explícito, requerido, de la clase concreta `<Operation>Request` de Application de esta app. No admite argumentos adicionales, defaults, rest ni sobrecargas. El retorno explícito es la clase concreta `<Operation>Response`, o `Promise` de esa clase, también en Application. Se admiten aliases de imports y tipos que resuelvan a esas clases; interfaces y clases abstractas no satisfacen el contrato.

CPA-002 requiere clases `<Operation>Handler` en archivos `<operation>.handler.ts` cuyo basename coincide con la operación convertida a kebab-case e implementación explícita de `Handler<Request, Response>` cuyo símbolo pertenece al paquete CQRS del workspace, en fuentes o declaraciones construidas. Los dos argumentos genéricos coinciden por símbolo con los modelos concretos de `execute`, que devuelve Promise. Acepta aliases de import, namespaces y reexports del mismo contrato; rechaza interfaces locales de igual forma, aliases locales especializados y contratos solo heredados.

Todas las clases con sufijo Request/Response en Application deben heredar de la base correspondiente real de CQRS, directamente o mediante clases intermedias. Las bases locales falsas no cumplen. Los tests aíslan las reglas BCK reutilizables, que permiten respuestas síncronas, de la restricción particular CPA-002, que exige Promise y los contratos compartidos. La suite verifica el Handler Health real y demuestra que quitar su cláusula implements produce una infracción.

También compara los símbolos reales de los retornos explícitos con la clase declarada: dos clases con igual nombre o forma no equivalen. Ignora retornos de callbacks internos. Inspecciona llamadas directas `handler.execute(...)` que el servicio de lenguaje puede asociar con el método, comprobando cantidad y tipo de argumentos. Emite errores como:

```text
src/application/cases/close-case.handler.ts:12: error BCK-004: ...
src/application/health/get-health-check-objects.handler.ts:11: error CPA-002: ...
src/application/queries/read-case.query.ts:1: error CPA-001: Group Application files under src/application/<resource>/ ...
```

Este análisis no recorre todos los flujos de datos: llamadas indirectas/desestructuradas, adaptadores de bus, valores forzados mediante casts, instanciación real detrás de tipos estructurales e inputs/contexto verificado necesitan revisión o checks específicos. El gate nativo de TypeScript acredita la compilación y los retornos incompletos; el scanner no utiliza los diagnósticos de compilación de ts-morph, cuyos wrappers no preservan todos los formatos implícitos de módulos NodeNext.

### Repositorios y Unit of Work con ts-morph

[data-access-rules.ts](../tools/architecture/data-access-rules.ts) añade BCK-021/BCK-022 y CPA-003 al mismo gate. Selecciona todas las fuentes del `src/` de la API incluidas en TypeScript, aun sin imports: interfaces en `domain/repositories/`, clases en `infrastructure/persistence/repositories/`, declaraciones con sufijo Repository/UnitOfWork y herederos de los contratos reales. No recorre tests como fuentes de producto ni certifica otras apps/libs. El lanzador rechaza un proyecto vacío y [data-access.test.ts](../test/architecture/data-access.test.ts) acredita el repositorio Health real.

Resuelve los símbolos reales de Entity/Repository/CrudRepository/UnitOfWork y PageRequest/PageResponse desde fuentes/declaraciones del paquete del workspace. Inspecciona firmas públicas declaradas/heredadas, overloads y propiedades de función; deja fuera constructores técnicos y helpers privados/protegidos. Acepta primitivos, arrays/readonly arrays, Promise en retornos y genéricos con restricciones válidas. Rechaza objetos/DTOs/ORM, utilitarios de objetos, tuplas, intersecciones y modelos de igual forma sin herencia explícita; los items de PageResponse también se verifican. Los alias/reexports del mismo símbolo y la herencia indirecta son válidos. Las restricciones genéricas de TypeScript y el lint siguen siendo parte del gate.

Para UnitOfWork verifica contrato real y scope no vacío con propiedades de repositorio. Rechaza inyección/uso de UnitOfWork desde repositorios y llamadas directas a otros repositorios (BCK-009). Analiza callbacks literales y funciones/variables resolubles por símbolo: deben estar en Application, usar repositorios del parámetro de scope y evitar anidar UnitOfWork. Admite aliases locales y destructuring del scope. Callbacks/llamadas indirectos no resolubles, mutación posterior de aliases, escapes, cast del resultado, operaciones sin await y factories dinámicas conservan revisión manual; no se afirma análisis completo de flujos.

Las pruebas de comportamiento del [paquete abstractions](../../../../libs/backend/abstractions/README.md) verifican el mecanismo con PostgreSQL: commit/rollback entre dos repositorios, fallo durante commit, scopes concurrentes y paginación de una sentencia. No hay escrituras/transacciones de producto nuevas en Health; cada futura fábrica de repositorios de la API debe acreditar su vínculo al manager y la concurrencia necesaria. `pnpm check:abstractions` y `pnpm test:abstractions:integration` son comandos adicionales del paquete propietario, y el segundo requiere Docker/Testcontainers.

## Cobertura del catálogo

Todos los IDs siguientes se refieren al catálogo enlazado arriba. **Parcial** significa que existe un check concreto, con un límite explícito, no que la regla completa esté demostrada.

| Regla | Evidencia automatizada actual | Evidencia adicional requerida |
| --- | --- | --- |
| BCK-001 | Sin comprobación semántica de negocio. | Revisar ubicación y ejecución de cada decisión de producto. |
| BCK-002 | Parcial: fronteras de imports de Domain. | Métodos, getters, funciones y constructores sin negocio oculto. |
| BCK-003 | Parcial: Presentation no importa persistencia/Domain directamente. | Delegación, proveedores y composición de casos de uso en el cuerpo del adaptador. |
| BCK-004 | Parcial: [use-case-rules.ts](../tools/architecture/use-case-rules.ts) verifica firma request y llamadas directas mediante símbolos en toda Application. [structure.test.ts](../test/architecture/structure.test.ts) acredita recursos, operaciones anidadas y el handler Health real. | Inputs/contexto verificado, invocaciones indirectas y adaptadores de bus. |
| BCK-005 | Parcial: [use-case-rules.ts](../tools/architecture/use-case-rules.ts) verifica clase de retorno explícita y símbolos de returns en toda Application, junto al type-check. Regresiones por recurso y operación: [structure.test.ts](../test/architecture/structure.test.ts). | Objeto real producido detrás de casts, aliases de valores y lógica funcional del resultado. |
| BCK-006 | Sin prueba genérica de autorización. | Pruebas del caso de uso con inputs inválidos y permisos negativos. |
| BCK-007 | Sin prueba genérica de mapeos. | Selección explícita de campos, ausencia de asignación masiva y salida pública. |
| BCK-008 | Parcial: capas, ciclos, Node, globals seleccionados y proveedores reconocidos. ESLint/grafo bloquean el adaptador NestJS de exception-handler en core, incluyendo barrels alcanzables; sus tests verifican errores puros permitidos. | Tipos públicos, bindings, APIs globales restantes y dependencias/proveedores nuevos. |
| BCK-009 | Parcial: [ESLint](../eslint.config.mjs) detecta findAndCount/By ordinarios y literales computados; [data-access-rules.ts](../tools/architecture/data-access-rules.ts) rechaza llamadas resolubles a otros repositorios. Regresiones en [eslint.test.ts](../test/architecture/eslint.test.ts) y [data-access.test.ts](../test/architecture/data-access.test.ts). | SQL y operaciones efectivas, composición propia/indirecta, ámbito autorizado y ausencia de políticas/efectos. Ningún check demuestra permisos o joins. |
| BCK-010 | Parcial: APIs transaccionales seleccionadas en repositorios; [data-access-rules.ts](../tools/architecture/data-access-rules.ts) rechaza inyección/uso de UnitOfWork y callback resoluble fuera de Application. | Transacciones implícitas ORM, aliases indirectos y política del callback. |
| BCK-011 | Parcial: [checker de data access](../tools/architecture/data-access-rules.ts) rechaza llamadas directas a repositorios globales/capturados en callbacks resolubles. [Integración del mecanismo compartido](../../../../libs/backend/abstractions/test/integration/unit-of-work.test.ts) acredita commit/rollback/fallo de commit/scopes concurrentes. | Cada fábrica concreta, escapes/aliases dinámicos, await de todas las operaciones y concurrencia funcional de cada caso de uso. |
| BCK-012 | Parcial: opciones ORM peligrosas literales. | Configuración dinámica, hooks, listeners, subscribers, DDL y efectos reales. |
| BCK-013 | Sin prueba genérica de ausencia de mutaciones. | Puertos y efectos de queries, incluidos adaptadores. |
| BCK-014 | Parcial: [ts-morph de layout](../tools/architecture/source-layout-rules.ts) verifica capas únicas sin contexts en fuentes analizadas; [dependency-cruiser](../dependency-cruiser.config.mjs) conserva fronteras de capas/apps. Regresiones: [structure.test.ts](../test/architecture/structure.test.ts) y [dependencies.test.ts](../test/architecture/dependencies.test.ts), con relaciones de Domain permitidas. | Propietario semántico de tablas/modelos, archivos fuera del proyecto TypeScript y acceso SQL entre aplicaciones. |
| BCK-015 | Parcial: dependencias de la API hacia otras apps/librerías cliente. | Negocio y consumidores de libs; resto del grafo del monorepo. |
| BCK-016 | Parcial: frontera con frameworks/drivers y adaptador NestJS de errores. [Exception-handler](../../../../libs/backend/exception-handler/README.md) verifica mapeos y sanitización pública con unitarias/HTTP; [composición API](../test/unit/error-handling.test.ts) e [integración Health](../test/integration/health.test.ts) verifican su adopción. La [prueba de UnitOfWork](../../../../libs/backend/abstractions/test/unit/unit-of-work.test.ts) acredita sanitización de conexión y su [integración](../../../../libs/backend/abstractions/test/integration/unit-of-work.test.ts) fallo de commit/preservación de errores del callback. | Errores funcionales de futuros casos de uso/repositorios; seguridad del contenido seleccionado, logging y otros consumidores/adaptadores. |
| BCK-017 | Parcial: [ESLint](../eslint.config.mjs) rechaza `synchronize: true` en `infrastructure/database/`; [ts-morph de layout](../tools/architecture/source-layout-rules.ts) detecta carpetas database fuera de esa ubicación. Regresiones: [eslint.test.ts](../test/architecture/eslint.test.ts) y [structure.test.ts](../test/architecture/structure.test.ts). | Contenido database con otro nombre, historia coordinada de migraciones, opciones calculadas y procedimiento de release. |
| BCK-018 | Sin prueba genérica de garantías externas. | Orden, fallos parciales, outbox/idempotencia cuando correspondan. |
| BCK-019 | Parcial: TypeScript estricto, ESLint, dependencias y pruebas de validadores. | Justificación de casts y pruebas proporcionales de cada comportamiento. |
| BCK-020 | Matriz y checks con IDs; sin certificación automática del catálogo completo. | Leer la normativa vigente y revisar todos los IDs activos en cada cambio. |
| BCK-021 | Completa para firmas públicas de declaraciones seleccionadas: [data-access-rules.ts](../tools/architecture/data-access-rules.ts) valida tipos permitidos, símbolos/herencia, genéricos, wrappers, métodos heredados y overloads. [data-access.test.ts](../test/architecture/data-access.test.ts) acredita aceptación/rechazo en fixtures compilables y fuentes reales. | Declaraciones fuera de ámbito/convenciones, casts/objetos reales detrás de tipos estructurales y revisión de campos/SQL. No se certifica todo el monorepo. |
| BCK-022 | Parcial: [data-access-rules.ts](../tools/architecture/data-access-rules.ts) valida contrato/scope y usos directos/aliases simples, con [regresiones](../test/architecture/data-access.test.ts). TypeScript valida RepositoryScope. [Integración del paquete](../../../../libs/backend/abstractions/test/integration/unit-of-work.test.ts) prueba el mecanismo real. | Fábricas de la app, callbacks no resolubles, escapes, mutación de aliases, await, reintentos/conflictos y efectos externos. |

## Cobertura de reglas particulares de la API

| Regla y fuente canónica | Evidencia automatizada actual | Evidencia adicional requerida |
| --- | --- | --- |
| [CPA-003](../../../../../docs/architecture/casepilot-backend-architecture.md#cpa-003--abstracciones-de-data-access-compartidas) | Completa para identidad de contratos y tipos de declaraciones seleccionadas mediante [ts-morph](../tools/architecture/data-access-rules.ts), con [tests](../test/architecture/data-access.test.ts). Parcial para entradas/frontera ORM mediante [ESLint](../eslint.config.mjs) y [grafo](../dependency-cruiser.config.mjs), con sus [tests lint](../test/architecture/eslint.test.ts) y [tests grafo](../test/architecture/dependencies.test.ts). Verificaciones del paquete: `pnpm check:abstractions` e integración PostgreSQL. | Nuevos consumidores fuera de API, objetos construidos detrás de casts, fábricas, SQL y aislamiento funcional; el contrato no acredita una sola operación de I/O. |
| [CPA-002](../../../../../docs/architecture/casepilot-backend-architecture.md#cpa-002--contratos-cqrs-compartidos-e-invocacion-directa) | Completa para las declaraciones reconocidas en las fuentes Application analizadas: [use-case-rules.ts](../tools/architecture/use-case-rules.ts) verifica nombres, Handler real, argumentos genéricos, Promise y bases Request/Response, con [structure.test.ts](../test/architecture/structure.test.ts). Parcial para imports: [ESLint](../eslint.config.mjs) comprueba imports nombrados de tipos/entrada pública, con [eslint.test.ts](../test/architecture/eslint.test.ts); [dependency-cruiser](../dependency-cruiser.config.mjs) verifica deep imports directos y resolución, con [dependencies.test.ts](../test/architecture/dependencies.test.ts). `pnpm check:cqrs` verifica la librería propietaria. | Nombres semánticos, handlers ocultos fuera de convenciones, invocaciones indirectas, casts, negocio en modelos, queries sin mutaciones y futuros mecanismos de despacho. La librería no certifica esas propiedades. |
| [CPA-001](../../../../../docs/architecture/casepilot-backend-architecture.md#cpa-001--application-de-la-api-organizada-por-recurso) | Completa para la propiedad delimitada de paths de fuentes incluidas en TypeScript: [source-layout-rules.ts](../tools/architecture/source-layout-rules.ts) rechaza archivos sueltos y carpetas commands/queries, también anidadas y sin imports. [structure.test.ts](../test/architecture/structure.test.ts) prueba recursos permitidos, subcarpetas de operaciones, alcance API/Application y rechazo de las rutas anteriores, además del handler Health real movido solo en memoria. [use-case-rules.ts](../tools/architecture/use-case-rules.ts) conserva BCK-004/BCK-005 en toda Application. | Revisar que el recurso o responsabilidad elegidos corresponda al contenido, justificar colaboradores compartidos y revisar archivos excluidos del proyecto TypeScript. |

## Pruebas y mantenimiento

Las suites [test/architecture/](../test/architecture/) son propias de esta API. Ejecutan ESLint sobre snippets, dependency-cruiser real sobre proyectos temporales y ts-morph sobre proyectos en memoria y fuentes reales sin guardarlas. Cubren relaciones de Domain permitidas, capas compartidas, database/configuración en Infrastructure, rechazo de contexts/capas repetidas, agrupación de Application por recurso, aliases, imports de tipos, barrels, ciclos entre recursos, dependencias de desarrollo, firmas inválidas, modelos concretos, símbolos distintos y supresiones. Los fixtures de ESLint/dependency-cruiser usan recursos para acreditar que sus selectores de Application siguen aplicando sin cambios de configuración. Una regresión modifica solo en memoria el handler Health real en `application/health/` para acreditar que el scanner lo selecciona y que el layout rechaza su ubicación anterior. Los proyectos temporales se crean bajo `build/` y se eliminan validando su pertenencia a esa carpeta; no modifican las fuentes ni los recursos locales de desarrollo.

El procedimiento para agregar, modificar o retirar reglas y ampliar su cobertura está en la [skill architecture-rules-sync](../../../../../.agents/skills/architecture-rules-sync/SKILL.md). Coordina catálogo backend, guía base, monorepo y adopción con los checks afectados, sus ejemplos válidos/inválidos y esta matriz. Revisa documentación → ejecución y ejecución → documentación, conservando la evidencia adicional que cada regla requiere. Los comandos y límites propios de esta API mantienen su fuente en este documento.

Versiones fijadas: ESLint 9.39.5, typescript-eslint 8.71.0, dependency-cruiser 18.5.0 y ts-morph 27.0.2. ts-morph incluye TypeScript 5.9.2 para análisis; la API compila con TypeScript 5.9.3. Se conserva la misma familia de compilador y se prueban resoluciones/símbolos. Las nuevas herramientas tienen licencia MIT y uso exclusivo de desarrollo, sin añadir peso al runtime ni a web/Capacitor. dependency-cruiser declara soporte Node `^22 || ^24 || >=26`; revisar engines y compatibilidad al actualizar las herramientas.

Referencias oficiales consultadas el 2026-10-01: [typed linting](https://typescript-eslint.io/getting-started/typed-linting/), [reglas dependency-cruiser](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-tutorial.md), [opciones dependency-cruiser](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md), [ts-morph](https://ts-morph.com/) y [tipos/símbolos](https://ts-morph.com/details/types).
