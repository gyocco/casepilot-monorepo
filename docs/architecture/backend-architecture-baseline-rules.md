# Reglas obligatorias de la arquitectura base backend

- Estado: base normativa reutilizable; obligatoria en cada proyecto que la adopte explícitamente.
- Revisión: 2026-10-01.
- Fecha inicial: 2026-09-30.
- Alcance: APIs, workers, schedulers, adaptadores y librerías backend de los proyectos que adopten esta base NestJS/TypeScript con TypeORM.
- Diseño explicado: [Arquitectura base backend](backend-architecture-baseline.md).
- Adopción: cada proyecto declara esta base en su arquitectura particular y registra la decisión en su propio ADR.

## Carácter obligatorio

Este documento es la fuente canónica de las restricciones de esta arquitectura base backend. Su presencia en un repositorio no obliga a otros proyectos a adoptarla. Una adopción explícita incorpora el catálogo completo; la arquitectura particular puede añadir restricciones compatibles y concretar decisiones técnicas, pero no flexibilizar las reglas activas. Todas las reglas activas son excluyentes: **DEBE** y **NO DEBE** expresan requisitos, no recomendaciones. Un cambio que incumpla una regla no está terminado y no debe aceptarse como compatible con la arquitectura.

No existen excepciones implícitas por simplicidad, rendimiento, conveniencia del ORM, prácticas de otros proyectos o carácter temporal. Un comentario, un ADR aislado o una supresión de lint no autorizan el incumplimiento. Para cambiar una regla se requiere una decisión explícita del responsable del proyecto, registrada y aplicada a esta normativa antes de introducir la arquitectura diferente. Las instrucciones del sistema y del usuario tienen prioridad; un cambio explícito de criterio del usuario se sincroniza con estas fuentes.

Las reglas se identifican con `BCK-NNN`. Los identificadores no se reutilizan ni se renumeran al agregar reglas. El catálogo debe crecer con restricciones concretas, compatibles y verificables. La guía descriptiva, las skills y los ejemplos remiten a este catálogo; no mantienen copias alternativas de la normativa.

## BCK-001 — Application es el único propietario del negocio

**Toda lógica de negocio y de casos de uso DEBE residir exclusivamente en Application, ejecutada por commands y queries.**

- Incluye reglas, cálculos, decisiones, validaciones de negocio, permisos sobre recursos, transiciones, coordinación de operaciones y tratamiento funcional de sus resultados.
- Puede factorizarse en políticas, validadores y colaboradores internos de Application llamados por handlers; esto no crea entradas de negocio alternativas.
- NO DEBE aparecer en Domain, controllers, repositorios, Infrastructure, módulos de composición, librerías generales, hooks ORM, triggers, scripts o contratos.

**Verificación:** localizar cada decisión del producto y comprobar que su implementación y punto de ejecución pertenecen a Application.

## BCK-002 — Domain contiene modelos y contratos sin comportamiento de negocio

**Domain DEBE limitarse a representar datos, tipos, enums, constantes, relaciones y contratos internos.**

- Constructores y modelos NO DEBEN validar reglas, calcular valores del producto, decidir estados o ejecutar transiciones.
- Entidades, agregaciones conceptuales y estructuras de valores NO DEBEN ejecutar negocio, persistencia, integraciones o publicación de eventos.
- Declarar estados válidos como enum no autoriza a validar sus transiciones en Domain.

**Verificación:** revisar métodos, constructores, getters y funciones de Domain; la inicialización estructural no debe ocultar reglas.

## BCK-003 — Los adaptadores de entrada no ejecutan negocio

**Controllers y otros adaptadores DEBEN limitarse a recibir, validar técnicamente, mapear, delegar y representar resultados.**

- Cada operación de producto delega a un command o query; la composición de varios casos de uso pertenece a Application.
- NO DEBEN consultar repositorios ni invocar SDKs/proveedores para resolver negocio.
- Guards, pipes, middleware, webhooks, consumidores de mensajes y schedulers NO DEBEN convertirse en ubicaciones alternativas para reglas del producto.
- Health checks y controles técnicos del proceso no constituyen casos de uso del producto ni una excepción para ejecutar negocio.

**Verificación:** revisar dependencias y cuerpo del adaptador; debe ser posible cambiar el transporte sin mover decisiones del caso de uso.

## BCK-004 — Exactamente un request obligatorio por command y query

**La ejecución de cada command y query DEBE recibir uno y solo un parámetro requerido, de una clase concreta `<Operation>Request`.**

- El request contiene todos los inputs necesarios. Un solo dato primitivo sigue requiriendo su wrapper; una operación sin datos específicos sigue requiriendo su clase y argumento request.
- NO se permiten parámetros extra, primitivos como entrada completa, rest parameters, argumentos opcionales, valores por defecto que omitan el request o sobrecargas alternativas.
- Identidad verificada y demás contexto requerido se incluyen como datos tipados del request; NO se pasa un objeto HTTP/Nest/ORM como contexto.
- Las dependencias de construcción/inyección no son inputs de ejecución. Si existe un mensaje envoltorio para el bus, recibe únicamente el request y delega al mismo contrato.

**Verificación:** inspeccionar firmas, todas las llamadas y adaptadores de bus; `execute(request: OperationRequest)` debe ser la única forma de ejecutar la operación.

## BCK-005 — Exactamente un response obligatorio por command y query

**Todo command y query DEBE devolver uno y solo un objeto de una clase concreta `<Operation>Response`, con tipo explícito.**

- La forma asíncrona es `Promise<OperationResponse>`; el objeto contiene todas las propiedades de salida.
- NO se permiten `void`, `undefined`, `null`, primitivos, entidades internas, arrays completos ni tipos genéricos sin un response concreto como retorno exitoso.
- Borrados, operaciones sin payload funcional y consultas sin resultados también tienen response. Colecciones, paginación y ausencia de datos se representan en sus propiedades.
- El response completo NO es opcional. Errores tipados pueden interrumpir la operación; no se devuelven resultados exitosos ficticios para cumplir la firma.

**Verificación:** inspeccionar todos los caminos exitosos y sus tipos; cada uno devuelve el response definido por la operación.

## BCK-006 — Validación de negocio y autorización dentro del caso de uso

**Application DEBE validar los inputs de negocio y los permisos sobre recursos independientemente del transporte.**

- Presentation puede validar formato, tipos y límites técnicos del protocolo, y autenticar identidad mediante mecanismos técnicos.
- Un guard o DTO validator NO sustituye reglas, permisos o validaciones de Application.
- IDs de usuario/tenant, roles o flags enviados por el cliente NO se aceptan como contexto autorizado sin verificación. Si hay multitenancy, Application determina el ámbito y lo transmite a cada acceso permitido.

**Verificación:** probar el caso de uso directamente, incluyendo inputs inválidos y permisos rechazados, sin depender de un controller.

## BCK-007 — Mapeos explícitos y estructurales fuera de Application

**Application DEBE seleccionar explícitamente los datos que usa para crear/modificar entidades y construir responses.**

- NO se copia un body/request completo sobre una entidad mediante asignación masiva.
- Mappers de persistencia y transporte NO toman decisiones del producto, completan estados según políticas ni calculan valores de negocio.
- Responses HTTP NO exponen entidades/modelos ORM o campos internos por serialización automática.

**Verificación:** revisar asignaciones y salida serializada, con atención a campos sensibles, cambios de estado y valores derivados.

## BCK-008 — Dependencias dirigidas hacia contratos internos

**Domain y el núcleo de Application DEBEN permanecer independientes de framework, ORM, transporte y proveedor.**

- Domain NO importa Application, Infrastructure ni Presentation.
- Application consume Domain y puertos; NO importa implementaciones de Infrastructure ni Presentation.
- TypeORM, NestJS, SDKs externos y objetos de runtime quedan en adaptadores/composición. Los contratos internos NO exponen sus tipos.
- Presentation invoca Application; Infrastructure implementa contratos; composición registra bindings. NO se admiten ciclos ni exports generales que eludan esos límites.

**Verificación:** revisar imports, exports, bindings y tipos públicos, no solo la ubicación de archivos.

## BCK-009 — Repositorios de entrada/salida y operación individual

**Cada método de repositorio DEBE ejecutar una única operación individual de obtención, alta, actualización o eliminación sobre su entidad y relaciones explícitas.**

- NO contiene validaciones/políticas de negocio, lectura seguida de decisión y escritura, llamadas a otros repositorios, integraciones, eventos ni varias escrituras ocultas.
- La composición de operaciones DEBE estar en Application. Una sola llamada a `save` u otra API del ORM no demuestra cumplimiento.
- Si items y total requieren lecturas independientes, Application coordina ambas; una API compuesta como `findAndCount` NO demuestra que haya una única operación individual.
- Lecturas de colecciones, filtros, joins propios y proyecciones estructurales son operaciones de obtención; NO pueden ampliar acceso a otro contexto ni decidir elegibilidad de negocio.
- Los criterios autorizados los suministra Application. El repositorio devuelve datos/metadatos técnicos y NO interpreta el resultado como decisión del producto.

**Verificación:** revisar cada operación, sus relaciones, SQL y efectos observables; el nombre del método no es evidencia suficiente de atomicidad.

## BCK-010 — Alcance transaccional exclusivo de Application

**Application DEBE decidir y coordinar toda transacción que componga operaciones de un caso de uso.**

- Repositorios NO inician, confirman, revierten ni anidan transacciones, explícitas o activadas automáticamente por el ORM.
- Un adaptador técnico puede implementar el mecanismo de un puerto transaccional; su callback de operaciones y política pertenecen a Application.
- Un repositorio puede participar en un scope recibido sin crear uno propio. La ejecución atómica implícita de una sentencia por el motor no es una transacción compuesta diseñada por el repositorio.
- Transacciones técnicas de migraciones de esquema quedan fuera de la ejecución de casos de uso; no permiten mover negocio a una migration.

**Verificación:** buscar APIs transaccionales, opciones de persistencia y callbacks; el límite del caso de uso debe estar declarado en Application.

## BCK-011 — Scope transaccional aislado y concurrencia explícita

**Todas las operaciones de una transacción DEBEN usar recursos vinculados a su scope y DEBEN devolver éxito solo tras completar el commit.**

- NO se utilizan managers/repositorios globales dentro de un scope esperando participación automática.
- NO se modifica un singleton con el manager de una petición; NO se filtran objetos ORM hacia Application para resolver el vínculo.
- Application determina la estrategia de concurrencia necesaria y trata conflictos/versiones/resultados de escritura. Infrastructure implementa el mecanismo solicitado sin decidir reintentos funcionales.

**Verificación:** comprobar aislamiento entre ejecuciones, rollback, confirmación y escenarios concurrentes proporcionales al riesgo.

## BCK-012 — Prohibidos los efectos de persistencia ocultos

**Infrastructure y la base NO DEBEN ejecutar operaciones adicionales de producto mediante automatismos.**

- NO se habilitan cascadas ORM de escritura/borrado, eliminación automática de huérfanos o cascadas de borrado en la base que compongan operaciones del caso de uso.
- Listeners, subscribers, hooks, triggers y procedimientos almacenados NO implementan negocio, escrituras adicionales ni notificaciones del producto.
- Las relaciones requeridas se materializan explícitamente en Infrastructure; NO se exportan relaciones lazy con I/O diferido.
- PK, FK, UNIQUE y NOT NULL pueden proteger integridad estructural; no sustituyen validaciones funcionales de Application.

**Verificación:** revisar schemas, opciones ORM, listeners/subscribers y DDL, además del código de repositorios.

## BCK-013 — Queries sin mutación de negocio

**Una query DEBE obtener datos y construir su response sin cambiar estado de negocio ni despachar commands.**

- Commands pueden leer y escribir dentro de su intención.
- Telemetría técnica no cambia esta separación. NO se usan caches, proyecciones o adaptadores de lectura para ocultar escrituras del producto o cálculos funcionales fuera de Application.

**Verificación:** revisar puertos invocados y efectos observables de cada query, incluidos sus adaptadores.

## BCK-014 — Contextos con dueño y API pública

**Cada modelo, tabla, repositorio y caso de uso DEBE tener un contexto propietario; la comunicación entre contextos DEBE usar APIs públicas o contratos explícitos.**

- NO se importan ni usan repositorios, schemas, modelos ORM o tablas privadas de otro contexto.
- Un join o base compartida NO autoriza romper esa frontera. La coordinación y los mapeos entre contextos son explícitos en Application.
- Una nueva API o audiencia NO define automáticamente otro contexto ni permite duplicar reglas del contexto propietario.

**Verificación:** revisar imports entre contextos, acceso a tablas y contratos exportados.

## BCK-015 — Librerías generales sin negocio del producto

**Los paquetes de capacidades backend generales DEBEN contener únicamente mecanismos técnicos configurables y reutilizables.**

- NO contiene entidades, repositorios, commands, queries o políticas específicas del producto. Las librerías NO importan desde apps ni llegan a bundles cliente.
- Las apps NO se convierten en dependencias de otras apps para compartir casos de uso.
- Compartir negocio entre varios hosts requiere una frontera de paquetes de producto decidida y documentada antes de la extracción; NO se disfraza como librería general.
- La ubicación de paquetes y las restricciones de proveedores/runtime se definen en la arquitectura particular y en la estructura del repositorio que adopta esta base.

**Verificación:** comprobar dueño, consumidores, API pública y dirección de dependencias de cada extracción.

## BCK-016 — Errores tipados y traducción por frontera

**Los errores funcionales DEBEN definirse e interpretarse en Application, independientemente de HTTP o del proveedor.**

- Infrastructure informa resultados/errores técnicos normalizados sin decidir consecuencias del producto.
- Presentation traduce responses y errores a contratos/status del transporte. Application NO arroja excepciones HTTP ni devuelve tipos del driver.
- NO se filtran secretos, SQL, tokens, datos personales innecesarios o detalles privados mediante respuestas/logs.

**Verificación:** revisar errores emitidos, mapeos y salida pública de escenarios fallidos.

## BCK-017 — Esquema, migraciones y configuración con una fuente coordinada

**El esquema DEBE evolucionar mediante migraciones versionadas y revisadas, con dueño y ejecución coordinada.**

- Entornos gestionados usan `synchronize: false`. Varias APIs NO mantienen historiales competidores para las mismas tablas ni ejecutan migraciones desde cada réplica al atender requests.
- Runtime y CLI DEBEN usar definiciones compatibles de entidades/opciones; `autoLoadEntities` de Nest NO sustituye la configuración del CLI.
- Credenciales y configuración sensible son server-side e inyectadas. Scripts que ejecutan negocio DEBEN invocar Application en lugar de reproducir reglas.

**Verificación:** revisar DataSource, opciones, migraciones, scripts y procedimiento de ejecución autorizado.

## BCK-018 — Efectos externos coordinados explícitamente

**Application DEBE decidir la secuencia y las garantías de los efectos externos del caso de uso.**

- Correo, mensajes, archivos y llamadas externas NO se disparan desde repositorios, entidades u hooks.
- Un rollback SQL NO se presenta como rollback de una operación externa ya realizada.
- Si se exige entrega fiable asociada al commit, se diseña una estrategia explícita, como outbox e idempotencia; no se afirma esa garantía solo por publicar en un bus en memoria.

**Verificación:** revisar orden de ejecución y fallos parciales, con las garantías efectivamente requeridas por el flujo.

## BCK-019 — Tipos y pruebas que acrediten comportamiento

**El código DEBE mantener tipos explícitos y verificaciones proporcionales al riesgo, sin eludir contratos para pasar checks.**

- NO se usan `any`, casts injustificados o supresiones para saltar firmas, dependencias o reglas. Inputs desconocidos se validan antes de convertirse en modelos tipados.
- Las pruebas de reglas y permisos pertenecen a Application; las de persistencia/transacciones verifican el adaptador con PostgreSQL cuando corresponde.
- DEBEN cubrir errores, autorización negativa y rollback/concurrencia cuando el cambio los afecte. NO se omiten lint, type-check, build o pruebas aplicables sin dejar constancia de la razón.

**Verificación:** revisar evidencia de checks y pruebas de comportamiento; una prueba que repite la implementación no acredita la arquitectura.

## BCK-020 — Cumplimiento completo y evolución de la normativa

**Cada cambio backend DEBE revisarse contra todas las reglas activas, incluidas las incorporadas después de esta versión inicial.**

- El agente DEBE leer esta fuente vigente y aplicar las instrucciones y skills de arquitectura declaradas por el proyecto; un resumen o listado antiguo no sustituye esa lectura.
- Hallazgos se identifican por regla, ubicación y efecto. Un incumplimiento se corrige dentro del alcance autorizado; NO se normaliza modificando reglas silenciosamente ni se declara terminado.
- Una incompatibilidad que requiera cambiar una decisión se presenta concretamente al responsable. Cuando ese cambio ya esté autorizado por el usuario, se documenta y sincroniza sin pedir la misma autorización de nuevo.

**Verificación:** revisar el diff completo y registrar reglas relevantes, checks realizados y limitaciones reales. Cada proyecto documenta qué reglas están verificadas por lint/tests y cuáles requieren revisión normativa/manual. La documentación no implica enforcement automático completo.

## Incorporación de reglas futuras

Para agregar una regla:

1. Identificar la restricción y comprobar que no contradiga una regla activa o una instrucción de mayor prioridad.
2. Asignar el siguiente identificador libre sin modificar los anteriores.
3. Escribir obligación, prohibiciones concretas, alcance y criterio verificable. Evitar convertir una preferencia circunstancial en una prohibición general.
4. Registrar un ADR si cambia una frontera o decisión arquitectónica, y sincronizar la guía y las instrucciones afectadas.
5. Incorporar verificaciones automatizadas cuando exista una herramienta y un comportamiento verificable que lo justifiquen. No afirmar garantías que esas verificaciones todavía no ofrecen.

Una regla reemplazada conserva su identificador y registra estado, fecha y regla/ADR sustituto. El catálogo activo sigue siendo la única fuente normativa.

En este repositorio, aplica [architecture-rules-sync](../../.agents/skills/architecture-rules-sync/SKILL.md) para coordinar altas, modificaciones y retiros con la guía base, la adopción, la estructura del monorepo, los checks y sus pruebas. La cobertura implementada se registra en el proyecto propietario; no se deduce del texto de la regla.
