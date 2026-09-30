# CasePilot Monorepo

Monorepo de CasePilot. La estructura separa los ejecutables y deployables de las librerías reutilizables, los contratos entre tecnologías, las pruebas y la operación. La carpeta `src/` agrupa los workspaces de código (`web-ui`, `services` y `mobile-ui`).

La implementación actual es la aplicación browser pública en [`src/web-ui/apps/public`](src/web-ui/apps/public/README.md), construida con React, Vite, Ionic React y Tailwind CSS. Los servicios futuros serán aplicaciones NestJS con TypeScript bajo `src/services/apps/`.

## Estructura base

```text
.
├── src/                            # workspaces de código
│   ├── web-ui/
│   │   ├── apps/                   # aplicaciones browser desplegables
│   │   │   ├── public/             # implementada actualmente
│   │   │   ├── admin/              # futura aplicación administrativa
│   │   │   └── backoffice/         # futura aplicación interna
│   │   └── libs/                   # librerías frontend de web
│   │       ├── identity/
│   │       ├── platform/
│   │       └── shared/
│   ├── services/
│   │   ├── apps/                   # deployables NestJS/TypeScript
│   │   │   ├── public-api/
│   │   │   ├── admin-api/
│   │   │   ├── workers/
│   │   │   └── schedulers/
│   │   └── libs/                   # dominio, aplicación e infraestructura backend
│   │       ├── orders/
│   │       ├── customers/
│   │       ├── billing/
│   │       ├── identity/
│   │       ├── platform/
│   │       └── shared/
│   └── mobile-ui/
│       ├── apps/                   # futuras aplicaciones Capacitor/Ionic
│       │   ├── customer/
│       │   └── internal/
│       └── libs/                   # librerías específicas de mobile
├── contracts/                      # OpenAPI, protobuf y eventos
├── tests/                          # e2e, integración, performance y arquitectura
├── infra/                          # Terraform, Kubernetes, Helm y Docker
├── deploy/                         # configuración por entorno
├── tools/                          # scripts, generadores y codegen
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── development/
│   └── ...                         # producto, operaciones y referencias existentes
├── .github/workflows/
├── package.json
├── pnpm-workspace.yaml
├── .editorconfig
└── README.md
```

Las carpetas que todavía no tienen un consumidor real no se crean solo para completar el árbol. Por eso pueden no existir aún `admin`, `backoffice`, `src/mobile-ui/apps`, los servicios NestJS, las librerías y los módulos de infraestructura.

## Límites de arquitectura

- `*/apps/` contiene código ejecutable o desplegable.
- `*/libs/` contiene código reusable y no importa desde una aplicación concreta.
- `src/services/apps/` contiene el bootstrap, transporte y composición de cada servicio NestJS.
- `src/services/libs/` contiene dominio, aplicación, infraestructura y adaptadores por módulo.
- `contracts/` contiene contratos independientes del framework y del proveedor de persistencia.
- La UI consume APIs y contratos tipados; no accede directamente a persistencia.
- No se usa Supabase. La elección de persistencia y proveedores se mantiene detrás de las fronteras backend.
- No se instala Nx. El workspace solo declara patrones pnpm y scripts explícitos.

La dirección general de dependencias es:

```text
src/web-ui/apps -> src/web-ui/libs y contracts
src/services/apps -> src/services/libs y contracts
src/mobile-ui/apps -> src/mobile-ui/libs y contracts
```

## Documentación y desarrollo

- [Índice de documentación](docs/README.md)
- [Arquitectura](docs/architecture/README.md)
- [Desarrollo](docs/development/README.md)
- [Decisiones técnicas](docs/adr/README.md)
- [Configuración de la app web pública](src/web-ui/apps/public/README.md)

El backend se implementará con NestJS/TypeScript; por esa razón no se crean `Directory.Build.props`, `Directory.Packages.props`, proyectos `.csproj` ni una solución `.slnx`. Esas piezas del árbol de referencia pertenecen a una variante .NET y no aplican a CasePilot.

No hay configuración, migraciones ni dependencias de Supabase en este repositorio.
