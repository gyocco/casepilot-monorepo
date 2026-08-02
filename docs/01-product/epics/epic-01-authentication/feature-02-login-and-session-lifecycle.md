# FEAT-AUTH-02 — Inicio de sesión y ciclo de sesión

- Epic: EPIC-01
- Estado: en definición
- Última actualización: 2026-08-02
- Prioridad: P0

## Propósito

Permitir entrar a CasePilot, conservar una sesión válida de forma segura, salir explícitamente y recuperarse de expiraciones o cambios de sesión sin mostrar datos protegidos de manera incorrecta.

## Alcance

Login por email y contraseña, restauración después de reload, refresh/expiración, logout y estados de sesión en web. Deep links y almacenamiento nativo se implementarán detrás de adaptadores cuando exista Capacitor.

## Dependencias

- `FEAT-AUTH-01` para estado de identidad y verificación.
- Proveedor de Auth y contrato de sesión.
- Router/shell de `apps/web`.
- [Línea base de arquitectura](../../../02-architecture/architecture-baseline.md).

## Historias

### US-AUTH-004 — Iniciar sesión

Como profesional registrado, quiero iniciar sesión con mis credenciales, para acceder a mis espacios y datos autorizados.

#### Descripción

Esta historia permite a una persona ya registrada entrar de forma segura y llegar al contexto que tiene autorizado. También define la experiencia para credenciales incorrectas o cuentas que aún no pueden acceder.

#### Criterios de aceptación

- `AC-AUTH-004-01`: con credenciales válidas y cuenta habilitada, el usuario entra a la página principal o al destino protegido solicitado.
- `AC-AUTH-004-02`: con credenciales inválidas, el sistema muestra un error genérico accionable sin confirmar datos de otra cuenta.
- `AC-AUTH-004-03`: una cuenta no verificada, bloqueada o desactivada recibe el flujo correspondiente y no una sesión normal.
- `AC-AUTH-004-04`: durante el envío se evita doble submit y se mantiene un estado de loading identificable.
- `AC-AUTH-004-05`: un redirect externo solo utiliza destinos permitidos y no habilita open redirect.

#### Reglas de negocio

- `RN-AUTH-004-01`: la autorización empieza después de validar identidad y estado de cuenta.
- `RN-AUTH-004-02`: el usuario puede tener más de un workspace, pero el tenant activo se resuelve de forma autorizada.
- `RN-AUTH-004-03`: los intentos fallidos y bloqueos siguen la política de abuso definida por el proveedor/servidor.

#### Requisitos no funcionales

- `RNF-AUTH-004-01`: no se guardan contraseñas en estado global, logs, URL ni analytics.
- `RNF-AUTH-004-02`: el formulario soporta password managers, teclado móvil, focus visible y lector de pantalla.
- `RNF-AUTH-004-03`: los errores de red tienen retry sin borrar entradas no sensibles.

### US-AUTH-005 — Restaurar una sesión válida

Como usuario, quiero que una sesión válida se restaure al recargar la aplicación, para no perder el contexto durante mi trabajo.

#### Descripción

Esta historia mantiene el contexto de trabajo cuando la aplicación se abre de nuevo o se recarga. La persona debe saber si su sesión se está resolviendo y nunca debe ver datos protegidos antes de que el acceso esté confirmado.

#### Criterios de aceptación

- `AC-AUTH-005-01`: al abrir o recargar la app, se muestra un estado de inicialización mientras se resuelve Auth.
- `AC-AUTH-005-02`: una sesión válida lleva al shell protegido sin parpadeo de login ni consulta de datos antes de validar identidad.
- `AC-AUTH-005-03`: una sesión ausente lleva al shell público sin exponer datos protegidos.
- `AC-AUTH-005-04`: un refresh de token exitoso conserva el contexto; uno fallido limpia sesión y solicita login.
- `AC-AUTH-005-05`: una segunda pestaña o cambio de sesión sincroniza el estado sin loops de navegación.

#### Reglas de negocio

- `RN-AUTH-005-01`: ninguna query de cliente, caso o documento se ejecuta antes de tener identidad y tenant autorizado.
- `RN-AUTH-005-02`: el tenant activo puede necesitar revalidación después de renovar la sesión.
- `RN-AUTH-005-03`: logout o revocación invalida el acceso aunque la UI conserve una referencia antigua.

#### Requisitos no funcionales

- `RNF-AUTH-005-01`: el bootstrap no bloquea indefinidamente; tiene timeout y estado de error/retry.
- `RNF-AUTH-005-02`: la estrategia de almacenamiento de sesión no expone secretos a APIs innecesarias y tendrá revisión para mobile.
- `RNF-AUTH-005-03`: no se generan renders o requests duplicados por suscripciones mal gestionadas.

### US-AUTH-006 — Cerrar sesión

Como usuario, quiero cerrar sesión de forma explícita, para impedir que otra persona use mi sesión en el dispositivo.

#### Descripción

Esta historia da a la persona control explícito para terminar su sesión en el dispositivo. Al salir, la experiencia debe volver a un estado público y no conservar acceso visible a datos privados.

#### Criterios de aceptación

- `AC-AUTH-006-01`: existe una acción visible y accesible de cerrar sesión desde el área de usuario.
- `AC-AUTH-006-02`: al completarla, se limpian datos de sesión y la navegación vuelve al shell público.
- `AC-AUTH-006-03`: si el proveedor responde error, la UI no afirma éxito sin resolver si la sesión sigue válida.
- `AC-AUTH-006-04`: usar atrás o una URL protegida después del logout no muestra contenido ni ejecuta queries protegidas.
- `AC-AUTH-006-05`: la acción no se duplica por doble tap y comunica estado de progreso.

#### Reglas de negocio

- `RN-AUTH-006-01`: logout local y revocación server-side se distinguen si el proveedor los trata de forma diferente.
- `RN-AUTH-006-02`: salir de un workspace no equivale a cerrar sesión global.
- `RN-AUTH-006-03`: las acciones de logout no requieren conocer ni recibir el tenant desde el navegador.

#### Requisitos no funcionales

- `RNF-AUTH-006-01`: no dejar datos sensibles en stores, cache o pantalla después de salir.
- `RNF-AUTH-006-02`: la navegación de salida funciona en web, botón atrás de Android futuro y deep link inválido.
- `RNF-AUTH-006-03`: el estado de error es recuperable y no revela detalles internos.

### US-AUTH-007 — Manejar sesión expirada o inválida

Como usuario, quiero recibir una explicación y poder volver a autenticarme cuando mi sesión expire, para no perder el control del trabajo ni ver estados incoherentes.

#### Descripción

Esta historia describe qué ocurre cuando una sesión deja de ser válida durante el trabajo. El objetivo es recuperar el acceso de forma comprensible, proteger los datos mientras cambia el estado y evitar presentar como guardada una acción incierta.

#### Criterios de aceptación

- `AC-AUTH-007-01`: una respuesta 401/403 o evento de expiración produce un estado global controlado.
- `AC-AUTH-007-02`: el sistema intenta refresh solo según la política definida y evita reintentos infinitos.
- `AC-AUTH-007-03`: si requiere login, se conserva un destino interno seguro y se informa la situación.
- `AC-AUTH-007-04`: una acción no confirmada no se presenta como guardada; se ofrece reintento cuando sea seguro.
- `AC-AUTH-007-05`: no se muestra contenido protegido durante la transición a anónimo.

#### Reglas de negocio

- `RN-AUTH-007-01`: una sesión inválida siempre pierde acceso a datos, aunque la UI no haya terminado de actualizarse.
- `RN-AUTH-007-02`: las operaciones no idempotentes no se repiten automáticamente sin una clave o confirmación.
- `RN-AUTH-007-03`: los permisos pueden cambiar durante una sesión y deben revalidarse en backend.

#### Requisitos no funcionales

- `RNF-AUTH-007-01`: errores de red, expiración y autorización se distinguen sin filtrar información sensible.
- `RNF-AUTH-007-02`: el modal/banner de reautenticación gestiona focus, teclado y cierre accesible.
- `RNF-AUTH-007-03`: el flujo es resiliente a latencia y reconexión.
