# FEAT-AUTH-04 — Perfil y preferencias

- Epic: EPIC-01
- Estado: en definición
- Última actualización: 2026-08-02
- Prioridad: P1

## Propósito

Permitir que el usuario consulte y mantenga su información de producto, preferencias y configuración personal sin confundir esos datos con permisos o con la identidad gestionada por el proveedor.

## Alcance

Página principal autenticada, visualización y edición del perfil, preferencias iniciales de locale/zona horaria/notificaciones y acceso a Seguridad. Las preferencias avanzadas por módulo se detallarán más adelante.

## Dependencias

- `FEAT-AUTH-02` para shell autenticado.
- `FEAT-AUTH-03` para Seguridad.
- Modelo de perfil y política de PII.
- Adaptadores de locale/notifications si se incorporan capacidades nativas.

## Historias

### US-AUTH-012 — Ver mi perfil

Como usuario autenticado, quiero ver mi perfil y el espacio activo, para saber con qué identidad y contexto estoy trabajando.

#### Descripción

Esta historia reúne la información que ayuda a la persona a reconocer su identidad de producto y el espacio en el que trabaja. Debe mostrar solo datos permitidos y ofrecer caminos claros hacia edición, preferencias y seguridad.

#### Criterios de aceptación

- `AC-AUTH-012-01`: la página de perfil muestra los datos visibles del usuario y el estado de cuenta sin exponer credenciales.
- `AC-AUTH-012-02`: muestra el workspace activo y un acceso claro a cambiarlo cuando hay más de uno.
- `AC-AUTH-012-03`: ofrece accesos a editar información, preferencias y Seguridad según permisos.
- `AC-AUTH-012-04`: si el perfil está incompleto o el dato no está disponible, se muestra un estado recuperable.
- `AC-AUTH-012-05`: la ruta está protegida y no se cargan datos antes de validar sesión y membresía.

#### Reglas de negocio

- `RN-AUTH-012-01`: el perfil de producto no sustituye la identidad de Auth ni puede elevar permisos.
- `RN-AUTH-012-02`: el workspace mostrado debe provenir del contexto autorizado del usuario.
- `RN-AUTH-012-03`: los datos visibles dependen de la política de PII y del propio usuario.

#### Requisitos no funcionales

- `RNF-AUTH-012-01`: carga rápida percibida, estados loading/empty/error/retry y no parpadeo de datos ajenos.
- `RNF-AUTH-012-02`: navegación accesible, títulos, landmarks, focus y controles touch.
- `RNF-AUTH-012-03`: diseño usable en móvil y pantallas amplias sin ancho fijo ni scroll horizontal.

### US-AUTH-013 — Editar mi información

Como usuario, quiero editar mi información personal y profesional, para mantener CasePilot actualizado y adaptar la experiencia a mi forma de trabajo.

#### Descripción

Esta historia permite mantener actualizados los datos personales y profesionales que CasePilot utiliza para identificar y personalizar la experiencia. Debe distinguir información editable de credenciales, permisos y otros datos gestionados por seguridad.

#### Criterios de aceptación

- `AC-AUTH-013-01`: el usuario puede editar solo campos de perfil permitidos y ver su valor actual.
- `AC-AUTH-013-02`: los campos se validan y muestran errores asociados sin perder datos no sensibles.
- `AC-AUTH-013-03`: guardar informa loading, éxito o error y evita doble actualización.
- `AC-AUTH-013-04`: recargar después de guardar muestra el valor persistido.
- `AC-AUTH-013-05`: los cambios no alteran roles, membresías ni credenciales.

#### Reglas de negocio

- `RN-AUTH-013-01`: el usuario solo modifica su propio perfil, salvo operaciones administrativas separadas.
- `RN-AUTH-013-02`: cambios de email requieren un flujo de verificación y no se aplican como texto libre inmediato si el proveedor lo restringe.
- `RN-AUTH-013-03`: campos profesionales configurables no deben usarse para autorización.

#### Requisitos no funcionales

- `RNF-AUTH-013-01`: validación server-side, protección contra mass assignment y payload mínimo.
- `RNF-AUTH-013-02`: controles accesibles, focus al error, feedback no ambiguo y soporte de teclado móvil.
- `RNF-AUTH-013-03`: comando idempotente o protegido contra doble submit y retry controlado.

### US-AUTH-014 — Gestionar preferencias personales

Como usuario, quiero ajustar mis preferencias básicas, para que CasePilot respete mi idioma, zona horaria y forma de recibir recordatorios.

#### Descripción

Esta historia permite adaptar CasePilot a la forma de trabajo de cada persona, comenzando por idioma, zona horaria y notificaciones. Los cambios deben ser comprensibles y aplicarse sin alterar permisos ni datos de negocio.

#### Criterios de aceptación

- `AC-AUTH-014-01`: el usuario puede consultar y actualizar preferencias disponibles para el MVP.
- `AC-AUTH-014-02`: la zona horaria se aplica a fechas y vencimientos mostrados por el producto.
- `AC-AUTH-014-03`: una preferencia inválida o no soportada se rechaza con una alternativa clara.
- `AC-AUTH-014-04`: cambiar preferencias no cambia permisos ni el tenant.
- `AC-AUTH-014-05`: el valor persiste y se aplica después de recargar o iniciar sesión nuevamente.

#### Reglas de negocio

- `RN-AUTH-014-01`: locale y zona horaria son preferencias de presentación; los timestamps persistidos deben conservar una representación inequívoca.
- `RN-AUTH-014-02`: las notificaciones requieren consentimiento y capacidad disponible; desactivar no borra recordatorios de negocio.
- `RN-AUTH-014-03`: las preferencias por workspace podrán sobrescribir las personales solo mediante una regla futura explícita.

#### Requisitos no funcionales

- `RNF-AUTH-014-01`: no depender exclusivamente de APIs web; usar valores estándar y fallback documentado.
- `RNF-AUTH-014-02`: controles y mensajes accesibles, incluyendo cambios con efecto global.
- `RNF-AUTH-014-03`: persistencia segura, validada y con compatibilidad futura web/native.
