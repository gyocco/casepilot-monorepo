# 0002 — Arquitectura backend y lógica exclusiva en Application

- Estado: aceptada; organización por contextos sustituida por el [ADR 0008](0008-application-wide-backend-layers.md). Las decisiones restantes continúan vigentes.
- Fecha: 2026-09-30.
- Alcance: backend NestJS/TypeScript de CasePilot con TypeORM.
- Evolución documental: [ADR 0006](0006-reusable-backend-baseline.md), base reutilizable y adopción particular desde 2026-10-01; la decisión de negocio sigue vigente.

## Contexto

La API es un placeholder y todavía no tiene dependencias ni código de producto. Se necesita una arquitectura explícita antes de implementar, compatible con las fronteras de [apps y libs](../architecture/monorepo-architecture.md), varias audiencias y futuros bounded contexts.

El responsable del proyecto decidió que toda lógica de negocio y de casos de uso pertenezca exclusivamente a Application. También exige un request y un response concretos por command/query, repositorios de operaciones individuales y coordinación transaccional en Application. Esta decisión ajusta la discusión inicial, que contemplaba comportamiento de negocio en entidades de Domain.

## Decisión

Adoptar un monolito modular por contextos, con Domain, Application, Infrastructure y Presentation/Web, más composición del proceso NestJS. Adoptar TypeORM como mecanismo de persistencia de la futura implementación.

- Application ejecuta todos los casos de uso mediante commands/queries y contiene todas sus reglas, validaciones funcionales, permisos, cálculos y transiciones.
- Domain representa datos y contratos sin comportamiento de negocio; no se usa un dominio rico como ubicación alternativa de reglas.
- Cada operación recibe exactamente una clase request como único argumento requerido y devuelve exactamente una clase response como objeto completo de salida.
- Los repositorios implementan operaciones individuales sobre la entidad y sus relaciones explícitas, sin reglas, transacciones propias ni flujos compuestos.
- Application define el alcance de transacciones y coordina las operaciones. Infrastructure puede implementar únicamente su mecanismo técnico, usando recursos aislados por scope.
- Controllers y otros transportes adaptan inputs/outputs y delegan. Los mecanismos técnicos generales permanecen en `src/libs/backend/`; el negocio conserva su contexto propietario.

Las fuentes canónicas son la [guía detallada](../architecture/backend-architecture-baseline.md) y las [reglas obligatorias](../architecture/backend-architecture-baseline-rules.md). La [arquitectura particular de CasePilot](../architecture/casepilot-backend-architecture.md) declara su adopción íntegra. La [skill backend](../../.agents/skills/backend-architecture/SKILL.md) guía su aplicación y se enlaza desde el arranque de agentes; no duplica el catálogo normativo.

## Alternativas

- Dominio rico con reglas e invariantes en entidades/value objects: descartado por la decisión explícita de concentrar el negocio en Application.
- Handlers que dependen directamente de TypeORM: descartado para mantener puertos, tipos internos y mecanismos de persistencia separados.
- Repositorios que persisten grafos o coordinan varias operaciones: descartado porque oculta composición y alcance transaccional fuera de Application.
- Controllers con servicios de negocio locales: descartado para que las mismas reglas se ejecuten desde HTTP, mensajes y tareas programadas.
- Microservicios o paquetes compartidos de producto desde el inicio: diferidos hasta existir una necesidad concreta y una frontera documentada.

## Consecuencias

Los handlers y colaboradores internos de Application tienen mayor responsabilidad y necesitan pruebas claras de reglas, permisos y conflictos. Los modelos de Domain son estructuras; el diseño usa vocabulario y límites de contexto sin adoptar todas las prácticas de un dominio rico.

Request y response explícitos añaden modelos incluso en operaciones sencillas. Permiten mantener una firma uniforme, encapsular todos los inputs y representar resultados vacíos o borrados sin retornos `void`.

Las relaciones y escrituras compuestas se expresan en Application. Se deben revisar cascadas, hooks y transacciones implícitas del ORM para que su comportamiento no eluda las reglas. La revisión incluye el scope transaccional y la concurrencia, no solo la presencia de un callback de transacción.

Varias APIs pueden tener contratos distintos y consumir el mismo servicio propietario. Si más adelante deben ejecutar el mismo negocio en procesos independientes, se decidirá un espacio de paquetes de producto compatible con una actualización de la estructura; esta decisión no autoriza colocar negocio de CasePilot en librerías generales ni importar una app desde otra.

Este ADR y los documentos relacionados no crean implementación, dependencias, despliegues ni checks de arquitectura automatizados. Las versiones concretas se fijarán al implementar. La adopción de nuevas reglas mantiene identificadores estables y la fuente normativa sincronizada.
