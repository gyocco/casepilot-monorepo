# 0014 — Presentation y composición organizadas por módulo de recurso

- Estado: aceptada e implementada.
- Fecha: 2026-10-02.
- Alcance: CasePilot API.
- Evoluciona: ubicación de módulos del [ADR 0013](0013-resource-module-composition.md).

## Contexto

La composición por recurso elimina bindings específicos de `AppModule`, pero deja los módulos en la raíz y separa sus controllers/responses bajo `presentation/http/`. El responsable solicita reunir cada módulo con su transporte en `presentation/<recurso>/` y registrar reglas verificables.

## Decisión

Registrar [CPA-004](../architecture/casepilot-backend-architecture.md#cpa-004--presentation-organizada-por-modulo-de-recurso) como fuente normativa particular. Health agrupa `health.module.ts`, `health.controller.ts` y `health-http.response.ts` en `presentation/health/`. AppModule/ApiModule conservan la composición raíz y DatabaseModule permanece en Infrastructure. Las cuatro capas siguen compartidas.

Los archivos de módulo conservan el rol de composición y pueden importar contratos e implementaciones para bindings. Esa ubicación no autoriza a controllers/responses a importar Domain, Infrastructure, drivers ni composición mediante imports directos o barrels. Domain/Application siguen independientes de NestJS; Infrastructure sigue independiente de Presentation.

Actualizar ts-morph para verificar agrupación y ubicación/nombre del módulo propietario, ESLint para separar imports de composición/transporte y dependency-cruiser para verificar el grafo, con regresiones positivas/negativas de los tres mecanismos. El catálogo BCK no cambia.

## Alternativas

- Mantener módulos en la raíz: no reúne las responsabilidades solicitadas.
- Permitir Infrastructure para toda Presentation: permitiría acceso directo a persistencia desde los adaptadores.
- Repetir las cuatro capas por módulo: incompatible con BCK-014.

## Consecuencias y evidencia

Agregar endpoints sigue sin modificar AppModule. Un recurso nuevo crea su carpeta de Presentation y se registra una sola vez en ApiModule. La convención operativa se mantiene en el [README de la API](../../src/apps/casepilot/casepilot-api/README.md#agregar-endpoints-sin-modificar-appmodule); el alcance automatizado y sus límites, en la [guía de validación](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md).

Los checks verifican paths e imports, sin demostrar que un archivo de composición carezca de negocio ni que la agrupación semántica sea correcta. La integración HTTP/PostgreSQL sigue acreditando bindings y comportamiento de Health. No se modifican contratos HTTP, esquema, transacciones ni UI.

Verificados `pnpm check:api:architecture`, `pnpm test:api`, `pnpm build:api` y `pnpm test:api:integration`: 11 pruebas unitarias, 98 de arquitectura y 7 de endpoints con PostgreSQL efímero pasan. CPA-004 tiene nueve regresiones nuevas repartidas entre ts-morph, ESLint y dependency-cruiser, incluidas las fuentes Health reales y el acceso a módulos mediante barrels.
