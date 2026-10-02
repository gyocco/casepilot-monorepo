# CRUD de servicios profesionales

La API implementa persistencia de los 28 modelos del [dominio](../../../../../docs/product/domain-model-professional-services.md). Todos los endpoints son públicos por decisión explícita del usuario; no se autentican usuarios ni se aplican permisos de Member. businessAccountId selecciona datos y no constituye autorización. [ADR 0015](../../../../../docs/adr/0015-professional-services-database-crud.md) registra el alcance.

## Recursos y rutas

| Modelo | Ruta base |
| --- | --- |
| User | `/users` |
| BusinessAccount | `/business-accounts` |
| Member | `/business-accounts/:businessAccountId/members` |
| ExternalParty | `/business-accounts/:businessAccountId/external-parties` |
| Case | `/business-accounts/:businessAccountId/cases` |
| CaseType | `/business-accounts/:businessAccountId/case-types` |
| CaseExternalParty | `/business-accounts/:businessAccountId/case-external-parties` |
| CaseMember | `/business-accounts/:businessAccountId/case-members` |
| Task | `/business-accounts/:businessAccountId/tasks` |
| Event | `/business-accounts/:businessAccountId/events` |
| Deadline | `/business-accounts/:businessAccountId/deadlines` |
| Folder | `/business-accounts/:businessAccountId/folders` |
| Document | `/business-accounts/:businessAccountId/documents` |
| DocumentVersion | `/business-accounts/:businessAccountId/document-versions` |
| Note | `/business-accounts/:businessAccountId/notes` |
| Comment | `/business-accounts/:businessAccountId/comments` |
| Communication | `/business-accounts/:businessAccountId/communications` |
| Activity | `/business-accounts/:businessAccountId/activities` |
| TimeEntry | `/business-accounts/:businessAccountId/time-entries` |
| Expense | `/business-accounts/:businessAccountId/expenses` |
| Invoice | `/business-accounts/:businessAccountId/invoices` |
| InvoiceLine | `/business-accounts/:businessAccountId/invoice-lines` |
| Payment | `/business-accounts/:businessAccountId/payments` |
| CustomFieldDefinition | `/business-accounts/:businessAccountId/custom-field-definitions` |
| CustomFieldValue | `/business-accounts/:businessAccountId/custom-field-values` |
| StatusDefinition | `/business-accounts/:businessAccountId/status-definitions` |
| Workflow | `/business-accounts/:businessAccountId/workflows` |
| WorkflowStep | `/business-accounts/:businessAccountId/workflow-steps` |

Cada ruta base R ofrece:

| Operación | Endpoint | Resultado |
| --- | --- | --- |
| Insertar | POST R | 201, `{ item }` |
| Obtener | GET R/:id | 200, `{ item }`; 404 si no existe en la cuenta seleccionada |
| Actualizar parcialmente | PATCH R/:id | 200, `{ item }`; body con version actual y al menos un campo mutable |
| Eliminar | DELETE R/:id?version=N | 200, `{ id, deleted: true }`; eliminación física sin cascadas |
| Paginar | GET R?pageNumber=1&pageSize=20&sortBy=id&sortDirection=asc | 200, `{ items, pagination }` |

Paginación empieza en 1 y admite pageSize de 1 a 100; defaults 1/20/id/asc. Los campos admitidos de sortBy están enumerados por recurso en [OpenAPI](../../../../../contracts/openapi/casepilot-api.yaml). El ID desambigua empates. Una página fuera del rango mantiene el total y devuelve items vacío. Items y count son dos lecturas explícitas coordinadas por Application dentro de un snapshot REPEATABLE READ.

El contrato completo de campos, nullabilidad, enums y respuestas está en OpenAPI. Las propiedades JSON utilizan camelCase; las tablas y columnas PostgreSQL usan snake_case. IDs y pertenencia a la cuenta son inmutables.

## Ejemplo

Crear primero una cuenta, un usuario y su Member:

```http
POST /business-accounts
Content-Type: application/json

{"name":"Estudio","timezone":"America/Montevideo","locale":"es-UY","currency":"UYU","countryCode":"UY","status":"ACTIVE"}
```

```http
POST /users
Content-Type: application/json

{"email":"profesional@example.test","firstName":"Ana","lastName":"Ejemplo","status":"ACTIVE"}
```

```http
POST /business-accounts/{accountId}/members
Content-Type: application/json

{"userId":"{userId}","role":"OWNER","status":"ACTIVE"}
```

Crear y actualizar un caso:

```http
POST /business-accounts/{accountId}/cases
Content-Type: application/json

{"title":"Consulta inicial","status":"OPEN","createdByMemberId":"{memberId}"}
```

```http
PATCH /business-accounts/{accountId}/cases/{caseId}
Content-Type: application/json

{"version":1,"title":"Consulta actualizada","description":null}
```

Los placeholders deben reemplazarse por UUIDs devueltos por la API. Cada insert devuelve version 1; cada update exitoso incrementa la versión. Los campos omitidos en PATCH conservan su valor. Null limpia únicamente campos nullable. No se aceptan campos desconocidos ni metadata del servidor.

## Datos, integridad y errores

- Cada tabla tiene UUID, createdAt, updatedAt y version. DocumentVersion, InvoiceLine y WorkflowStep incorporan businessAccountId explícito para reforzar sus relaciones.
- Los decimales se envían y reciben como strings y se almacenan en numeric(20,4). Los campos monetarios son no negativos; CustomFieldValue.valueNumber admite negativos. sizeBytes es un string de bigint para evitar pérdida de precisión en JavaScript.
- Fechas usan YYYY-MM-DD; timestamps requieren ISO 8601 con zona horaria y se devuelven en UTC. createdAt/updatedAt los establece Application. User.email se normaliza a minúsculas.
- Se validan referencias dentro de la cuenta en Application, y PostgreSQL las protege con FKs compuestas. currentVersionId debe pertenecer al mismo Document; una Task asociada a TimeEntry debe pertenecer al mismo Case. Folder rechaza ciclos.
- Las referencias polimórficas de Comment, Activity y CustomFieldValue se validan al insertar/actualizar. entityType/targetType utilizan nombres como CASE, TASK, EXTERNAL_PARTY o DOCUMENT (nombres singulares del dominio en mayúsculas con guiones bajos). No hay FK polimórfica; borrar el destino puede conservar referencias históricas.
- Campos de estado declarados como varchar permiten códigos personalizados; los enums cerrados del documento se validan como valores enumerados. Los campos opcionales omitidos se almacenan como null.
- Unicidad: email de User, slug de BusinessAccount; Member por cuenta/usuario; número de Case/Invoice por cuenta; CaseMember por caso/miembro; CaseExternalParty por caso/parte/rol; versión de documento por documento/número; definición de campo por cuenta/tipo/clave y valor por cuenta/definición/tipo/entidad.
- Escrituras SERIALIZABLE y updates/deletes condicionados por version evitan sobrescrituras. Versiones obsoletas y conflictos detectados durante una sentencia devuelven 409; el cliente vuelve a leer antes de decidir si reintenta. El adaptador UnitOfWork compartido normaliza fallas de apertura o commit como errores técnicos genéricos (500), sin exponer causas del driver.
- DELETE rechaza padres referenciados con 409. El consumidor debe retirar relaciones explícitamente; no hay soft delete, cascadas, triggers, hooks ni transacciones ocultas en repositorios.
- Problem Details conserva el filtro global: 400 para validación, 404 para ausentes, 409 para unicidad/version/referencias y 500 genérico para errores técnicos. Todas las respuestas incluyen Cache-Control: no-store.

Document y DocumentVersion guardan solo metadatos; storageKey/avatarUrl/externalReference son strings sin llamadas externas. No hay subida, lectura, verificación ni borrado de archivos. Tampoco se implementan correos, cobros, cálculo automático de facturas, aplicación de pagos, ejecución de workflows, transiciones automáticas ni auditoría automática. Activity conserva CRUD manual solicitado y no se presenta como auditoría inmutable; estos comportamientos requieren sus propios casos de uso posteriores.

## Migraciones y pruebas

La migración `1790899200000-create-professional-services.ts` crea las 28 tablas, índices, uniques y 80 FKs. Crea primero las tablas y después las FKs para resolver las referencias circulares Document/DocumentVersion. Down retira FKs e índices/tablas sin cascadas. Runtime y CLI comparten registro; synchronize y migrationsRun permanecen en false.

Desde la raíz: `pnpm migration:api:run`. La API no aplica migraciones al arrancar. La ejecución sobre una base compartida debe ser un paso coordinado.

`pnpm test:api` acredita validaciones de Application sin HTTP y los checks arquitectónicos. `pnpm test:api:integration` verifica los 28 recursos por HTTP con PostgreSQL 18 efímero: altas, lecturas, PATCH, DELETE, páginas vacías, orden, precisión, referencias cruzadas, errores, rollback, concurrencia, ausencia de drift y reversión/reaplicación de migraciones. Las pruebas nunca usan ni migran la base persistente de desarrollo.
