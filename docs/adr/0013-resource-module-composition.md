# 0013 — Composición NestJS por módulos de recurso

- Estado: aceptada e implementada.
- Fecha: 2026-10-02.
- Alcance: composición de CasePilot API.
- Evoluciona: la composición directa de Health del [ADR 0008](0008-application-wide-backend-layers.md).

## Contexto

`AppModule` registra el controller, el token de repositorio y las factories de Health. Repetir esa composición para nuevos endpoints y recursos haría crecer la raíz con dependencias específicas. El responsable solicita agregar endpoints sin tener que modificar siempre `app.module.ts`.

## Decisión

Evolución de ubicación: el [ADR 0014](0014-resource-organized-presentation.md) sustituye los módulos de recurso junto a `app.module.ts` por `presentation/<recurso>/<recurso>.module.ts`, con sus controllers y responses HTTP. AppModule/ApiModule conservan las responsabilidades definidas aquí; CPA-004 añade la convención y sus checks.

- Mantener `AppModule` como configuración del proceso: conexión global, filtro global de errores e import de `ApiModule`.
- Usar `ApiModule` como registro explícito de módulos de composición por recurso mediante imports estáticos. Un recurso nuevo se registra una sola vez allí; agregar endpoints a un recurso existente no modifica ese registro.
- Mover el controller y los bindings de Health a `health.module.ts`. Los futuros módulos de recurso también viven junto a `app.module.ts`, fuera del núcleo independiente de NestJS.
- Conservar las cuatro capas compartidas y el dominio de la aplicación. Estos módulos agrupan construcción/inyección, sin crear bounded contexts, capas paralelas ni una división por entidad.
- Mantener factories y tokens de runtime en composición. Exportar providers solo cuando otro módulo los necesite y consumirlos importando su módulo propietario, sin registrarlos de nuevo.
- Conservar el registro de entidades y migraciones en la fábrica DataSource compartida por runtime y CLI, y la inicialización diferida de la conexión.

La incorporación inicial de este ADR no cambia las reglas BCK/CPA, la configuración de validadores, el contrato HTTP ni el esquema. El ADR 0014 añade posteriormente CPA-004 y sus validadores. El procedimiento operativo tiene su fuente canónica en el [README de la API](../../src/apps/casepilot/casepilot-api/README.md#agregar-endpoints-sin-modificar-appmodule).

## Alternativas

- Mantener todos los bindings en la raíz: sigue obligando a editarla por operaciones nuevas.
- Escanear archivos en runtime o añadir un contenedor propio: requiere convenciones y resolución dinámica adicionales para una responsabilidad que ya cubren los módulos NestJS.
- Añadir decoradores NestJS a handlers/repositorios internos: contradice la independencia del núcleo de BCK-008.

## Consecuencias y validación

Los detalles de una operación se registran en el módulo propietario. Permanece un registro manual y visible por recurso en `ApiModule`; no hay descubrimiento automático de endpoints. Las interfaces y clases puras siguen necesitando bindings explícitos, acotados a su módulo.

Verificados `pnpm check:api:architecture`, `pnpm test:api`, `pnpm build:api` y `pnpm test:api:integration`: 11 pruebas unitarias, 87 de validadores y 7 de endpoints con PostgreSQL efímero pasan. La prueba HTTP de errores resuelve el handler dentro de `HealthModule` con búsqueda estricta; la integración verifica respuesta simple, lectura, concurrencia y fallos con la nueva composición. Los gates de arquitectura siguen revisando imports y capas sin modificar su cobertura. No hay cambios de UI que requieran revisión de viewport o accesibilidad visual.

Referencia técnica consultada el 2026-10-02: [módulos NestJS](https://docs.nestjs.com/modules) y [providers personalizados](https://docs.nestjs.com/fundamentals/custom-providers), sobre NestJS 12.1.2 fijado por la API.
