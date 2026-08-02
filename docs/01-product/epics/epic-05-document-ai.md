# EPIC-05 — IA documental

- Estado: propuesta
- Última actualización: 2026-08-02
- Nivel: Epic / módulo

## Objetivo

Ayudar a leer, consultar y transformar documentos mediante IA, manteniendo el alcance autorizado, las referencias y la revisión humana.

## Alcance base

Chat sobre documentos seleccionados, chat global del espacio, consultas sobre casos, extracción OCR y estados de procesamiento. El contrato debe contemplar límites, errores, trazabilidad y costo.

## Feature semilla

### FEAT-AI-01 — Asistente contextual de documentos

Un profesional debe poder preguntar sobre información autorizada y recibir una respuesta útil con fuentes o una indicación clara de insuficiencia.

#### US-AI-001 — Consultar documentos con IA

Como profesional, quiero hacer preguntas sobre documentos y recibir respuestas con contexto y referencias, para comprender más rápido la información sin perder control sobre la fuente.

##### Descripción

Esta historia permite consultar información documental sin perder el vínculo con las fuentes. La respuesta es una ayuda para leer y decidir, no una autoridad: el profesional debe conocer el alcance consultado, la evidencia disponible y cualquier limitación.

##### Criterios de aceptación base

- `AC-AI-001-01`: el usuario puede seleccionar el alcance documental autorizado antes de consultar.
- `AC-AI-001-02`: la respuesta comunica estado de procesamiento, progreso o espera cuando aplique.
- `AC-AI-001-03`: la respuesta incluye referencias a documentos o fragmentos disponibles, o indica que no pudo fundamentarse.
- `AC-AI-001-04`: el sistema no usa documentos de otro tenant o fuera del alcance elegido.
- `AC-AI-001-05`: el usuario puede reintentar, detener o iniciar una nueva conversación sin duplicar operaciones.

##### Reglas de negocio base

- `RN-AI-001-01`: la IA es asistente; el profesional debe revisar antes de actuar o generar un documento.
- `RN-AI-001-02`: el contexto enviado al proveedor se limita por autorización, propósito y política de datos.
- `RN-AI-001-03`: una respuesta sin evidencia suficiente no se presenta como certeza.

##### Requisitos no funcionales base

- `RNF-AI-001-01`: rate limits, límites de tamaño, timeout, manejo de errores y observabilidad sin registrar contenido sensible innecesario.
- `RNF-AI-001-02`: streaming o progreso accesible, cancelación y soporte para red inestable.
- `RNF-AI-001-03`: versión de modelo, prompt/flujo y fuentes deben poder auditarse según la política definida.

## Fuera de alcance por ahora

Decisiones autónomas, asesoramiento profesional garantizado, entrenamiento con datos del cliente sin consentimiento y respuestas sin trazabilidad.

## Próxima expansión

Separar chat documental, chat global, consultas por caso, OCR, indexación, citas, feedback, evaluación de calidad y políticas de retención.
