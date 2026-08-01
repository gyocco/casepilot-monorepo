# Skill: UI mobile-first web + native

## Cuándo usarla

Usa esta skill para cualquier pantalla, componente, formulario, modal, navegación, layout, responsive behavior o cambio de tema.

## Procedimiento

1. Identifica el flujo de usuario, el viewport móvil mínimo, el contenido largo y los estados de red.
2. Decide si el elemento es específico de `apps/web` o reutilizable en `packages/ui-components`.
3. Construye la estructura con Ionic: `IonPage` como raíz de una pantalla, `IonContent` como scroll principal y componentes Ionic para interacción y navegación.
4. Estiliza mobile-first: utilities Tailwind sin prefijo como base y variantes `sm`/`md`/`lg` solo como mejoras. Usa tokens de `theme` y evita valores arbitrarios repetidos.
5. Comprueba safe areas, teclado, orientación, touch targets, focus visible, reduced motion, contraste, texto largo y errores de validación.
6. No dependas de hover, mouse, `window`, filesystem del navegador o una capacidad nativa sin fallback.
7. Si requiere cámara, archivos, biometría, notificaciones, compartir o storage, define una interfaz y un adapter web/Capacitor; no llames el plugin desde la UI de negocio.
8. Prueba móvil estrecho, tablet/escritorio, teclado y navegación atrás. Documenta permisos o configuración nativa en `docs/04-operations/`.

## Checklist de salida

- [ ] La experiencia móvil es completa sin depender de breakpoint.
- [ ] La pantalla tiene `IonPage` y un único scroll owner.
- [ ] Los controles tienen nombre accesible y funcionan con teclado/touch.
- [ ] Existen estados loading, empty, error y success cuando aplican.
- [ ] No hay overflow horizontal ni acciones solo hover.
- [ ] Los tokens y componentes existentes fueron reutilizados.
- [ ] El fallback web está definido para capacidades nativas.
- [ ] Se validaron build y lint, además de la revisión visual.
