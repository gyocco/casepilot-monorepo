# 0004 — Pruebas completas de endpoints con PostgreSQL efímero

- Estado: aceptada; ubicación, paquete separado y acceso de tests reemplazados parcialmente por [ADR 0005](0005-project-owned-tests.md).
- Actualización: 2026-10-01; aislamiento y Testcontainers permanecen vigentes.
- Fecha: 2026-09-30.
- Reemplaza: el uso de schemas de prueba en PostgreSQL local descrito en la validación del [ADR 0003](0003-base-api-and-health-checks.md).

## Contexto

Se exige mantener fija la base local de desarrollo y no usarla para pruebas. Los endpoints de salud deben probarse con la aplicación NestJS completa y PostgreSQL real, con recursos de prueba aislados y limpieza automática.

## Decisión original (2026-09-30)

El ADR 0005 sustituye ubicación y consumo desde un paquete externo: actualmente todas las pruebas de la API están en su `test/`, con composición local del mismo paquete. PostgreSQL efímero, migraciones, HTTP real y limpieza se conservan.

- Ubicar las pruebas de endpoints en el paquete privado `tests/`, bajo `integration/casepilot-api/`, porque atraviesan HTTP, composición, Application, repositorios y PostgreSQL. Conservar pruebas unitarias en la app.
- Usar Testcontainers y su módulo PostgreSQL 12.0.0, compatibles con Node 22.12. Las versiones siguientes exigen actualizar ese runtime. Versionar las dependencias y lockfile y mantenerlas exclusivamente en desarrollo.
- Crear PostgreSQL nuevo por suite, con imagen `postgres:18-bookworm`, puertos dinámicos, credenciales propias y ninguna referencia a la base, contenedor, volumen o archivos `.env` de desarrollo. No habilitar reuse ni fallback.
- Ejecutar las migraciones reales de la API. Exponer únicamente bootstrap, tipos de configuración y fábrica DataSource como entradas de composición del paquete API, con declaraciones TypeScript. Los tests no importan rutas internas ni un loader de credenciales.
- Usar el runner nativo de Node, hooks explícitos y HTTP real con `fetch`. No sustituir providers ni repositorios. Restablecer fixtures entre casos y ejecutar en serie los casos que comparten una base. Aislar el escenario de PostgreSQL detenido en su propio contenedor.
- Cerrar HTTP y pools y eliminar los recursos propios incluso si hay errores. Mantener Ryuk y esperas de disponibilidad del módulo; no introducir sleeps arbitrarios o skips ante fallos de infraestructura.
- Resolver el caso de Docker Desktop/Windows con localhost solo IPv6 mediante un override IPv4 limitado al proceso hijo y Docker local. Respetar los overrides y endpoints Docker remotos explícitos.

## Alternativas

Un schema aislado en el servicio local sigue usando la misma base persistente, por lo que queda reemplazado. SQLite o mocks no verifican la integración real de TypeORM con PostgreSQL. Iniciar Compose para pruebas compartiría estado y puertos de desarrollo. Un segundo framework de tests o cliente de assertions HTTP no aporta una capacidad requerida por esta suite inicial.

## Consecuencias

Las pruebas requieren Docker, permisos de creación de contenedores y descarga inicial de imágenes. No requieren `infra:up`, credenciales de producto ni un servidor API previo. El comando raíz `pnpm test:api:integration` compila la app y la suite y ejecuta todos sus archivos de endpoints. El comando actual delega en la API; Testcontainers es una dependencia de desarrollo de ese paquete, sin dependencia de runtime desplegable.

Se cubren respuestas HTTP, SELECT real, datos vacíos, concurrencia, ausencia de tabla, recuperación por migración y arranque sin PostgreSQL disponible. UI, autorización y transacciones de producto no se modifican ni se afirman verificadas.

Procedimiento y referencias canónicos: [README de integración de la API](../../src/apps/casepilot/casepilot-api/test/integration/README.md). La arquitectura y sus reglas de Application/Domain/repositorios siguen vigentes; cambia el recurso y ubicación de las pruebas, no el flujo de producto.
