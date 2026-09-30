# Arquitectura y estructura del monorepo

- Estado: guía estructural vigente
- Alcance: organización del repositorio, límites entre aplicaciones y librerías, documentación y CI/CD

## Propósito

CasePilot se organiza como un monorepo para mantener en un mismo repositorio las aplicaciones web, mobile y backend, junto con las capacidades técnicas reutilizables que necesitan. La estructura separa dos tipos de código:

- `src/apps/`: código específico de una aplicación ejecutable o desplegable.
- `src/libs/`: capacidades generales, independientes de una aplicación concreta y reutilizables por más de un consumidor.

Esta separación evita que una aplicación se convierta en una dependencia accidental de otra y evita que `libs/` se transforme en un cajón de código de negocio sin un dueño claro.

Las carpetas que todavía no tienen una responsabilidad o un consumidor real no deben crearse solo para completar el árbol. Los nombres mostrados como futuros son una guía, no una obligación de crear directorios vacíos.

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
│       ├── frontend/                # capacidades compartidas de interfaz web
│       └── mobile/                  # adaptadores y capacidades mobile compartidas
├── contracts/                       # contratos entre aplicaciones, servicios y procesos
├── tests/                           # pruebas que cruzan límites del monorepo
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

Capacidades server-side compartidas por APIs, workers u otros procesos backend. Las áreas previstas en el scaffold actual son:

- `auth/`: mecanismos y adaptadores técnicos de autenticación;
- `database/`: acceso técnico a persistencia y adaptadores, sin modelos de una feature concreta;
- `email/`: envío de correo y adaptadores de proveedores;
- `exception-handler/`: normalización y traducción de errores;
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

Pruebas que cruzan límites del monorepo:

- `e2e/`: recorridos completos desde la perspectiva del usuario;
- `integration/`: colaboración entre aplicaciones, servicios, adaptadores y contratos;
- `performance/`: mediciones reproducibles;
- `architecture/`: reglas de dependencias y estructura;
- `fixtures/`: datos mínimos, deterministas y no sensibles.

Las pruebas unitarias estrechamente ligadas a una app o librería pueden vivir junto al código. No se guardan credenciales reales, volcados de producción ni datos personales innecesarios.

### `infra/`

Infraestructura como código y artefactos de runtime: por ejemplo Terraform, Kubernetes, Helm o Docker. Describe y provisiona recursos técnicos. No contiene features de producto ni secretos versionados.

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
| Regla de negocio de casos o documentos | App o módulo que posee esa feature | No pertenece a una librería general. |
| Esquema de una API entre cliente y servidor | `contracts/` | Es un contrato de comunicación versionado. |
| Recorrido e2e web + API | `tests/e2e/` | Cruza más de un deployable. |
| Script usado por varios workflows | `tools/ci/` | Es automatización reusable del repositorio. |
| Workflow de pull request | `.github/workflows/` | Es configuración de CI/CD del proveedor. |

## Higiene y mantenimiento

- Usa nombres en minúsculas con guiones cuando el nombre sea una carpeta o archivo nuevo.
- Mantén los tests, el README local y la configuración cerca del paquete o aplicación a la que pertenecen.
- Actualiza esta documentación cuando cambien las fronteras, las rutas o la estrategia de CI/CD.
- No versiones `node_modules/`, `dist/`, `build/`, `coverage/`, archivos `.env`, tokens ni secretos.
- Valida datos en los bordes y usa tipos explícitos; no introduzcas `any` sin una justificación verificable.
- Antes de mover código a `libs/`, comprueba consumidores reales, dependencias permitidas, API pública, pruebas y documentación.

## Fuentes relacionadas

- [README del monorepo](../../README.md)
- [Instrucciones de arquitectura](../../.agents/instructions/10-architecture.md)
- [Instrucciones de documentación](../../.agents/instructions/60-documentation.md)
- [README de infraestructura](../../infra/README.md)
- [README de pruebas transversales](../../tests/README.md)
- [README de herramientas](../../tools/README.md)
