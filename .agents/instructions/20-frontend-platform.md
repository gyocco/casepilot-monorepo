# 20 — Frontend Angular, Material, Tailwind y Capacitor

## Fuentes obligatorias

Para trabajo frontend DEBE leer [arquitectura frontend](../../docs/architecture/frontend-architecture.md), [reglas FRT-001 a FRT-012](../../docs/architecture/frontend-architecture-rules.md) y [cobertura de los validadores](../../tools/frontend-architecture/README.md). El catálogo FRT es la fuente normativa; esta instrucción organiza su aplicación. La ubicación global sigue [arquitectura del monorepo](../../docs/architecture/monorepo-architecture.md).

La SPA implementa Angular 21 LTS/TypeScript, Angular Material y Tailwind. Material se consume mediante `@casepilot/pilot-ui-kit`. La decisión del [ADR 0020](../../docs/adr/0020-frontend-foundation-and-theming.md) sustituye Ionic Angular para la SPA; mobile conserva la futura composición Capacitor y sus adaptadores sin imponer ahora un segundo sistema de componentes.

## Organización y componentes

- `src/app/` compone providers y rutas; `src/shell/` contiene layout/navegación transversal; `src/features/<feature>/` agrupa rutas, páginas y responsabilidades relacionadas.
- Cuando exista contenido, usa `pages/`, `components/`, `state/`, `data-access/` y `models/` dentro de la feature. La UI llama a fachadas/estado; los clientes y mappers permanecen en data-access.
- Capacidades de varias features de la app pertenecen a `core/<capability>/` o `shared/<capability>/`; no conocen features. Auth control, mensajes y notificaciones futuros siguen esa propiedad, sin carpetas vacías ni implementación ficticia.
- UI general reutilizable pertenece a `src/libs/frontend/pilot-ui-kit/`; no incluye rutas, permisos ni negocio de CasePilot. Usa su entrada pública.
- Componentes standalone/OnPush, inputs/outputs tipados, TypeScript y templates estrictos. Usa identidad estable y `track` en listas. Estado derivado se calcula desde una fuente de verdad; recursos/suscripciones tienen dueño y liberación.
- Angular Router carga features de forma lazy. La UI consume APIs NestJS y contratos; autorización/negocio se validan en backend.

## Temas, recursos y Tailwind

- Colores de componentes, estilos, templates y SVG DEBEN usar roles del kit: `PILOT_COLOR`, `PILOT_COLOR_VARIABLE`, nombres CSS registrados o utilidades semánticas como `bg-surface`/`text-primary`. Se prohíben valores literales y paletas Tailwind predeterminadas.
- Los valores concretos solo son datos de la paleta base o de `src/theme/*.theme.ts`. No se redefinen variables de color en consumidores.
- Logos, iconos, imágenes, GIFs/animaciones y vídeos se resuelven por nombre con `pilot-asset`. La app instala archivos en `public/themes/` y paths en manifiestos; una variante de tema cambia sus recursos sin editar componentes.
- Respeta el fallback al tema inicial y reduced motion. Nuevos formatos requieren un renderer/adaptador y pruebas propios.
- Tailwind organiza layout, spacing y mejoras responsive; CSS local resuelve reglas que no convenga expresar como utilities. Mantén nombres de clases detectables por el compilador.

## Mobile-first y accesibilidad

- El mínimo móvil usa estilos sin prefijo; `sm:`/`md:`/`lg:` son mejoras para pantallas mayores. Evita anchos fijos, overflow horizontal y acciones solo hover.
- Usa HTML semántico y componentes del kit. Verifica nombres accesibles, focus visible, contraste, touch targets, teclado, safe areas, orientación y contenido largo.
- Comprueba carga/error/vacío/reintento/offline cuando haya comportamiento; el login inicial solo es un placeholder y no simula autenticación.
- No omitas sanitización Angular ni distribuyas APIs web/nativas por componentes. Capacidades de plataforma se encapsulan en adaptadores y se prueban con fallback web.

## Configuración y verificaciones

Angular CLI gestiona desarrollo/build; todo valor incorporado a environments, bundle o archivos servidos al cliente es público. No importes backend/Node, persistencia, SDKs administrativos, claves privadas ni tokens privilegiados. Los proveedores mantienen su fuente en [infraestructura](../../docs/architecture/infrastructure-providers.md); Firebase Authentication y despliegues siguen pendientes.

Desde la raíz ejecuta `pnpm check:web` para cambios frontend/kit o de sus reglas. Incluye tipos, lint, builds, pruebas de kit/SPA, checkers/regresiones y Playwright/axe en móvil/escritorio. Instala Chromium una vez como indica el [README web](../../src/apps/casepilot/casepilot-web/README.md). No declares cobertura total de semántica, lectores de pantalla, secretos, permisos o dispositivos a partir de checks estáticos; consulta la matriz y añade evidencia proporcional.

Para modificar reglas, aplica [architecture-rules-sync](../skills/architecture-rules-sync/SKILL.md) y sincroniza normativa, diseño, tooling, regresiones y cobertura en el mismo cambio. El gate backend no certifica el frontend.

## Referencias

- [Guía Angular](https://angular.dev/style-guide), [componentes](https://angular.dev/guide/components), [Router](https://angular.dev/guide/routing) y [formularios tipados](https://angular.dev/guide/forms/typed-forms).
- [Material 21: temas](https://v21.material.angular.dev/guide/theming).
- [Tailwind mobile-first](https://tailwindcss.com/docs/responsive-design) y [Angular](https://tailwindcss.com/docs/installation/framework-guides/angular).
- [Capacitor](https://capacitorjs.com/docs) y [workflow](https://capacitorjs.com/docs/basics/workflow).
