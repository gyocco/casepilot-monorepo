# 90 — Flujo de trabajo del agente

## Antes de editar

1. Lee las instrucciones aplicables.
2. Ejecuta `git status --short` y conserva los cambios preexistentes del usuario.
3. Busca símbolos, rutas, tests y documentación relacionados antes de diseñar.
4. Define una lista corta de archivos y capas afectadas.
5. Si la decisión cambia arquitectura o seguridad, prepara un ADR o deja identificado que debe crearse.

## Durante la implementación

- Usa cambios pequeños y reversibles.
- Respeta la estructura actual antes de reorganizarla.
- Usa `apply_patch` para editar archivos.
- No reformatees archivos no relacionados.
- No introduzcas una dependencia si una capacidad existente resuelve el problema.
- Mantén la compatibilidad web y la ruta futura Capacitor.
- Cuando una operación dependa de un servicio local, explica el requisito y evita acciones remotas.

## Verificación local

La API y las librerías CQRS/abstractions/validation/exception-handler cuentan con manifest y verificaciones; la SPA y el UI kit también tienen manifests, verificaciones y suites propias; mobile sigue pendiente. Para CQRS ejecuta `pnpm check:cqrs`; para abstractions, `pnpm check:abstractions` y, ante cambios transaccionales, `pnpm test:abstractions:integration` con Docker/PostgreSQL efímero; para exception-handler, `pnpm check:exception-handler`, con HTTP NestJS sin Docker. Los tests propios permanecen con la librería y la API construye las cuatro antes de sus checks. Para validation ejecuta `pnpm check:validation`. Para cambios de documentación o configuración, verifica enlaces locales, rutas, JSON/YAML, correspondencia entre workspace y carpetas, y `git diff --check`.

Para frontend y sus reglas usa desde la raíz:

```bash
pnpm check:web
```

Para la API NestJS usa `pnpm lint:api`, `pnpm typecheck:api`, `pnpm build:api`, `pnpm test:api` y `pnpm test:api:integration`. La integración levanta PostgreSQL efímero mediante Testcontainers: requiere Docker, no `infra:up` ni credenciales de producto, y nunca usa la base local persistente. Los checks de API incluyen fuentes, suites unitarias, integración y su lanzador. `tests/architecture/frontend/` contiene regresiones multiproyecto ejecutadas por `tools/frontend-architecture/`; consulta el [README de integración de la API](../../src/apps/casepilot/casepilot-api/test/integration/README.md). Para mobile y librerías ejecuta los scripts cuando se implementen. No se asume infraestructura remota sin decisión y configuración versionada.

No ejecutes despliegues, publicación de apps ni cambios remotos como parte de una verificación implícita.

## Revisión final

- Revisa `git diff` y `git status --short`.
- Comprueba que no haya secretos, archivos generados ni cambios ajenos.
- Comprueba types, lint, build, tests, enlaces, responsive, accesibilidad y estados de error según el riesgo.
- Actualiza documentación y ADRs.
- En la entrega final resume archivos, verificaciones, limitaciones y cualquier paso manual pendiente.

## Límites

- No hagas `git reset --hard`, `git checkout --`, borrados masivos ni cambios destructivos sin solicitud explícita.
- No comitees, hagas push, abras PR ni despliegues salvo que el usuario lo pida.
- Si una acción requiere credenciales, entorno remoto o una decisión de producto que no está disponible, detente en ese borde y describe exactamente qué falta.
