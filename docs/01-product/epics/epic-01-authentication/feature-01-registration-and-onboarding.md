# FEAT-AUTH-01 — Registro y onboarding

- Epic: EPIC-01
- Estado: en definición
- Última actualización: 2026-08-02
- Prioridad: P0

## Propósito

Permitir que un profesional cree una identidad de CasePilot, confirme el control de su email y complete los datos mínimos para llegar a un espacio de trabajo utilizable.

## Alcance

Registro por email y contraseña, aceptación de términos, verificación de email, estados de cuenta y onboarding mínimo. La creación formal del espacio personal se especifica en `FEAT-AUTH-05`, aunque el onboarding debe poder dirigir a ese flujo sin ambigüedad.

## Dependencias

- Proveedor de Auth y contrato de sesión.
- Política de términos, privacidad y retención.
- Modelo conceptual de perfil.
- [Espacios de trabajo](feature-05-workspaces-and-multitenancy.md).

## Historias

### US-AUTH-001 — Crear una cuenta profesional

Como profesional, quiero crear una cuenta con mi email y contraseña, para acceder de forma privada a CasePilot.

#### Descripción

Esta historia cubre el alta inicial de una persona profesional en CasePilot: captura los datos mínimos, explica las condiciones de acceso y deja la cuenta preparada para verificar el email. No incluye todavía la configuración completa del espacio de trabajo ni la colaboración.

#### Criterios de aceptación

- `AC-AUTH-001-01`: dado un email válido, contraseña que cumple la política y consentimiento requerido, cuando envío el registro, entonces se crea una identidad en estado pendiente de verificación.
- `AC-AUTH-001-02`: si el formato, la contraseña o el consentimiento no son válidos, el formulario identifica el problema sin perder entradas no sensibles.
- `AC-AUTH-001-03`: si el email ya está registrado, el sistema evita crear un duplicado y comunica un camino seguro para iniciar sesión o recuperar acceso, sin enumerar cuentas de terceros innecesariamente.
- `AC-AUTH-001-04`: tras un registro válido, la UI informa el siguiente paso y no presenta una pantalla protegida como si el usuario ya tuviera permisos completos.
- `AC-AUTH-001-05`: el flujo funciona con teclado, lector de pantalla, touch y viewport móvil estrecho.

#### Reglas de negocio

- `RN-AUTH-001-01`: una cuenta nueva no se considera verificada hasta completar el mecanismo de confirmación definido.
- `RN-AUTH-001-02`: la contraseña nunca se guarda ni se registra en texto plano.
- `RN-AUTH-001-03`: la aceptación de términos y privacidad debe conservar versión/fecha o el mecanismo equivalente que se defina.
- `RN-AUTH-001-04`: una identidad puede tener un único perfil de producto vigente.

#### Requisitos no funcionales

- `RNF-AUTH-001-01`: validación server-side, rate limit y protección contra abuso; la validación de UI es solo UX.
- `RNF-AUTH-001-02`: mensajes de error claros, no enumerativos y sin detalles internos.
- `RNF-AUTH-001-03`: focus visible, labels, autocomplete seguro y compatibilidad con password managers.
- `RNF-AUTH-001-04`: telemetría sin email completo ni contraseña; errores técnicos solo en logs protegidos.

### US-AUTH-002 — Verificar el email

Como profesional, quiero confirmar mi email mediante un enlace seguro, para demostrar control de la cuenta y habilitar el uso normal de CasePilot.

#### Descripción

Esta historia cubre el paso que confirma que la persona controla el email declarado. Debe ofrecer un camino claro para completar, repetir o recuperar la verificación sin convertir un enlace vencido o inválido en un acceso válido.

#### Criterios de aceptación

- `AC-AUTH-002-01`: el usuario recibe una instrucción para revisar su email después del registro.
- `AC-AUTH-002-02`: un enlace válido y no expirado confirma la identidad y lleva a un estado de éxito entendible.
- `AC-AUTH-002-03`: un enlace expirado, usado o inválido no activa la cuenta y ofrece solicitar uno nuevo.
- `AC-AUTH-002-04`: repetir el enlace no genera efectos duplicados ni revela secretos en la URL o en logs.
- `AC-AUTH-002-05`: después de confirmar, el usuario puede continuar al onboarding o iniciar sesión según el estado de sesión.

#### Reglas de negocio

- `RN-AUTH-002-01`: el token de verificación es de un solo propósito, tiene expiración y no se almacena en texto visible más allá del flujo necesario.
- `RN-AUTH-002-02`: la verificación no crea membresías arbitrarias; el workspace inicial se resuelve por el flujo autorizado.
- `RN-AUTH-002-03`: reenviar el email aplica límites de frecuencia.

#### Requisitos no funcionales

- `RNF-AUTH-002-01`: redirect/deep link debe funcionar en web y quedar aislado para futura Capacitor.
- `RNF-AUTH-002-02`: la UI no expone token completo en mensajes, analítica ni errores.
- `RNF-AUTH-002-03`: mensajes de expiración y reenvío deben ser accesibles y no depender solo del color.

### US-AUTH-003 — Completar el onboarding inicial

Como profesional, quiero completar mis datos iniciales y preferencias mínimas, para entrar a CasePilot con un espacio de trabajo listo para usar.

#### Descripción

Esta historia cubre la primera configuración del producto después de verificar la cuenta: datos mínimos, preferencias y llegada a un espacio utilizable. El flujo debe poder reanudarse sin crear perfiles o espacios duplicados.

#### Criterios de aceptación

- `AC-AUTH-003-01`: después de verificar o iniciar sesión por primera vez, el sistema identifica si falta onboarding.
- `AC-AUTH-003-02`: el usuario puede completar nombre visible, profesión o tipo de uso y preferencias mínimas definidas para el MVP.
- `AC-AUTH-003-03`: abandonar y volver al flujo conserva solo datos no sensibles permitidos o permite continuar sin duplicar el perfil.
- `AC-AUTH-003-04`: al finalizar, el usuario llega a la página principal o al espacio personal creado por el flujo autorizado.
- `AC-AUTH-003-05`: el onboarding no permite seleccionar un tenant ajeno ni asignarse roles.

#### Reglas de negocio

- `RN-AUTH-003-01`: el onboarding es idempotente; repetirlo actualiza el mismo perfil y no crea duplicados.
- `RN-AUTH-003-02`: solo se solicitan datos necesarios para activar la experiencia.
- `RN-AUTH-003-03`: la creación del workspace personal se realiza según las reglas de `US-AUTH-015`.

#### Requisitos no funcionales

- `RNF-AUTH-003-01`: se puede completar en móvil con teclado y conexión inestable sin confirmar dos veces.
- `RNF-AUTH-003-02`: los datos de preferencias se validan en backend y no se consideran autorización.
- `RNF-AUTH-003-03`: cada paso tiene loading, error, retry y salida segura.
