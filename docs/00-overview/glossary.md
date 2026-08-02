# Glosario del dominio

- Estado: propuesta inicial
- Última actualización: 2026-08-02

| Término | Definición inicial |
| --- | --- |
| Profesional | Persona que utiliza CasePilot para gestionar su trabajo y sus clientes. Incluye abogados, escribanos, contadores y perfiles similares. |
| Usuario | Identidad autenticada que puede acceder a uno o más espacios de trabajo. |
| Espacio de trabajo | Unidad lógica de colaboración y aislamiento de datos. En el modelo técnico también puede denominarse `tenant`. |
| Tenant | Nombre técnico del límite de aislamiento multi-tenant. Nunca debe confundirse con un simple filtro enviado por el cliente. |
| Membresía | Relación entre un usuario y un espacio de trabajo, incluyendo su rol y estado. |
| Rol | Conjunto de permisos asignado a una membresía, por ejemplo propietario, administrador o colaborador. |
| Cliente | Persona o entidad atendida por el profesional. Puede estar vinculada a uno o más casos. |
| Caso / expediente / proyecto | Unidad de trabajo que agrupa un objetivo profesional, un cliente, estado, prioridades, vencimientos, notas y documentos. El nombre visible puede variar por profesión. |
| Documento | Archivo o contenido estructurado asociado a un caso, cliente, carpeta o conocimiento general. |
| Versión | Estado inmutable o trazable de un documento a lo largo de sus modificaciones. |
| Etiqueta | Clasificación transversal que permite filtrar clientes, casos o documentos. |
| Vencimiento | Fecha o momento límite que requiere seguimiento y eventualmente un recordatorio. |
| Recordatorio | Notificación o elemento de seguimiento asociado a una acción o fecha. |
| Base de conocimiento | Colección organizada de leyes, manuales, documentos legales, plantillas y material de referencia del profesional o espacio. |
| Plantilla | Estructura reutilizable para producir un documento con variables, secciones y reglas de completado. |
| Chat global | Conversación con IA sobre el contenido permitido del espacio de trabajo, no limitada a un documento individual. |
| Chat documental | Conversación con IA acotada a uno o más documentos seleccionados, con referencias a las fuentes cuando sea posible. |
| OCR | Reconocimiento óptico de caracteres para extraer texto de documentos escaneados o basados en imágenes. |
| IA asistida | Funcionalidad que propone, resume, busca o genera contenido, dejando la revisión y decisión final en manos del profesional. |
| RLS | Row Level Security de PostgreSQL/Supabase. Mecanismo de backend para asegurar que las filas solo sean accesibles según la identidad y membresía autorizadas. |
| PII | Información personal identificable. Debe minimizarse, protegerse y no registrarse innecesariamente. |

## Convenciones de uso

- En requisitos de producto se preferirán los términos visibles para el usuario: `espacio de trabajo`, `cliente`, `caso` y `documento`.
- En arquitectura se podrá usar `tenant`, `membership` y `RLS`, siempre enlazando con este glosario.
- `Caso`, `expediente` y `proyecto` representan inicialmente el mismo concepto de dominio; la terminología configurable por profesión queda pendiente.
