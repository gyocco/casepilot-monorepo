# FEAT-AUTH-06 — Roles, autorización y navegación protegida

- Epic: EPIC-01
- Estado: en definición
- Última actualización: 2026-08-02
- Prioridad: P0

## Propósito

Convertir identidad, membresía y rol en permisos verificables para que cada pantalla y operación sea accesible solo a quien corresponda.

## Alcance

Catálogo inicial de roles, matriz de permisos, guards de navegación, estados de acceso denegado y reautenticación/autorización para acciones sensibles. Los permisos específicos de clientes, casos y documentos se ampliarán con cada épica.

## Dependencias

- `FEAT-AUTH-05` para tenant y membership.
- Contratos de dominio y datos de cada módulo.
- RLS, Storage policies y funciones server-side.
- [Línea base de arquitectura](../../../02-architecture/architecture-baseline.md).

## Historias

### US-AUTH-019 — Aplicar roles y permisos

Como propietario de un workspace, quiero que cada miembro tenga un rol y permisos claros, para colaborar sin otorgar acceso excesivo.

#### Descripción

Esta historia hace visibles y predecibles los límites de colaboración dentro de un espacio. Cada miembro debe recibir solo las capacidades necesarias para su trabajo, y esos permisos deben aplicarse de igual forma en toda la experiencia.

#### Criterios de aceptación

- `AC-AUTH-019-01`: existe una matriz documentada de roles y acciones para el alcance MVP.
- `AC-AUTH-019-02`: cada membership tiene un rol y estado válidos.
- `AC-AUTH-019-03`: una operación permitida funciona para el rol correspondiente y una no permitida falla en backend/RLS.
- `AC-AUTH-019-04`: cambiar un rol se refleja en nuevas operaciones sin confiar en una UI cacheada.
- `AC-AUTH-019-05`: la UI puede ocultar o deshabilitar acciones no permitidas, pero la seguridad sigue funcionando sin esa capa.

#### Reglas de negocio

- `RN-AUTH-019-01`: roles iniciales sugeridos: `owner`, `admin` y `member`; se validarán con el primer caso de estudio real.
- `RN-AUTH-019-02`: el owner no puede ser eliminado o degradado sin una transferencia explícita y un owner sustituto válido.
- `RN-AUTH-019-03`: los permisos se derivan de membership + rol + estado + operación + tenant.
- `RN-AUTH-019-04`: no se autoriza por flags enviados por el navegador ni por un rol guardado solo en el cliente.

#### Requisitos no funcionales

- `RNF-AUTH-019-01`: matriz auditable y pruebas de cada permiso crítico en positivo y negativo.
- `RNF-AUTH-019-02`: cambios de rol y membresía tienen trazabilidad mínima y consistencia transaccional.
- `RNF-AUTH-019-03`: no revelar a un usuario la existencia de acciones o recursos que no puede conocer cuando eso sea sensible.

### US-AUTH-020 — Proteger rutas y manejar acceso denegado

Como usuario, quiero que CasePilot me lleve a la pantalla correcta según mi sesión y permisos, para no encontrar pantallas rotas ni acceder accidentalmente a datos protegidos.

#### Descripción

Esta historia asegura que cada navegación respete la identidad y los permisos actuales. La persona debe recibir una pantalla útil cuando el acceso es anónimo o insuficiente, sin fallos confusos ni exposición accidental de contenido.

#### Criterios de aceptación

- `AC-AUTH-020-01`: rutas públicas, autenticadas y restringidas por permiso están diferenciadas.
- `AC-AUTH-020-02`: un anónimo que abre una ruta protegida va a login y puede volver al destino interno seguro.
- `AC-AUTH-020-03`: un autenticado sin permiso recibe una pantalla 403/acción denegada con siguiente paso útil.
- `AC-AUTH-020-04`: una ruta inexistente no revela rutas, IDs o datos privados.
- `AC-AUTH-020-05`: al cambiar sesión, tenant o rol, el guard reevalúa el acceso y no deja contenido anterior.

#### Reglas de negocio

- `RN-AUTH-020-01`: un route guard mejora UX; la autorización real debe ocurrir en la operación backend.
- `RN-AUTH-020-02`: solo se preservan redirects internos allowlisted.
- `RN-AUTH-020-03`: `loading` de Auth no se trata como anónimo para evitar redirecciones prematuras.

#### Requisitos no funcionales

- `RNF-AUTH-020-01`: no flash de contenido protegido durante bootstrap o cambio de contexto.
- `RNF-AUTH-020-02`: página 401/403 accesible, explicativa y compatible con botón atrás.
- `RNF-AUTH-020-03`: rutas lazy y guards no generan loops ni requests innecesarios.

### US-AUTH-021 — Reautenticar acciones sensibles

Como usuario, quiero que acciones de alto riesgo pidan una confirmación de identidad reciente, para reducir el impacto de una sesión abandonada.

#### Descripción

Esta historia añade una confirmación de identidad reciente antes de operaciones de alto riesgo. La fricción se reserva para acciones que podrían causar daño relevante y debe indicar qué se está protegiendo y qué ocurre si se cancela.

#### Criterios de aceptación

- `AC-AUTH-021-01`: las operaciones sensibles tienen una lista definida y un requisito de reauth explícito.
- `AC-AUTH-021-02`: si la reauth es válida dentro de la ventana, la operación continúa una vez.
- `AC-AUTH-021-03`: si falla o expira, la acción no se ejecuta y se muestra el siguiente paso.
- `AC-AUTH-021-04`: la confirmación no eleva rol ni permiso; solo vuelve a probar identidad.
- `AC-AUTH-021-05`: la UI no confirma cambios hasta recibir resultado del backend.

#### Reglas de negocio

- `RN-AUTH-021-01`: reauth no reemplaza RLS ni autorización de tenant/rol.
- `RN-AUTH-021-02`: operaciones candidatas: cambio de contraseña/email, eliminación, exportación, transferir owner y acciones equivalentes que se agreguen.
- `RN-AUTH-021-03`: la ventana, factor y revocación deben ser configurables por política y proveedor.

#### Requisitos no funcionales

- `RNF-AUTH-021-01`: no registrar credenciales ni respuestas de desafío; feedback de seguridad no enumerativo.
- `RNF-AUTH-021-02`: modal/step-up accesible, focus gestionado, cancelación clara y compatibilidad con móvil.
- `RNF-AUTH-021-03`: protección contra doble ejecución e idempotencia cuando la operación tenga efecto.
