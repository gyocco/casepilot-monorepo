# 0019 — SPA Angular y TypeScript

- Estado: aceptada; base Angular implementada. Propuesta de Ionic para la SPA sustituida por Material en [ADR 0020](0020-frontend-foundation-and-theming.md).
- Fecha: 2026-10-04.
- Alcance: SPA CasePilot y documentación frontend/web/mobile relacionada.

## Contexto

Al tomar esta decisión, web y mobile eran placeholders. Las guías anteriores contemplaban React/Vite/Ionic React, pero el usuario decidió usar Angular y TypeScript para la SPA. La decisión debe reflejarse en las fuentes canónicas antes de crear la aplicación.

## Decisión

Usar Angular y TypeScript para `src/apps/casepilot/casepilot-web/`, Angular Router para navegación y Angular CLI para la configuración y el build de la SPA. Se conservan Ionic y Tailwind CSS; la integración Ionic pasa a Ionic Angular y se mantiene la compatibilidad futura con Capacitor.

Firebase Hosting publicará el build estático conforme al [ADR 0018](0018-infrastructure-providers-and-environments.md). Las instrucciones frontend vigentes están en [20 — Frontend y plataforma](../../.agents/instructions/20-frontend-platform.md) y la ubicación de código en [Arquitectura del monorepo](../architecture/monorepo-architecture.md).

Las convenciones de componentes, templates, servicios, navegación y configuración pública sustituyen las referencias activas a hooks, JSX, React Router, componentes Ionic React y variables `VITE_*`. Los paquetes/builds internos que use Angular CLI no constituyen una decisión de gestionar la app como proyecto Vite independiente.

## Alternativas

- React/Vite/Ionic React: propuesta anterior sustituida por la elección explícita de Angular/TypeScript.
- Cambiar además backend, contratos o persistencia: no es necesario para esta decisión.

## Consecuencias

- Angular se limita a la frontera de UI y no introduce dependencias de framework en el negocio backend.
- Las instrucciones y skills deben usar convenciones Angular/Ionic Angular, conservando mobile-first, accesibilidad, tipos estrictos y adaptadores web/native.
- La configuración incorporada al bundle es pública; las credenciales de base y administrativas siguen en backend/CI/CD.
- Este ADR se aceptó inicialmente como documentación. La implementación de SPA/kit y sus validadores se registra después en ADR 0020.
