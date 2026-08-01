# 00 — Contexto del proyecto

## Misión

CasePilot es un monorepo orientado a una experiencia web y mobile con un único código de producto. La aplicación actual es `apps/web`, construida con React, Vite, Ionic React y Tailwind CSS. Supabase es la plataforma de datos, autenticación, storage, realtime y funciones server-side.

El objetivo de plataforma es compartir la mayor cantidad posible de código entre:

- navegador web;
- Android mediante Capacitor;
- iOS mediante Capacitor.

La compatibilidad nativa es un requisito de diseño desde ahora, aunque las carpetas nativas de Capacitor todavía no estén creadas.

## Fuentes de verdad

- Estructura y límites del repositorio: [`README.md`](../../README.md).
- Organización documental: [`docs/README.md`](../../docs/README.md).
- Producto y requisitos: [`docs/01-product/`](../../docs/01-product/).
- Arquitectura: [`docs/02-architecture/`](../../docs/02-architecture/).
- Desarrollo local: [`docs/03-development/`](../../docs/03-development/).
- Operación y despliegue: [`docs/04-operations/`](../../docs/04-operations/).
- Contratos y configuración: [`docs/05-reference/`](../../docs/05-reference/).
- Decisiones de arquitectura: [`docs/06-decisions/`](../../docs/06-decisions/).

Si dos documentos se contradicen, no elijas silenciosamente. Identifica la fuente canónica, corrige la documentación y registra un ADR si el conflicto representa una decisión técnica.

## Estado actual y evolución

Actualmente `apps/web` y `supabase/config.toml` son las piezas implementadas. `packages/`, `tests/` y `tooling/` son extensiones preparadas. No inventes módulos solo para completar la estructura; crea un paquete o una carpeta cuando exista una responsabilidad clara.

Los paquetes que podrán aparecer a medida que crezca el producto son:

- `packages/ui-components`: componentes visuales y tokens compartidos;
- `packages/domain-models`: entidades, value objects, contratos y reglas puras del dominio;
- `packages/supabase-client`: cliente browser-safe, tipos generados y mapeadores;
- `packages/supabase-admin`: acceso privilegiado exclusivamente server-side;
- `packages/platform`: adaptadores web/Capacitor para capacidades de dispositivo.

Cada paquete nuevo necesita una responsabilidad única, API pública documentada, pruebas y un `README.md` local.

## Principios de producto

- Mobile-first es la configuración por defecto, no una tarea posterior.
- La accesibilidad y la claridad de estados son parte de la funcionalidad.
- La seguridad se aplica en el backend y en el cliente; ocultar un botón no es autorización.
- La reproducibilidad local es obligatoria para migraciones, seeds y pruebas.
- Las abstracciones compartidas se crean por necesidad real y con límites explícitos.
