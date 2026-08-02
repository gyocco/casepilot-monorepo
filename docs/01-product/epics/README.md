# Épicas de CasePilot

Este directorio contiene la descomposición Product → Epic → Feature → User Story. La documentación actual es una línea base: la [Epic 1 — Autenticación](epic-01-authentication/README.md) está más detallada y las demás conservan una feature y una historia semilla para orientar la siguiente iteración.

## Índice

| ID | Épica | Documento |
| --- | --- | --- |
| EPIC-01 | Autenticación, identidad y espacios de trabajo | [Abrir](epic-01-authentication/README.md) |
| EPIC-02 | Gestión de clientes | [Abrir](epic-02-client-management.md) |
| EPIC-03 | Gestión de casos / expedientes / proyectos | [Abrir](epic-03-case-management.md) |
| EPIC-04 | Gestión documental | [Abrir](epic-04-document-management.md) |
| EPIC-05 | IA documental | [Abrir](epic-05-document-ai.md) |
| EPIC-06 | Base de conocimiento | [Abrir](epic-06-knowledge-base.md) |
| EPIC-07 | Generador documental | [Abrir](epic-07-document-generator.md) |

## Convención de cada épica

Cada documento debe explicar objetivo, actores, alcance, dependencias, fuera de alcance y criterios de salida. Luego debe enlazar sus features. Cada feature debe contener historias y cada historia debe incluir:

1. relato de usuario y valor;
2. una descripción clara del contexto, alcance y límites;
3. criterios de aceptación observables;
4. reglas de negocio;
5. requisitos no funcionales aplicables.

La arquitectura concreta se documenta en `docs/02-architecture/`, y las decisiones estructurales se registran en `docs/06-decisions/`.
