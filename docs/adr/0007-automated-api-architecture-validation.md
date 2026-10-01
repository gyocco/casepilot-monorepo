# 0007 — Validaciones automatizadas de arquitectura de CasePilot API

- Estado: aceptada e implementada.
- Fecha: 2026-10-01.
- Alcance: herramientas de desarrollo y checks de CasePilot API.

## Contexto

La API adopta el catálogo BCK completo, pero su lint inicial cubría únicamente algunas fronteras. Se solicita incorporar ESLint, dependency-cruiser y ts-morph para obtener validaciones reproducibles de la arquitectura.

## Decisión

Mantener ESLint con información de tipos y añadir dependency-cruiser para el grafo de dependencias y ts-morph para contratos estructurales de handlers. Instalar las herramientas como devDependencies fijadas de la API. Sus configuraciones, validadores, pruebas y documentación permanecen con el paquete propietario; no se convierten en código de producto o librerías generales.

El comando común ejecuta primero TypeScript nativo y después los tres mecanismos, con errores que hacen fallar la ejecución. Puede utilizarse igual en desarrollo y CI, sin Docker ni configuración de runtime. Los tests de los validadores forman parte de las pruebas habituales de la API.

Concretar dos convenciones verificables compatibles con la base: handlers de clase en `application/commands/` o `queries/`, con `execute` público de instancia declarado y modelos `<Operation>Request`/`<Operation>Response`; imports entre contextos por el archivo `public.ts` propietario cuando exista un consumidor. El entry point público no autoriza exportar persistencia privada ni debilita las fronteras de capas.

La [documentación local de validación](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md) es la fuente canónica de comandos, versiones, cobertura por ID, límites y mantenimiento. El catálogo BCK permanece sin modificaciones.

## Alternativas

Mantener solamente revisión manual dificulta detectar regresiones estructurales. Concentrar todo en reglas ESLint propias es viable, pero añade complejidad para el grafo y los contratos entre declaraciones. Duplicar cada check en las tres herramientas aumenta mantenimiento; se asigna una responsabilidad principal a cada mecanismo, conservando las restricciones locales de imports existentes para feedback inmediato.

## Consecuencias

Las violaciones verificables fallan de forma reproducible y se prueban con ejemplos inválidos. Los validadores requieren mantenimiento y ampliación al evolucionar la normativa. Un resultado verde no demuestra ausencia de negocio oculto, autorización correcta, aislamiento transaccional, efectos SQL ni garantías externas; esa evidencia conserva sus pruebas y revisión obligatorias.
