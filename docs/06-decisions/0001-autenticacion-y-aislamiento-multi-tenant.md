# ADR 0001: Autenticación y aislamiento multi-tenant

- Estado: propuesta
- Fecha: 2026-08-02
- Alcance: identidad, autorización, espacios de trabajo y futuras capacidades web/native

## Contexto

CasePilot debe servir primero a profesionales independientes y luego a estudios pequeños. Una persona puede empezar sola y, en el futuro, pertenecer a varios espacios de trabajo. Clientes, casos y documentos son información sensible y no pueden quedar aislados únicamente por filtros de interfaz.

El repositorio ya contempla Supabase como plataforma para autenticación, datos, Storage, realtime y funciones server-side. La aplicación web debe compartir la mayor cantidad posible de código con futuras aplicaciones Capacitor/Ionic.

## Decisión propuesta

Adoptar una frontera de identidad y autorización basada en:

1. un proveedor de autenticación gestionado para credenciales y sesiones;
2. un perfil de producto separado de la identidad de autenticación;
3. espacios de trabajo (`tenant`) como límite lógico de datos;
4. membresías explícitas usuario–tenant con rol y estado;
5. autorización backend/RLS en cada operación, independientemente del tenant seleccionado por la UI;
6. cliente browser-safe para la aplicación y una frontera server-side para operaciones privilegiadas;
7. adaptadores de plataforma para diferencias web/native.

Supabase Auth, PostgreSQL/RLS, Storage y Edge Functions son la dirección compatible con el estado actual del monorepo, pero la decisión queda en estado `propuesta` hasta validar esquema, policies, pruebas locales y necesidades comerciales.

## Alternativas consideradas

### Identidad y autorización totalmente propias

Descartada como dirección inicial por aumentar la superficie de seguridad, mantenimiento y responsabilidad operativa antes de validar el producto.

### Un único espacio global por usuario, sin membresías

No es suficiente para estudios, colaboración ni aislamiento futuro. Puede simplificar el MVP, pero haría más costosa la evolución y no resuelve la frontera multi-tenant.

### Autorización solo en el cliente

Descartada. Ocultar rutas o botones no protege datos ni operaciones; la autorización debe verificarse en backend/RLS.

### Proveedor de identidad externo desacoplado desde el día uno

Permanece como alternativa futura si cambian las necesidades de SSO, compliance o escala. Introducirlo antes de validar los flujos agregaría complejidad estructural.

## Consecuencias

### Positivas

- Aislamiento explícito desde el modelo de dominio.
- Camino natural desde cuenta individual hacia equipos.
- Compatibilidad con web y Capacitor mediante contratos compartidos.
- Separación clara entre cliente browser-safe y operaciones privilegiadas.

### Costos y riesgos

- Se deben diseñar y probar migrations, RLS, Storage y políticas de membresía.
- Cambiar de proveedor de identidad posteriormente requerirá un adaptador y migración controlada.
- El tenant activo debe manejarse como contexto de UX sin transformarse en autoridad.
- Sesiones, deep links, permisos nativos y almacenamiento local requieren revisión específica.

## Validación pendiente

- modelo relacional y políticas negativas/positivas en Supabase local;
- flujos de expiración, refresh, logout y recuperación;
- catálogo de roles para profesional independiente y estudio;
- tratamiento de exportación, eliminación y retención de PII;
- soporte de correo, SSO y MFA según el mercado inicial;
- revisión de seguridad antes de marcar el ADR como `aceptada`.
