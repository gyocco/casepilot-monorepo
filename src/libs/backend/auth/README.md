# Auth

`@casepilot/auth` reúne contratos puros de verificación de identidad, un adaptador técnico de Firebase Admin y un guard global NestJS para APIs backend. No contiene usuarios del producto, roles, membresías ni reglas de autorización (`BCK-001`, `BCK-003`, `BCK-015`, `CPA-005`).

## Entradas públicas

- `@casepilot/auth`: `AuthProvider`, `VerifiedIdentity`, `TokenVerifier` y `parseBearerToken`. Entrada pura sin dependencias de NestJS, Firebase ni Node.
- `@casepilot/auth/firebase`: `FirebaseTokenVerifier` sobre `firebase-admin` (soporta `FIREBASE_AUTH_EMULATOR_HOST` únicamente cuando el host pasa `emulatorHost` explícitamente). Solo `Infrastructure`/composición.
- `@casepilot/auth/nestjs`: `NestAuthModule`, `BearerAuthGuard`, `PublicEndpoint`, `CurrentIdentity` y `TOKEN_VERIFIER`. Solo `Presentation`/composición.

No usar deep imports ni importar adaptadores `/firebase` o `/nestjs` desde `Domain` o `Application`.

## Verificación

Desde la raíz:

```bash
pnpm check:auth
pnpm build:auth
pnpm test:auth
```

Decisión: [ADR 0022](../../../../docs/adr/0022-firebase-authentication-and-application-authorization.md).
