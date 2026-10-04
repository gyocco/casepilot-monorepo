# Pruebas transversales del monorepo

Esta carpeta global se reserva exclusivamente para pruebas cuyo alcance involucre realmente varios proyectos, o reglas de arquitectura transversales que verifiquen varios proyectos. La fuente canónica es [monorepo-architecture.md](../docs/architecture/monorepo-architecture.md); la decisión está en el [ADR 0005](../docs/adr/0005-project-owned-tests.md).

Ejemplos: un recorrido web + API, colaboración entre dos servicios, compatibilidad de contratos entre proyectos o dependencias permitidas en todo el monorepo.

`architecture/frontend/` contiene regresiones ejecutables de los límites entre SPA/kit, estilos, recursos, configuración Angular y grafo. Usa los checkers reales de [frontend-architecture](../tools/frontend-architecture/README.md) y se ejecuta con `pnpm test:frontend:architecture`; el paquete propietario del tooling está en `tools/`, no es un proyecto de producto. La suite no mueve las pruebas locales ni crea carpetas vacías.

Todas las pruebas específicas de una app o librería permanecen en su proyecto, incluidas unitarias, integración y endpoints completos. Atravesar capas de una API o usar PostgreSQL/Testcontainers no convierte una suite en transversal. Los proyectos de producto no dependen de esta carpeta.

Pruebas actuales de CasePilot API: [README de integración](../src/apps/casepilot/casepilot-api/test/integration/README.md) y [README de la API](../src/apps/casepilot/casepilot-api/README.md).
