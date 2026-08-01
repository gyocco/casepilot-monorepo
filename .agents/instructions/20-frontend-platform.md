# 20 — Frontend, React, Vite, Tailwind, Ionic y Capacitor

## React y TypeScript

- Usa componentes funcionales y hooks; no introduzcas class components.
- Respeta las Rules of Hooks: hooks solo en el nivel superior de componentes o custom hooks, nunca en condiciones, loops, callbacks ni después de un return temprano.
- Usa `useEffect` para sincronizar con sistemas externos: suscripciones, timers, APIs del navegador o widgets no React. No lo uses para calcular valores derivados ni para encadenar el flujo normal de datos.
- Prefiere props explícitas, composición y componentes pequeños frente a componentes monolíticos con muchos booleanos.
- Mantén TypeScript estricto. Usa tipos de dominio, `unknown` con type guards y uniones discriminadas. `any`, `@ts-ignore` y `as` sin una razón verificable requieren justificación.
- Usa keys estables de dominio; no uses el índice del array si el orden o la identidad pueden cambiar.
- Mantén el estado lo más cerca posible de su consumidor. Usa contexto solo para dependencias verdaderamente transversales y no conviertas contexto en un store global accidental.
- No dupliques estado derivado. Calcula a partir de la fuente de verdad o usa un selector memoizado cuando exista una medición real.

Referencias: [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) y [`useEffect`](https://react.dev/reference/react/useEffect).

## Estructura de la app

En `apps/web/src/`, separa navegación, features, componentes locales, hooks de composición, integración y tema. Una pantalla debe orquestar; un componente de UI no debe conocer credenciales, queries o reglas de autorización.

La cadena recomendada es:

```text
Page/Route -> Feature container -> Hook/use-case -> Package client/domain -> API
                  └-> UI components
```

La carga, error, vacío, éxito, reintento y estado offline deben modelarse antes de dar por terminada una pantalla.

## Ionic React

- Usa `IonApp` como raíz de la aplicación y `IonRouterOutlet`/React Router para navegación.
- Cada pantalla enrutable DEBE tener `IonPage` como componente raíz. Dentro de ella usa la estructura Ionic apropiada (`IonHeader`, `IonToolbar`, `IonContent`, `IonFooter`) en vez de reproducirla con divs.
- Prefiere componentes Ionic para navegación, botones, listas, formularios, modales, alerts, loading y gestos cuando exista un componente equivalente.
- Usa `ionicons/icons` con imports explícitos; no cargues un catálogo completo ni dependas de nombres de iconos dinámicos sin necesidad.
- Respeta el ciclo de navegación, botón atrás de Android, teclado, safe areas, scroll y transiciones de Ionic.
- No anides contenedores con scroll sin una razón clara. Define un único dueño del scroll por pantalla.

La guía oficial de estructura, `IonPage` y Capacitor está en [Ionic React Quickstart](https://ionicframework.com/docs/react/quickstart) y la integración general en [Ionic React Overview](https://ionicframework.com/docs/react/overview).

## Mobile-first obligatorio

- Diseña y prueba primero en un viewport móvil estrecho. El layout base sin prefijo Tailwind representa móvil; `sm:`, `md:`, `lg:` y demás variantes mejoran pantallas mayores.
- No uses `sm:` para definir el diseño móvil. Usa utilidades sin prefijo para la base y añade overrides progresivos.
- Usa layout fluido, `max-w-*`, `min-h-*`, grids flexibles y container queries cuando aporten reutilización. Evita anchos fijos que obliguen a hacer scroll horizontal.
- Las acciones táctiles deben ser cómodas, visibles y operables sin hover. No hagas que una acción crítica dependa solo de `:hover`.
- Respeta `prefers-reduced-motion`, focus visible, contraste, labels de formulario, tamaño de texto y navegación por teclado.
- Prueba estados de teclado abierto, contenido largo, orientación horizontal, safe area, modo oscuro si aplica y viewport de escritorio.
- Una decisión visual que solo funciona en escritorio se considera un defecto, no un detalle pendiente.

Tailwind documenta el enfoque [mobile-first responsive](https://tailwindcss.com/docs/responsive-design). Esta regla es obligatoria para web y sirve como base para Android/iOS.

## Tailwind CSS y estilos

- Usa Tailwind para layout, spacing, tipografía y estados repetibles. Usa CSS global o CSS del componente para tokens, estilos de Ionic y reglas que realmente no expresen bien como utilities.
- Define colores, radios, tipografías, sombras y breakpoints como tokens; evita hexadecimales y valores arbitrarios repetidos en JSX.
- Evita `!important`, selectores globales agresivos y estilos inline salvo para valores dinámicos que no puedan representarse como clase.
- No mezcles dos sistemas de spacing o breakpoints sin documentarlo. La fuente de verdad del tema debe permanecer en `apps/web/src/theme/` o en el paquete de UI cuando sea compartida.
- Revisa que las clases dinámicas sean detectables por el compilador de Tailwind; no construyas nombres completos de clase a partir de strings arbitrarios.

## Vite y configuración

- Solo variables con prefijo `VITE_` pueden llegar al bundle cliente y, por definición, deben considerarse públicas.
- Nunca pongas secretos, passwords, tokens administrativos o URLs privadas protegidas en `VITE_*`.
- Trata las variables como strings y valida/convierte tipos en un módulo de configuración único.
- Mantén `.env.example` con nombres y ejemplos no sensibles. Los archivos `.env.local` y equivalentes no se versionan.
- No importes APIs Node-only, `supabase-admin` ni módulos server-only desde código que Vite pueda incluir en el navegador.
- Si cambia la configuración de Vite, comprueba dev, build, preview y el futuro build de Capacitor.

Referencia oficial: [Vite Env Variables and Modes](https://vite.dev/guide/env-and-mode.html).

## Compatibilidad futura con Capacitor

- Mantén la lógica de producto y dominio independiente de browser y native.
- Encapsula cámara, archivos, notificaciones, biometría, almacenamiento, compartir y sensores detrás de interfaces/adaptadores en `packages/platform` o una frontera equivalente.
- Cada capability debe tener implementación web/fallback, implementación Capacitor cuando corresponda, detección de disponibilidad, manejo de permisos, manejo de error y prueba.
- No llames APIs nativas directamente desde componentes de negocio. El componente pide una capacidad; el adaptador decide cómo resolverla.
- Evita asumir que existen `window`, hover, mouse, filesystem local, tamaño de pantalla fijo o conectividad continua.
- No persistas información sensible en almacenamiento web o nativo sin una decisión de seguridad documentada.
- Cuando se añadan plataformas `ios/` y `android/`, registra cambios de permisos, plugins, configuración nativa y pasos de build en `docs/04-operations/`.

Capacitor está diseñado para llevar una aplicación web a iOS, Android y web conservando una base de código compartida; consulta su [documentación oficial](https://capacitorjs.com/docs) y el [workflow de desarrollo](https://capacitorjs.com/docs/basics/workflow).
