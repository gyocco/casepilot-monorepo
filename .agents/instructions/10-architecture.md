# 10 — Arquitectura y límites

## Capas recomendadas

La guía canónica es [Arquitectura del monorepo](../../docs/architecture/monorepo-architecture.md).

Para backend, la fuente de diseño es [Arquitectura base backend](../../docs/architecture/backend-architecture-baseline.md) y la fuente normativa es [Reglas obligatorias de la arquitectura base backend](../../docs/architecture/backend-architecture-baseline-rules.md). La [arquitectura particular de CasePilot](../../docs/architecture/casepilot-backend-architecture.md) registra su adopción. DEBE aplicar la skill [backend-architecture](../skills/backend-architecture/SKILL.md) y todas las reglas activas. En el backend, toda lógica de negocio y de casos de uso vive exclusivamente en Application; Domain contiene datos y contratos sin comportamiento de negocio. La decisión se registra en el [ADR 0002](../../docs/adr/0002-backend-application-owned-business-logic.md).

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

Las aplicaciones pueden consumir librerías y contratos. Las librerías no deben importar código desde `apps/`. La lógica de negocio no debe depender de React, Ionic, NestJS, APIs del navegador ni una implementación concreta de persistencia. En backend se implementa en Application; modelos de Domain y contratos internos mantienen la misma independencia.

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

La organización interna usa una única `application/`, `domain/`, `infrastructure/` y `presentation/` directamente bajo `src/` de la app, sin división por contextos ni capas repetidas por feature. Los modelos relacionados comparten Domain. Database y configuración técnica pertenecen a `infrastructure/database/` e `infrastructure/config/`; bootstrap y composición raíz pueden permanecer como archivos en `src/`. Cada command/query tiene un único request obligatorio y un único response concreto. Controllers delegan; repositorios hacen operaciones individuales; Application coordina transacciones. Los detalles y criterios verificables se mantienen únicamente en las reglas backend enlazadas arriba.

Dentro de Application de CasePilot API, aplica [BCK-023](../../docs/architecture/backend-architecture-baseline-rules.md#bck-023--application-organizada-por-recurso-y-operacion) y [CPA-001](../../docs/architecture/casepilot-backend-architecture.md#cpa-001--application-de-la-api-organizada-por-recurso): `application/<recurso>/<operacion>/` con archivos handler/request/response obligatorios. Los datos, mappers y reglas reutilizados entre operaciones van a `<recurso>/shared/`; los colaboradores entre recursos a `application/shared/`. Health usa `application/health/get-health-check-objects/`. Evolución: [ADR 0009](../../docs/adr/0009-resource-organized-application.md) y [ADR 0017](../../docs/adr/0017-operation-organized-application.md).

Aplica también [CPA-002](../../docs/architecture/casepilot-backend-architecture.md#cpa-002--contratos-cqrs-compartidos-e-invocacion-directa): `<Operation>Handler` en `.handler.ts`, contrato único `Handler` de `@casepilot/cqrs`, modelos que heredan de Request/Response e invocación directa. La [librería CQRS](../../src/libs/backend/cqrs/README.md) contiene solo bases y contratos generales; decisión: [ADR 0010](../../docs/adr/0010-shared-cqrs-contracts.md).

Aplica [BCK-021/BCK-022](../../docs/architecture/backend-architecture-baseline-rules.md) y [CPA-003](../../docs/architecture/casepilot-backend-architecture.md#cpa-003--abstracciones-de-data-access-compartidas): contratos Repository/CrudRepository y Entity de `@casepilot/abstractions`, firmas sin DTOs/objetos custom y UnitOfWork coordinado por Application con repositorios del scope. El adaptador `/typeorm` solo pertenece a Infrastructure/composición. Modelos genéricos en `dataaccess/models/`; entidades/repositorios concretos de producto permanecen en su app. API, pruebas y comandos: [README abstractions](../../src/libs/backend/abstractions/README.md).

Para Presentation de la API aplica [CPA-004](../../docs/architecture/casepilot-backend-architecture.md#cpa-004--presentation-organizada-por-modulo-de-recurso): módulos de recurso en `presentation/<recurso>/<recurso>.module.ts`, con sus controllers y modelos de transporte en esa carpeta. Solo los archivos de composición enlazan Domain/Infrastructure; los adaptadores siguen delegando a Application. La raíz conserva AppModule/ApiModule y los módulos técnicos permanecen en Infrastructure. Decisión: [ADR 0014](../../docs/adr/0014-resource-organized-presentation.md).

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
2. Si la lógica es de negocio de CasePilot, mantenla en el módulo de la app o servicio que posee la feature, independiente del framework y de la persistencia; en backend reside exclusivamente en su capa Application.
3. Si es acceso a datos o una integración backend específica, usa la infraestructura del módulo propietario. Solo extrae el mecanismo técnico general a `src/libs/backend/<capability>/`.
4. Si es visual y se repetirá entre aplicaciones frontend, usa la librería frontend correspondiente.
5. Si es un contrato entre procesos o tecnologías, ubícalo en `contracts/`.

Una abstracción compartida debe tener consumidores reales o un contrato claramente planificado.

Aplica CPA-005 y ADR 0016: mecanismos backend genéricos en libs/backend, políticas en la app, entradas públicas puras y adaptadores /typeorm, /node y /nestjs separados. Consulta los README de abstractions, cqrs, validation y exception-handler; no recrees helpers genéricos en application/shared.
