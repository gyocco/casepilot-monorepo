# EPIC-02 — Gestión de clientes

- Estado: propuesta
- Última actualización: 2026-08-02
- Nivel: Epic / módulo

## Objetivo

Permitir que un profesional gestione su cartera de clientes desde un único espacio, con información de contacto, clasificación, notas y una línea de tiempo de interacciones relevantes.

## Alcance base

La épica deberá cubrir el CRUD de clientes, búsqueda y filtros, datos de contacto, etiquetas, campos configurables, notas y timeline. La relación con casos y documentos se detallará junto con las épicas correspondientes.

## Feature semilla

### FEAT-CLI-01 — Cartera y ficha de cliente

Una ficha de cliente debe reunir identidad, contacto, etiquetas, campos del profesional, notas y eventos de timeline, respetando el tenant activo y los permisos de la membresía.

#### US-CLI-001 — Gestionar la cartera de clientes

Como profesional, quiero crear, consultar, editar, archivar y buscar clientes, para mantener organizada mi cartera y disponer de contexto antes de trabajar en un caso.

##### Descripción

Esta historia concentra el ciclo de trabajo de la cartera en una experiencia coherente: alta, consulta, actualización, búsqueda y archivado. La ficha debe ofrecer el contexto suficiente para iniciar un caso sin convertir el cliente en un dato aislado.

##### Criterios de aceptación base

- `AC-CLI-001-01`: se puede crear un cliente con los datos mínimos definidos para el tipo de persona o entidad.
- `AC-CLI-001-02`: se puede consultar una ficha y ver contacto, etiquetas, campos, notas y timeline en estados claros.
- `AC-CLI-001-03`: se puede editar o archivar sin borrar información que deba conservarse por trazabilidad.
- `AC-CLI-001-04`: la búsqueda y los filtros no exponen clientes de otro tenant.
- `AC-CLI-001-05`: la UI funciona en viewport móvil y comunica loading, vacío, error, reintento y éxito.

##### Reglas de negocio base

- `RN-CLI-001-01`: cada cliente pertenece a un único tenant durante esta etapa.
- `RN-CLI-001-02`: los campos obligatorios y el formato de contacto deben validarse en el borde y en backend.
- `RN-CLI-001-03`: archivar no equivale necesariamente a eliminar; la política de retención queda pendiente.

##### Requisitos no funcionales base

- `RNF-CLI-001-01`: PII mínima, autorización server-side/RLS y logs sin datos sensibles innecesarios.
- `RNF-CLI-001-02`: controles accesibles por teclado, lector de pantalla y touch.
- `RNF-CLI-001-03`: consultas paginadas o acotadas para carteras grandes.

## Fuera de alcance por ahora

Importación masiva, deduplicación avanzada, portal del cliente, campañas de comunicación y sincronización con sistemas externos.

## Próxima expansión

Separar historias para tipos de cliente, contactos múltiples, relaciones, etiquetas, campos configurables, notas colaborativas, timeline, búsqueda, archivado, exportación y políticas de retención.
