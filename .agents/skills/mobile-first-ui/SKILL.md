---
name: mobile-first-ui
description: Guía de diseño e implementación mobile-first web y native en CasePilot. Úsala para cualquier pantalla, componente, formulario, modal, navegación, layout, responsive behavior o cambio de tema.
metadata:
  short-description: Diseñar e implementar UI mobile-first web y native
---

# Skill: UI mobile-first web + native

## Cuándo usarla

Usa esta skill para cualquier pantalla, componente, formulario, modal, navegación, layout, responsive behavior o cambio de tema.

## Procedimiento

1. Identifica el flujo de usuario, el viewport móvil mínimo, el contenido largo y los estados de red.
2. Decide si el elemento es específico de `src/apps/casepilot/casepilot-web/` o `src/apps/casepilot/casepilot-mobile/`, o si es UI general reutilizable en `src/libs/frontend/`. Mantén rutas, estado y negocio específicos dentro de la app.
3. Para la SPA lee [arquitectura frontend](../../../docs/architecture/frontend-architecture.md) y [reglas FRT](../../../docs/architecture/frontend-architecture-rules.md). Usa HTML semántico, Angular Router y componentes Material encapsulados en `pilot-ui-kit`; un único scroll principal. La composición mobile futura conserva adaptadores y compatibilidad Capacitor.
4. Estiliza mobile-first: utilities Tailwind sin prefijo como base y variantes `sm`/`md`/`lg` solo como mejoras. Usa tokens de `theme` y evita valores arbitrarios repetidos.
5. Comprueba safe areas, teclado, orientación, touch targets, focus visible, reduced motion, contraste, texto largo y errores de validación.
6. No dependas de hover, mouse, `window`, filesystem del navegador o una capacidad nativa sin fallback.
7. Si requiere cámara, archivos, biometría, notificaciones, compartir o storage, define una interfaz y un adapter web/Capacitor en `src/libs/mobile/` cuando sea reusable, o junto a la app si solo tiene un consumidor; no llames el plugin desde la UI de negocio.
8. Prueba móvil estrecho, tablet/escritorio, teclado y navegación atrás. Documenta permisos o configuración nativa en el README de la app y en `docs/operations/` si son transversales.

## Checklist de salida

- [ ] La experiencia móvil es completa sin depender de breakpoint.
- [ ] La página usa la estructura Angular/kit y un único dueño del scroll.
- [ ] Los controles tienen nombre accesible y funcionan con teclado/touch.
- [ ] Existen estados loading, empty, error y success cuando aplican.
- [ ] No hay overflow horizontal ni acciones solo hover.
- [ ] Colores y recursos usan tokens/nombres del kit, sin valores o paths hardcoded en consumidores.
- [ ] El fallback web está definido para capacidades nativas.
- [ ] Se validaron build y lint, además de la revisión visual.
