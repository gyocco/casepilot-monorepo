# 0020 — Base Angular LTS, Material, UI kit y temas

- Estado: aceptada.
- Fecha: 2026-10-04.
- Alcance: SPA, kit visual y validación de arquitectura frontend.

## Contexto

La SPA y el kit eran placeholders. El usuario solicita Angular en su rama LTS más reciente, Angular Material, Tailwind, arquitectura por features y un kit que permita cambiar colores y recursos sin modificar componentes. También exige reglas ejecutables y pruebas de sus verificadores.

## Decisión

Implementar Angular 21 LTS standalone y zoneless, Angular Router con features lazy, Material encapsulado por `@casepilot/pilot-ui-kit` y Tailwind CSS con colores semánticos. Las versiones exactas se fijan en manifests y lockfile.

Para esta SPA, Material sustituye la propuesta de Ionic Angular del [ADR 0019](0019-angular-spa.md); no se mezclan ambos sistemas de componentes. Se conserva mobile-first y la compatibilidad futura con Capacitor. Mobile sigue sin implementación y no requiere elegir ahora su sistema de componentes.

El kit publica roles/constantes de color, variables CSS globales, contratos de recursos, registro de temas y componentes generales. La app instala archivos y manifiestos. Solo las fuentes de paleta/manifiestos definen valores de color; la UI usa los tokens. Una variante Christmas demuestra sustitución de recursos y fallback sin añadir comportamiento al login.

Las [reglas frontend](../architecture/frontend-architecture-rules.md) tienen IDs FRT estables. Los validadores multiproyecto residen en `tools/frontend-architecture/`, con regresiones en `tests/architecture/frontend/`; las pruebas de producto permanecen en SPA/kit. El [diseño frontend](../architecture/frontend-architecture.md) y la cobertura delimitan qué requiere revisión o pruebas de comportamiento.

## Alternativas

- Angular 22: estable en soporte activo, pero todavía no LTS al verificar la solicitud.
- Ionic y Material en la misma SPA: duplica componentes y convenciones sin necesidad actual.
- Colores/paths en cada componente: impide sustituir temas de forma consistente y queda prohibido.
- Kit dentro de la SPA: impide mantener una frontera reutilizable entre aplicaciones.

## Consecuencias

- Login inicial solo presenta contenido placeholder; autenticación y diseño se implementarán después. **Evolución 2026-11-20:** [ADR 0022](0022-firebase-authentication-and-application-authorization.md) implementa login real con Firebase Authentication y pantalla mínima de perfil, actualizando `FRT-009`.
- El kit tiene build Angular Package Format, API pública y pruebas propias.
- El gate debe fallar ante imports incompatibles, colores/recursos literales y ámbitos vacíos, y mantener regresiones negativas.
- El workflow de calidad GitHub Actions invoca `pnpm check:web`. Su ejecución remota y la protección de ramas deben verificarse al incorporarlo a GitHub; el aprovisionamiento y los pipelines de despliegue siguen pendientes.
