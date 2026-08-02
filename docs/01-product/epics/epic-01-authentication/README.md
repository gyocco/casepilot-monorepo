# EPIC-01 — Autenticación, identidad y espacios de trabajo

- Estado: en definición
- Última actualización: 2026-08-02
- Nivel: Epic / módulo
- Prioridad: P0 — fundación del producto

## Objetivo

Permitir que un profesional cree una cuenta, inicie y cierre sesión de forma segura, gestione su perfil y seguridad, acceda a una página principal protegida y trabaje dentro de un espacio personal o compartido sin que los datos de tenants se mezclen.

La experiencia inicial se plantea como una cuenta personal con un espacio privado creado por defecto. La misma frontera debe permitir que, más adelante, la persona pertenezca a varios espacios de trabajo de un estudio.

## Valor para el usuario

- empezar a usar CasePilot sin configuración empresarial;
- recuperar el acceso sin depender de soporte;
- entender quién es el usuario, cuál es el espacio activo y qué puede hacer;
- mantener control sobre la información de su perfil, sus sesiones y su cuenta;
- colaborar en un estudio sin exponer casos, clientes o documentos de otro espacio.

## Actores

| Actor | Responsabilidad en la épica |
| --- | --- |
| Profesional | Se registra, inicia sesión, configura su perfil y usa su espacio privado. |
| Propietario del espacio | Gestiona el espacio y sus membresías. |
| Administrador | Administra miembros y capacidades autorizadas por el rol. |
| Colaborador | Usa las capacidades permitidas por su membresía. |
| Sistema de identidad | Verifica credenciales, sesiones y recuperación. |
| Soporte/administración interna | Queda fuera del cliente y requiere una frontera privilegiada separada. |

## Alcance

1. Registro por email y contraseña como método inicial.
2. Verificación de email y onboarding básico.
3. Inicio, restauración, expiración y cierre de sesión.
4. Recuperación y cambio de contraseña.
5. Perfil, preferencias y página principal protegida.
6. Espacio personal, selección de tenant y aislamiento de datos.
7. Invitación de miembros y roles base para colaboración.
8. Rutas protegidas, acceso denegado y reautenticación de acciones sensibles.
9. Auditoría mínima de seguridad y ciclo de vida de cuenta.

## Fuera de alcance inicial

- SSO empresarial, SCIM y aprovisionamiento automático.
- Login social, si no se valida una necesidad concreta.
- MFA como requisito de la primera versión; queda como backlog de seguridad priorizable.
- Administración de facturación, límites comerciales y soporte interno desde la UI del profesional.
- Impersonación de usuarios o bypass de RLS.
- Acceso offline a datos sensibles sin una decisión de almacenamiento y seguridad.

## Modelo conceptual

| Entidad conceptual | Propósito | Estado |
| --- | --- | --- |
| Identity | Credencial y estado gestionados por el proveedor de Auth | Propuesta |
| User profile | Nombre, contacto, preferencias y datos de producto | Propuesta |
| Workspace / tenant | Límite lógico de colaboración y datos | Propuesta |
| Membership | Relación usuario–workspace, rol y estado | Propuesta |
| Session | Contexto autenticado, expiración y refresh | Propuesta |
| Security event | Registro mínimo de acciones sensibles y cambios de acceso | Propuesta |

El modelo no implica que las tablas ya existan. Las migrations y policies solo se crearán cuando una historia esté lista para desarrollo y se probarán localmente.

## Mapa de features

| ID | Feature | Historias | Documento |
| --- | --- | --- | --- |
| FEAT-AUTH-01 | Registro y onboarding | US-AUTH-001 a US-AUTH-003 | [Abrir](feature-01-registration-and-onboarding.md) |
| FEAT-AUTH-02 | Inicio de sesión y ciclo de sesión | US-AUTH-004 a US-AUTH-007 | [Abrir](feature-02-login-and-session-lifecycle.md) |
| FEAT-AUTH-03 | Credenciales y seguridad de cuenta | US-AUTH-008 a US-AUTH-011 | [Abrir](feature-03-credentials-and-account-security.md) |
| FEAT-AUTH-04 | Perfil y preferencias | US-AUTH-012 a US-AUTH-014 | [Abrir](feature-04-profile-and-preferences.md) |
| FEAT-AUTH-05 | Espacios de trabajo y multi-tenant | US-AUTH-015 a US-AUTH-018 | [Abrir](feature-05-workspaces-and-multitenancy.md) |
| FEAT-AUTH-06 | Roles, autorización y navegación protegida | US-AUTH-019 a US-AUTH-021 | [Abrir](feature-06-roles-authorization-and-protected-navigation.md) |
| FEAT-AUTH-07 | Ciclo de vida y auditoría | US-AUTH-022 a US-AUTH-023 | [Abrir](feature-07-account-lifecycle-and-audit.md) |

## Requisitos transversales de la épica

### Seguridad y privacidad

- La identidad se verifica en backend; el cliente no es autoridad.
- El `tenant_id`, rol o permiso enviado por el navegador nunca se acepta sin validar membresía.
- RLS, policies de Storage y funciones server-side deben tener casos positivos y negativos.
- No se guardan contraseñas, secretos ni tokens administrativos en el cliente o documentación.
- Los errores visibles no revelan si una cuenta ajena existe cuando eso facilite enumeración.

### Experiencia y accesibilidad

- Todas las pantallas funcionan primero en viewport móvil estrecho.
- Los formularios tienen labels, focus visible, errores asociados al campo y mensajes entendibles.
- El flujo funciona con teclado, lector de pantalla, touch, botón atrás de Android y teclado abierto.
- Loading, éxito, vacío, error, retry y sesión expirada son estados explícitos.

### Compatibilidad web/native

- Las operaciones de Auth se encapsulan en un contrato compartido y no se duplican en cada pantalla.
- Redirects, deep links, almacenamiento de sesión, biometría y notificaciones requieren adaptadores y revisión específica.
- El fallback web debe probarse antes de añadir una implementación Capacitor.

## Dependencias

- [ADR 0001 — Autenticación y aislamiento multi-tenant](../../../06-decisions/0001-autenticacion-y-aislamiento-multi-tenant.md)
- [Línea base de arquitectura](../../../02-architecture/architecture-baseline.md)
- [Instrucciones de seguridad](../../../../.agents/instructions/50-security.md)
- [Instrucciones de calidad](../../../../.agents/instructions/40-quality-testing.md)

## Criterio de salida de la épica

La épica podrá marcarse como completada cuando el alcance MVP acordado tenga registro, sesión, recuperación, perfil, espacio personal, autorización y aislamiento verificables; pruebas de integración/RLS y e2e para recorridos críticos; revisión móvil/accesible; documentación de contratos y un ADR validado o reemplazado de forma explícita.

## Preguntas abiertas

- ¿El email será el único identificador inicial o se requiere teléfono/login social?
- ¿Qué proveedor, dominio de correo y política de expiración se usarán?
- ¿Qué roles son imprescindibles para el primer estudio piloto?
- ¿Se exige MFA desde el primer plan o se habilita como opción posterior?
- ¿Qué datos del perfil son obligatorios por profesión y jurisdicción?
- ¿Qué política de exportación, retención y eliminación aplica a una cuenta con casos/documentos?

## Documentos relacionados

- [Visión y alcance](../../product-vision-and-scope.md)
- [Mapa de requisitos](../../requirements-map.md)
- [Roadmap](../../../07-project-management/roadmap.md)
