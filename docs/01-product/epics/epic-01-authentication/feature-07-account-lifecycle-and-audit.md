# FEAT-AUTH-07 — Ciclo de vida y auditoría de cuenta

- Epic: EPIC-01
- Estado: propuesta avanzada
- Última actualización: 2026-08-02
- Prioridad: P1

## Propósito

Permitir que el sistema y el usuario entiendan cambios relevantes de seguridad y que la cuenta tenga un ciclo de vida explícito, sin borrar datos profesionales de manera accidental ni crear vías administrativas ocultas.

## Alcance

Eventos mínimos de seguridad, estado de cuenta, desactivación, reactivación si aplica, exportación y solicitud de eliminación. La retención legal/comercial de clientes, casos y documentos se decidirá por separado.

## Dependencias

- `FEAT-AUTH-03` para cambios de credenciales/sesiones.
- `FEAT-AUTH-05` y `FEAT-AUTH-06` para membresías y roles.
- Política de privacidad, retención y soporte.
- Sistema de observabilidad server-side.

## Historias

### US-AUTH-022 — Consultar y registrar eventos de seguridad

Como usuario, quiero conocer actividad relevante de mi cuenta, para detectar cambios que no reconozco y mantener confianza en CasePilot.

#### Descripción

Esta historia da visibilidad a los cambios relevantes de seguridad y acceso de la cuenta. La persona debe poder reconocer actividad legítima, detectar señales inesperadas y entender qué información se registra sin acceder a datos de otros usuarios.

#### Criterios de aceptación

- `AC-AUTH-022-01`: cambios relevantes como login, logout, recuperación, cambio de contraseña, membresía y reauth pueden generar un evento según la política.
- `AC-AUTH-022-02`: el usuario ve un resumen útil sin tokens, contraseñas ni PII excesiva.
- `AC-AUTH-022-03`: los eventos tienen timestamp inequívoco y contexto de dispositivo/acción solo cuando sea necesario.
- `AC-AUTH-022-04`: un fallo al registrar telemetría no convierte una operación segura en una operación autorizada ni expone datos.
- `AC-AUTH-022-05`: las acciones administrativas o de soporte están separadas del historial visible del profesional.

#### Reglas de negocio

- `RN-AUTH-022-01`: un evento de auditoría no sustituye logs técnicos protegidos ni autorización.
- `RN-AUTH-022-02`: el contenido y retención dependen de una política de privacidad y jurisdicción.
- `RN-AUTH-022-03`: los eventos deben ser append-only o tener una estrategia de integridad definida.
- `RN-AUTH-022-04`: no registrar secretos, documentos completos, prompts completos o contenido de clientes salvo decisión explícita y protegida.

#### Requisitos no funcionales

- `RNF-AUTH-022-01`: timestamps en UTC/canonizados y presentación según zona horaria del usuario.
- `RNF-AUTH-022-02`: acceso a eventos limitado por actor/tenant y protegido por RLS o frontera server-side.
- `RNF-AUTH-022-03`: volumen, retención, coste y consulta deben ser observables sin degradar el flujo principal.

### US-AUTH-023 — Gestionar el ciclo de vida de mi cuenta

Como usuario, quiero desactivar, exportar o solicitar la eliminación de mi cuenta, para controlar mis datos y dejar de usar el servicio de forma clara.

#### Descripción

Esta historia permite decidir qué hacer con la cuenta y sus datos cuando la persona deja de utilizar CasePilot. Debe explicar opciones, consecuencias y estados de exportación, desactivación o eliminación sin prometer acciones que la política aún no soporte.

#### Criterios de aceptación

- `AC-AUTH-023-01`: desde Seguridad/Privacidad, el usuario puede conocer qué opciones de desactivación, exportación y eliminación existen.
- `AC-AUTH-023-02`: las acciones sensibles requieren reautenticación, confirmación explícita y explicación de consecuencias.
- `AC-AUTH-023-03`: desactivar impide el acceso normal sin borrar automáticamente datos que tengan otra política de ownership/retención.
- `AC-AUTH-023-04`: exportar genera un resultado protegido, con estado, expiración y alcance explícito.
- `AC-AUTH-023-05`: eliminar valida memberships/ownership, ejecuta la política definida y comunica estados pendiente/completado/error sin prometer una eliminación inmediata si no es posible.

#### Reglas de negocio

- `RN-AUTH-023-01`: eliminar una identidad no puede dejar recursos críticos sin owner; se debe transferir, archivar o aplicar política antes de completar.
- `RN-AUTH-023-02`: la retención legal, contractual o de auditoría puede impedir una purga inmediata; debe informarse con claridad.
- `RN-AUTH-023-03`: exportación y eliminación deben estar limitadas a los datos que el usuario tiene derecho a controlar.
- `RN-AUTH-023-04`: no se implementa un bypass administrativo desde la UI del profesional.

#### Requisitos no funcionales

- `RNF-AUTH-023-01`: protección de archivos exportados, URLs temporales, expiración y no exposición en logs.
- `RNF-AUTH-023-02`: procesos largos son asíncronos, reintentables e idempotentes; sus estados son consultables.
- `RNF-AUTH-023-03`: copy legal y UX accesibles; confirmación no se basa únicamente en color o texto ambiguo.
