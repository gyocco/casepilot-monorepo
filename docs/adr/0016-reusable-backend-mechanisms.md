# 0016 — Mecanismos backend reutilizables

- Estado: aceptada.
- Fecha: 2026-10-02.
- Alcance: librerías backend y CasePilot API, con futuras APIs como consumidores planificados.

## Contexto

La API contenía normalización de errores SQL, conversión de filas, descriptores de tablas, una base de repositorio y helpers de validación y paginación reutilizables mezclados con políticas de cuentas, referencias y campos del producto. El usuario solicita que los mecanismos generales tengan dueño en libs/backend.

## Decisión

Extender abstractions con errores y contratos puros de persistencia, StoredEntity, JsonValue/isJsonValue, CrudRuntime, ScopedDataRepository y runPersistence. Separar los adaptadores por entradas públicas /typeorm y /node. El repositorio SQL reutilizable recibe columna de ámbito y columnas inmutables; no fija business_account_id. Mover PageMetadataResponse a cqrs y crear validation para validación estructural parametrizada, con parsers HTTP en su entrada /nestjs.

Application elige reglas y traducción funcional de los errores. La librería ejecuta el mecanismo suministrado, sin elegir consecuencias de negocio. Las relaciones de CasePilot, políticas de campos, paginación y scope CRUD permanecen en Application. Los schemas y repositorios concretos permanecen en Infrastructure. No se crean wrappers que solo reexporten piezas extraídas.

Los errores técnicos conservan cause sin serializarlo en Problem Details. ConflictError pasa al vocabulario compartido y su mapping HTTP estándar a exception-handler. No cambian los endpoints ni sus políticas existentes.

## Verificación y límites

Los paquetes poseen pruebas y checks. Los validadores de la API protegen entradas públicas y prohíben adaptadores en el núcleo, también mediante barrels. ts-morph resuelve las firmas heredadas desde abstractions y la herencia CQRS. La integración usa PostgreSQL efímero y verifica el comportamiento de los consumidores. La identificación de negocio o de código genérico no puede acreditarse completamente mediante imports; permanece la revisión semántica de BCK-001/BCK-015 y CPA-005.

## Consecuencias

Las futuras APIs consumen mecanismos con parámetros explícitos y pruebas propias. Las apps siguen siendo propietarias de decisiones, tablas y contratos concretos. Las nuevas capacidades necesitan build antes de type-check del consumidor, y las fronteras de runtime se mantienen en exports separados.
