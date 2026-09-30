# 00 — Contexto del proyecto

## Misión

CasePilot es un monorepo orientado a una experiencia web y mobile con un único código de producto. La aplicación implementada actualmente es `src/web-ui/apps/public`, construida con React, Vite, Ionic React y Tailwind CSS. Los servicios de backend se incorporarán como aplicaciones NestJS con TypeScript bajo `src/services/apps/`.

El objetivo de plataforma es compartir la mayor cantidad posible de código entre:

- navegador web;
- Android mediante Capacitor;
- iOS mediante Capacitor.

La compatibilidad nativa es un requisito de diseño desde ahora, aunque las carpetas nativas todavía no estén creadas.

CasePilot no usa Supabase. La persistencia, identidad, mensajería, observabilidad y demás integraciones de backend deben encapsularse en servicios NestJS y librerías backend, sin acoplar la UI a un proveedor concreto.

## Fuentes de verdad

- Estructura y límites del repositorio: [`README.md`](../../README.md).
- Organización documental: [`docs/README.md`](../../docs/README.md).
- Producto y requisitos: [`docs/01-product/`](../../docs/01-product/).
- Arquitectura: [`docs/architecture/`](../../docs/architecture/).
- Desarrollo local: [`docs/development/`](../../docs/development/).
- Operación y despliegue: [`docs/04-operations/`](../../docs/04-operations/).
- Contratos y configuración: [`docs/05-reference/`](../../docs/05-reference/).
- Decisiones de arquitectura: [`docs/adr/`](../../docs/adr/).

Si dos documentos se contradicen, no elijas silenciosamente. Identifica la fuente canónica, corrige la documentación y registra un ADR si el conflicto representa una decisión técnica.

## Estado actual y evolución

Actualmente solo está implementada `src/web-ui/apps/public`. `src/web-ui/apps/admin`, `src/web-ui/apps/backoffice`, `src/services/apps/`, `src/mobile-ui/apps/`, las librerías compartidas, los contratos y la infraestructura se crearán cuando exista una responsabilidad y un consumidor real.

Las áreas del monorepo son:

- `src/web-ui/`: aplicaciones browser y librerías frontend compartidas;
- `src/services/`: aplicaciones NestJS desplegables y librerías backend;
- `src/mobile-ui/`: futuras aplicaciones mobile y sus librerías específicas;
- `contracts/`: contratos independientes de tecnología entre clientes y servicios;
- `tests/`: pruebas que cruzan aplicaciones, servicios, contratos o arquitectura;
- `infra/`, `deploy/` y `tools/`: operación, despliegue y automatización del repositorio.

No se deben crear módulos vacíos solo para completar un árbol de carpetas.

## Principios de producto

- Mobile-first es la configuración por defecto, no una tarea posterior.
- La accesibilidad y la claridad de estados son parte de la funcionalidad.
- La seguridad se aplica en los servicios NestJS y en el cliente; ocultar un botón no es autorización.
- La reproducibilidad local es obligatoria para pruebas, seeds o fixtures cuando se incorporen.
- Las abstracciones compartidas se crean por necesidad real y con límites explícitos.
