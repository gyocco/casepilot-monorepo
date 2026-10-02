# 0007 — Validaciones automatizadas de arquitectura de CasePilot API

- Estado: aceptada e implementada; la convención de imports entre contextos queda sustituida por las capas únicas del [ADR 0008](0008-application-wide-backend-layers.md), y la ubicación por commands/queries por la agrupación por recurso del [ADR 0009](0009-resource-organized-application.md). Las herramientas y contratos de handlers continúan vigentes.
- Fecha: 2026-10-01.
- Alcance: herramientas de desarrollo y checks de CasePilot API.

## Contexto

La API adopta el catálogo BCK completo, pero su lint inicial cubría únicamente algunas fronteras. Se solicita incorporar ESLint, dependency-cruiser y ts-morph para obtener validaciones reproducibles de la arquitectura.

## Decisión

Mantener ESLint con información de tipos y añadir dependency-cruiser para el grafo de dependencias y ts-morph para contratos estructurales de handlers. Instalar las herramientas como devDependencies fijadas de la API. Sus configuraciones, validadores, pruebas y documentación permanecen con el paquete propietario; no se convierten en código de producto o librerías generales.

El comando común ejecuta primero TypeScript nativo y después los tres mecanismos, con errores que hacen fallar la ejecución. Puede utilizarse igual en desarrollo y CI, sin Docker ni configuración de runtime. Los tests de los validadores forman parte de las pruebas habituales de la API.

Concretar dos convenciones verificables compatibles con la base: handlers de clase en `application/commands/` o `queries/`, con `execute` público de instancia declarado y modelos `<Operation>Request`/`<Operation>Response`; imports entre contextos por el archivo `public.ts` propietario cuando exista un consumidor. El entry point público no autoriza exportar persistencia privada ni debilita las fronteras de capas.

Estas ubicaciones corresponden a la decisión inicial: los ADRs 0008 y 0009 sustituyen las convenciones de paths. Actualmente el scanner recorre toda Application organizada por recurso y el checker de layout verifica CPA-001, conservando los contratos de handlers y las herramientas decididas aquí.

El [ADR 0010](0010-shared-cqrs-contracts.md) añade CPA-002: Request/Response con herencia compartida y `<Operation>Handler` con el contrato único de CQRS; las herramientas verifican los símbolos reales y su adopción en Application.

La [documentación local de validación](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md) es la fuente canónica de comandos, versiones, cobertura por ID, límites y mantenimiento. El catálogo BCK permanece sin modificaciones.

El [ADR 0014](0014-resource-organized-presentation.md) añade CPA-004: Presentation por módulo de recurso y separación de imports de composición/transporte. ts-morph verifica ubicación y módulo propietario; ESLint y dependency-cruiser conservan las restricciones de adaptadores y detectan acceso a módulos de composición por barrels.

## Alternativas

Mantener solamente revisión manual dificulta detectar regresiones estructurales. Concentrar todo en reglas ESLint propias es viable, pero añade complejidad para el grafo y los contratos entre declaraciones. Duplicar cada check en las tres herramientas aumenta mantenimiento; se asigna una responsabilidad principal a cada mecanismo, conservando las restricciones locales de imports existentes para feedback inmediato.

## Consecuencias

Las violaciones verificables fallan de forma reproducible y se prueban con ejemplos inválidos. Los validadores requieren mantenimiento y ampliación al evolucionar la normativa. Un resultado verde no demuestra ausencia de negocio oculto, autorización correcta, aislamiento transaccional, efectos SQL ni garantías externas; esa evidencia conserva sus pruebas y revisión obligatorias.
