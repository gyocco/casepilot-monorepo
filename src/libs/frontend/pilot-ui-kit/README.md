# Pilot UI Kit

`@casepilot/pilot-ui-kit` es una librería Angular 21 de UI general, temas semánticos y recursos por nombre. CasePilot Web es su consumidor inicial; otras apps Angular compatibles son consumidores planificados. No contiene rutas, autenticación de producto, permisos ni clientes API.

## API pública

- `PilotSurfaceComponent`: contenedor Material con nombre accesible y contenido proyectado.
- `PilotAssetComponent`: renderer por nombre para imagen/icono SVG, animación de imagen/GIF o vídeo. Usa `alt` para contenido significativo o `decorative=true` para decoración; vídeos requieren nombre accesible, controles y no autoplay.
- `PILOT_COLOR_VARIABLE`: nombres de variables CSS por rol; `PILOT_COLOR`: referencias `var(...)` para TypeScript; `PilotColors`: contrato completo de paleta.
- `DEFAULT_PILOT_COLORS`: única paleta base. Valores concretos solo en este conjunto o manifiestos de tema; componentes nunca los duplican.
- `providePilotThemes`, `PilotThemeService`, `PilotThemeRegistry`, `PilotTheme` y `PilotAsset`: configuración, cambio observable, validación y fallback de recursos.
- `PILOT_THEME_HOST`/`PilotThemeHost`: frontera DOM/reduced motion inyectable, con fallback sin DOM al no ejecutarse en navegador.
- `@casepilot/pilot-ui-kit/theme.scss`: roles Material globales; `@casepilot/pilot-ui-kit/tailwind.css`: utilidades de color semánticas sin paleta predeterminada.

Consume únicamente estas entradas. No importes `src/`, `dist/` ni componentes por paths privados. La aplicación depende del paquete mediante `workspace:*`; debe construirlo antes de compilar. El paquete requiere peers Angular/Common/Forms/CDK/Material 21 y RxJS 7.8 compatibles, y no depende de ninguna app/backend.

## Ejemplo de configuración

```typescript
import { DEFAULT_PILOT_COLORS, providePilotThemes } from '@casepilot/pilot-ui-kit';

const providers = [providePilotThemes({
  initialTheme: 'default',
  themes: [{
    id: 'default',
    colorScheme: 'light',
    colors: DEFAULT_PILOT_COLORS,
    assets: { 'brand.logo': { kind: 'image', src: 'themes/default/logo.svg' } },
  }],
})];
```

El ejemplo pertenece a un manifiesto de la app. Sus componentes usan el nombre `brand.logo`, preferentemente a través de sus constantes locales, y `pilot-asset`; nunca el path. Los nombres pueden definir logos, imágenes, iconos y estados/animaciones sin modificar la librería. Copia los archivos a una carpeta pública de la app y registra paths relativos compatibles con su base URL/Capacitor.

Una variante registra todos los colores y puede sobrescribir solo algunos recursos; los restantes usan el tema inicial. `setTheme('christmas')` actualiza variables globales y componentes ya renderizados. IDs/nombres inexistentes, URLs inseguras, roles ausentes y GIFs sin alternativa estática fallan explícitamente. `kind: 'animation'` exige `reducedMotionSrc`; formatos no soportados como Lottie requieren un adaptador/renderer nuevo.

## Build y verificaciones

Desde la raíz:

```bash
pnpm build:ui-kit
pnpm check:ui-kit
pnpm check:frontend:architecture
pnpm test:frontend:architecture
```

`watch:ui-kit` actualiza el bundle usado por el dev server. ng-packagr genera Angular Package Format en `dist/`: bundle FESM, declaraciones en `types/` y estilos. Los exports del manifest workspace apuntan a `dist/`; [finalize-package.mjs](tools/finalize-package.mjs) normaliza los subpaths de estilos del manifest distribuible a su propia raíz. Los avisos de ng-packagr al reemplazar condiciones de export de la raíz reflejan esa diferencia de ubicación; no se omiten tipos ni se añaden declarations ficticias.

Las [pruebas](test/unit/theme.spec.ts) consumen el paquete compilado para acreditar metadata real de inputs Angular, cambio de recursos, fallback, validación, reduced motion y vídeo. Las pruebas propias permanecen aquí; el [gate compartido](../../../../tools/frontend-architecture/README.md) cubre sus fronteras con la app. Obligaciones: [catálogo FRT](../../../../docs/architecture/frontend-architecture-rules.md).
