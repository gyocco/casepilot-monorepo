# CasePilot Monorepo

Repositorio monorepo de CasePilot. La estructura separa las aplicaciones desplegables, los paquetes reutilizables, la infraestructura de Supabase, las pruebas, las herramientas de desarrollo y la documentación.

## Navegación

- [Mapa y reglas de documentación](docs/README.md)
- [Documentación de la aplicación web](apps/web/README.md)
- [Configuración local de Supabase](supabase/config.toml)

## Estructura recomendada

```text
.
├── .agents/
│   ├── instructions/             # instrucciones operativas para agentes
│   └── skills/                   # habilidades y flujos reutilizables
├── apps/
│   └── web/                      # aplicación web desplegable
│       ├── public/               # archivos públicos servidos sin transformación
│       ├── src/                  # código de la aplicación
│       │   ├── assets/           # recursos importados por el código
│       │   └── theme/            # tokens y estilos globales
│       ├── package.json
│       ├── package-lock.json
│       └── README.md
├── packages/
│   ├── supabase-admin/           # acceso privilegiado, solo servidor
│   ├── supabase-client/          # cliente seguro para aplicaciones
│   └── ui-components/            # componentes visuales compartidos
├── supabase/
│   ├── migrations/               # cambios versionados de base de datos
│   ├── functions/                # Edge Functions
│   ├── seed.sql                  # datos mínimos para desarrollo y pruebas
│   ├── config.toml               # configuración local de Supabase
│   └── README.md                 # procedimientos específicos de Supabase
├── docs/
│   ├── README.md
│   ├── 00-overview/
│   ├── 01-product/
│   ├── 02-architecture/
│   ├── 03-development/
│   ├── 04-operations/
│   ├── 05-reference/
│   ├── 06-decisions/
│   ├── 07-project-management/
│   ├── 90-archive/
│   ├── templates/
│   └── assets/
├── tests/
│   ├── unit/                     # pruebas aisladas
│   ├── integration/              # integración entre módulos o servicios
│   ├── e2e/                      # recorridos completos de usuario
│   ├── fixtures/                 # datos y recursos de prueba
│   └── README.md
├── tooling/
│   ├── scripts/                  # automatizaciones de desarrollo y CI
│   ├── config/                   # configuración compartida de herramientas
│   └── README.md
├── .gitignore
└── README.md
```

Las carpetas mostradas como recomendadas pueden permanecer vacías hasta que exista código o documentación que justifique su creación. No se deben añadir archivos ficticios solo para completar el árbol.

## Responsabilidad de cada carpeta

### `.agents/`

Contiene instrucciones y habilidades específicas del repositorio para agentes de desarrollo.

- `instructions/`: reglas estables sobre arquitectura, seguridad, estilo, revisión y operación del proyecto.
- `skills/`: flujos reutilizables. Cada habilidad debe tener su propio directorio y un `SKILL.md` claro.
- No contiene código de producto, credenciales, requisitos funcionales ni documentación general para usuarios.

### `apps/`

Contiene aplicaciones ejecutables y desplegables. Cada aplicación debe ser independiente en su entrada, configuración, scripts y documentación local.

En `apps/web/` viven actualmente la aplicación React/Vite/Ionic, sus archivos públicos, estilos y configuración de TypeScript. El código que pueda reutilizarse en más de una aplicación debe moverse a `packages/` en lugar de copiarse.

### `packages/`

Contiene unidades reutilizables del monorepo. Cada paquete debe tener, como mínimo, su propio `package.json`, código fuente, API pública y `README.md`.

- `supabase-client/`: cliente y tipos seguros para consumo desde aplicaciones.
- `supabase-admin/`: operaciones privilegiadas que nunca deben llegar al navegador ni exponer secretos.
- `ui-components/`: componentes y estilos de interfaz compartidos.

La dirección de dependencias recomendada es `apps -> packages`. Un paquete no debe importar código de una aplicación.

### `supabase/`

Es la fuente versionada de la infraestructura de datos y backend gestionado.

- `config.toml`: configuración local de Supabase CLI.
- `migrations/`: cambios de esquema ordenados y versionados; no se editan migraciones ya aplicadas.
- `functions/<nombre>/`: una Edge Function por directorio, con su código y pruebas específicas.
- `seed.sql` o `seeds/`: datos mínimos, deterministas y no sensibles para desarrollo.
- `tests/`: pruebas SQL o pgTAP, si se incorporan.
- No se versionan estados locales, archivos temporales, tokens, claves privadas ni datos reales.

Los tipos generados de la base de datos deben tener una única ubicación canónica, preferiblemente dentro de `packages/supabase-client`, y no deben editarse manualmente.

### `docs/`

Es la biblioteca de documentación transversal y de larga duración. Su organización y reglas están en [docs/README.md](docs/README.md).

- La documentación que explica una aplicación o paquete concreto debe permanecer junto a ese código, normalmente en su `README.md`.
- La documentación que cruza varias áreas, describe decisiones o explica operación debe vivir en `docs/`.
- Los documentos deben enlazar a una fuente canónica en lugar de duplicar instrucciones.

### `tests/`

Agrupa pruebas que cruzan aplicaciones, paquetes o infraestructura. Se recomienda separar `unit`, `integration` y `e2e`, además de mantener `fixtures` aislados de los datos de producción.

Las pruebas pequeñas y estrechamente ligadas a un módulo pueden colocarse junto al código (`*.test.ts` o `*.test.tsx`). Las pruebas de flujos completos o de integración entre proyectos deben permanecer en la raíz `tests/`.

### `tooling/`

Contiene scripts, generadores, validadores, configuración compartida y tareas de CI/CD. No debe contener lógica de negocio ni código que se ejecute en producción.

### Archivos de la raíz

- `README.md`: entrada general y mapa del monorepo.
- `.gitignore`: exclusiones de archivos generados, locales o sensibles.
- `package.json` y un lockfile raíz: deben añadirse cuando se formalice un workspace común. Mientras cada aplicación gestione sus dependencias por separado, su lockfile permanece junto a ella.
- `.env.example`: nombres de variables requeridas sin valores reales, cuando sean necesarias a nivel de repositorio.
- Configuración de CI/CD: en la raíz si aplica a todo el monorepo; configuración exclusiva de una aplicación junto a esa aplicación.

## Reglas de higiene

- No versionar `node_modules/`, `dist/`, `build/`, `coverage/`, `.env`, estados locales de Supabase ni secretos.
- Preferir nombres de carpetas y archivos en minúsculas con guiones (`kebab-case`).
- Mantener una sola fuente de verdad para cada procedimiento.
- Actualizar el `README.md` local o el documento transversal correspondiente en el mismo cambio que modifica la arquitectura, configuración u operación.
- Antes de crear una carpeta nueva, comprobar si su contenido pertenece a una aplicación, paquete, herramienta, prueba o sección existente de `docs/`.

## Estado inicial observado

El repositorio ya contiene `apps/web` y la configuración base de `supabase`. `packages/`, `tests/` y `tooling/` están preparados como puntos de extensión, mientras que `.agents/` ya contiene las carpetas `instructions/` y `skills/`. La estructura de `docs/` creada en este cambio establece la organización documental objetivo.
