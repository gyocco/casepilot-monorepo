# EPIC-04 — Gestión documental

- Estado: propuesta
- Última actualización: 2026-08-02
- Nivel: Epic / módulo

## Objetivo

Permitir almacenar y organizar documentos de trabajo con carpetas, etiquetas, relaciones y versiones, de manera segura y trazable.

## Alcance base

CRUD de metadatos, subida y descarga autorizada, carpetas, etiquetas, versionado, estados de procesamiento y relación con clientes, casos o base de conocimiento.

## Feature semilla

### FEAT-DOC-01 — Repositorio documental organizado

Un repositorio debe permitir encontrar la versión correcta de un archivo y conocer a qué contexto de trabajo pertenece.

#### US-DOC-001 — Gestionar documentos y sus versiones

Como profesional, quiero subir, consultar, clasificar, versionar y archivar documentos, para mantener un repositorio confiable asociado a mi trabajo.

##### Descripción

Esta historia convierte los archivos de trabajo en documentos encontrables, clasificables y trazables. Cada documento debe conservar su historial de versiones y mantener claras sus relaciones, permisos y estados de procesamiento.

##### Criterios de aceptación base

- `AC-DOC-001-01`: se puede subir un archivo permitido y ver su estado de procesamiento.
- `AC-DOC-001-02`: se pueden editar metadatos, carpeta y etiquetas sin cambiar el contenido de una versión existente.
- `AC-DOC-001-03`: una nueva versión conserva la relación con el documento lógico y permite identificar la versión vigente.
- `AC-DOC-001-04`: descarga, vista previa y archivado validan autorización.
- `AC-DOC-001-05`: errores de tamaño, formato, red o procesamiento tienen mensajes accionables y reintento seguro.

##### Reglas de negocio base

- `RN-DOC-001-01`: Storage y metadatos deben aplicar el mismo límite de tenant y membresía.
- `RN-DOC-001-02`: una versión no se sobrescribe de forma destructiva.
- `RN-DOC-001-03`: los formatos y límites soportados deben ser explícitos y configurables.

##### Requisitos no funcionales base

- `RNF-DOC-001-01`: archivos y metadatos sensibles no aparecen en logs públicos ni fixtures reales.
- `RNF-DOC-001-02`: subida accesible, progreso visible y recuperación de conexión cuando sea posible.
- `RNF-DOC-001-03`: paginación, límites de tamaño y procesamiento fuera del render.

## Fuera de alcance por ahora

Edición colaborativa en tiempo real, firma electrónica, sincronización automática con drives externos y clasificación IA completa.

## Próxima expansión

Dividir por upload, preview, carpetas, etiquetas, búsqueda, versiones, archivos duplicados, permisos compartidos, OCR y ciclo de retención.
