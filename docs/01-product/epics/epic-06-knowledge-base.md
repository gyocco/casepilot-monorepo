# EPIC-06 — Base de conocimiento

- Estado: propuesta
- Última actualización: 2026-08-02
- Nivel: Epic / módulo

## Objetivo

Construir un espacio de conocimiento reutilizable con leyes, manuales, documentos legales, notas y plantillas, consultable por el profesional y por la IA según permisos.

## Alcance base

Alta, organización, clasificación, versionado y consulta de material de referencia; separación entre conocimiento del profesional, del tenant y futuras fuentes compartidas.

## Feature semilla

### FEAT-KB-01 — Biblioteca de conocimiento profesional

La biblioteca debe transformar materiales dispersos en una fuente organizada y reutilizable para el trabajo diario.

#### US-KB-001 — Mantener y consultar la base de conocimiento

Como profesional, quiero guardar y consultar leyes, manuales, documentos y plantillas, para reutilizar conocimiento confiable en mis casos y documentos.

##### Descripción

Esta historia organiza materiales de referencia para que puedan reutilizarse con confianza en casos y documentos. La persona debe poder distinguir vigencia, jurisdicción, versión y origen antes de aplicar la información.

##### Criterios de aceptación base

- `AC-KB-001-01`: se puede incorporar material con tipo, título, jurisdicción o metadatos definidos para la etapa.
- `AC-KB-001-02`: se puede organizar, buscar, etiquetar, versionar y archivar material.
- `AC-KB-001-03`: una consulta distingue material vigente, archivado o pendiente de revisión.
- `AC-KB-001-04`: la IA solo consulta material autorizado y puede mostrar el origen.
- `AC-KB-001-05`: los estados vacíos, errores y contenido no encontrado son comprensibles.

##### Reglas de negocio base

- `RN-KB-001-01`: la vigencia y jurisdicción son metadatos de negocio, no inferencias implícitas.
- `RN-KB-001-02`: el material privado del tenant no se mezcla con fuentes globales sin una regla explícita.
- `RN-KB-001-03`: la información de referencia no reemplaza la validación profesional ni la fuente oficial.

##### Requisitos no funcionales base

- `RNF-KB-001-01`: trazabilidad de origen, versión y permisos.
- `RNF-KB-001-02`: búsquedas paginadas, tiempos de respuesta medibles y tolerancia a material grande.
- `RNF-KB-001-03`: taxonomía y formularios accesibles, mobile-first y preparados para múltiples jurisdicciones.

## Fuera de alcance por ahora

Actualización automática de legislación, garantía de vigencia jurídica, marketplace de plantillas y publicación pública de contenido.

## Próxima expansión

Separar fuentes, jurisdicciones, revisiones, colecciones, plantillas, búsqueda semántica, permisos, comentarios y sincronizaciones.
