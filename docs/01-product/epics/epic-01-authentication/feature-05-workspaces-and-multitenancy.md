# FEAT-AUTH-05 — Espacios de trabajo y multi-tenant

- Epic: EPIC-01
- Estado: en definición
- Última actualización: 2026-08-02
- Prioridad: P0 para aislamiento; P1 para colaboración

## Propósito

Proveer un espacio privado por defecto y una frontera explícita para que una persona pueda pertenecer a uno o más espacios de trabajo sin mezclar clientes, casos, documentos o conocimiento.

## Alcance

Creación del workspace personal, resolución del tenant activo, aislamiento backend/RLS, cambio entre workspaces e invitación/gestión básica de miembros. La colaboración avanzada y los roles comerciales se refinan después.

## Dependencias

- `FEAT-AUTH-01` para onboarding.
- `FEAT-AUTH-02` para sesión.
- `FEAT-AUTH-06` para roles y autorización.
- Migrations, RLS, Storage policies y pruebas locales.
- [ADR 0001 — Autenticación y aislamiento multi-tenant](../../../06-decisions/0001-autenticacion-y-aislamiento-multi-tenant.md).

## Historias

### US-AUTH-015 — Crear un espacio personal

Como profesional que empieza a usar CasePilot, quiero tener un espacio privado propio, para organizar mi trabajo sin configurar un estudio.

#### Descripción

Esta historia elimina la configuración inicial del espacio: al terminar el alta, cada profesional debe disponer de un entorno privado y reconocible. El resultado debe ser único, recuperable y listo para recibir clientes, casos y documentos.

#### Criterios de aceptación

- `AC-AUTH-015-01`: al completar el onboarding, el usuario obtiene un workspace personal si no tiene uno elegible.
- `AC-AUTH-015-02`: el workspace se crea una sola vez aunque el onboarding se reintente.
- `AC-AUTH-015-03`: el creador queda asociado con el rol de propietario según la política definida.
- `AC-AUTH-015-04`: el usuario puede ver el nombre y estado del espacio activo desde la página principal/perfil.
- `AC-AUTH-015-05`: una falla parcial no deja una membresía sin tenant o un tenant sin propietario sin una estrategia de recuperación.

#### Reglas de negocio

- `RN-AUTH-015-01`: el workspace personal es privado por defecto y no se descubre por búsqueda pública.
- `RN-AUTH-015-02`: la creación debe ser idempotente y transaccional en la frontera server-side.
- `RN-AUTH-015-03`: el cliente no puede elegir un propietario, rol o tenant diferente del usuario autenticado.

#### Requisitos no funcionales

- `RNF-AUTH-015-01`: constraints, transacción y RLS evitan duplicados y estados huérfanos.
- `RNF-AUTH-015-02`: nombre y campos de workspace se validan y escapan como input no confiable.
- `RNF-AUTH-015-03`: si falla red, el retry no crea un segundo workspace ni una segunda membresía.

### US-AUTH-016 — Aislar los datos por tenant

Como usuario, quiero que mis datos solo sean accesibles desde espacios autorizados, para proteger la confidencialidad de clientes, casos y documentos.

#### Descripción

Esta historia establece la promesa de confidencialidad de CasePilot: cada persona solo ve y modifica información de los espacios donde tiene autorización. El aislamiento debe mantenerse de forma consistente al consultar, buscar o actuar sobre cualquier recurso.

#### Criterios de aceptación

- `AC-AUTH-016-01`: toda consulta de producto se evalúa con identidad y membresía autorizada.
- `AC-AUTH-016-02`: un usuario no puede leer, crear, editar, borrar o enumerar datos de otro tenant manipulando IDs o requests.
- `AC-AUTH-016-03`: cambiar el tenant activo actualiza el contexto y no conserva datos visibles del tenant anterior.
- `AC-AUTH-016-04`: Storage, Realtime y funciones server-side aplican la misma frontera.
- `AC-AUTH-016-05`: existen pruebas positivas y negativas para cada operación protegida del MVP.

#### Reglas de negocio

- `RN-AUTH-016-01`: un `tenant_id` enviado por el cliente es contexto solicitado, no autorización.
- `RN-AUTH-016-02`: membership activa y permisos del rol son condiciones para acceder.
- `RN-AUTH-016-03`: revocar o suspender una membresía corta el acceso aunque exista cache o una UI antigua.

#### Requisitos no funcionales

- `RNF-AUTH-016-01`: RLS activo en tablas expuestas y policies de Storage/Realtime revisadas.
- `RNF-AUTH-016-02`: errores de autorización no filtran si existe el recurso ajeno.
- `RNF-AUTH-016-03`: queries, cache keys y logs incluyen contexto de forma segura y no mezclan respuestas.

### US-AUTH-017 — Cambiar de espacio de trabajo

Como usuario que pertenece a más de un espacio, quiero cambiar el espacio activo, para trabajar en el contexto correcto sin cerrar sesión.

#### Descripción

Esta historia permite trabajar con más de un espacio sin cerrar la sesión. El cambio de contexto debe ser explícito, mostrar en qué espacio se está trabajando y evitar que la pantalla mezcle información del espacio anterior.

#### Criterios de aceptación

- `AC-AUTH-017-01`: el selector muestra solo workspaces con membresía autorizada y estado elegible.
- `AC-AUTH-017-02`: al seleccionar uno, se revalida acceso y se actualiza el shell antes de consultar datos del nuevo contexto.
- `AC-AUTH-017-03`: se limpian o invalidan datos cacheados del workspace anterior.
- `AC-AUTH-017-04`: si el workspace deja de estar disponible, se informa y se elige un contexto válido sin bloquear la cuenta completa.
- `AC-AUTH-017-05`: la selección persiste solo según una política segura y no se usa como autorización.

#### Reglas de negocio

- `RN-AUTH-017-01`: cambiar workspace no cambia identidad, credenciales ni rol en otro workspace.
- `RN-AUTH-017-02`: el tenant seleccionado debe pertenecer a la lista autorizada del backend.
- `RN-AUTH-017-03`: una membresía pendiente, suspendida o revocada no aparece como activa.

#### Requisitos no funcionales

- `RNF-AUTH-017-01`: transición sin mostrar contenido del tenant anterior después de confirmar el cambio.
- `RNF-AUTH-017-02`: selector usable con teclado, lector, touch y lista larga.
- `RNF-AUTH-017-03`: reintento seguro ante red lenta y sin requests duplicados.

### US-AUTH-018 — Invitar y gestionar miembros

Como propietario o administrador autorizado, quiero invitar y gestionar miembros de mi workspace, para colaborar sin perder control sobre quién accede.

#### Descripción

Esta historia permite que un propietario o administrador incorpore colaboradores y mantenga actualizada la membresía del espacio. La colaboración se limita a las invitaciones, estados y permisos que el rol autorizado puede gestionar.

#### Criterios de aceptación

- `AC-AUTH-018-01`: un rol autorizado puede enviar una invitación a un email y rol permitido.
- `AC-AUTH-018-02`: la invitación tiene expiración, estado y no permite aceptar en un tenant no autorizado por el token/contexto.
- `AC-AUTH-018-03`: el invitado puede aceptar, registrarse o vincularse según su estado de identidad.
- `AC-AUTH-018-04`: el administrador puede ver, suspender o revocar membresías según el catálogo de permisos.
- `AC-AUTH-018-05`: el propietario no puede quedar sin un owner válido por una operación accidental.

#### Reglas de negocio

- `RN-AUTH-018-01`: solo owner/admin autorizado gestiona membresías; la UI no es la autoridad.
- `RN-AUTH-018-02`: una invitación es de un solo uso, expira y queda vinculada al tenant y rol permitido.
- `RN-AUTH-018-03`: suspender o revocar corta acceso futuro y obliga a revalidar sesiones activas.
- `RN-AUTH-018-04`: el catálogo de roles y la posibilidad de invitar cada rol deben ser explícitos.

#### Requisitos no funcionales

- `RNF-AUTH-018-01`: tokens de invitación fuera de logs, respuestas públicas y analytics; email y PII minimizados.
- `RNF-AUTH-018-02`: rate limit, idempotencia y protección contra abuso de invitaciones.
- `RNF-AUTH-018-03`: UI accesible, confirmaciones claras y estados pending/accepted/expired/revoked.
