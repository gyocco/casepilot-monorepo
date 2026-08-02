# Convenciones y referencias del proyecto

- Estado: línea base propuesta
- Última actualización: 2026-08-02

## Identificadores de producto

| Elemento | Formato | Ejemplo |
| --- | --- | --- |
| Product | Nombre descriptivo | `CasePilot` |
| Epic | `EPIC-NN` | `EPIC-01` |
| Feature | `FEAT-DOM-NN` | `FEAT-AUTH-01` |
| User Story | `US-DOM-NNN` | `US-AUTH-001` |
| ADR | `NNNN-kebab-case` | `0001-autenticacion-y-aislamiento-multi-tenant.md` |

## Estados

Los requisitos usan `propuesta`, `backlog`, `en definición`, `lista para desarrollo`, `en desarrollo`, `verificación`, `completada` y `futura`. El significado canónico está en el [mapa de requisitos](../01-product/requirements-map.md).

## Fronteras de datos

- Componentes React no consultan Supabase directamente.
- `packages/domain-models` contiene lógica pura y no importa React, Ionic, Supabase ni APIs web.
- `packages/supabase-client` es browser-safe.
- `packages/supabase-admin` y funciones privilegiadas son server-side.
- `packages/platform` encapsula capacidades web/native cuando exista un consumidor real.

## Seguridad rápida

- `VITE_*` es público.
- `service_role`, tokens administrativos, passwords y claves privadas nunca se versionan ni llegan al cliente.
- Tenant activo no equivale a autorización.
- RLS, Storage policies y funciones server-side deben cubrir positivos y negativos.
- PII, contenido de clientes y documentos no deben aparecer innecesariamente en logs o fixtures.

## Navegación de fuentes

- [Contexto y glosario](../00-overview/product-and-project-context.md)
- [Visión del producto](../01-product/product-vision-and-scope.md)
- [Épicas y requisitos](../01-product/requirements-map.md)
- [Arquitectura](../02-architecture/architecture-baseline.md)
- [Desarrollo](../03-development/development-baseline.md)
- [Operación](../04-operations/operations-baseline.md)
- [Decisiones](../06-decisions/README.md)

## Regla de sincronización

Cuando cambie un contrato, modelo, permiso, comando, variable, integración, flujo de usuario o decisión arquitectónica, se actualiza la fuente documental canónica en el mismo cambio y se enlazan los consumidores afectados.
