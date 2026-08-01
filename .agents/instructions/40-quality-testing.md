# 40 — Calidad, pruebas, accesibilidad y performance

## Gated quality

Todo cambio de código debe pasar, como mínimo, las verificaciones relevantes:

- type-check y build de la app o paquete afectado;
- lint sin nuevos errores;
- pruebas unitarias para lógica pura y estados de componentes;
- pruebas de integración para contratos con Supabase o paquetes;
- pruebas e2e para flujos críticos de usuario;
- revisión manual de viewport móvil, teclado, focus, estados de error y navegación.

La app actual expone `npm run lint` y `npm run build` en `apps/web`. Si se añaden scripts de test, deben documentarse en el README local y en `docs/03-development/`.

## Estrategia de pruebas

- `unit`: funciones de dominio, validadores, mapeadores, reducers y componentes sin dependencias externas.
- `integration`: cliente Supabase con stack local, RLS, Edge Functions, adapters y colaboración entre paquetes.
- `e2e`: autenticación, navegación, formularios, permisos y recorridos de negocio desde la perspectiva del usuario.
- `fixtures`: datos mínimos y builders deterministas; nunca credenciales reales ni volcados de producción.

Las pruebas específicas de una app o paquete pueden vivir junto al código. Las pruebas que cruzan proyectos permanecen en `tests/`.

## Reglas de tests

- Escribe el caso que debe fallar antes o junto a la implementación cuando el cambio tenga lógica de negocio.
- Comprueba comportamiento observable, no detalles internos frágiles.
- Usa nombres que expliquen escenario y resultado esperado.
- No uses sleeps arbitrarios ni dependas del orden global de pruebas.
- Aísla tiempo, red, random, almacenamiento y Capacitor mediante adaptadores/mocks controlados.
- Si un test es flaky, trátalo como defecto: diagnostícalo y corrígelo antes de ocultarlo o reintentarlo indefinidamente.
- Un cambio de RLS debe incluir casos positivos y negativos.

## Accesibilidad

- Usa HTML semántico y componentes Ionic adecuados.
- Todos los controles tienen nombre accesible, estados y feedback entendibles.
- El flujo funciona con teclado, focus visible, lector de pantalla y touch.
- No uses color como única señal. Revisa contraste, tamaños, errores de formularios y reduced motion.
- Los modales, alerts y toasts gestionan focus y pueden cerrarse de forma accesible.

## Performance y resiliencia

- Evita renders, efectos, queries y revalidaciones innecesarios; mide antes de introducir memoización.
- Lazy-load de rutas y recursos pesados cuando el beneficio sea real.
- Maneja red lenta, desconexión, reintento, timeout, respuestas vacías y errores parciales.
- No bloquees el hilo principal con parsing o procesamiento grande en render.
- Verifica el tamaño del bundle web y el impacto de cada dependencia en la futura app móvil.

## Definition of Done de calidad

No se considera completo un cambio que solo “se ve bien” en una pantalla. Debe ser tipeado, testeable, accesible, responsive, documentado y verificable en la ruta de build correspondiente.
