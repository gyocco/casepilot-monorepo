# EPIC-03 — Gestión de casos, expedientes y proyectos

- Estado: propuesta
- Última actualización: 2026-08-02
- Nivel: Epic / módulo

## Objetivo

Permitir que cada profesional organice los trabajos que realiza para sus clientes como casos, expedientes o proyectos, con estado, prioridad, notas, fechas, recordatorios y contexto de IA.

## Alcance base

CRUD de casos, vínculo con cliente, estados configurables por lo necesario, prioridad, notas, vencimientos, recordatorios y una entrada para chat IA contextual al caso.

## Feature semilla

### FEAT-CASE-01 — Espacio de trabajo del caso

Un caso debe concentrar la información operativa y documental necesaria para avanzar un trabajo sin perder el vínculo con su cliente.

#### US-CASE-001 — Gestionar un caso de trabajo

Como profesional, quiero crear y gestionar un caso asociado a un cliente, con estado, prioridad, notas y fechas, para controlar el trabajo pendiente y sus vencimientos.

##### Descripción

Esta historia reúne en un mismo contexto el trabajo pendiente para un cliente: estado, prioridad, notas, fechas y vencimientos. El profesional debe poder distinguir lo activo de lo cerrado y recibir una señal clara cuando el caso no tiene información suficiente para una consulta.

##### Criterios de aceptación base

- `AC-CASE-001-01`: se puede crear un caso asociado a un cliente autorizado.
- `AC-CASE-001-02`: se puede consultar y actualizar estado, prioridad, notas y fechas.
- `AC-CASE-001-03`: los recordatorios y vencimientos se muestran con su estado y zona horaria definida.
- `AC-CASE-001-04`: el caso puede ser archivado o cerrado sin perder el historial requerido.
- `AC-CASE-001-05`: el chat IA del caso queda acotado al contexto autorizado y comunica cuando no hay información suficiente.

##### Reglas de negocio base

- `RN-CASE-001-01`: un caso pertenece a un tenant y debe estar vinculado a un cliente accesible.
- `RN-CASE-001-02`: cerrar un caso no elimina automáticamente sus documentos ni al cliente.
- `RN-CASE-001-03`: una fecha vencida requiere una representación visible que no dependa solo del color.

##### Requisitos no funcionales base

- `RNF-CASE-001-01`: autorización backend/RLS por tenant y membresía.
- `RNF-CASE-001-02`: manejo de fechas, zona horaria, locale, offline y reintento sin duplicar comandos.
- `RNF-CASE-001-03`: interfaz usable en móvil y con contenido largo.

## Fuera de alcance por ahora

Expedientes judiciales conectados a organismos externos, calendarios bidireccionales, asignación avanzada de equipos, facturación y automatización autónoma.

## Próxima expansión

Dividir por ciclo de vida, tipos de caso, asignación, tareas, recordatorios recurrentes, documentos relacionados, timeline, colaboración y chat IA contextual.
