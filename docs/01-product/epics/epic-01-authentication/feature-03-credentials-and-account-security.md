# FEAT-AUTH-03 — Credenciales y seguridad de cuenta

- Epic: EPIC-01
- Estado: en definición
- Última actualización: 2026-08-02
- Prioridad: P0

## Propósito

Dar al usuario mecanismos seguros para recuperar o cambiar su contraseña y entender/revocar sesiones, sin convertir la UI en una frontera de seguridad falsa.

## Alcance

Solicitud de recuperación, establecimiento de nueva contraseña, cambio autenticado, cierre de sesiones activas y manejo de estados de seguridad. MFA, SSO y biometría quedan como extensiones futuras con decisiones específicas.

## Dependencias

- `FEAT-AUTH-02` para sesión.
- Proveedor de Auth y correo transaccional.
- Políticas de rate limit, recuperación y retención de eventos.
- Adaptadores de plataforma si se incorpora biometría en mobile.

## Historias

### US-AUTH-008 — Solicitar recuperación de contraseña

Como usuario que no recuerda su contraseña, quiero solicitar un enlace de recuperación, para volver a acceder sin soporte manual.

#### Descripción

Esta historia ofrece un camino autónomo para iniciar recuperación sin depender de soporte. La respuesta debe proteger la privacidad del usuario y orientar el siguiente paso incluso cuando no pueda confirmarse el estado del email.

#### Criterios de aceptación

- `AC-AUTH-008-01`: el usuario puede enviar un email desde una ruta pública con un formulario accesible.
- `AC-AUTH-008-02`: la respuesta no confirma si el email existe; comunica siempre un siguiente paso seguro.
- `AC-AUTH-008-03`: los reenvíos están limitados y la UI muestra cooldown o una alternativa.
- `AC-AUTH-008-04`: un email válido conduce a una ruta de restablecimiento permitida y no a un destino arbitrario.
- `AC-AUTH-008-05`: errores de red permiten retry sin revelar información sensible.

#### Reglas de negocio

- `RN-AUTH-008-01`: el token de recuperación es de un solo propósito, expira y se invalida al completar o revocar según el proveedor.
- `RN-AUTH-008-02`: la solicitud no crea sesión autenticada.
- `RN-AUTH-008-03`: se aplican límites por identidad, IP/dispositivo o mecanismo equivalente.

#### Requisitos no funcionales

- `RNF-AUTH-008-01`: no registrar el email completo, token o contenido del correo en logs públicos.
- `RNF-AUTH-008-02`: copy no enumerativo, focus y navegación accesibles.
- `RNF-AUTH-008-03`: la pantalla funciona en móvil y con gestor de contraseñas cuando aplique.

### US-AUTH-009 — Establecer una nueva contraseña

Como usuario con un enlace de recuperación válido, quiero definir una nueva contraseña, para recuperar el acceso de forma segura.

#### Descripción

Esta historia permite convertir un enlace de recuperación válido en una nueva contraseña y una sesión segura. Debe guiar también los casos de enlace vencido, usado o inválido sin dejar ambigüedad sobre el resultado.

#### Criterios de aceptación

- `AC-AUTH-009-01`: un token válido permite ingresar y confirmar una contraseña que cumple la política.
- `AC-AUTH-009-02`: las contraseñas no coincidentes o débiles se marcan antes de confirmar y también se validan en backend.
- `AC-AUTH-009-03`: un token expirado, usado o manipulado no cambia la contraseña y ofrece solicitar recuperación nuevamente.
- `AC-AUTH-009-04`: al completar, las sesiones anteriores se revocan o se aplica la política definida y se informa al usuario.
- `AC-AUTH-009-05`: el usuario puede iniciar sesión con la contraseña nueva sin que el token quede reutilizable.

#### Reglas de negocio

- `RN-AUTH-009-01`: la nueva contraseña no puede ser igual a una credencial prohibida por la política.
- `RN-AUTH-009-02`: el token nunca se trata como contraseña ni se persiste en el perfil.
- `RN-AUTH-009-03`: el cambio debe invalidar el enlace y dejar un estado de seguridad trazable.

#### Requisitos no funcionales

- `RNF-AUTH-009-01`: campos tipo password, no exposición en URL/logs y soporte de password manager.
- `RNF-AUTH-009-02`: mensajes de error no revelan si el token correspondía a otra cuenta.
- `RNF-AUTH-009-03`: reintento seguro y feedback accesible para éxito o error.

### US-AUTH-010 — Cambiar contraseña estando autenticado

Como usuario autenticado, quiero cambiar mi contraseña desde Seguridad, para mantener el control de mi cuenta.

#### Descripción

Esta historia permite a una persona autenticada renovar sus credenciales desde el área de seguridad. El cambio debe confirmar la identidad reciente, explicar el efecto en otras sesiones y dejar claro cuándo la nueva contraseña está activa.

#### Criterios de aceptación

- `AC-AUTH-010-01`: desde el perfil, el usuario puede abrir una sección de seguridad protegida.
- `AC-AUTH-010-02`: se solicita la contraseña actual o reautenticación equivalente cuando la política lo exige.
- `AC-AUTH-010-03`: la nueva contraseña se valida, se confirma y se informa el resultado sin exponerla.
- `AC-AUTH-010-04`: un cambio exitoso comunica qué sesiones se mantienen o revocan.
- `AC-AUTH-010-05`: fallos de red o de credenciales permiten retry y no dejan un estado ambiguo.

#### Reglas de negocio

- `RN-AUTH-010-01`: cambiar contraseña no modifica perfil, tenant, membresías ni permisos.
- `RN-AUTH-010-02`: la operación se autoriza para el usuario autenticado, no para un ID enviado por el cliente.
- `RN-AUTH-010-03`: se registra un evento de seguridad sin guardar la contraseña.

#### Requisitos no funcionales

- `RNF-AUTH-010-01`: exigir reautenticación reciente para reducir riesgo de sesión abandonada.
- `RNF-AUTH-010-02`: feedback accesible, campos seguros y compatibilidad con password managers.
- `RNF-AUTH-010-03`: logs y métricas minimizan PII.

### US-AUTH-011 — Administrar sesiones activas

Como usuario, quiero ver y cerrar sesiones activas, para revocar accesos desde dispositivos que ya no controlo.

#### Descripción

Esta historia permite revisar dónde está abierta la cuenta y cerrar sesiones que ya no sean confiables. La persona conserva el control de su acceso sin poder afectar sesiones o usuarios fuera de su cuenta.

#### Criterios de aceptación

- `AC-AUTH-011-01`: la sección Seguridad muestra sesiones o un mecanismo equivalente con información no sensible y útil.
- `AC-AUTH-011-02`: el usuario puede cerrar una sesión específica si el proveedor lo soporta.
- `AC-AUTH-011-03`: el usuario puede cerrar todas las demás sesiones mediante una acción confirmada.
- `AC-AUTH-011-04`: la sesión actual se identifica sin revelar tokens ni identificadores internos innecesarios.
- `AC-AUTH-011-05`: un cambio externo se refleja al refrescar o por evento, y una sesión revocada pierde acceso.

#### Reglas de negocio

- `RN-AUTH-011-01`: listar o revocar sesiones requiere autenticación reciente.
- `RN-AUTH-011-02`: revocar sesiones no elimina perfil, clientes, casos ni documentos.
- `RN-AUTH-011-03`: si el proveedor no ofrece granularidad, se documenta la capacidad real y se ofrece logout global seguro.

#### Requisitos no funcionales

- `RNF-AUTH-011-01`: no mostrar IP completa, user-agent crudo u otros datos que no sean necesarios para el usuario.
- `RNF-AUTH-011-02`: confirmaciones y estados de revocación son accesibles y reversibles solo cuando sea seguro.
- `RNF-AUTH-011-03`: errores parciales no dejan la UI afirmando que todas las sesiones fueron revocadas.
