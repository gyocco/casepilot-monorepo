# 0001 — PostgreSQL para el entorno local

- Estado: aceptada para desarrollo local
- Fecha: 2026-09-30

## Contexto

Las aplicaciones de `src/apps/casepilot/` todavía son placeholders. Se necesita una base PostgreSQL local reproducible para la futura API NestJS sin colisionar con motores instalados en el host. La ubicación y los límites vigentes son los de `AGENTS.md` y [Arquitectura del monorepo](../architecture/monorepo-architecture.md).

## Decisión

- Mantener las dependencias locales en `infra/docker/compose.yaml`, comenzando solo por PostgreSQL con la imagen oficial `postgres:18-bookworm`.
- Publicar PostgreSQL en `127.0.0.1:55432`, con puerto configurable mediante `CASEPILOT_POSTGRES_PORT`; conservar `5432` dentro del contenedor.
- Usar un volumen nombrado persistente, el proyecto Compose `casepilot-local`, un health check TCP y arranque con `--wait`.
- Generar la contraseña en un `.env` ignorado por Git, sin sobrescribir configuración existente ni imprimir secretos.
- Mantener las credenciales en el backend. Web y mobile consumirán la API NestJS y contratos tipados.

## Alternativas

- Publicar en `5432`: descartado por el riesgo de colisión con PostgreSQL instalado en el host.
- Usar exclusivamente una instalación del host: depende del estado de cada máquina y dificulta reproducir el entorno.
- Agregar otros servicios ahora: se incorporarán cuando las aplicaciones tengan dependencias reales.

## Consecuencias

El entorno requiere Docker con contenedores Linux. Los datos sobreviven al apagado del proyecto; las variables de inicialización solo afectan un volumen vacío. La API debe cargar su configuración server-side cuando se implemente. Esta decisión no define un ORM, esquema, migraciones ni infraestructura de producción.

El procedimiento canónico de instalación, conexión y mantenimiento está en [Dependencias locales de CasePilot](../../infra/docker/README.md).
