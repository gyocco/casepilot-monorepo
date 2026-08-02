# Línea base de arquitectura

- Estado: propuesta inicial
- Última actualización: 2026-08-02
- Alcance: web, futura movilidad, datos, identidad y extensibilidad

## Objetivo

Establecer las fronteras técnicas que la implementación deberá respetar mientras se detallan las épicas. No se crean tablas, migraciones ni APIs por efecto de este documento.

## Capas y dirección de dependencias

```text
apps/web
  ├── rutas, páginas y composición de features
  ├── packages/ui-components
  ├── packages/domain-models
  ├── packages/supabase-client
  └── packages/platform

packages/domain-models
  └── reglas y tipos puros

packages/supabase-client
  └── SDK, contratos, mapeadores y acceso browser-safe

packages/supabase-admin
  └── operaciones privilegiadas server-side

supabase/
  ├── migrations
  ├── functions
  └── seed.sql
```

La dirección permitida es `apps → packages`. Los paquetes no deben importar desde `apps`; el dominio no debe conocer React, Ionic, Supabase ni APIs del navegador.

## Identidad y multi-tenant

El modelo conceptual de la Epic 1 requiere, como mínimo:

- identidad autenticada;
- perfil de usuario separado de la credencial;
- espacio de trabajo o tenant;
- membresía usuario–tenant con rol y estado;
- contexto de sesión y tenant activo;
- eventos de seguridad o auditoría cuando el alcance lo requiera.

La implementación inicial podrá apoyarse en Supabase Auth, PostgreSQL/RLS, Storage y funciones server-side, de acuerdo con el [ADR 0001](../06-decisions/0001-autenticacion-y-aislamiento-multi-tenant.md). El esquema real, las policies y los contratos quedan pendientes de diseño y pruebas locales.

## Reglas de seguridad arquitectónica

- Las credenciales y tokens administrativos nunca llegan al cliente.
- RLS y validaciones server-side son la fuente de autorización; la UI solo refleja el resultado para mejorar la experiencia.
- Toda operación que use un tenant debe derivar el permiso desde una membresía autorizada.
- Las funciones de IA y OCR deben recibir solamente datos permitidos, con límites, errores y trazabilidad.
- Los datos de clientes, casos y documentos deben minimizarse en logs y fixtures.
- Acciones sensibles pueden exigir reautenticación y registro de evento.

## Estados transversales que deben modelarse

Toda pantalla o caso de uso que interactúe con red, Auth, Storage o IA debe considerar `loading`, `success`, `empty`, `error`, `retry` y, cuando corresponda, `offline` o `pending-processing`.

## Compatibilidad web y mobile

- La base visual es mobile-first y accesible.
- Las APIs web/native se encapsulan detrás de adaptadores compartidos.
- El almacenamiento local de información sensible requiere una decisión de seguridad específica.
- Deep links, botón atrás, teclado, safe areas, permisos y exposición de datos en background se documentarán al habilitar Capacitor.

## Calidad y observabilidad

Cada módulo debe tener tipos explícitos, pruebas de dominio e integración proporcionales, revisión de accesibilidad y validación en viewport móvil. Los flujos críticos de autenticación, permisos y aislamiento deben cubrir casos positivos y negativos.

## Decisiones pendientes

- esquema final de perfiles, tenants y membresías;
- catálogo de roles y permisos;
- estrategia de sesiones y almacenamiento seguro en web/native;
- proveedor y contrato de IA/OCR;
- retención, exportación y eliminación de documentos;
- estrategia de eventos y observabilidad.

## Fuentes

- [Contexto del sistema](system-context.md)
- [ADR 0001](../06-decisions/0001-autenticacion-y-aislamiento-multi-tenant.md)
- [Instrucciones de arquitectura](../../.agents/instructions/10-architecture.md)
- [Instrucciones de seguridad](../../.agents/instructions/50-security.md)
