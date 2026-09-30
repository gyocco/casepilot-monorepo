# Documentación de CasePilot

## Documentos disponibles

- [Estructura y límites del monorepo](architecture/monorepo-structure.md): organización de `src/apps/` y `src/libs/`, responsabilidades por runtime, dirección de dependencias y ubicación de contratos, tests, infraestructura y CI/CD.
- [README del monorepo](../README.md): estado actual, mapa breve, workspace y comandos raíz.
- [Infraestructura](../infra/README.md): alcance de infraestructura y artefactos de runtime.
- [Dependencias locales de CasePilot](../infra/docker/README.md): Docker Compose, PostgreSQL local, conexión y comandos.
- [Decisión de PostgreSQL local](adr/0001-local-postgresql.md): versión, puerto, persistencia y límites del entorno.
- [Pruebas transversales](../tests/README.md): pruebas que cruzan aplicaciones, servicios y contratos.
- [Herramientas](../tools/README.md): automatización propia del repositorio.
- [Instrucciones para agentes](../.agents/README.md): políticas y skills de trabajo.

## Áreas futuras

Las siguientes áreas se crearán cuando exista contenido real, siguiendo la guía de estructura:

- `product/`: visión, requisitos y alcance.
- `project-management/`: roadmap, hitos y seguimiento.
- `development/`: instalación, comandos y calidad.
- `operations/`: despliegue, entornos, observabilidad e incidentes.
- `reference/`: APIs, variables, contratos y comandos de consulta.

La documentación específica de una aplicación o librería vive en su README local. Cada tema transversal mantiene una fuente canónica y se enlaza desde este índice.
