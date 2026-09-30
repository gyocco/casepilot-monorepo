# 10 — Arquitectura y límites

## Capas recomendadas

La guía canónica es [Estructura y límites del monorepo](../../docs/architecture/monorepo-structure.md).

Mantén una dirección de dependencias simple:

```text
src/apps/casepilot/casepilot-web y casepilot-mobile
  ├── rutas, páginas y composición de features
  ├── src/libs/frontend/* y src/libs/mobile/* según runtime y compatibilidad
  └── contratos compartidos

src/apps/casepilot/casepilot-api
  ├── bootstrap, transporte y composición del servicio NestJS
  ├── módulos propios de dominio, aplicación e infraestructura
  ├── src/libs/backend/* para capacidades técnicas generales
  └── contracts para APIs, eventos y mensajes

contracts/
  ├── openapi
  ├── protobuf
  └── events
```

Las aplicaciones pueden consumir librerías y contratos. Las librerías no deben importar código desde `apps/`. La lógica de dominio no debe depender de React, Ionic, NestJS, APIs del navegador ni una implementación concreta de persistencia.

## Dónde colocar cada cosa

### `src/apps/casepilot/casepilot-web/` y `src/apps/casepilot/casepilot-mobile/`

Usa estas carpetas para composición específica de cada aplicación:

- `src/`: bootstrap, rutas, páginas y composición local;
- features que solo tengan sentido para esa aplicación;
- configuración y scripts propios de su runtime;
- README local con comandos y variables no sensibles.

Las features, reglas de negocio y componentes específicos permanecen en la app que los posee. Solo extrae capacidades técnicas generales a `src/libs/frontend/` o `src/libs/mobile/` cuando tengan consumidores reales o planificados y una frontera explícita.

### `src/libs/frontend/` y `src/libs/mobile/`

`frontend/` agrupa UI y capacidades de cliente reutilizables; `pilot-ui-kit/` es el lugar previsto para componentes, tokens y patrones accesibles. `mobile/` agrupa adaptadores de dispositivo y plataforma con fallback web cuando corresponda. Una librería debe ser reusable, testeable, independiente de rutas y negocio de CasePilot y tener una API clara.

### `src/apps/casepilot/casepilot-api/`

Contiene la API NestJS con TypeScript: bootstrap, configuración, transporte, health checks y composición de módulos. Los módulos de dominio, aplicación e infraestructura específicos de CasePilot permanecen en esta app. Si se incorporan workers o schedulers como deployables independientes, se ubican en `src/apps/<producto>/<app>/` con su propia entrada y configuración.

### `src/libs/backend/`

Agrupa capacidades técnicas generales como `auth`, `database`, `email`, `exception-handler`, `logging`, `pdf` y `security`. No contiene reglas de negocio ni modelos específicos de una feature. La conexión a persistencia y los adaptadores generales pueden compartirse; los repositorios y consultas de negocio permanecen con su módulo propietario. Estas librerías solo se consumen desde procesos backend y nunca llegan a bundles web o mobile.

### `contracts/`

Contiene contratos independientes de tecnología: OpenAPI para APIs HTTP, protobuf para comunicación binaria cuando exista una necesidad real y esquemas de eventos versionados. No debe duplicar modelos internos de dominio.

## Reglas de diseño

- Una función, módulo o componente debe tener una responsabilidad explicable en una frase.
- Modela los estados relevantes explícitamente: loading, success, empty, error y offline cuando aplique.
- Valida y transforma datos en los bordes; no propagues respuestas crudas de integraciones por toda la UI.
- Evita dependencias circulares y barrels que oculten ciclos.
- Usa contratos tipados entre clientes y servicios.
- Una nueva dependencia externa necesita justificar su necesidad, impacto en bundle/runtime, licencia, mantenimiento y alternativa.
- Cambios transversales de arquitectura, persistencia, autenticación o plataforma requieren un ADR en `docs/adr/`.

## Regla de reusabilidad

Antes de copiar lógica:

1. Comprueba si ya existe una librería o adaptador equivalente.
2. Si la lógica es de dominio de CasePilot, mantenla en el módulo de la app o servicio que posee la feature, independiente del framework y de la persistencia.
3. Si es acceso a datos o una integración backend específica, usa la infraestructura del módulo propietario. Solo extrae el mecanismo técnico general a `src/libs/backend/<capability>/`.
4. Si es visual y se repetirá entre aplicaciones frontend, usa la librería frontend correspondiente.
5. Si es un contrato entre procesos o tecnologías, ubícalo en `contracts/`.

Una abstracción compartida debe tener consumidores reales o un contrato claramente planificado.
