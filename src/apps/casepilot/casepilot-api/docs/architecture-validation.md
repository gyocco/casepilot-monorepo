# Validación automatizada de arquitectura de CasePilot API

- Estado: implementada para esta API.
- Fecha: 2026-10-01.
- Normativa: [catálogo BCK vigente](../../../../../docs/architecture/backend-architecture-baseline-rules.md), adoptado por la [arquitectura particular de CasePilot](../../../../../docs/architecture/casepilot-backend-architecture.md).
- Decisión de herramientas y convenciones verificables: [ADR 0007](../../../../../docs/adr/0007-automated-api-architecture-validation.md).

Este documento describe la cobertura ejecutable; no reemplaza el catálogo ni convierte un check verde en evidencia de cumplimiento completo. Las herramientas son dependencias de desarrollo del paquete API y no se importan desde el producto.

## Comandos

Requisitos: dependencias instaladas con `pnpm install --frozen-lockfile`. Verificado con Node.js 22.12.0 y pnpm 10.13.1. Los checks estáticos y sus pruebas no necesitan Docker, PostgreSQL, archivos `.env` ni una API en ejecución.

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
| `pnpm check:structure` | Firmas, símbolos de modelos, retornos explícitos y llamadas directas a handlers. No sustituye `typecheck`. |
| `pnpm test:architecture` | Pruebas de los tres mecanismos con ejemplos válidos e inválidos. |

`pnpm test:api` también ejecuta estas pruebas después de las unitarias existentes. Los builds y endpoints continúan verificándose con `pnpm build:api` y `pnpm test:api:integration`; únicamente integración necesita Docker y PostgreSQL efímero de Testcontainers. No se incorpora un workflow remoto: cualquier pipeline puede invocar estos mismos comandos después de instalar el lockfile.

## Responsabilidad de cada mecanismo

### ESLint

[eslint.config.mjs](../eslint.config.mjs) mantiene `recommendedTypeChecked`, imports restringidos en Domain/Application/Presentation y las reglas generales de calidad de TypeScript. Agrega detección de:

- Uso directo de `process` y `fetch` en Domain/Application.
- Llamadas a `transaction`, `startTransaction`, `commitTransaction` y `rollbackTransaction` desde repositorios, mediante miembros ordinarios o literales computados.
- Llamadas ordinarias a `findAndCount` y `findAndCountBy` en repositorios.
- Opciones literales `cascade: true`, cascadas con arrays no vacíos, `lazy: true`, `onDelete: 'CASCADE'` y eliminación de huérfanos en `persistence/schemas/`, `entities/` y `models/`.
- `synchronize: true` literal bajo `src/database/`.

Las directivas inline de ESLint están deshabilitadas y los warnings hacen fallar el comando. Una supresión no autoriza incumplir el catálogo. Estos selectores detectan sintaxis concreta: opciones calculadas, aliases de métodos, callbacks transaccionales y configuración construida dinámicamente requieren verificaciones adicionales y revisión. Un objeto con esos nombres en las carpetas ORM se interpreta como configuración de persistencia.

### dependency-cruiser

[dependency-cruiser.config.mjs](../dependency-cruiser.config.mjs) verifica fuentes TypeScript antes de compilarlas, incluidos imports exclusivamente de tipos. Usa `tsconfig.json` para resolución y conserva dependencias externas visibles sin recorrer sus internals de `node_modules`.

Valida ciclos, imports irresolubles, dependencias de desarrollo desde runtime, fronteras entre capas y acceso a Node desde el núcleo. Domain/Application no pueden alcanzar Infrastructure, Presentation, configuración o composición mediante barrels intermedios. La lista de frameworks/proveedores reconocidos incluye NestJS, TypeORM, pg, React, Ionic, Capacitor y SDKs AWS/Azure; un proveedor nuevo requiere actualizar y probar esta detección.

Los imports entre contextos utilizan `src/contexts/<contexto>/public.ts`, cuando haya un consumidor real. Ese archivo expone únicamente la API/contratos públicos decididos para el contexto. Los imports privados desde otro contexto fallan. Dentro de un contexto los imports siguen respetando las capas. La composición NestJS permanece en `<contexto>.module.ts` y el bootstrap, fuera del núcleo.

La API puede consumir librerías backend y contratos; no otra app, librerías cliente, tests ni herramientas. El análisis comienza en esta API: no acredita todas las dependencias del monorepo ni que una librería general carezca de negocio. Un `public.ts` no autoriza exportar repositorios o modelos ORM; su superficie y el acceso SQL entre contextos requieren revisión.

### ts-morph

[use-case-rules.ts](../tools/architecture/use-case-rules.ts) analiza las clases bajo `src/contexts/<contexto>/application/commands/` y `queries/`. Reconoce clases con sufijo `Command`, `Query` o `Handler`, además de clases que declaren `execute`. Los archivos `.command.ts`, `.query.ts` y `.handler.ts` deben declarar su handler; requests/responses y errores no se interpretan como handlers por compartir carpeta.

Para cada operación, el handler declara un método público de instancia `execute`, con un único parámetro explícito, requerido, de la clase concreta `<Operation>Request` del mismo contexto. No admite argumentos adicionales, defaults, rest ni sobrecargas. El retorno explícito es la clase concreta `<Operation>Response`, o `Promise` de esa clase, en Application del mismo contexto. Se admiten aliases de imports y tipos que resuelvan a esas clases; interfaces y clases abstractas no satisfacen el contrato.

También compara los símbolos reales de los retornos explícitos con la clase declarada: dos clases con igual nombre o forma no equivalen. Ignora retornos de callbacks internos. Inspecciona llamadas directas `handler.execute(...)` que el servicio de lenguaje puede asociar con el método, comprobando cantidad y tipo de argumentos. Emite errores como:

```text
src/contexts/cases/application/commands/close-case.handler.ts:12: error BCK-004: ...
```

Este análisis no recorre todos los flujos de datos: llamadas indirectas/desestructuradas, adaptadores de bus, valores forzados mediante casts, instanciación real detrás de tipos estructurales e inputs/contexto verificado necesitan revisión o checks específicos. El gate nativo de TypeScript acredita la compilación y los retornos incompletos; el scanner no utiliza los diagnósticos de compilación de ts-morph, cuyos wrappers no preservan todos los formatos implícitos de módulos NodeNext.

## Cobertura del catálogo

Todos los IDs siguientes se refieren al catálogo enlazado arriba. **Parcial** significa que existe un check concreto, con un límite explícito, no que la regla completa esté demostrada.

| Regla | Evidencia automatizada actual | Evidencia adicional requerida |
| --- | --- | --- |
| BCK-001 | Sin comprobación semántica de negocio. | Revisar ubicación y ejecución de cada decisión de producto. |
| BCK-002 | Parcial: fronteras de imports de Domain. | Métodos, getters, funciones y constructores sin negocio oculto. |
| BCK-003 | Parcial: Presentation no importa persistencia/Domain directamente. | Delegación, proveedores y composición de casos de uso en el cuerpo del adaptador. |
| BCK-004 | Parcial: firma request y llamadas directas mediante símbolos. | Inputs/contexto verificado, invocaciones indirectas y adaptadores de bus. |
| BCK-005 | Parcial: clase de retorno explícita, símbolos de returns y type-check. | Objeto real producido detrás de casts, aliases de valores y lógica funcional del resultado. |
| BCK-006 | Sin prueba genérica de autorización. | Pruebas del caso de uso con inputs inválidos y permisos negativos. |
| BCK-007 | Sin prueba genérica de mapeos. | Selección explícita de campos, ausencia de asignación masiva y salida pública. |
| BCK-008 | Parcial: capas, ciclos, Node, globals seleccionados y proveedores reconocidos. | Tipos públicos, bindings, APIs globales restantes y dependencias/proveedores nuevos. |
| BCK-009 | Parcial: `findAndCount`/`findAndCountBy` directos. | SQL y operaciones efectivas, relaciones y ausencia de políticas/efectos en repositorios. |
| BCK-010 | Parcial: APIs transaccionales seleccionadas en repositorios. | Transacciones implícitas ORM, aliases y política/callback de Application. |
| BCK-011 | Sin prueba estática de aislamiento/commit. | Integración de scope, rollback, confirmación y concurrencia. |
| BCK-012 | Parcial: opciones ORM peligrosas literales. | Configuración dinámica, hooks, listeners, subscribers, DDL y efectos reales. |
| BCK-013 | Sin prueba genérica de ausencia de mutaciones. | Puertos y efectos de queries, incluidos adaptadores. |
| BCK-014 | Parcial: imports entre contextos por `public.ts`. | Superficie exportada, dueño de tablas y accesos SQL entre contextos. |
| BCK-015 | Parcial: dependencias de la API hacia otras apps/librerías cliente. | Negocio y consumidores de libs; resto del grafo del monorepo. |
| BCK-016 | Parcial: frontera con frameworks/drivers. | Errores funcionales, traducción y sanitización pública/logs. |
| BCK-017 | Parcial: `synchronize: true` literal en configuración de base. | Historia coordinada de migraciones, opciones calculadas y procedimiento de release. |
| BCK-018 | Sin prueba genérica de garantías externas. | Orden, fallos parciales, outbox/idempotencia cuando correspondan. |
| BCK-019 | Parcial: TypeScript estricto, ESLint, dependencias y pruebas de validadores. | Justificación de casts y pruebas proporcionales de cada comportamiento. |
| BCK-020 | Matriz y checks con IDs; sin certificación automática del catálogo completo. | Leer la normativa vigente y revisar todos los IDs activos en cada cambio. |

## Pruebas y mantenimiento

Las suites [test/architecture/](../test/architecture/) son propias de esta API. Ejecutan ESLint sobre snippets, dependency-cruiser real sobre proyectos temporales y ts-morph sobre proyectos en memoria. Cubren fronteras válidas, aliases, imports de tipos, barrels, ciclos, contextos privados, dependencias de desarrollo, firmas inválidas, modelos concretos, símbolos distintos y supresiones. Los proyectos temporales se crean bajo `build/` y se eliminan validando su pertenencia a esa carpeta; no modifican las fuentes ni los recursos locales de desarrollo.

El procedimiento para agregar, modificar o retirar reglas y ampliar su cobertura está en la [skill architecture-rules-sync](../../../../../.agents/skills/architecture-rules-sync/SKILL.md). Coordina catálogo backend, guía base, monorepo y adopción con los checks afectados, sus ejemplos válidos/inválidos y esta matriz. Revisa documentación → ejecución y ejecución → documentación, conservando la evidencia adicional que cada regla requiere. Los comandos y límites propios de esta API mantienen su fuente en este documento.

Versiones fijadas: ESLint 9.39.5, typescript-eslint 8.71.0, dependency-cruiser 18.5.0 y ts-morph 27.0.2. ts-morph incluye TypeScript 5.9.2 para análisis; la API compila con TypeScript 5.9.3. Se conserva la misma familia de compilador y se prueban resoluciones/símbolos. Las nuevas herramientas tienen licencia MIT y uso exclusivo de desarrollo, sin añadir peso al runtime ni a web/Capacitor. dependency-cruiser declara soporte Node `^22 || ^24 || >=26`; revisar engines y compatibilidad al actualizar las herramientas.

Referencias oficiales consultadas el 2026-10-01: [typed linting](https://typescript-eslint.io/getting-started/typed-linting/), [reglas dependency-cruiser](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-tutorial.md), [opciones dependency-cruiser](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md), [ts-morph](https://ts-morph.com/) y [tipos/símbolos](https://ts-morph.com/details/types).
