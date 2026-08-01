# 10 — Arquitectura y límites

## Capas recomendadas

Mantén una dirección de dependencias simple:

```text
apps/web
  ├── páginas, rutas y composición de features
  ├── packages/ui-components
  ├── packages/domain-models
  ├── packages/supabase-client
  └── packages/platform

packages/domain-models
  └── reglas y tipos puros, sin React, Ionic ni Supabase

packages/supabase-client
  └── SDK, tipos generados y mapeo entre datos persistidos y dominio

packages/supabase-admin
  └── operaciones privilegiadas en servidor o funciones, nunca en el bundle cliente

supabase/
  ├── migrations y schemas
  ├── seed.sql
  └── functions/<name>/
```

Regla principal: `apps` puede consumir `packages`; `packages` NO puede importar desde `apps`. La lógica de dominio no debe depender de una biblioteca de UI ni de una implementación concreta de persistencia.

## Dónde colocar cada cosa

### `apps/web/src/`

Usa esta carpeta para composición específica de la aplicación:

- `app/`: bootstrap, providers y composición raíz;
- `routes/` o `pages/`: navegación y pantallas completas;
- `features/`: casos de uso de la aplicación cuando tengan UI y orquestación propia;
- `components/`: componentes locales a esta app;
- `hooks/`: hooks locales de composición, no servicios de datos globales;
- `lib/`: integración local muy pequeña y sin candidato real a paquete;
- `theme/` y `assets/`: estilos, tokens y recursos.

No crees todas estas carpetas por adelantado. Añade solo las que correspondan al código real.

### `packages/`

Un paquete debe ser reusable, testeable y tener una frontera clara. Preferencias:

- `ui-components`: componentes presentacionales, accesibles y agnósticos de una pantalla concreta;
- `domain-models`: tipos, validadores y reglas de negocio puras;
- `supabase-client`: consultas y comandos tipados, sin JSX;
- `supabase-admin`: operaciones que requieren privilegios, con una frontera server-only explícita;
- `platform`: interfaces de capacidades como cámara, archivos, biometría, notificaciones o almacenamiento.

No pongas en un paquete un componente que solo sirve a una pantalla. No hagas que `domain-models` conozca `IonButton`, `supabase-js`, `window` o `Capacitor`.

## Reglas de diseño

- Una función o componente debe tener una responsabilidad explicable en una frase.
- Modela los estados relevantes explícitamente: loading, success, empty, error y offline cuando aplique.
- Valida y transforma datos en los bordes; no propagues `unknown` o respuestas crudas de Supabase por toda la UI.
- Evita dependencias circulares y barrels que oculten ciclos. Si un import necesita muchos niveles `../../`, revisa la frontera.
- Usa contratos tipados entre capas. Los tipos generados de Supabase describen persistencia; los modelos de dominio describen comportamiento del producto.
- Una nueva dependencia externa necesita justificar su necesidad, impacto en bundle web/mobile, licencia, mantenimiento y alternativa nativa/web.
- Cambios transversales de arquitectura, persistencia, autenticación o plataforma requieren un ADR en `docs/06-decisions/`.

## Regla de reusabilidad

Antes de copiar lógica:

1. Comprueba si ya existe un paquete o servicio equivalente.
2. Si la lógica es de dominio y no depende de UI, considera `packages/domain-models`.
3. Si es acceso a datos, usa `packages/supabase-client`.
4. Si es visual y se repetirá, usa `packages/ui-components`.
5. Si depende de capacidades del dispositivo, usa `packages/platform` con fallback web.

Una abstracción compartida debe tener consumidores reales o un contrato claramente planificado; no conviertas `packages/` en un cajón de utilidades sin dueño.
