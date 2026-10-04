# Dependencias locales de CasePilot

Este entorno Docker Compose provee las dependencias de las aplicaciones de `src/apps/casepilot/`. Por ahora contiene PostgreSQL. La API NestJS se ejecuta en el host; Compose no arranca aplicaciones.

## Requisitos y arranque

- Docker Engine con contenedores Linux (Docker Desktop en Windows).
- Docker Compose v2 con soporte de `up --wait`.
- Node.js 22.12 o superior y pnpm 10.13.1 para la API y los comandos raíz.

Desde la raíz del repositorio:

```bash
pnpm infra:up
pnpm infra:status
```

El primer arranque crea `infra/docker/.env` a partir de `.env.example`, genera una contraseña aleatoria sin imprimirla, descarga la imagen oficial `postgres:18-bookworm` y espera a que PostgreSQL esté saludable. Los siguientes arranques conservan el archivo `.env` existente. Este archivo está ignorado por Git y contiene configuración exclusivamente local y server-side.

También se puede crear `.env` copiando `.env.example` y sustituyendo el placeholder de contraseña. Después, el comando equivalente sin pnpm es:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml up -d --wait --wait-timeout 120
```

## Conexión

| Campo | Valor por defecto |
| --- | --- |
| Host desde la máquina de desarrollo | `127.0.0.1` |
| Puerto de la máquina de desarrollo | `55432` |
| Base de datos | `casepilot` |
| Usuario | `casepilot` |
| Contraseña | `CASEPILOT_POSTGRES_PASSWORD` en `infra/docker/.env` |
| Host y puerto entre servicios del mismo proyecto Compose | `postgres:5432` |

El mapeo `127.0.0.1:55432:5432` mantiene libre el puerto habitual `5432` del host para otras instalaciones de PostgreSQL y limita la publicación a esta máquina. El puerto interno del contenedor sigue siendo `5432`.

Si otro proceso ocupa `55432`, cambia `CASEPILOT_POSTGRES_PORT` en `infra/docker/.env` y ejecuta de nuevo `pnpm infra:up`. Actualiza también el puerto de la configuración de la API o del cliente SQL. Las variables de entorno del shell tienen precedencia sobre el archivo de Compose.

La API NestJS ejecutada en el host lee este archivo automáticamente cuando `APP_ENV=local`. No es necesario copiar sus credenciales. Puedes sustituir la conexión mediante `DATABASE_*` en el entorno de la API; por ejemplo, `DATABASE_URL` server-side con este formato:

```dotenv
DATABASE_URL=postgresql://casepilot:REPLACE_WITH_LOCAL_PASSWORD@127.0.0.1:55432/casepilot
```

La contraseña generada usa caracteres hexadecimales válidos en una URL. Si eliges una contraseña con caracteres especiales, codifícala como componente de URL. Una API dentro del mismo proyecto Compose usará `postgres:5432`. La web y mobile consumen la API; las credenciales nunca van en la configuración pública de Angular ni en el cliente. Después de `infra:up`, ejecuta `pnpm migration:api:run` y `pnpm dev:api`. Configuración y migraciones: [README de la API](../../src/apps/casepilot/casepilot-api/README.md).

## Comandos

| Comando desde la raíz | Efecto |
| --- | --- |
| `pnpm infra:env` | Crear el archivo local si no existe; conservarlo si existe |
| `pnpm infra:up` | Arrancar dependencias y esperar su health check |
| `pnpm infra:status` | Consultar contenedores, puertos y salud |
| `pnpm infra:logs` | Seguir los últimos logs; salir con Ctrl+C |
| `pnpm infra:check` | Validar Compose sin imprimir credenciales |
| `pnpm infra:down` | Eliminar contenedores y red, conservando los datos |

Para abrir `psql` dentro del contenedor con los nombres por defecto:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/compose.yaml exec postgres psql -U casepilot -d casepilot
```

## Persistencia y mantenimiento

Los datos viven en el volumen `casepilot-local_postgres-data`, montado en `/var/lib/postgresql` según el layout de la imagen PostgreSQL 18. Sobreviven a `infra:down`, reinicios y recreación del contenedor. No uses `down --volumes` si necesitas conservarlos.

`CASEPILOT_POSTGRES_DB`, `CASEPILOT_POSTGRES_USER` y `CASEPILOT_POSTGRES_PASSWORD` solo inicializan un volumen vacío. Modificar esos valores en `.env` no cambia una base de datos existente; aplica los cambios mediante SQL autenticado y sincroniza la configuración local. Conserva `.env` mientras uses su volumen.

El nombre de proyecto `casepilot-local` aísla la red, contenedores y volumen del entorno. Para ejecutar otra copia del repositorio simultáneamente, usa un `COMPOSE_PROJECT_NAME` distinto y otro puerto host.

La imagen fija la versión mayor 18 y permite actualizaciones menores de esa rama. Un cambio de versión mayor requiere una migración explícita de datos. El usuario inicial tiene privilegios de administración para este entorno local.

## Referencias

- [Decisión del entorno PostgreSQL local](../../docs/adr/0001-local-postgresql.md).
- [Imagen oficial PostgreSQL y variables de inicialización](https://hub.docker.com/_/postgres).
- [Docker Compose: arranque y espera de salud](https://docs.docker.com/reference/cli/docker/compose/up/).
