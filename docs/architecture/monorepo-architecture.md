# Arquitectura del monorepo

- Estado: guía estructural vigente
- Alcance: organización del repositorio, límites entre aplicaciones y librerías, documentación y CI/CD

La API ya implementa una base NestJS/TypeORM, con configuración por entorno, health checks y migración PostgreSQL. La librería `src/libs/backend/cqrs/` implementa Request, Response y Handler; web, mobile y las demás capacidades previstas siguen sin implementación. El contrato HTTP está en `contracts/openapi/casepilot-api.yaml`; los comandos de la API, en su [README](../../src/apps/casepilot/casepilot-api/README.md).

`src/libs/backend/abstractions/` implementa errores puros, contratos de data access, modelos genéricos y UnitOfWork. Su [README](../../src/libs/backend/abstractions/README.md) define API, pruebas y límites; las entidades/repositorios del producto permanecen en la app propietaria.

Esta es la fuente canónica de las convenciones globales de carpetas, propiedad de proyectos y ubicación de pruebas. La [arquitectura particular del backend de CasePilot](casepilot-backend-architecture.md) documenta su adopción de la base backend reutilizable; las reglas internas de un backend no se definen aquí.

## Propósito

CasePilot se organiza como un monorepo para mantener en un mismo repositorio las aplicaciones web, mobile y backend, junto con las capacidades técnicas reutilizables que necesitan. La estructura separa dos tipos de código:

- `src/apps/`: código específico de una aplicación ejecutable o desplegable.
- `src/libs/`: capacidades generales, independientes de una aplicación concreta y reutilizables por más de un consumidor.

Esta separación evita que una aplicación se convierta en una dependencia accidental de otra y evita que `libs/` se transforme en un cajón de código de negocio sin un dueño claro.

Las carpetas que todavía no tienen una responsabilidad o un consumidor real no deben crearse solo para completar el árbol. Los nombres mostrados como futuros son una guía, no una obligación de crear directorios vacíos.

## Carpetas globales y estructura propia de cada proyecto

Las carpetas de alto nivel pertenecen al monorepo: pueden agrupar o coordinar muchos productos, aplicaciones y librerías. No son la estructura interna de una única aplicación.

- `src/` organiza los proyectos y capacidades del repositorio, agrupados en `apps/` y `libs/`. No es el único directorio de fuentes TypeScript de todas las aplicaciones.
- `tests/` se reserva exclusivamente para pruebas cuyo alcance involucre realmente varios proyectos, o reglas de arquitectura transversales que verifiquen varios proyectos del monorepo.
- `contracts/`, `docs/`, `infra/`, `deploy/` y `tools/` coordinan contratos, documentación, recursos y automatización del repositorio según su responsabilidad. Pueden atender a múltiples proyectos sin sustituir su configuración local.

Cada proyecto dentro de `src/` conserva su propia raíz y puede tener `package.json`, `tsconfig.json`, README, `src/`, `test/` y artefactos generados. El `src` global organiza proyectos; el `src` interno contiene el código fuente de su propietario. Repetir el nombre no duplica responsabilidades.

La clasificación unit/integration/e2e determina el tipo y ejecución de una prueba; su propietario determina la carpeta padre. Atravesar HTTP, Application, repositorios y una base externa sigue siendo una prueba de una sola API. PostgreSQL o Testcontainers son dependencias de prueba, no otro proyecto de producto. El aislamiento de recursos no depende de la ubicación del archivo.

Todas las pruebas propias de una app o librería, incluidas las de integración y sus fixtures, se mantienen en ese proyecto. Las pruebas globales consumen APIs públicas o contratos de los proyectos participantes; ningún proyecto de producto depende de `tests/`.

La decisión y sus alternativas se registran en el [ADR 0005](../adr/0005-project-owned-tests.md).

## Mapa del repositorio

```text
.
├── .agents/                         # instrucciones y flujos para agentes del repositorio
├── src/
│   ├── apps/
│   │   └── casepilot/
│   │       ├── casepilot-api/       # aplicación backend desplegable
│   │       ├── casepilot-mobile/    # aplicación mobile Capacitor/Ionic
│   │       └── casepilot-web/       # aplicación web React/Vite/Ionic
│   └── libs/
│       ├── backend/                 # capacidades server-side compartidas
│       │   ├── abstractions/       # errores, dataaccess/models, repositorios y UnitOfWork
│       │   ├── cqrs/               # bases y contratos puros
│       │   ├── validation/         # validación estructural y adaptador HTTP separados
│       │   └── exception-handler/  # adaptador HTTP NestJS de errores compartidos
│       ├── frontend/                # capacidades compartidas de interfaz web
│       └── mobile/                  # adaptadores y capacidades mobile compartidas
├── contracts/                       # contratos entre aplicaciones, servicios y procesos
├── tests/                           # pruebas de varios proyectos del monorepo
├── infra/                           # infraestructura como código y artefactos de runtime
├── deploy/                          # configuración y manifiestos de despliegue
├── tools/                           # scripts, generadores y automatización del repositorio
├── .github/workflows/               # workflows de CI/CD de GitHub, cuando se habiliten
├── docs/                            # documentación transversal
├── package.json                     # scripts y metadatos del workspace raíz
├── pnpm-workspace.yaml              # paquetes incluidos en el workspace pnpm
├── pnpm-lock.yaml                   # versiones reproducibles de dependencias
├── .editorconfig                    # formato común de archivos
└── README.md                        # entrada general y mapa breve del repositorio
```

`contracts/`, `deploy/` y `.github/workflows/` pueden no contener todavía archivos de producto. Deben aparecer cuando exista un contrato, despliegue o pipeline real que justifique su uso.

## Regla principal: `apps` frente a `libs`

Usa esta pregunta para decidir dónde colocar un archivo nuevo:

> ¿Este código describe cómo funciona una aplicación concreta o proporciona una capacidad técnica que varias aplicaciones pueden consumir?

### El código va en `src/apps/` cuando

- define el arranque, las rutas, las pantallas o la composición de una aplicación;
- contiene una feature que solo tiene sentido para esa aplicación;
- orquesta un flujo de producto o una regla de negocio de CasePilot;
- contiene configuración, assets, tema, permisos o variables propias del runtime de una aplicación;
- es el bootstrap, el transporte o la composición de un servicio desplegable.

El código dentro de una aplicación puede consumir librerías y contratos. Una librería no puede importar código desde una aplicación.

### El código va en `src/libs/` cuando

- resuelve una capacidad técnica general con más de un consumidor real o planificado;
- no conoce el nombre, las rutas, las pantallas ni el estado de una aplicación concreta;
- no contiene una regla de negocio específica de clientes, casos, documentos u otro flujo de CasePilot;
- tiene una API pública, una frontera clara y pruebas propias;
- puede evolucionar sin importar desde `src/apps/`.

Ejemplos válidos son un kit de componentes visuales, un adaptador de correo, logging estructurado, manejo común de excepciones, generación de PDF o una interfaz para una capacidad del dispositivo.

No extraigas código a `libs/` solo porque se repite una vez. Primero identifica consumidores reales, define la responsabilidad de la librería y comprueba que la extracción no introduce dependencias de negocio o de una aplicación.

Los mecanismos backend de propósito general adoptados por CasePilot y sus futuras APIs DEBEN residir en `src/libs/backend/`, aunque la primera API sea su consumidor inicial. Deben tener una entrada pública, pruebas propias y parámetros explícitos para diferencias entre aplicaciones. No se conservan copias ni wrappers locales que solo reexporten implementación genérica. Las políticas de Application, las tablas, las relaciones y la composición específicas del producto conservan su dueño en la app. La clasificación semántica de una pieza requiere revisión; los checks de imports no prueban que sea genérica. La decisión y el mapa de capacidades se registran en [ADR 0016](../adr/0016-reusable-backend-mechanisms.md).

## Organización de `src/apps/`

`src/apps/` contiene las unidades ejecutables y desplegables del producto. Cada aplicación debe poder explicar su responsabilidad en una frase y debe mantener su propia entrada, configuración, scripts y documentación local.

### `src/apps/casepilot/`

Agrupa las aplicaciones que forman parte del producto CasePilot. Esta carpeta permite mantener juntas las variantes de plataforma sin mezclar su código interno.

### `src/apps/casepilot/casepilot-web/`

Aplicación browser basada en React, Vite, Ionic React y Tailwind CSS. Aquí viven, según sean necesarios:

- bootstrap de React/Ionic y providers de la aplicación;
- rutas, páginas y composición de features;
- componentes, hooks y mapeadores que solo sirven a esta aplicación;
- tema, tokens y assets locales;
- configuración de Vite y variables públicas del cliente;
- README local con comandos, requisitos y configuración no sensible.

Una pantalla debe orquestar el flujo. El acceso a APIs, persistencia o autorización no debe estar escondido dentro de un componente visual. La UI consume APIs y contratos tipados; no accede directamente a persistencia.

### `src/apps/casepilot/casepilot-mobile/`

Aplicación mobile empaquetada con Ionic/Capacitor cuando se habilite. Contiene la composición específica de la app mobile, su navegación, configuración y los puntos de entrada nativos. Las capacidades como cámara, archivos, notificaciones o biometría deben consumirse a través de adaptadores compartidos y con fallback web cuando corresponda; no se llaman APIs nativas directamente desde una feature de negocio.

### `src/apps/casepilot/casepilot-api/`

Aplicación backend desplegable. Contiene el bootstrap del servicio, transporte HTTP o de mensajería, composición de módulos, configuración, health checks y límites operativos propios de esa API. Las capacidades técnicas generales se consumen desde `src/libs/backend/`; los contratos externos viven en `contracts/`.

La autorización, validación de entrada, acceso a persistencia e integraciones externas se resuelven en la frontera server-side. Nunca se trasladan secretos o credenciales privilegiadas al cliente.

Las responsabilidades internas y restricciones backend se consultan en la [arquitectura particular de CasePilot](casepilot-backend-architecture.md), que adopta una base reutilizable. La API mantiene un dominio compartido y cuatro capas directamente bajo su `src/`, con database dentro de Infrastructure según el [ADR 0008](../adr/0008-application-wide-backend-layers.md). Este documento determina la ubicación y propiedad del paquete, sus fuentes y pruebas.

### Estructura interna de una aplicación

No es necesario crear todas las subcarpetas por adelantado. Cuando el código exista, una aplicación puede organizarse así:

```text
<app>/
├── src/                            # código fuente de la aplicación
│   ├── app/                        # bootstrap y composición raíz, si aplica
│   ├── routes/                     # navegación y rutas
│   ├── features/                   # features propias de esta aplicación
│   ├── components/                 # UI local, no reusable entre apps
│   ├── hooks/                      # hooks de composición local
│   ├── config/                     # configuración validada del runtime
│   └── theme/                      # tema y tokens locales, si aplica
├── public/                         # archivos públicos, solo en apps que los sirvan
├── package.json                    # scripts y dependencias de la aplicación
└── README.md                       # uso, comandos y límites locales
```

La estructura interna puede variar entre web, mobile y API. La regla importante es que la aplicación componga su experiencia y no se convierta en una librería compartida por otra aplicación.

Por ejemplo, la raíz del proyecto API mantiene separados fuentes, pruebas y configuración:

```text
casepilot-api/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── application/
│   │   └── health/
│   │       └── get-health-check-objects/ # handler/request/response de la operación
│   ├── domain/
│   ├── infrastructure/
│   │   ├── config/
│   │   ├── database/
│   │   └── persistence/
│   ├── presentation/
│   │   └── health/                 # módulo, controller y modelos HTTP del recurso
│   ├── api.module.ts               # registro de módulos de recurso
│   └── main.ts / create-app.ts / app.module.ts
├── test/
│   ├── architecture/
│   ├── unit/
│   └── integration/
│       └── support/
└── dist/                           # generado; no se versiona
```

`test/unit/` y `test/integration/` tienen el mismo propietario. Un proyecto puede añadir otras suites propias cuando existan; no necesita carpetas vacías. `dist/`, `build/` y otros artefactos de compilación se generan según su configuración y permanecen ignorados por Git.

Application de la API agrupa su contenido por recurso y operación conforme a [BCK-023](backend-architecture-baseline-rules.md#bck-023--application-organizada-por-recurso-y-operacion) y [CPA-001](casepilot-backend-architecture.md#cpa-001--application-de-la-api-organizada-por-recurso). Cada operación tiene handler/request/response; los datos y reglas usados por varias operaciones van a `<recurso>/shared/`. Los colaboradores de producto entre recursos conservan `application/shared/`. La API implementa Health y 28 recursos CRUD; no se crean recursos futuros sin contenido. Evolución: [ADR 0009](../adr/0009-resource-organized-application.md) y [ADR 0017](../adr/0017-operation-organized-application.md).

Presentation agrupa módulos de composición, controllers y modelos de transporte en `presentation/<recurso>/`, con `<recurso>.module.ts` directamente en esa carpeta, conforme a [CPA-004](casepilot-backend-architecture.md#cpa-004--presentation-organizada-por-modulo-de-recurso) y al [ADR 0014](../adr/0014-resource-organized-presentation.md). La raíz conserva AppModule/ApiModule; módulos técnicos como DatabaseModule permanecen en Infrastructure. Esto ordena composición y transporte dentro de la API, sin repetir capas por recurso.

## Organización de `src/libs/`

`src/libs/` contiene código reusable y de propósito general. Una librería no debe importar desde `src/apps/`, depender de una ruta o pantalla concreta, ni ocultar lógica de negocio de CasePilot bajo un nombre genérico.

Cada librería nueva debe documentar en su README local:

- propósito y límites;
- consumidores permitidos;
- API pública y ejemplo mínimo;
- requisitos de runtime o variables;
- cómo ejecutar sus pruebas y build;
- qué módulos no debe importar.

### `src/libs/backend/`

Capacidades server-side compartidas por APIs, workers u otros procesos backend. El paquete implementado [`cqrs/`](../../src/libs/backend/cqrs/README.md) exporta Request, Response y Handler sin negocio ni dependencias de runtime. Sus fuentes, pruebas y configuración pertenecen a ese paquete; modelos concretos y casos de uso permanecen en la app consumidora. La entrada pública es `@casepilot/cqrs`, enlazada con `workspace:*`; los consumidores construyen primero sus declaraciones/ESM. Adopción en la API: [ADR 0010](../adr/0010-shared-cqrs-contracts.md).

El paquete [`abstractions/`](../../src/libs/backend/abstractions/README.md) contiene errores puros en `src/errors.ts`, `src/dataaccess/models/` para Entity, StoredEntity, PageRequest y PageResponse, contratos Repository/CrudRepository/ScopedDataRepository/UnitOfWork en `src/dataaccess/` y mecanismos técnicos de persistencia. Expone `@casepilot/abstractions` (puro), `@casepilot/abstractions/typeorm` (SQL/conexión/transacciones) y `@casepilot/abstractions/node` (UUID/fecha); los adaptadores son exclusivos de Infrastructure/composición. Las pruebas de errores/modelos/tipos e integración PostgreSQL viven en su propio `test/`; los validadores de consumidores API permanecen en la API. Los futuros workers deben integrar checks propios antes de declarar cobertura. Decisiones: [ADR 0011](../adr/0011-data-access-abstractions.md), [ADR 0012](../adr/0012-configurable-http-error-handler.md) y [ADR 0016](../adr/0016-reusable-backend-mechanisms.md).

El paquete [`exception-handler/`](../../src/libs/backend/exception-handler/README.md) implementa filtro HTTP global/configuración en `@casepilot/exception-handler/nestjs` y reexporta los errores puros de abstractions en `@casepilot/exception-handler` por compatibilidad. Depende de abstractions, sin dependencia inversa. Application consume el vocabulario puro; el adaptador pertenece a transporte/composición. Tiene tests y checks propios, con CasePilot API como consumidor inicial. Decisión y contrato Problem Details: [ADR 0012](../adr/0012-configurable-http-error-handler.md).

El paquete [`validation/`](../../src/libs/backend/validation/README.md) contiene validación estructural parametrizada y una entrada `/nestjs` para parsers HTTP. Los modelos/errores/contratos, la ejecución con política explícita y los adaptadores SQL/UUID/fecha tienen dueño en abstractions; PageMetadataResponse en cqrs. Se consumen las entradas públicas, con tests propios y futuras APIs como consumidores planificados. La app conserva políticas y datos del producto según CPA-005 y ADR 0016.

Capacidades adicionales previstas:

- `auth/`: mecanismos y adaptadores técnicos de autenticación;
- `database/`: acceso técnico a persistencia y adaptadores, sin modelos de una feature concreta;
- `email/`: envío de correo y adaptadores de proveedores;
- `logging/`: logging estructurado, contexto y correlación;
- `pdf/`: generación, lectura o transformación de documentos PDF;
- `security/`: utilidades y controles de seguridad reutilizables.

Estas librerías pueden depender de runtime backend, pero no deben llegar a un bundle web o mobile. Los secretos se inyectan desde el entorno server-side y no se escriben en código, logs ni documentación.

### `src/libs/frontend/`

Capacidades reutilizables para aplicaciones web. `pilot-ui-kit/` es el lugar previsto para componentes visuales, tokens, patrones de formularios y estados accesibles que puedan ser utilizados por más de una app web.

Un componente que solo sirve a una pantalla permanece en la aplicación. El kit no debe conocer rutas, queries, permisos concretos ni reglas de negocio; recibe datos y callbacks mediante props o contratos explícitos.

### `src/libs/mobile/`

Capacidades mobile transversales y adaptadores de plataforma. Puede contener interfaces y fallback web para almacenamiento, archivos, cámara, notificaciones, compartir, biometría u otras capacidades cuando tengan más de un consumidor.

La lógica de dominio permanece independiente de Ionic, Capacitor, `window` y APIs nativas. Cada adaptador debe documentar disponibilidad, permisos, errores y comportamiento cuando la capacidad no exista.

### Cuándo no usar una librería general

El siguiente código no pertenece a una librería general solo por ser reutilizable técnicamente:

- una regla de negocio de una feature;
- un flujo de autenticación específico de una pantalla;
- un modelo que solo entiende una aplicación;
- un componente que no tiene un segundo consumidor;
- un cliente API acoplado a una vista concreta;
- una configuración con secretos o permisos propios de un deployable.

Ese código debe permanecer en la aplicación o en el módulo de servicio que lo posee. Si más adelante aparece una necesidad transversal, extrae únicamente la parte estable y documenta la frontera.

## Otras carpetas del monorepo

### `contracts/`

Contratos independientes de la implementación entre aplicaciones, servicios y procesos. Aquí pueden vivir esquemas OpenAPI, mensajes de eventos, protobuf u otros contratos versionados cuando exista una necesidad real.

Los contratos describen la comunicación externa; no duplican todos los modelos internos ni sustituyen las reglas de dominio. Los clientes y servicios deben consumir tipos generados o validados desde una única fuente de verdad.

### `tests/`

Pruebas cuyo alcance involucra varios proyectos del monorepo:

- `e2e/`: recorridos que verifican cliente web/mobile y API juntos;
- `integration/`: colaboración entre varios servicios o compatibilidad de contratos entre proyectos;
- `performance/`: mediciones de escenarios que involucren varios proyectos;
- `architecture/`: reglas de dependencias y estructura aplicadas a varios proyectos;
- `fixtures/`: datos sintéticos compartidos por esas suites transversales.

Las unitarias, integración de persistencia y full endpoint tests de una sola app permanecen en su `test/`, aunque utilicen Docker, HTTP o una base externa. No se guarda aquí una suite específica de una API solo por llamarse integration o e2e. Una verificación de contrato de un solo propietario sigue siendo local; la compatibilidad entre proyectos sí puede ser transversal.

El contenido versionado actual de `tests/` es únicamente su [README](../../tests/README.md): no es un paquete activo del workspace ni tiene suites ejecutables. Se agregará configuración propia cuando exista una necesidad real de varias aplicaciones, sin mover automáticamente pruebas locales.

No se guardan credenciales reales, volcados de producción ni datos personales innecesarios. Los proyectos de producto no importan desde esta carpeta. Procedimiento concreto de las pruebas API: [README de integración](../../src/apps/casepilot/casepilot-api/test/integration/README.md).

### `infra/`

Infraestructura como código y artefactos de runtime: por ejemplo Terraform, Kubernetes, Helm o Docker. Describe y provisiona recursos técnicos. No contiene features de producto ni secretos versionados.

El entorno de dependencias locales de CasePilot vive en `infra/docker/`. La decisión sobre PostgreSQL, puertos y persistencia está en [ADR 0001](../adr/0001-local-postgresql.md); el procedimiento operativo se mantiene en su [README local](../../infra/docker/README.md).

### `deploy/`

Manifiestos, overlays y configuración de release por entorno o destino de despliegue. Separa la descripción de cómo se publica una aplicación de la definición de la infraestructura que la soporta.

La configuración sensible se inyecta mediante el entorno o un secret manager. Los archivos versionados solo contienen nombres, referencias y valores seguros de ejemplo.

### `tools/`

Scripts, generadores, validadores y codegen del repositorio. `tools/ci/` es un lugar adecuado para scripts reutilizables por los pipelines si llegan a ser necesarios. No contiene lógica de negocio ni código ejecutado como parte del producto en producción.

### `.github/workflows/` y CI/CD

`.github/workflows/` es la ubicación recomendada para los workflows de GitHub Actions que ejecuten lint, type-check, build, tests, validaciones de arquitectura y despliegues autorizados.

Los workflows deben coordinar tareas pequeñas y reproducibles; la lógica compleja debe vivir en scripts versionados dentro de `tools/ci/` o en el comando propio de la app. Los workflows no deben contener secretos escritos en claro ni realizar despliegues remotos como efecto de una verificación local.

No hace falta crear una carpeta raíz `ci/` si `.github/workflows/` y `tools/ci/` cubren la necesidad. Puede añadirse `ci/` únicamente si se adopta una herramienta o proveedor que requiera configuración independiente y compartida; en ese caso debe documentarse su responsabilidad y evitar duplicar los scripts de `tools/`.

### `docs/`

Documentación transversal y de larga duración. La documentación específica de una aplicación o librería permanece junto a su código, normalmente en su README local. En `docs/` viven las decisiones y explicaciones que cruzan varias áreas:

- `architecture/`: límites, estructura del monorepo, dependencias y diagramas;
- `adr/`: decisiones con contexto, alternativas y consecuencias;
- `product/`: visión, requisitos y alcance;
- `project-management/`: roadmap, hitos y seguimiento;
- `development/`: instalación, comandos y calidad, cuando se incorpore;
- `operations/`: despliegue, entornos, observabilidad e incidentes, cuando se incorpore;
- `reference/`: APIs, variables, contratos y comandos de consulta, cuando se incorpore.

Cada tema debe tener una fuente canónica. Cuando una decisión cambie una frontera de arquitectura, persistencia, autenticación, seguridad o plataforma, debe registrarse además un ADR y enlazarse desde la documentación afectada.

### `.agents/`

Instrucciones y habilidades para agentes que trabajan en el repositorio. No contiene código de producto, secretos, requisitos funcionales ni documentación operativa general para usuarios.

## Dirección de dependencias

La dirección preferida es:

```text
src/apps/*
  ├── consume src/libs/* según plataforma y runtime
  └── consume contracts/

tests/
  └── puede verificar apps, libs y contracts

infra/ + deploy/ + .github/workflows/ + tools/
  └── construyen, validan y publican deployables; no son dependencias de runtime del producto

src/libs/*
  └── no importa desde src/apps/*
```

Reglas de frontera:

- una aplicación puede consumir librerías y contratos;
- una librería puede depender de otras librerías de menor nivel, pero no de una app concreta;
- la lógica de negocio no depende de React, Ionic, NestJS, APIs del navegador ni una implementación concreta de persistencia;
- la UI no accede directamente a persistencia;
- las diferencias web/native se aíslan en adaptadores reutilizables;
- no se crean dependencias circulares ni barrels que oculten ciclos.

## Ejemplos rápidos de ubicación

| Necesidad | Ubicación | Motivo |
| --- | --- | --- |
| Ruta o pantalla exclusiva de la web | `src/apps/casepilot/casepilot-web/` | Es composición específica de una aplicación. |
| Bootstrap y controller de la API | `src/apps/casepilot/casepilot-api/` | Es código desplegable del servicio. |
| Botón o patrón visual usado por varias apps web | `src/libs/frontend/pilot-ui-kit/` | Es UI reusable y agnóstica de una pantalla. |
| Cliente técnico de correo | `src/libs/backend/email/` | Es una capacidad server-side transversal. |
| Manejo común de errores HTTP | `src/libs/backend/exception-handler/` | Es infraestructura compartida, no negocio. |
| Adaptador de cámara con fallback web | `src/libs/mobile/` | Aísla una diferencia de plataforma. |
| Regla de negocio de una feature | Módulo del proyecto propietario, según su arquitectura particular | Es comportamiento del producto, no una capacidad técnica general. |
| Esquema de una API entre cliente y servidor | `contracts/` | Es un contrato de comunicación versionado. |
| Pruebas unitarias y endpoints de una API | `src/apps/<producto>/<api>/test/` | Verifican un único proyecto, independientemente del tipo de prueba. |
| Recorrido e2e web + API | `tests/e2e/` | Cruza más de un deployable. |
| Script usado por varios workflows | `tools/ci/` | Es automatización reusable del repositorio. |
| Workflow de pull request | `.github/workflows/` | Es configuración de CI/CD del proveedor. |

## Higiene y mantenimiento

- Usa nombres en minúsculas con guiones cuando el nombre sea una carpeta o archivo nuevo.
- Mantén los tests, el README local y la configuración cerca del paquete o aplicación a la que pertenecen.
- Actualiza esta documentación cuando cambien las fronteras, las rutas o la estrategia de CI/CD.
- Para agregar, modificar o retirar una regla, aplica [architecture-rules-sync](../../.agents/skills/architecture-rules-sync/SKILL.md) y sincroniza la documentación con los checks, pruebas y alcance realmente verificado de los proyectos afectados.
- No versiones `node_modules/`, `dist/`, `build/`, `coverage/`, archivos `.env`, tokens ni secretos.
- Valida datos en los bordes y usa tipos explícitos; no introduzcas `any` sin una justificación verificable.
- Antes de mover código a `libs/`, comprueba consumidores reales, dependencias permitidas, API pública, pruebas y documentación.

## Fuentes relacionadas

- [README del monorepo](../../README.md)
- [Índice de documentación](../README.md)
- [Instrucciones de arquitectura](../../.agents/instructions/10-architecture.md)
- [Instrucciones de documentación](../../.agents/instructions/60-documentation.md)
- [README de infraestructura](../../infra/README.md)
- [README de pruebas transversales](../../tests/README.md)
- [README de herramientas](../../tools/README.md)
