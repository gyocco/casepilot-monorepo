# Verificación de arquitectura frontend

Analiza conjuntamente `casepilot-web/src/`, `pilot-ui-kit/src/` y los SVG de `casepilot-web/public/themes/`. Su fuente normativa es el [catálogo FRT](../../docs/architecture/frontend-architecture-rules.md); diseño en [arquitectura frontend](../../docs/architecture/frontend-architecture.md). No ejecuta código de producto ni accede a servicios remotos.

## Comandos desde la raíz

```bash
pnpm check:frontend:architecture
pnpm test:frontend:architecture
pnpm check:web
```

El primero ejecuta lint de tooling/regresiones y el gate de fuentes, configuración y grafo. El segundo prueba ejemplos permitidos y rechazados usando los checkers reales. `check:web` añade tipos Angular estrictos, lint, pruebas y builds de kit/SPA, y e2e Chromium. Instala Chromium una vez con `pnpm --dir src/apps/casepilot/casepilot-web exec playwright install chromium`.

## Implementación y alcance

- [check.mjs](check.mjs) descubre fuentes TS, HTML, CSS/SCSS y SVG y rechaza ámbitos vacíos. No ignora archivos de producto por ser difíciles de analizar.
- [source-rules.mjs](source-rules.mjs) usa ASTs ts-morph, Angular compiler y PostCSS/value-parser: metadata standalone/OnPush, colores, nombres de tokens, recursos, utilidades Tailwind y rutas eager. Analiza templates/styles inline y archivos externos, incluidos imports Angular con alias o namespace. Componentes requieren metadata estática y no se permite esconderla en strings calculados.
- [config-rules.mjs](config-rules.mjs) conserva flags TypeScript y Angular estrictos, incluidos overrides heredados y selección de fuentes no vacía.
- [eslint-rules.mjs](eslint-rules.mjs) se carga desde las configuraciones reales de [SPA](../../src/apps/casepilot/casepilot-web/eslint.config.mjs) y [kit](../../src/libs/frontend/pilot-ui-kit/eslint.config.mjs). Comprueba imports/exports/imports dinámicos literales, globals sin definición local y omisión de sanitización; angular-eslint comprueba templates y accesibilidad delimitada.
- [dependency-rules.mjs](dependency-rules.mjs) y [configuración del grafo](dependency-cruiser.config.mjs) comprueban ciclos, resolución, features, capas y apps/libs, con tipos, aliases y reexports. El [tsconfig del grafo](tsconfig.graph.json) resuelve la entrada pública del kit a sus fuentes para analizar indirectas; la compilación de producto consume su paquete Angular compilado. No sigue código de dependencias npm, Node o bundles generados.

Las regresiones multiproyecto viven en [tests/architecture/frontend](../../tests/architecture/frontend/). Las fixtures temporales se crean dentro de `build/frontend-architecture/`, con verificación de rutas antes de limpieza; no se agregan ejemplos inválidos a fuentes de producto.

## Cobertura por regla

| Regla | Evidencia ejecutable | Cobertura y límites |
| --- | --- | --- |
| FRT-001 | Grafo + ESLint + estructura TS; [dependencias](../../tests/architecture/frontend/dependencies.test.mjs), [ESLint](../../tests/architecture/frontend/eslint.test.mjs), [fuentes](../../tests/architecture/frontend/source-rules.test.mjs) | Completa para imports analizados, entrada pública y rutas TS admitidas; decidir si una capacidad es de producto requiere revisión. |
| FRT-002 | Grafo; [dependencias](../../tests/architecture/frontend/dependencies.test.mjs) | Completa para cross-feature/shared transitivo y UI → data-access directo. Estado → data-access es permitido; semántica de fachadas y negocio requiere revisión. |
| FRT-003 | Metadata AST, flags heredados, ngc/tsc, angular-eslint; [fuentes](../../tests/architecture/frontend/source-rules.test.mjs), [configuración](../../tests/architecture/frontend/config.test.mjs) | Completa para metadata explícita, flags y errores de compilación; ciclo de vida y responsabilidad requieren pruebas/revisión. |
| FRT-004 | AST de estilos/templates/TS, clases Tailwind y tokens; [fuentes](../../tests/architecture/frontend/source-rules.test.mjs) | Detecta literales de color, paletas conocidas, variables desconocidas y redefiniciones CSS. No demuestra todo valor calculado en runtime ni inspecciona píxeles de binarios; conserva revisión. |
| FRT-005 | AST de recursos/paths y renderer; [fuentes](../../tests/architecture/frontend/source-rules.test.mjs), [kit](../../src/libs/frontend/pilot-ui-kit/test/unit/theme.spec.ts) | Completa para literales analizados y sustitución por nombre; expresiones/URLs externas dinámicas requieren validación y revisión. |
| FRT-006 | Registro/host/servicio, [pruebas del kit](../../src/libs/frontend/pilot-ui-kit/test/unit/theme.spec.ts), [e2e de temas](../../src/apps/casepilot/casepilot-web/test/e2e/foundation.spec.ts) | Comportamiento de cambio, fallback, URLs, paleta completa, reduced motion del renderer y Material global. Nuevos renderers y contenido audiovisual requieren evidencia propia. |
| FRT-007 | ESLint + grafo; [regresiones ESLint](../../tests/architecture/frontend/eslint.test.mjs) | Completa para imports/globals reconocidos; APIs escondidas en otras dependencias o nuevas capacidades requieren ampliar detección. |
| FRT-008 | Imports/llamadas ESLint y URLs del registro; [ESLint](../../tests/architecture/frontend/eslint.test.mjs), [kit](../../src/libs/frontend/pilot-ui-kit/test/unit/theme.spec.ts) | Parcial. No certifica secretos, autorización, HTML remoto ni seguridad de proveedores. |
| FRT-009 | AST de imports eager y [pruebas de rutas](../../src/apps/casepilot/casepilot-web/test/unit/routes.spec.ts); e2e | Lazy routes y redirects acreditados para rutas iniciales; nuevas features deben añadir pruebas. |
| FRT-010 | Descubrimiento, config y grafo; regresiones de ámbitos vacíos/ciclos/imports irresolubles | Completa para los dos proyectos y extensiones declarados. Nuevas apps/libs/extensiones requieren integrar scope y regresiones antes de declarar cobertura. |
| FRT-011 | angular-eslint + Playwright/axe en 360×740 y 1440×900; [e2e](../../src/apps/casepilot/casepilot-web/test/e2e/foundation.spec.ts) | Placeholder, teclado, skip link, overflow, tema y reglas axe. No sustituye lector de pantalla, UX real, dispositivos nativos ni futuros formularios/estados. |
| FRT-012 | ESLint de imports Material; [ESLint](../../tests/architecture/frontend/eslint.test.mjs), builds/consumo público | Completa para imports Material directos reconocidos; reutilización y contrato visual requieren revisión. |

Esta cobertura no redefine reglas backend ni certifica API, Firebase, Hosting, CI remoto o infraestructura. Usa [architecture-rules-sync](../../.agents/skills/architecture-rules-sync/SKILL.md) al evolucionar reglas y valida ambos sentidos documento ↔ checker. El [workflow de calidad frontend](../../.github/workflows/frontend-quality.yml) invoca el mismo gate local. Su ejecución remota y la protección de ramas aún requieren verificación/configuración en GitHub; no se realizan desde este tooling.
