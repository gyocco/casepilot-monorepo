# 40 — Calidad, pruebas, accesibilidad y performance

## Gated quality

Todo cambio de código debe pasar, como mínimo, las verificaciones relevantes:

- type-check y build de la app o paquete afectado;
- lint sin nuevos errores;
- pruebas unitarias para lógica pura y estados de componentes;
- pruebas de integración para servicios NestJS, adaptadores y contratos;
- pruebas e2e para flujos críticos de usuario;
- revisión manual de viewport móvil, teclado, focus, estados de error y navegación.

La API dispone de `pnpm lint:api`, `pnpm typecheck:api`, `pnpm build:api`, `pnpm test:api` y `pnpm test:api:integration`. Todas las pruebas de la API viven en su `test/`: unitarias e integración, con sus dependencias de desarrollo y checks del paquete API. Los full endpoint tests usan PostgreSQL efímero con Testcontainers; requieren Docker y nunca utilizan la base persistente de desarrollo. Consulta el [README de integración](../../src/apps/casepilot/casepilot-api/test/integration/README.md) y el [README de la API](../../src/apps/casepilot/casepilot-api/README.md). La [librería CQRS](../../src/libs/backend/cqrs/README.md) tiene `pnpm check:cqrs` y pruebas propias de tipos/ejecución en su `test/`. Web y las demás capacidades previstas tendrán scripts cuando existan sus manifests.

Para cambios solo de documentación o configuración del scaffold, valida enlaces, rutas, manifests, workspace y diff. Deja constancia de que type-check, lint, build, tests de producto y revisión de viewport/accesibilidad no aplican o no están disponibles.

La [librería abstractions](../../src/libs/backend/abstractions/README.md) tiene `pnpm check:abstractions` y pruebas propias de tipos/modelos. `pnpm test:abstractions:integration` acredita commit/rollback y scopes concurrentes con PostgreSQL efímero, requiere Docker y no utiliza la base persistente local. Los checks de consumidores API incorporan firmas de repositorios y uso de UnitOfWork; consulta su cobertura delimitada.

## Estrategia de pruebas

- `unit`: funciones de dominio, validadores, mapeadores, reducers y componentes sin dependencias externas.
- `integration`: colaboración entre aplicaciones, servicios NestJS, adaptadores y contratos.
- `e2e`: autenticación, navegación, formularios, permisos y recorridos de negocio desde la perspectiva del usuario.
- `fixtures`: datos mínimos y builders deterministas; nunca credenciales reales ni volcados de producción.

Todas las pruebas específicas de una app o paquete, incluidas integración y endpoints, DEBEN permanecer en el proyecto propietario. `tests/` global se reserva para suites de varios proyectos y reglas transversales; atravesar capas de una API o usar PostgreSQL no cambia su propietario. El criterio canónico está en [monorepo-architecture.md](../../docs/architecture/monorepo-architecture.md).

## Reglas de tests

- Escribe el caso que debe fallar antes o junto a la implementación cuando el cambio tenga lógica de negocio.
- Comprueba comportamiento observable, no detalles internos frágiles.
- Usa nombres que expliquen escenario y resultado esperado.
- No uses sleeps arbitrarios ni dependas del orden global de pruebas.
- Aísla tiempo, red, random, almacenamiento y Capacitor mediante adaptadores/mocks controlados.
- Si un test es flaky, trátalo como defecto: diagnostícalo y corrígelo antes de ocultarlo o reintentarlo indefinidamente.
- Un cambio de autorización debe incluir casos positivos y negativos.

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
