# Contexto del producto y del proyecto

- Estado: propuesta de producto y línea base documental
- Última actualización: 2026-08-02
- Fuente canónica: `docs/00-overview/`, `docs/01-product/` y `docs/07-project-management/`

## Propósito

Este documento permite entender qué se quiere construir, para quién y en qué estado se encuentra el proyecto. No representa funcionalidades ya disponibles: las capacidades de producto se encuentran en estado `propuesta` o `backlog` hasta que exista una implementación verificada.

## Resumen de CasePilot

CasePilot será un SaaS de productividad y gestión de trabajo para profesionales que gestionan casos, expedientes, clientes y documentación. La primera experiencia será web y deberá conservar una base compatible con una futura aplicación Android e iOS mediante Capacitor/Ionic.

El producto combina:

- gestión ligera de clientes y relaciones;
- gestión de casos, expedientes o proyectos de trabajo;
- organización documental y control de versiones;
- base de conocimiento con leyes, manuales, documentos y plantillas;
- asistencia de IA para consultar, resumir y preparar trabajo documental;
- generación de documentos a partir de plantillas y datos del caso.

## Problema a resolver

Los profesionales independientes y los estudios pequeños suelen distribuir la información entre carpetas, correo, mensajería, documentos locales y hojas de cálculo. Esa dispersión dificulta encontrar antecedentes, mantener vencimientos, reutilizar conocimiento, preparar documentos y dar seguimiento consistente a cada cliente.

CasePilot debe ofrecer un espacio de trabajo único, trazable y seguro, con IA como asistente supervisado por el profesional. La IA no sustituye el criterio profesional ni debe presentarse como fuente autónoma de asesoramiento legal, contable o notarial.

## Clientes y usuarios objetivo

| Persona | Necesidad principal | Prioridad inicial |
| --- | --- | --- |
| Profesional independiente | Organizar clientes, casos y documentos sin administrar una plataforma compleja | Alta |
| Abogado/a independiente | Consultar expedientes, leyes, plazos y producir documentos con contexto | Alta |
| Escribano/a independiente | Gestionar operaciones, documentación y modelos reutilizables | Alta |
| Contador/a u otro profesional de casos | Centralizar documentación, tareas, vencimientos y conocimiento propio | Media |
| Estudio pequeño | Compartir espacios, asignar trabajo y controlar permisos | Media |
| Cliente final del profesional | Recibir comunicación o documentos en una futura experiencia externa | Futura |

## Alcance del proyecto

El proyecto cubre la definición y construcción incremental de:

1. una aplicación web mobile-first;
2. paquetes compartidos para dominio, UI, acceso a datos y capacidades de plataforma cuando haya consumidores reales;
3. un backend gestionado con autenticación, persistencia, storage y funciones server-side;
4. documentación de producto, arquitectura, desarrollo, operación y decisiones;
5. una futura ruta de empaquetado para Android e iOS sin duplicar la lógica de negocio.

## Fuentes relacionadas

- [Visión y alcance del producto](../01-product/product-vision-and-scope.md)
- [Mapa de requisitos](../01-product/requirements-map.md)
- [Contexto del sistema](../02-architecture/system-context.md)
- [Línea base de arquitectura](../02-architecture/architecture-baseline.md)
- [Roadmap inicial](../07-project-management/roadmap.md)
- [Glosario](glossary.md)
