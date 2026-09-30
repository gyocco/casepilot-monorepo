---
name: monorepo-code-placement
description: Decide where new CasePilot code, tests, contracts, documentation, infrastructure, deployment configuration, or CI/CD files belong while preserving the apps-versus-libs boundaries. Use before creating or moving files in this monorepo.
metadata:
  short-description: Route new work to the correct monorepo folder
---

# Ubicación de código en el monorepo

## Propósito

Usa esta skill antes de crear o mover archivos para elegir la carpeta correcta del monorepo. La fuente de verdad detallada es [Estructura y límites del monorepo](../../../docs/architecture/monorepo-structure.md); léela cuando la decisión no sea obvia o cuando el cambio afecte más de una capa.

Esta skill no autoriza despliegues, operaciones remotas ni cambios destructivos. Solo ayuda a ubicar el trabajo y a mantener las fronteras de arquitectura.

## Flujo de decisión

1. Lee `AGENTS.md`, las instrucciones aplicables de `.agents/instructions/` y la documentación arquitectónica.
2. Comprueba `git status --short`, busca un `AGENTS.md` más específico y revisa patrones existentes con `rg --files` y `rg` antes de crear una ruta nueva.
3. Identifica el consumidor, el runtime y el dueño del código:
   - una sola aplicación o un deployable;
   - varias aplicaciones del mismo runtime;
   - varios runtimes o procesos;
   - infraestructura, automatización o documentación transversal.
4. Elige la ubicación más específica que ya exista. No crees carpetas vacías solo para completar el árbol.
5. Si el código es compartido, verifica que tenga consumidores reales o un consumidor claramente planificado, una responsabilidad única, una API explícita y pruebas proporcionales.
6. Revisa la dirección de dependencias y actualiza README, documentación arquitectónica o ADR cuando cambie una frontera.

## Regla `apps` frente a `libs`

| Pregunta | Ubicación |
| --- | --- |
| ¿Define bootstrap, rutas, pantallas, configuración o composición de una app concreta? | `src/apps/casepilot/<app>/` |
| ¿Implementa una feature o regla de negocio que pertenece a una app o servicio? | La app o el módulo que posee esa feature, no una librería general |
| ¿Resuelve una capacidad técnica general reutilizable por más de un consumidor? | `src/libs/<scope>/` |
| ¿Es un contrato entre clientes, servicios o procesos? | `contracts/` |

`src/apps/` contiene ejecutables y deployables. En la estructura actual, las aplicaciones principales son:

- `src/apps/casepilot/casepilot-web/`: React/Vite/Ionic/Tailwind, rutas, páginas, features y tema propios de la web.
- `src/apps/casepilot/casepilot-mobile/`: composición mobile y configuración Capacitor/Ionic propias de la app.
- `src/apps/casepilot/casepilot-api/`: bootstrap, transporte, módulos, configuración y health checks del backend desplegable.

`src/libs/` contiene código general, independiente de una app concreta y reutilizable. No debe conocer rutas, pantallas, queries, permisos o reglas de negocio específicas de CasePilot. Una librería nunca importa desde `src/apps/`.

## Rutas por responsabilidad

| Tipo de trabajo | Carpeta preferida | Regla de colocación |
| --- | --- | --- |
| Capacidad backend transversal | `src/libs/backend/<capability>/` | Solo server-side; no debe llegar a bundles web/mobile ni contener negocio específico. |
| UI reusable entre apps web | `src/libs/frontend/<library>/` | Componentes, tokens y patrones accesibles; sin rutas ni queries concretas. |
| Adaptador o capability mobile reusable | `src/libs/mobile/` o una subcarpeta con dueño claro | Aísla APIs web/native, permisos, disponibilidad, errores y fallback. |
| Test unitario de una app o librería | Junto al código propietario | Mantiene el test cerca de la unidad que verifica. |
| Test que cruza apps, servicios o contratos | `tests/integration/`, `tests/e2e/`, `tests/performance/` o `tests/architecture/` | Usa la subcarpeta según el tipo de prueba. |
| Contrato HTTP, evento o mensaje | `contracts/` | Versiona el contrato externo; no dupliques modelos internos. |
| Infraestructura como código/runtime | `infra/` | Terraform, Kubernetes, Helm, Docker y recursos técnicos. |
| Manifiesto u overlay de release | `deploy/` | Configuración por entorno o destino de despliegue. |
| Workflow de GitHub Actions | `.github/workflows/` | Orquesta lint, type-check, build, tests y despliegues autorizados. |
| Script reutilizable por CI/CD | `tools/ci/` | Mantiene la lógica fuera del YAML; no contiene lógica de negocio. |
| Generador, validator o codegen | `tools/` | Automatización del repositorio que no se ejecuta como producto. |
| Decisión o límite transversal | `docs/architecture/` y, si corresponde, `docs/adr/` | Mantén una fuente canónica y enlaza documentos relacionados. |
| Documentación de una app o librería | README junto a esa app o librería | Incluye propósito, límites, consumidores, comandos y requisitos. |

No hace falta crear una carpeta raíz `ci/` si `.github/workflows/` y `tools/ci/` son suficientes. Añádela solo si una herramienta o proveedor exige una configuración compartida independiente y documenta la razón.

## Límites obligatorios

- `src/apps/*` puede consumir `src/libs/*` y `contracts/`.
- `src/libs/*` no puede importar código desde `src/apps/*`.
- La lógica de negocio no depende de React, Ionic, NestJS, APIs del navegador ni una implementación concreta de persistencia.
- La UI no accede directamente a persistencia; usa APIs, contratos y librerías/adaptadores permitidos.
- Las APIs nativas y web se encapsulan detrás de adaptadores; las features de negocio no llaman plugins directamente.
- Los secretos, tokens administrativos y credenciales permanecen fuera del código cliente, bundles, logs y documentación.
- No uses `src/libs/` como un cajón de componentes, helpers, modelos o reglas de negocio de una sola app.

## Casos ambiguos

- Si una pieza solo tiene un consumidor, déjala junto a ese consumidor hasta que exista una necesidad real de extracción.
- Si se repite código pero contiene reglas de negocio, comparte un contrato o extrae una frontera explícita; no lo conviertas automáticamente en una librería general.
- Si una librería necesita una dependencia server-only, mantenla bajo `src/libs/backend/` y comprueba que ningún bundle cliente pueda importarla.
- Si una decisión hace que dos documentos o instrucciones indiquen rutas distintas, no elijas silenciosamente: identifica la fuente canónica, corrige la documentación y registra un ADR si representa una decisión técnica.
- Si la ruta propuesta no existe, confirma primero si es una extensión justificada del árbol; no agregues un alias paralelo para evitar resolver la frontera.

## Verificación antes de cerrar

- La ruta elegida coincide con el consumidor y el runtime reales.
- Ninguna librería importa desde una app y el nuevo módulo no crea un ciclo. Las apps pueden consumir librerías compatibles con su runtime.
- La librería tiene responsabilidad, API, consumidores, pruebas y README local cuando corresponda.
- Los contratos, tests, configuración de deploy y workflows quedaron en sus carpetas transversales.
- Se actualizaron los documentos canónicos afectados.
- Se ejecutaron las verificaciones relevantes del paquete o app; si una no aplica o no puede ejecutarse, se deja constancia de la razón.
