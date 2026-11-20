# 0022 — Autenticación con Firebase Auth y autorización en Application

- Estado: aceptada e implementada.
- Fecha: 2026-11-20.
- Alcance: `@casepilot/auth`, CasePilot API, SPA Angular (`casepilot-web`), `@casepilot/pilot-ui-kit` y validadores arquitectónicos.
- Evoluciona: [ADR 0015](0015-professional-services-database-crud.md) y [ADR 0020](0020-frontend-foundation-and-theming.md).

## Contexto

En el [ADR 0015](0015-professional-services-database-crud.md), los 28 recursos CRUD se mantuvieron públicos temporalmente y en el [ADR 0020](0020-frontend-foundation-and-theming.md) el login de la SPA quedó como placeholder sin formulario ni integración. Para habilitar el acceso seguro de usuarios reales y comprobar de punta a punta autenticación y autorización entre SPA y API sin acoplar el núcleo de negocio a Firebase, es necesario introducir verificación técnica de tokens, vínculo persistente con `User`, políticas de autorización en `Application` y una pantalla mínima de login y perfil en la SPA.

## Decisión

1. **Librería backend reutilizable `@casepilot/auth` (`src/libs/backend/auth/`, CPA-005)**:
   - Entrada pública pura `@casepilot/auth`: define `AuthProvider`, `VerifiedIdentity`, `TokenVerifier` y `parseBearerToken`, sin dependencias de NestJS, Firebase ni Node.
   - Adaptador `@casepilot/auth/firebase`: encapsula `firebase-admin` para verificar Firebase ID Tokens (con soporte explícito a `FIREBASE_AUTH_EMULATOR_HOST` únicamente en `APP_ENV=local`), normalizando cualquier fallo a `UnauthorizedError` sin exponer detalles internos del SDK.
   - Adaptador `@casepilot/auth/nestjs`: provee `BearerAuthGuard` (registrado globalmente vía `APP_GUARD`), `@PublicEndpoint()` y `@CurrentIdentity()`. El guard solo ejecuta verificación técnica de identidad; nunca consulta repositorios de negocio ni decide permisos (`BCK-003`).
2. **Protección por defecto de la API (reemplaza la excepción pública de ADR 0015)**:
   - Todas las rutas HTTP requieren `Authorization: Bearer <idToken>` por defecto.
   - Únicamente las sondas técnicas `GET /health` y `GET /health/database` llevan `@PublicEndpoint()`. Un checker `ts-morph` en `Presentation` prohíbe usar `@PublicEndpoint()` en controllers de producto.
3. **Vínculo de identidad persistente (`user_identities`)**:
   - Migración versionada y reversible `1790985600000-create-user-identities.ts` crea la tabla `user_identities(id, created_at, updated_at, version, user_id, provider, subject)` con FK a `users(id)` y restricción `UNIQUE(provider, subject)`.
   - `UserIdentity` y `UserIdentityRepository` respetan `BCK-002`, `BCK-009`, `BCK-021` y `CPA-003`.
4. **Autorización exclusiva en `Application` (`BCK-001`, `BCK-004`, `BCK-006`)**:
   - Todo `*Request` de operación protegida incluye `actor: VerifiedIdentity` tipado (nunca objetos HTTP/Nest).
   - `application/shared/authorization.ts` resuelve `VerifiedIdentity → UserIdentity → User` activo (`status === 'ACTIVE'`) y verifica pertenencia activa (`Member` con `status === 'ACTIVE'`) y rol permitido en el `BusinessAccount`:
     - Lecturas tenant-scoped: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`.
     - Escrituras tenant-scoped generales: `OWNER`, `ADMIN`, `MEMBER`.
     - Administración de cuenta/miembros (`PATCH`/`DELETE` de `business-accounts`, escrituras en `members`): `OWNER`, `ADMIN`.
     - Recursos globales: `POST /business-accounts` está permitido a cualquier usuario activo y crea atómicamente su membresía `OWNER` dentro del mismo `UnitOfWork`; `GET /business-accounts/:id` exige membresía activa en esa cuenta; `GET /business-accounts` exige usuario activo y devuelve únicamente las cuentas donde posee membresía activa; `users` permite `GET`/`PATCH`/`DELETE` propios o por `OWNER`/`ADMIN` de una cuenta compartida, y `POST`/`GET` listado a `OWNER`/`ADMIN` activos.
   - Cualquier falta de identidad provista o permiso insuficiente devuelve `403 ForbiddenError` (sin filtrar existencia de recursos ajenos).
5. **Separación Command vs Query en `application/auth/` (`BCK-013`, `BCK-023`)**:
   - `POST /auth/me/bootstrap` (`bootstrap-current-user` — Command): dentro de un `UnitOfWork`, resuelve el usuario vinculado o aprovisiona idempotentemente `User`, `UserIdentity`, un `BusinessAccount` personal inicial y su `Member` con rol `OWNER` (o vincula por email verificado si el `User` ya existía sin identidad).
   - `GET /auth/me` (`get-current-user-profile` — Query pura sin escrituras): devuelve perfil del usuario y sus membresías activas con resumen de `BusinessAccount`.
   - `PATCH /auth/me` (`update-current-user-profile` — Command): actualiza explícitamente campos propios permitidos (`firstName`, `lastName`, `displayName`, `locale`, `timezone`) con versión optimista (`BCK-007`, `BCK-011`).
6. **Integración mínima en SPA (`casepilot-web`) y evolución de `FRT-009`**:
   - Se actualiza `FRT-009` para habilitar el login real con Firebase Authentication a través de `core/auth/` (manteniendo prohibida la simulación de sesión en producción).
   - `casepilot-web` añade `core/config/` (configuración pública `app-config.json` por ambiente sin secretos), `core/auth/` (adaptador `firebase/auth` con soporte a emulador solo cuando `authEmulatorUrl` está configurado en local, `AuthFacade`, `authGuard`, `guestGuard`, `authTokenInterceptor` restringido a `apiBaseUrl`), `core/http/` (Problem Details RFC 9457), login real en `/auth/login` y pantalla mínima protegida `/profile` (`features/profile/`) que demuestra autenticación (`POST /auth/me/bootstrap`, `GET /auth/me`, `PATCH /auth/me`) y autorización real (`GET /business-accounts/:id` con éxito `200` en cuenta propia y `403 Forbidden` controlado en cuenta ajena).
   - `@casepilot/pilot-ui-kit` encapsula los controles Material mínimos necesarios (`pilot-button`, `pilot-text-field`, `pilot-banner`, `pilot-badge`) usando únicamente tokens `PILOT_COLOR` (`FRT-004`, `FRT-012`).

## Alternativas consideradas

- Auto-provisioning dentro de `GET /auth/me`: descartado porque violaría `BCK-013` (una query no debe mutar estado).
- Almacenar `firebaseUid` directamente como columna en `users`: descartado para mantener `User` desacoplado del proveedor de identidad y soportar múltiples identidades.
- Resolver roles/permisos en un Guard NestJS consultando la base de datos: descartado porque violaría `BCK-001`, `BCK-003` y `BCK-006`.

## Consecuencias

- Domain y Application permanecen libres de `firebase-admin`, `firebase`, `@google-cloud/*` y adaptadores NestJS, verificado por ESLint y dependency-cruiser con regresiones negativas.
- `local` opera completamente aislado de GCP DEV mediante Docker Compose (PostgreSQL 18 + Firebase Auth Emulator).
- Los tests unitarios e integración acreditan flujos positivos y negativos (`401`, `403`, `200`, `201`) sin depender de servicios remotos.
