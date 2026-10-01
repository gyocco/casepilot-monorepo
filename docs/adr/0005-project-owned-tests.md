# 0005 — Pruebas con el proyecto propietario y carpetas globales

- Estado: aceptada e implementada.
- Fecha: 2026-10-01.
- Reemplaza parcialmente: ubicación, paquete separado y consumo de exports de tests del [ADR 0004](0004-isolated-endpoint-tests.md).
- Fuente canónica: [monorepo-architecture.md](../architecture/monorepo-architecture.md).

## Contexto

Las unitarias de CasePilot API estaban en su paquete y los endpoint tests en un paquete independiente en `tests/` global. Ambas suites verifican una única API. Atravesar HTTP, Application, repositorio y PostgreSQL no implica verificar varios proyectos.

El responsable decide organizar por propietario y después por tipo de prueba. Cada proyecto dentro de `src/` puede tener su propia raíz con manifest, configuración, README, `src/`, `test/` y artefactos generados.

## Decisión

- Mantener todas las pruebas propias de una app o librería en ese proyecto, organizadas por tipo.
- Mover endpoints Health y fixture a `casepilot-api/test/integration/`, junto a `test/unit/`. Mover el lanzador a `test/run-integration-tests.mjs` y Testcontainers a devDependencies de la API.
- Reservar `tests/` global exclusivamente para suites de varios proyectos y reglas transversales. Mantener por ahora su README, sin paquete ni registro en el workspace.
- Conservar `src/` interno: el global organiza proyectos; el interno contiene sus fuentes.
- Mantener `pnpm test:api:integration` en raíz, delegando en la API. Sus checks incluyen fuentes, ambas suites y lanzador.
- Los tests locales importan composición desde fuentes de su paquete, sin sustituir providers ni repositorios. Se conservan los exports de composición existentes; ya no requieren otro paquete de tests.
- Conservar PostgreSQL exclusivo de Testcontainers, migraciones/HTTP reales, fixtures controladas y limpieza. La base persistente de desarrollo sigue excluida.

## Alternativas

Centralizar todo en raíz separa pruebas de su dueño sin otro consumidor. Separar solo por ser unitario o integración confunde categoría con propiedad. Un paquete global sigue siendo válido para colaboración real entre varios proyectos.

## Consecuencias

La API posee configuración de pruebas y comandos separados. Unitarias no inician Docker; integración sí lo requiere. Cambian ubicación y compilación, sin modificar endpoints ni acceso a la base local. La guía de estructura mantiene convenciones globales y README local mantiene requisitos/escenarios. El ADR 0004 conserva historial y decisiones de aislamiento no reemplazadas.
