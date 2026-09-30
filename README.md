# CasePilot Monorepo

Monorepo de CasePilot. `src/apps/` agrupa las aplicaciones ejecutables y desplegables por producto; `src/libs/` agrupa las capacidades técnicas reutilizables por runtime: backend, frontend y mobile. La fuente detallada de estructura y límites es [Estructura y límites del monorepo](docs/architecture/monorepo-structure.md).

## Estado actual

El repositorio contiene un scaffold. Las carpetas de las aplicaciones y librerías solo tienen `.gitkeep`; todavía no contienen código ni `package.json` propios. La web prevista usará React, Vite, Ionic React y Tailwind CSS; la API usará NestJS con TypeScript y mobile se empaquetará con Ionic/Capacitor.

## Estructura

```text
.
├── .agents/                         # instrucciones y skills para agentes
├── src/
│   ├── apps/
│   │   └── casepilot/
│   │       ├── casepilot-api/       # backend desplegable
│   │       ├── casepilot-mobile/    # aplicación Ionic/Capacitor
│   │       └── casepilot-web/       # aplicación React/Vite/Ionic
│   └── libs/
│       ├── backend/                 # capacidades server-side compartidas
│       │   ├── auth/
│       │   ├── database/
│       │   ├── email/
│       │   ├── exception-handler/
│       │   ├── logging/
│       │   ├── pdf/
│       │   └── security/
│       ├── frontend/
│       │   └── pilot-ui-kit/        # UI reusable
│       └── mobile/                  # adaptadores y capacidades mobile
├── docs/
│   ├── README.md                   # índice de documentación
│   ├── architecture/
│   │   └── monorepo-structure.md    # estructura y límites
│   └── adr/
│       └── 0001-local-postgresql.md # decisión del entorno PostgreSQL local
├── infra/                          # infraestructura y artefactos de runtime
├── tests/                          # pruebas que cruzan límites del monorepo
├── tools/                          # scripts, generadores y codegen
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .editorconfig
└── README.md
```

`contracts/`, `deploy/` y `.github/workflows/` se incorporarán cuando exista un contrato, despliegue o pipeline real. No se crean más módulos vacíos solo para completar un árbol.

## Límites de arquitectura

- `src/apps/` contiene bootstrap, configuración, composición y features específicas de cada aplicación. Las reglas de negocio permanecen en la app o módulo que las posee.
- `src/libs/` contiene capacidades técnicas generales con una API clara y consumidores reales o planificados. Las librerías no importan desde aplicaciones ni contienen reglas de negocio específicas de CasePilot.
- `src/libs/backend/` solo se consume desde procesos server-side; no debe llegar a bundles web o mobile.
- `src/libs/frontend/` contiene UI reusable; `src/libs/mobile/` aísla capacidades y diferencias de plataforma con fallback web cuando corresponda.
- `contracts/` contendrá contratos entre clientes, servicios y procesos, independientes del framework y del proveedor de persistencia.
- La UI consume APIs y contratos tipados; no accede directamente a persistencia.
- No se usa Supabase ni se instala Nx. El workspace usa patrones pnpm y scripts explícitos.

## Workspace y comandos

`pnpm-workspace.yaml` incluye aplicaciones en `src/apps/*/*` y librerías en `src/libs/backend/*`, `src/libs/frontend/*` y `src/libs/mobile/*`. Cada paquete se declara con su propio `package.json` cuando se implemente.

Los scripts raíz apuntan a `src/apps/casepilot/casepilot-web/`:

```bash
pnpm dev:web
pnpm lint:web
pnpm build:web
```

Estos comandos estarán disponibles cuando la app web tenga un `package.json` con scripts `dev`, `lint` y `build`. En el scaffold actual no se pueden ejecutar verificaciones de producto.

## Dependencias locales

Con Docker Desktop/Engine activo, desde la raíz:

```bash
pnpm infra:up
pnpm infra:status
pnpm infra:down
```

El entorno inicia PostgreSQL en `127.0.0.1:55432`, genera una contraseña local en un archivo ignorado por Git y conserva los datos al apagarlo. Los requisitos, variables, conexión de la API y demás comandos están en [Dependencias locales de CasePilot](infra/docker/README.md).

## Documentación

- [Índice de documentación](docs/README.md)
- [Estructura y límites del monorepo](docs/architecture/monorepo-structure.md)
- [Instrucciones para agentes](AGENTS.md)
- [Infraestructura](infra/README.md)
- [Pruebas transversales](tests/README.md)
- [Herramientas](tools/README.md)

El backend previsto es NestJS/TypeScript. No se crean proyectos ni archivos de configuración .NET.
