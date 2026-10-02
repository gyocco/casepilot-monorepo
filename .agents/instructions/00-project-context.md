# 00 — Contexto del proyecto

## Misión

CasePilot es un monorepo orientado a una experiencia web y mobile con un único código de producto. Las aplicaciones se agrupan en `src/apps/casepilot/`: `casepilot-web` usará React, Vite, Ionic React y Tailwind CSS; `casepilot-mobile` usará Ionic/Capacitor y `casepilot-api` implementa la base NestJS/TypeScript con TypeORM. `src/libs/backend/cqrs/` y `src/libs/backend/abstractions/` implementan contratos compartidos; web, mobile y las demás capacidades previstas siguen sin implementación.

El objetivo de plataforma es compartir la mayor cantidad posible de código entre:

- navegador web;
- Android mediante Capacitor;
- iOS mediante Capacitor.

La compatibilidad nativa es un requisito de diseño desde ahora, aunque las carpetas nativas todavía no estén creadas.

CasePilot no usa Supabase. La persistencia, identidad, mensajería, observabilidad y demás integraciones de backend deben encapsularse en servicios NestJS y librerías backend, sin acoplar la UI a un proveedor concreto.

## Fuentes de verdad

- Estructura y límites del repositorio: [Arquitectura del monorepo](../../docs/architecture/monorepo-architecture.md).
- Estado actual, mapa breve y comandos raíz: [`README.md`](../../README.md).
- Organización documental: [`docs/README.md`](../../docs/README.md).

Las demás áreas documentales son `docs/product/`, `docs/development/`, `docs/operations/`, `docs/reference/`, `docs/project-management/` y `docs/adr/`. Consulta el índice para saber cuáles existen; no asumas documentos implementados ni crees carpetas vacías.

Si dos documentos se contradicen, no elijas silenciosamente. Identifica la fuente canónica, corrige la documentación y registra un ADR si el conflicto representa una decisión técnica.

## Estado actual y evolución

`src/apps/casepilot/casepilot-api/` contiene manifest, código, pruebas y README, con PostgreSQL local en Docker. `src/libs/backend/cqrs/` contiene bases Request/Response y Handler. `src/libs/backend/abstractions/` contiene Entity/paginación, Repository/CrudRepository y UnitOfWork con adaptador TypeORM separado. `src/libs/backend/exception-handler/` contiene errores puros y filtro HTTP NestJS configurable con Problem Details. Los tres paquetes tienen pruebas, configuración y README propios. Web, mobile y las demás capacidades previstas incorporarán su propio paquete cuando se implementen. El contrato HTTP está en `contracts/openapi/casepilot-api.yaml`.

Las áreas del monorepo son:

- `src/apps/`: ejecutables y deployables agrupados por producto; aquí permanecen las features y reglas de negocio de cada app o servicio;
- `src/libs/backend/`: capacidades técnicas server-side reutilizables, sin negocio específico de una app;
- `src/libs/frontend/`: capacidades de interfaz reutilizables e independientes de una pantalla;
- `src/libs/mobile/`: adaptadores y capacidades mobile reutilizables;
- `contracts/`: contratos independientes de tecnología entre clientes y servicios;
- `tests/`: exclusivamente pruebas de varios proyectos y reglas de arquitectura transversales; todas las pruebas propias permanecen en su proyecto;
- `infra/`, `deploy/` y `tools/`: operación, despliegue y automatización del repositorio.

No se deben crear módulos vacíos solo para completar un árbol de carpetas.

## Principios de producto

- Mobile-first es la configuración por defecto, no una tarea posterior.
- La accesibilidad y la claridad de estados son parte de la funcionalidad.
- La seguridad se aplica en los servicios NestJS y en el cliente; ocultar un botón no es autorización.
- La reproducibilidad local es obligatoria para pruebas, seeds o fixtures cuando se incorporen.
- Las abstracciones compartidas se crean por necesidad real y con límites explícitos.
