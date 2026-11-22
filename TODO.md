# TODO

La fuente canónica y actualizada de pendientes, roadmap y próximos pasos de CasePilot vive en:

- [Roadmap, pendientes y próximos pasos](docs/project-management/roadmap-and-next-steps.md)

Resumen de foco inmediato:

1. Ejecutar `pnpm check:backend:integration` y smoke test local con Docker Desktop activo (cierre del Bloque A).
2. Implementar el **Bloque B** (CI backend, Dockerfile API, Terraform para DEV en Google Cloud con OIDC y pipelines `deploy-dev.yml`).
3. Evaluar mejora de validación de requests CQRS sobre `@casepilot/validation` y continuar con las features de producto en `casepilot-web`.
