# Deploy DEV — Firebase Hosting

Configuración de publicación de `casepilot-web` en Firebase Hosting para el ambiente `development` (DEV).

## Archivos

- [`firebase.json`](firebase.json):
  - Sirve el artefacto estático compilado en `src/apps/casepilot/casepilot-web/dist/browser`.
  - Aplica rewrite SPA (`** -> /index.html`) para rutas Angular (`/auth/login`, `/profile`, etc.).
  - Aplica cabeceras de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`).
  - Fuerza `Cache-Control: no-store, no-cache, must-revalidate` en `/app-config.json` para que cambios de configuración pública surtan efecto inmediato sin invalidar bundles.
  - Aplica caché inmutable de 1 año a recursos versionados por hash (`outputHashing: "all"`).

## Generación de `/app-config.json`

Antes de desplegar, el workflow [`.github/workflows/deploy-dev.yml`](../../.github/workflows/deploy-dev.yml) ejecuta [`tools/ci/generate-web-app-config.mjs`](../../tools/ci/generate-web-app-config.mjs) para escribir `dist/browser/app-config.json` exclusivamente con valores públicos de DEV (URL de Cloud Run + configuración web pública de Firebase, con `authEmulatorUrl: null`). Ningún secreto entra al artefacto web.

## Despliegue

El despliegue se realiza vía OIDC (`GOOGLE_APPLICATION_CREDENTIALS` emitido por `google-github-actions/auth`) apuntando al sitio DEV configurado en `FIREBASE_HOSTING_SITE`:

```bash
npx --yes firebase-tools deploy \
  --config deploy/dev/firebase.json \
  --project "$GCP_PROJECT_ID" \
  --only "hosting:${FIREBASE_HOSTING_SITE}" \
  --non-interactive
```

*(En `deploy-dev.yml` se inyecta `"site": "<FIREBASE_HOSTING_SITE>"` dinámicamente o mediante `firebase target:apply` sobre una copia temporal para desacoplar el `site_id` del archivo versionado.)*
