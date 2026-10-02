# Modelo de dominio — SaaS para gestión de servicios profesionales

## 1. Objetivo del dominio

El sistema es un SaaS multi-tenant orientado a profesionales y organizaciones que gestionan trabajo basado en casos, expedientes, servicios o proyectos profesionales.

El mismo modelo debe soportar, entre otros escenarios:

- un abogado independiente;
- un estudio jurídico con múltiples abogados y asistentes;
- un contador independiente;
- un estudio contable;
- otros profesionales que gestionen clientes, casos, documentos, tareas, vencimientos, horas y facturación.

La idea central es que todo el dominio de negocio se organiza alrededor de un `BusinessAccount`.

Un `BusinessAccount` puede representar tanto a una persona que trabaja de forma independiente como a una organización con múltiples miembros.

---

# 2. Conceptos principales

El núcleo del dominio puede resumirse de la siguiente forma:

```text
User
  │
  └── Member
        │
        ▼
BusinessAccount
├── Member
├── ExternalParty
├── Case
│   ├── CaseMember
│   ├── CaseExternalParty
│   ├── Task
│   ├── Event
│   ├── Deadline
│   ├── Document
│   ├── Note
│   ├── Communication
│   ├── TimeEntry
│   └── Expense
├── Invoice
├── Payment
├── Workflow
├── StatusDefinition
└── CustomFieldDefinition
```

El sistema distingue claramente entre:

- **usuarios internos**, que acceden a la aplicación mediante `User` y participan de un `BusinessAccount` mediante `Member`;
- **personas u organizaciones externas**, representadas mediante `ExternalParty`;
- **trabajos profesionales**, representados mediante `Case`.

---

# 3. Multi-tenancy

`BusinessAccount` es el límite principal de aislamiento de datos.

Salvo las entidades explícitamente globales, todas las entidades de negocio deben pertenecer directa o indirectamente a un único `BusinessAccount`.

## Entidades globales

Inicialmente:

- `User`

## Entidades pertenecientes a un BusinessAccount

Entre otras:

- `Member`
- `ExternalParty`
- `Case`
- `CaseType`
- `Task`
- `Event`
- `Deadline`
- `Document`
- `Folder`
- `Note`
- `Communication`
- `TimeEntry`
- `Expense`
- `Invoice`
- `Payment`
- `Workflow`

Esto significa que un mismo individuo o empresa puede existir como dos `ExternalParty` diferentes en dos `BusinessAccount` distintos.

No existe un directorio global de clientes compartido entre tenants.

---

# 4. Invariantes principales del dominio

Las siguientes reglas deberían considerarse invariantes:

1. Todo `Member` pertenece a un único `BusinessAccount`.
2. Todo `ExternalParty` pertenece a un único `BusinessAccount`.
3. Todo `Case` pertenece a un único `BusinessAccount`.
4. Un `CaseMember` solo puede relacionar un `Case` con un `Member` del mismo `BusinessAccount`.
5. Un `CaseExternalParty` solo puede relacionar un `Case` con un `ExternalParty` del mismo `BusinessAccount`.
6. Las entidades subordinadas a un `Case` deben pertenecer al mismo `BusinessAccount` que dicho `Case`.
7. Un `User` puede pertenecer a varios `BusinessAccount` diferentes a través de distintos registros `Member`.
8. Un `ExternalParty` nunca debe reutilizarse entre distintos `BusinessAccount`.
9. La autorización debe evaluarse dentro del contexto del `BusinessAccount`.
10. Las operaciones sensibles deberían generar registros de auditoría mediante `Activity`.

---

# 5. Convenciones generales

Las entidades persistentes deberían considerar, salvo que exista una razón para no hacerlo, los siguientes campos comunes:

| Campo | Tipo sugerido | Descripción |
|---|---|---|
| `id` | UUID / ULID | Identificador único |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Última modificación |
| `deleted_at` | timestamp nullable | Soft delete opcional |
| `version` | integer nullable | Control de concurrencia optimista, si se requiere |

Para entidades pertenecientes directamente al tenant:

| Campo | Tipo sugerido | Descripción |
|---|---|---|
| `business_account_id` | UUID / FK | BusinessAccount propietario del registro |

Cuando sea posible, las claves foráneas deberían reforzar a nivel de base de datos las restricciones de tenant.

---

# 6. Entidades

## 6.1 User

### Representa

La identidad global de una persona que puede autenticarse en la plataforma.

`User` no representa al profesional dentro de una organización concreta. Esa relación se representa mediante `Member`.

Un mismo `User` puede participar en múltiples `BusinessAccount`.

### Relaciones

```text
User 1 ─── N Member
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `email` | varchar | Email principal de acceso |
| `email_verified_at` | timestamp nullable | Verificación del email |
| `first_name` | varchar | Nombre |
| `last_name` | varchar | Apellido |
| `display_name` | varchar nullable | Nombre a mostrar |
| `avatar_url` | varchar nullable | Avatar |
| `locale` | varchar nullable | Idioma preferido |
| `timezone` | varchar nullable | Zona horaria |
| `status` | enum | ACTIVE, BLOCKED, DISABLED, etc. |
| `last_login_at` | timestamp nullable | Último acceso |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

### Observaciones

Las credenciales pueden estar en esta entidad o en un subsistema de identidad separado.

---

# 6.2 BusinessAccount

### Representa

El tenant principal del sistema.

Puede representar:

- un profesional independiente;
- un estudio jurídico;
- un estudio contable;
- una consultora;
- cualquier organización usuaria del producto.

### Relaciones

```text
BusinessAccount
├── N Member
├── N ExternalParty
├── N Case
├── N CaseType
├── N Invoice
├── N Workflow
└── N CustomFieldDefinition
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `name` | varchar | Nombre comercial |
| `legal_name` | varchar nullable | Razón social |
| `slug` | varchar nullable | Identificador legible |
| `type` | enum nullable | INDIVIDUAL, FIRM, COMPANY, etc. |
| `tax_id` | varchar nullable | Identificador fiscal |
| `email` | varchar nullable | Email general |
| `phone` | varchar nullable | Teléfono |
| `website` | varchar nullable | Sitio web |
| `timezone` | varchar | Zona horaria por defecto |
| `locale` | varchar | Idioma/región |
| `currency` | varchar | Moneda principal |
| `country_code` | varchar | País |
| `status` | enum | ACTIVE, SUSPENDED, CLOSED |
| `settings` | json/jsonb nullable | Configuración general |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.3 Member

### Representa

La participación de un `User` dentro de un `BusinessAccount`.

Es la identidad operativa del usuario dentro de una cuenta concreta.

### Relaciones

```text
User 1 ─── N Member N ─── 1 BusinessAccount

Member 1 ─── N CaseMember
Member 1 ─── N Task
Member 1 ─── N TimeEntry
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `user_id` | UUID | User global |
| `role` | enum / varchar | OWNER, ADMIN, MEMBER, VIEWER, etc. |
| `status` | enum | INVITED, ACTIVE, SUSPENDED, REMOVED |
| `title` | varchar nullable | Cargo o título profesional |
| `professional_registration` | varchar nullable | Matrícula profesional |
| `hourly_rate` | decimal nullable | Tarifa por defecto |
| `joined_at` | timestamp nullable | Fecha de incorporación |
| `invited_at` | timestamp nullable | Fecha de invitación |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

### Restricciones recomendadas

```text
UNIQUE (business_account_id, user_id)
```

---

# 6.4 ExternalParty

### Representa

Una persona u organización externa al `BusinessAccount`.

Ejemplos:

- cliente;
- prospecto;
- contraparte;
- proveedor;
- testigo;
- organismo público;
- empleador;
- banco;
- estudio jurídico externo;
- empresa vinculada.

Un `ExternalParty` pertenece siempre a un único `BusinessAccount`.

### Relaciones

```text
BusinessAccount 1 ─── N ExternalParty
ExternalParty 1 ─── N CaseExternalParty
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | Propietario |
| `type` | enum | PERSON, ORGANIZATION |
| `display_name` | varchar | Nombre principal |
| `first_name` | varchar nullable | Persona |
| `last_name` | varchar nullable | Persona |
| `legal_name` | varchar nullable | Organización |
| `tax_id` | varchar nullable | Documento o ID fiscal |
| `email` | varchar nullable | Email |
| `phone` | varchar nullable | Teléfono |
| `website` | varchar nullable | Web |
| `address_line_1` | varchar nullable | Dirección |
| `address_line_2` | varchar nullable | Dirección |
| `city` | varchar nullable | Ciudad |
| `region` | varchar nullable | Estado/departamento/provincia |
| `postal_code` | varchar nullable | Código postal |
| `country_code` | varchar nullable | País |
| `notes` | text nullable | Observaciones generales |
| `status` | enum nullable | ACTIVE, INACTIVE, ARCHIVED |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

### Nota de diseño

No es necesario que `ExternalParty` tenga un único rol global.

Una misma parte puede actuar de formas diferentes según el `Case`.

Por ejemplo:

```text
ExternalParty: ACME S.A.

Case A → CLIENT
Case B → COUNTERPARTY
```

---

# 6.5 Case

### Representa

La unidad principal de trabajo profesional.

Puede representar:

- un expediente;
- un litigio;
- una consulta;
- una auditoría;
- una declaración fiscal;
- un contrato;
- un servicio recurrente;
- una investigación;
- un proyecto profesional.

Internamente el dominio utiliza `Case`, aunque la interfaz puede mostrar otro término dependiendo del tipo de negocio.

### Relaciones

```text
BusinessAccount 1 ─── N Case
CaseType 1 ─── N Case

Case
├── N CaseMember
├── N CaseExternalParty
├── N Task
├── N Event
├── N Deadline
├── N Document
├── N Note
├── N Communication
├── N TimeEntry
└── N Expense
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_type_id` | UUID nullable | Tipo |
| `number` | varchar nullable | Número interno |
| `external_reference` | varchar nullable | Referencia externa |
| `title` | varchar | Título |
| `description` | text nullable | Descripción |
| `status` | varchar / FK | Estado |
| `priority` | enum nullable | LOW, NORMAL, HIGH, URGENT |
| `opened_at` | date/timestamp nullable | Apertura |
| `closed_at` | date/timestamp nullable | Cierre |
| `responsible_member_id` | UUID nullable | Responsable principal |
| `billing_type` | enum nullable | HOURLY, FIXED, RETAINER, NON_BILLABLE |
| `hourly_rate` | decimal nullable | Tarifa particular |
| `currency` | varchar nullable | Moneda |
| `created_by_member_id` | UUID | Creador |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.6 CaseType

### Representa

Una clasificación de `Case`.

Ejemplos jurídicos:

- Litigio
- Consulta
- Contrato
- Sucesión

Ejemplos contables:

- Declaración fiscal
- Auditoría
- Liquidación mensual
- Constitución de sociedad

### Relaciones

```text
BusinessAccount 1 ─── N CaseType
CaseType 1 ─── N Case
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `name` | varchar | Nombre |
| `description` | text nullable | Descripción |
| `code` | varchar nullable | Código interno |
| `is_active` | boolean | Disponible para nuevos casos |
| `default_workflow_id` | UUID nullable | Workflow por defecto |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.7 CaseExternalParty

### Representa

La participación de un `ExternalParty` dentro de un `Case`.

Permite que una parte tenga un rol específico dentro de cada caso.

### Relaciones

```text
Case N ─── N ExternalParty
        vía CaseExternalParty
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID | Case |
| `external_party_id` | UUID | ExternalParty |
| `role` | varchar / enum | CLIENT, COUNTERPARTY, WITNESS, etc. |
| `is_primary` | boolean | Parte principal para ese rol |
| `notes` | text nullable | Contexto |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

### Restricción fundamental

`Case` y `ExternalParty` deben pertenecer al mismo `BusinessAccount`.

---

# 6.8 CaseMember

### Representa

La asignación de un `Member` a un `Case`.

### Relaciones

```text
Case N ─── N Member
        vía CaseMember
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID | Case |
| `member_id` | UUID | Member |
| `role` | varchar nullable | RESPONSIBLE, COLLABORATOR, REVIEWER |
| `is_primary` | boolean | Responsable principal |
| `assigned_at` | timestamp | Asignación |
| `removed_at` | timestamp nullable | Fin de asignación |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

### Restricción recomendada

```text
UNIQUE (case_id, member_id)
```

---

# 6.9 Task

### Representa

Una unidad de trabajo que debe ejecutarse.

Puede pertenecer a un `Case` o ser una tarea general del `BusinessAccount`.

### Relaciones

```text
BusinessAccount 1 ─── N Task
Case 1 ─── N Task
Member 1 ─── N Task
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID nullable | Case |
| `title` | varchar | Título |
| `description` | text nullable | Detalle |
| `status` | enum / varchar | TODO, IN_PROGRESS, DONE, CANCELLED |
| `priority` | enum nullable | Prioridad |
| `assigned_member_id` | UUID nullable | Responsable |
| `created_by_member_id` | UUID | Creador |
| `due_at` | timestamp nullable | Vencimiento |
| `completed_at` | timestamp nullable | Finalización |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.10 Event

### Representa

Un evento de calendario.

Ejemplos:

- audiencia;
- reunión;
- llamada;
- presentación;
- cita con cliente.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID nullable | Case |
| `title` | varchar | Título |
| `description` | text nullable | Descripción |
| `event_type` | varchar nullable | Tipo |
| `starts_at` | timestamp | Inicio |
| `ends_at` | timestamp nullable | Fin |
| `all_day` | boolean | Día completo |
| `location` | varchar nullable | Lugar |
| `created_by_member_id` | UUID | Creador |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.11 Deadline

### Representa

Un vencimiento formal o relevante que requiere seguimiento.

Conviene separarlo de `Event` cuando el dominio trata los vencimientos como elementos críticos.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID | Case |
| `title` | varchar | Descripción |
| `due_at` | timestamp | Vencimiento |
| `status` | enum | PENDING, COMPLETED, MISSED, CANCELLED |
| `responsible_member_id` | UUID nullable | Responsable |
| `completed_at` | timestamp nullable | Cumplimiento |
| `notes` | text nullable | Observaciones |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.12 Folder

### Representa

Una agrupación lógica de documentos.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID nullable | Case |
| `parent_folder_id` | UUID nullable | Carpeta padre |
| `name` | varchar | Nombre |
| `created_by_member_id` | UUID | Creador |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.13 Document

### Representa

Un documento gestionado por el sistema.

El archivo físico puede almacenarse en object storage mientras esta entidad mantiene la metadata de negocio.

### Relaciones

```text
Document 1 ─── N DocumentVersion
Folder 1 ─── N Document
Case 1 ─── N Document
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID nullable | Case |
| `external_party_id` | UUID nullable | Parte relacionada |
| `folder_id` | UUID nullable | Carpeta |
| `name` | varchar | Nombre lógico |
| `description` | text nullable | Descripción |
| `document_type` | varchar nullable | Tipo |
| `current_version_id` | UUID nullable | Versión actual |
| `created_by_member_id` | UUID | Creador |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.14 DocumentVersion

### Representa

Una versión concreta de un `Document`.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `document_id` | UUID | Documento |
| `version_number` | integer | Número de versión |
| `storage_key` | varchar | Ubicación en storage |
| `file_name` | varchar | Nombre del archivo |
| `mime_type` | varchar | MIME type |
| `size_bytes` | bigint | Tamaño |
| `checksum` | varchar nullable | Hash |
| `uploaded_by_member_id` | UUID | Usuario que subió |
| `created_at` | timestamp | Fecha |

---

# 6.15 Note

### Representa

Una nota interna.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID nullable | Case |
| `external_party_id` | UUID nullable | Parte relacionada |
| `author_member_id` | UUID | Autor |
| `title` | varchar nullable | Título |
| `body` | text | Contenido |
| `is_private` | boolean | Visibilidad restringida |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.16 Comment

### Representa

Un comentario dentro de una conversación asociada a otra entidad.

Ejemplos:

- comentarios en una tarea;
- comentarios en un documento;
- discusión interna sobre un caso.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `author_member_id` | UUID | Autor |
| `target_type` | varchar | Tipo de entidad comentada |
| `target_id` | UUID | ID de entidad comentada |
| `body` | text | Comentario |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

### Nota

`target_type + target_id` es una relación polimórfica. Si se prefiere integridad referencial estricta, puede sustituirse por tablas específicas.

---

# 6.17 Communication

### Representa

Una comunicación con un tercero.

Ejemplos:

- llamada;
- correo electrónico;
- reunión;
- mensaje;
- carta.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID nullable | Case |
| `external_party_id` | UUID nullable | Interlocutor |
| `member_id` | UUID nullable | Miembro interno |
| `type` | enum | EMAIL, PHONE, MEETING, MESSAGE, LETTER |
| `direction` | enum nullable | INBOUND, OUTBOUND |
| `subject` | varchar nullable | Asunto |
| `body` | text nullable | Resumen o contenido |
| `occurred_at` | timestamp | Fecha |
| `external_reference` | varchar nullable | ID de proveedor externo |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.18 Activity

### Representa

Un evento de auditoría o historial.

Ejemplos:

- creación de un caso;
- cambio de estado;
- carga de documento;
- asignación de un miembro;
- modificación de un vencimiento.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `actor_member_id` | UUID nullable | Actor |
| `action` | varchar | Acción |
| `entity_type` | varchar | Tipo de entidad |
| `entity_id` | UUID | Entidad |
| `case_id` | UUID nullable | Case relacionado |
| `metadata` | json/jsonb nullable | Datos adicionales |
| `occurred_at` | timestamp | Momento |

### Nota

En general debería ser append-only.

---

# 6.19 TimeEntry

### Representa

Tiempo trabajado por un `Member`.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID | Case |
| `member_id` | UUID | Miembro |
| `task_id` | UUID nullable | Tarea |
| `description` | text nullable | Trabajo realizado |
| `started_at` | timestamp nullable | Inicio |
| `ended_at` | timestamp nullable | Fin |
| `duration_minutes` | integer | Duración |
| `billable` | boolean | Facturable |
| `hourly_rate` | decimal nullable | Tarifa aplicada |
| `currency` | varchar nullable | Moneda |
| `invoice_line_id` | UUID nullable | Línea facturada |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.20 Expense

### Representa

Un gasto asociado a un `Case`.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `case_id` | UUID | Case |
| `member_id` | UUID nullable | Miembro que registró |
| `description` | varchar | Concepto |
| `amount` | decimal | Importe |
| `currency` | varchar | Moneda |
| `occurred_on` | date | Fecha |
| `billable` | boolean | Repercutible al cliente |
| `invoice_line_id` | UUID nullable | Línea facturada |
| `document_id` | UUID nullable | Comprobante |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.21 Invoice

### Representa

Una factura emitida por el `BusinessAccount`.

### Relaciones

```text
Invoice 1 ─── N InvoiceLine
Invoice 1 ─── N Payment
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `external_party_id` | UUID | Cliente facturado |
| `case_id` | UUID nullable | Caso específico |
| `number` | varchar | Número |
| `status` | enum | DRAFT, ISSUED, PAID, VOID, OVERDUE |
| `currency` | varchar | Moneda |
| `issue_date` | date | Emisión |
| `due_date` | date nullable | Vencimiento |
| `subtotal` | decimal | Subtotal |
| `tax_amount` | decimal | Impuestos |
| `total` | decimal | Total |
| `balance_due` | decimal | Saldo |
| `notes` | text nullable | Notas |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.22 InvoiceLine

### Representa

Una línea de detalle de una factura.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `invoice_id` | UUID | Factura |
| `case_id` | UUID nullable | Case relacionado |
| `description` | varchar | Concepto |
| `quantity` | decimal | Cantidad |
| `unit_price` | decimal | Precio unitario |
| `tax_rate` | decimal nullable | Impuesto |
| `subtotal` | decimal | Subtotal |
| `total` | decimal | Total |
| `sort_order` | integer | Orden |

---

# 6.23 Payment

### Representa

Un pago recibido y aplicado a una factura.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `invoice_id` | UUID | Factura |
| `amount` | decimal | Monto |
| `currency` | varchar | Moneda |
| `payment_method` | varchar nullable | Método |
| `reference` | varchar nullable | Referencia |
| `paid_at` | timestamp | Fecha de pago |
| `notes` | text nullable | Notas |
| `created_at` | timestamp | Creación |

---

# 6.24 CustomFieldDefinition

### Representa

La definición de un campo personalizado creado por un `BusinessAccount`.

Permite agregar atributos específicos sin modificar el esquema principal.

Ejemplos:

- número de expediente;
- juzgado;
- jurisdicción;
- ejercicio fiscal;
- organismo;
- número de declaración.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `entity_type` | varchar | CASE, EXTERNAL_PARTY, etc. |
| `case_type_id` | UUID nullable | Limitar a un CaseType |
| `name` | varchar | Nombre |
| `key` | varchar | Clave estable |
| `data_type` | enum | TEXT, NUMBER, DATE, BOOLEAN, SELECT, etc. |
| `required` | boolean | Obligatorio |
| `configuration` | json/jsonb nullable | Opciones |
| `sort_order` | integer | Orden |
| `is_active` | boolean | Activo |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.25 CustomFieldValue

### Representa

El valor concreto de un `CustomFieldDefinition`.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `custom_field_definition_id` | UUID | Definición |
| `entity_type` | varchar | Tipo de entidad |
| `entity_id` | UUID | ID de entidad |
| `value_text` | text nullable | Texto |
| `value_number` | decimal nullable | Número |
| `value_date` | date/timestamp nullable | Fecha |
| `value_boolean` | boolean nullable | Booleano |
| `value_json` | json/jsonb nullable | Estructura compleja |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.26 StatusDefinition

### Representa

Una definición configurable de estado dentro de un `BusinessAccount`.

Permite evitar hardcodear todos los estados del dominio.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `entity_type` | varchar | CASE, TASK, etc. |
| `case_type_id` | UUID nullable | Aplicación específica |
| `name` | varchar | Nombre |
| `code` | varchar | Código |
| `category` | varchar nullable | OPEN, CLOSED, etc. |
| `sort_order` | integer | Orden |
| `is_initial` | boolean | Estado inicial |
| `is_terminal` | boolean | Estado final |
| `is_active` | boolean | Activo |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.27 Workflow

### Representa

Un proceso configurable aplicable a determinados casos.

Por ejemplo:

```text
Nuevo
  ↓
Esperando documentación
  ↓
En análisis
  ↓
Presentado
  ↓
Finalizado
```

### Relaciones

```text
BusinessAccount 1 ─── N Workflow
Workflow 1 ─── N WorkflowStep
CaseType N ─── 1 Workflow
```

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `business_account_id` | UUID | BusinessAccount |
| `name` | varchar | Nombre |
| `description` | text nullable | Descripción |
| `is_active` | boolean | Activo |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 6.28 WorkflowStep

### Representa

Una etapa dentro de un `Workflow`.

### Campos sugeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador |
| `workflow_id` | UUID | Workflow |
| `status_definition_id` | UUID nullable | Estado asociado |
| `name` | varchar | Nombre |
| `description` | text nullable | Descripción |
| `sort_order` | integer | Orden |
| `is_initial` | boolean | Inicial |
| `is_terminal` | boolean | Terminal |
| `created_at` | timestamp | Creación |
| `updated_at` | timestamp | Modificación |

---

# 7. Relaciones principales resumidas

```text
User
  1
  │
  N
Member
  N
  │
  1
BusinessAccount
  │
  ├── N ExternalParty
  │
  ├── N CaseType
  │
  ├── N Case
  │     │
  │     ├── N CaseMember ─── Member
  │     ├── N CaseExternalParty ─── ExternalParty
  │     ├── N Task
  │     ├── N Event
  │     ├── N Deadline
  │     ├── N Document
  │     │      └── N DocumentVersion
  │     ├── N Note
  │     ├── N Communication
  │     ├── N TimeEntry
  │     └── N Expense
  │
  ├── N Invoice
  │     ├── N InvoiceLine
  │     └── N Payment
  │
  ├── N CustomFieldDefinition
  │     └── N CustomFieldValue
  │
  ├── N StatusDefinition
  │
  └── N Workflow
        └── N WorkflowStep
```

---

# 8. Aggregate roots sugeridos

Desde una perspectiva DDD, una primera aproximación podría considerar como aggregate roots:

## BusinessAccount

Controla el tenant y su configuración principal.

## Member

Representa la identidad operativa dentro del tenant.

## ExternalParty

Mantiene la información de una persona u organización externa dentro del tenant.

## Case

Aggregate principal de trabajo.

Gran parte de las operaciones profesionales ocurren en el contexto de un `Case`.

## Document

Puede tener ciclo de vida propio debido a versionado, permisos y almacenamiento.

## Invoice

Controla líneas, totales, pagos y estado de facturación.

## Workflow

Controla la configuración del proceso.

No necesariamente todas las relaciones anteriores deben convertirse literalmente en aggregates de DDD. La decisión final dependerá de los límites transaccionales y casos de uso.

---

# 9. Recomendaciones de integridad multi-tenant

No debería ser posible crear relaciones cruzadas entre tenants.

Por ejemplo, si existen:

```text
BusinessAccount A
  Case A1
  ExternalParty A1
  Member A1

BusinessAccount B
  Case B1
  ExternalParty B1
  Member B1
```

deben rechazarse:

```text
CaseExternalParty(Case A1, ExternalParty B1)
CaseMember(Case A1, Member B1)
```

Esto debería validarse en:

1. dominio/aplicación;
2. persistencia, cuando el motor de base de datos permita expresarlo;
3. autorización.

Una estrategia particularmente útil es incluir `business_account_id` también en tablas de relación como:

- `CaseMember`;
- `CaseExternalParty`;
- `Task`;
- `TimeEntry`;
- `Expense`.

Aunque ese valor pueda derivarse de otra FK, ayuda a:

- simplificar filtros;
- reforzar tenant isolation;
- construir índices;
- implementar Row Level Security;
- detectar relaciones inconsistentes.

---

# 10. Índices recomendados

Algunos índices típicos:

```text
Member
  UNIQUE (business_account_id, user_id)

ExternalParty
  INDEX (business_account_id, display_name)
  INDEX (business_account_id, tax_id)

Case
  INDEX (business_account_id, status)
  INDEX (business_account_id, case_type_id)
  INDEX (business_account_id, responsible_member_id)
  UNIQUE? (business_account_id, number)

CaseMember
  UNIQUE (case_id, member_id)

CaseExternalParty
  INDEX (case_id)
  INDEX (external_party_id)
  UNIQUE? (case_id, external_party_id, role)

Task
  INDEX (business_account_id, assigned_member_id, status)
  INDEX (case_id, status)
  INDEX (due_at)

Deadline
  INDEX (business_account_id, due_at, status)

TimeEntry
  INDEX (case_id, member_id)
  INDEX (business_account_id, created_at)

Invoice
  UNIQUE (business_account_id, number)
  INDEX (business_account_id, status)
  INDEX (external_party_id)
```

---

# 11. Modelo mínimo recomendado para un MVP

No es necesario implementar todas las entidades desde la primera versión.

Un MVP sólido podría comenzar con:

```text
User
BusinessAccount
Member
ExternalParty

Case
CaseType
CaseMember
CaseExternalParty

Task
Event
Document
DocumentVersion
Note
Activity
```

Después podrían agregarse:

```text
Deadline
Communication

TimeEntry
Expense

Invoice
InvoiceLine
Payment

CustomFieldDefinition
CustomFieldValue

StatusDefinition
Workflow
WorkflowStep
```

---

# 12. Núcleo conceptual final

El modelo puede resumirse en tres tipos de actores y una unidad principal de trabajo.

## Usuario de la plataforma

```text
User
  ↓
Member
  ↓
BusinessAccount
```

## Terceros

```text
BusinessAccount
  ↓
ExternalParty
```

## Trabajo profesional

```text
BusinessAccount
  ↓
Case
```

## Participantes del caso

```text
Case
├── CaseMember
│     └── Member
│
└── CaseExternalParty
      └── ExternalParty
```

Esta separación permite que el dominio soporte tanto un profesional independiente como una organización compleja sin cambiar su estructura conceptual.

Un profesional independiente simplemente tendrá:

```text
BusinessAccount
└── Member
    └── User
```

mientras que un estudio tendrá:

```text
BusinessAccount
├── Member
│   ├── User A
│   ├── User B
│   └── User C
│
├── ExternalParty ...
└── Case ...
```

El modelo permanece esencialmente igual en ambos escenarios.
