# EPIC-07 — Generador documental

- Estado: propuesta
- Última actualización: 2026-08-02
- Nivel: Epic / módulo

## Objetivo

Permitir producir documentos de trabajo a partir de plantillas y datos autorizados del cliente, caso y base de conocimiento, manteniendo un flujo de revisión antes de guardar o compartir.

## Alcance base

Selección de plantilla, variables y autocompletado, generación de un borrador, revisión, creación de una nueva versión y manejo de errores o datos faltantes.

## Feature semilla

### FEAT-GEN-01 — Generación asistida mediante plantillas

Una plantilla debe convertir datos estructurados y contenido autorizado en un borrador editable o descargable, con indicación de campos incompletos y origen del contenido.

#### US-GEN-001 — Generar un documento desde una plantilla

Como profesional, quiero elegir una plantilla y completarla con los datos de un cliente o caso, para preparar documentos más rápido y con menos errores repetitivos.

##### Descripción

Esta historia acelera la preparación de documentos repetitivos mediante una plantilla y un contexto de trabajo autorizado. El resultado es siempre un borrador revisable, con campos faltantes y advertencias visibles antes de guardarlo o utilizarlo externamente.

##### Criterios de aceptación base

- `AC-GEN-001-01`: el usuario puede seleccionar una plantilla autorizada y un contexto de cliente/caso.
- `AC-GEN-001-02`: las variables se rellenan desde datos permitidos y los campos faltantes se identifican antes de generar.
- `AC-GEN-001-03`: el resultado se presenta como borrador revisable, con origen o advertencia cuando interviene IA.
- `AC-GEN-001-04`: guardar produce una nueva versión o documento según la decisión de negocio, sin sobrescribir de forma destructiva.
- `AC-GEN-001-05`: errores de plantilla, datos, generación o formato se pueden entender y reintentar de manera segura.

##### Reglas de negocio base

- `RN-GEN-001-01`: generar no equivale a aprobar, firmar ni enviar el documento.
- `RN-GEN-001-02`: solo se utilizan datos del tenant y del contexto seleccionado.
- `RN-GEN-001-03`: el usuario debe poder revisar y corregir el resultado antes de su uso externo.

##### Requisitos no funcionales base

- `RNF-GEN-001-01`: protección de PII, autorización por tenant y no exposición de prompts o secretos.
- `RNF-GEN-001-02`: historial de plantilla, versión, datos usados y resultado según la política de auditoría.
- `RNF-GEN-001-03`: generación con progreso, cancelación, retry e interfaz accesible en móvil.

## Fuera de alcance por ahora

Firma electrónica, envío automático a terceros, asesoramiento autónomo, plantillas legales certificadas y edición colaborativa simultánea.

## Próxima expansión

Separar catálogo de plantillas, variables, formularios, autocompletado, IA, revisión, exportación, versionado, firmas y entregas.
