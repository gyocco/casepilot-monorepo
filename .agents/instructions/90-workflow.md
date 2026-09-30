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

Para la app actual, desde `src/web-ui/apps/public/` usa cuando corresponda:

```bash
pnpm --dir src/web-ui/apps/public lint
pnpm --dir src/web-ui/apps/public build
```

Para servicios NestJS, ejecuta los scripts definidos por el servicio afectado desde su carpeta y documenta cualquier dependencia local. No se asume un proveedor de base de datos o infraestructura hasta que exista una decisión y configuración versionada.

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
