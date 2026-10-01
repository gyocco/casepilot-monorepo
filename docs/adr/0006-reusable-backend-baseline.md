# 0006 — Base backend reutilizable y arquitectura particular

- Estado: aceptada e implementada.
- Fecha: 2026-10-01.
- Relacionadas: [ADR 0002](0002-backend-application-owned-business-logic.md), [ADR 0003](0003-base-api-and-health-checks.md) y [ADR 0005](0005-project-owned-tests.md).

## Contexto

Guía y reglas backend mezclaban responsabilidades reutilizables con nombres, rutas, endpoints y restricciones de CasePilot. Se solicita una base para múltiples proyectos, con arquitectura específica por proyecto.

## Decisión

- Renombrar guía como [backend-architecture-baseline.md](../architecture/backend-architecture-baseline.md): base NestJS/TypeORM con negocio exclusivo en Application.
- Renombrar catálogo como [backend-architecture-baseline-rules.md](../architecture/backend-architecture-baseline-rules.md): obligatorio para proyectos que adopten explícitamente esta base.
- Conservar BCK-001 a BCK-020 y sus exigencias, generalizando producto, rutas y herramientas. No retirar obligaciones ni admitir excepciones locales.
- Registrar en [casepilot-backend-architecture.md](../architecture/casepilot-backend-architecture.md) adopción íntegra por todo backend CasePilot y decisiones concretas de host, Health, PostgreSQL y checks.
- Mantener convenciones de carpetas y propiedad de pruebas en [monorepo-architecture.md](../architecture/monorepo-architecture.md), sin una guía global paralela en documentos backend.
- Cada producto registra alcance/adopción en arquitectura particular y ADR. Puede añadir restricciones compatibles; no flexibilizar reglas activas. Compartir repositorio no implica adopción.
- Sincronizar instrucciones, skills y enlaces. La skill del repositorio mantiene su alcance CasePilot y carga base más adopción.

## Alternativas

Mantener contenido exclusivo de CasePilot dificulta reutilización. Copiar el catálogo por API genera divergencia. Convertir reglas en recomendaciones perdería su carácter obligatorio.

## Consecuencias

La base puede reutilizarse sin endpoints, rutas, ADRs ni skills de CasePilot. Cada adopción registra decisiones y evidencia sin copiar el catálogo. La exclusión de Supabase permanece en las instrucciones y arquitectura particular de CasePilot.

La separación no cambia comportamiento de producto ni exigencias funcionales. Arquitecturas incompatibles requieren decisión explícita y normativa sincronizada antes de implementarse.
