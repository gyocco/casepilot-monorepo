# Línea base de entornos y releases

- Estado: propuesta operativa inicial
- Última actualización: 2026-08-02

## Entornos

| Entorno | Estado | Propósito |
| --- | --- | --- |
| Local | Disponible como objetivo | Desarrollo y pruebas con datos sintéticos. |
| Preview | Pendiente | Validación de una rama/cambio antes de integrar. |
| Staging | Pendiente | Pruebas integradas con configuración similar a producción. |
| Producción | Pendiente | Servicio para usuarios reales, con controles de acceso y backups definidos. |

No se deben asumir URLs, credenciales, proveedores ni procedimientos de despliegue hasta que se documenten y autoricen.

## Release baseline

Antes de una release se debe verificar:

- alcance y estado de las historias incluidos;
- lint, type-check, build y pruebas aplicables;
- migrations nuevas revisadas, RLS probado y rollback entendido;
- variables configuradas sin secretos en repositorio o bundle;
- flujos críticos de Auth, permisos, datos sensibles y errores revisados;
- documentación de contratos, cambios y pasos operativos actualizada.

## Datos y migraciones

- Las migrations son versionadas y no se modifican después de poder haberse aplicado.
- Cambios de Supabase requieren migration nueva, RLS y prueba local.
- `seed.sql` y fixtures deben ser mínimos, deterministas y no sensibles.
- No ejecutar `db push`, `db reset --linked`, despliegues o acciones destructivas remotas sin autorización explícita.

## Observabilidad mínima futura

Cada módulo deberá definir, antes de producción:

- errores de aplicación y de integración;
- latencia y tasa de éxito de operaciones críticas;
- expiración/refresh y fallos de Auth;
- denegaciones de autorización sin datos sensibles;
- estados y tiempos de Storage, OCR e IA;
- alertas, owner y procedimiento de respuesta.

## Backups, recuperación y secretos

La política de backups, retención, restauración, rotación de secretos y respuesta ante exposición queda pendiente de definir con el proveedor y el entorno real. Nunca se deben incluir credenciales reales en documentación, fixtures, logs o capturas.

## Incidentes

Cuando exista un incidente de identidad, aislamiento o exposición de datos, la prioridad es contener acceso, preservar evidencia protegida, revocar/rotar credenciales comprometidas, evaluar impacto y documentar la resolución. Los pasos específicos y responsables se crearán en runbooks antes de operar con datos reales.

## Fuentes relacionadas

- [Línea base de arquitectura](../02-architecture/architecture-baseline.md)
- [ADR de autenticación y multi-tenant](../06-decisions/0001-autenticacion-y-aislamiento-multi-tenant.md)
- [Instrucciones de workflow](../../.agents/instructions/90-workflow.md)
