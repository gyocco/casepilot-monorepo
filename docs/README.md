# Documentación de CasePilot

Este directorio contiene la documentación transversal del monorepo: decisiones, arquitectura, producto, desarrollo, operación y referencias compartidas. El [README.md de la raíz](../README.md) es la entrada general del repositorio y documenta el propósito de cada carpeta técnica.

## Entradas recomendadas

- [Contexto del producto y del proyecto](00-overview/product-and-project-context.md)
- [Visión y alcance de CasePilot](01-product/product-vision-and-scope.md)
- [Mapa de requisitos y épicas](01-product/requirements-map.md)
- [Epic 1 — Autenticación](01-product/epics/epic-01-authentication/README.md)
- [Contexto y arquitectura del sistema](02-architecture/system-context.md)
- [Roadmap inicial](07-project-management/roadmap.md)

## Estructura recomendada

```text
docs/
├── README.md
├── 00-overview/           # contexto general, glosario y mapa del sistema
├── 01-product/            # problema, usuarios, requisitos y flujos
├── 02-architecture/       # arquitectura, datos, integraciones y seguridad
├── 03-development/        # instalación, desarrollo local y calidad
├── 04-operations/         # despliegue, entornos, observabilidad y runbooks
├── 05-reference/          # API, configuración, comandos y contratos
├── 06-decisions/          # ADRs y decisiones técnicas aceptadas
├── 07-project-management/ # alcance, roadmap, hitos y seguimiento
├── 90-archive/             # documentación obsoleta conservada por contexto
├── templates/              # plantillas para crear documentos consistentes
└── assets/                 # diagramas, imágenes y recursos documentales
```

Cada sección tiene un `README.md` que explica qué debe contener. Los documentos nuevos deben ubicarse en la sección más específica posible y enlazarse desde el índice de esa sección cuando el volumen lo justifique.

## Qué documentación va aquí

Debe vivir en `docs/` la información que:

- aplica a más de una aplicación o paquete;
- describe decisiones, límites, contratos o procesos del sistema;
- sirve como referencia para desarrollo, soporte, despliegue u operación;
- necesita conservar contexto histórico o una relación explícita con otras áreas.

La documentación específica de un proyecto debe permanecer cerca de ese proyecto. Por ejemplo, la forma de ejecutar `apps/web` está en [apps/web/README.md](../apps/web/README.md), mientras que una política de despliegue de todo el monorepo pertenece a `docs/04-operations/`.

## Convenciones

- Usar Markdown (`.md`) para texto y código de ejemplo.
- Usar nombres en minúsculas con guiones: `local-development.md`, `api-contract.md`.
- Usar títulos descriptivos y una breve sección de propósito al inicio.
- Enlazar documentos relacionados con rutas relativas y mantener actualizados los enlaces al mover archivos.
- Preferir ejemplos reproducibles y marcar explícitamente si un valor es ficticio, local o sensible.
- No guardar secretos, volcados de datos reales ni archivos generados en este directorio.
- Para decisiones técnicas, usar la convención `NNNN-titulo-corto.md` dentro de `06-decisions/`.

## Ciclo de vida de un documento

1. Crear el documento en la sección que corresponde y enlazarlo desde el índice local.
2. Añadir o actualizar enlaces cuando cambie una carpeta, contrato, comando o decisión.
3. Mover documentos reemplazados a `90-archive/` solo cuando conservarlos aporte contexto; si no, eliminarlos en el mismo cambio que los vuelve irrelevantes.
4. Revisar documentos afectados por cambios de código antes de cerrar una entrega.

## Ubicación rápida

| Necesidad | Ubicación |
| --- | --- |
| Empezar a trabajar con el repositorio | `README.md` de la raíz y `docs/03-development/` |
| Entender el producto | `docs/00-overview/` y `docs/01-product/` |
| Entender componentes, datos o integraciones | `docs/02-architecture/` |
| Desplegar, operar o responder incidentes | `docs/04-operations/` |
| Consultar endpoints, variables o comandos | `docs/05-reference/` |
| Registrar una decisión técnica | `docs/06-decisions/` |
| Consultar alcance o hitos | `docs/07-project-management/` |
| Crear un documento nuevo | `docs/templates/` |
