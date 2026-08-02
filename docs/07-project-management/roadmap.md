# Roadmap inicial de CasePilot

- Estado: propuesta de secuenciación
- Última actualización: 2026-08-02

Este roadmap organiza dependencias y aprendizaje. No asigna fechas de entrega hasta validar alcance, equipo y mercado; el seguimiento operativo se realiza fuera de esta documentación.

## Etapas

| Etapa | Objetivo | Alcance principal | Criterio de salida |
| --- | --- | --- | --- |
| 0. Fundaciones | Mantener una base ejecutable y documentada | Arquitectura, convenciones, quality gates y decisiones iniciales | Build/lint reproducibles, límites documentados y riesgos visibles |
| 1. Identidad | Permitir acceso seguro a un espacio personal y preparar equipos | EPIC-01 completa para el MVP acordado | Registro, sesión, perfil, autorización, aislamiento y pruebas positivas/negativas |
| 2. CRM de trabajo | Centralizar clientes y casos | EPIC-02 y EPIC-03 | Crear, consultar, editar y filtrar clientes/casos con fechas y estados |
| 3. Documentos | Convertir el repositorio en un espacio documental útil | EPIC-04 | Upload, carpetas, etiquetas, versiones, permisos y estados de procesamiento |
| 4. IA documental | Acelerar lectura y búsqueda | EPIC-05 | Consultas acotadas, referencias, límites, errores y revisión humana |
| 5. Conocimiento y generación | Reutilizar conocimiento y producir documentos | EPIC-06 y EPIC-07 | Base de conocimiento, plantillas, variables y generación revisable |
| 6. Colaboración futura | Extender a estudios y comunicación | Roles avanzados, portal, mensajes y notificaciones | Definido después de validar el uso individual |

## Orden recomendado de refinamiento

1. Confirmar personas, jurisdicción, vocabulario y límites de datos.
2. Refinar Epic 1 hasta que el modelo de identidad, membresía y RLS sea implementable.
3. Refinar clientes y casos con el mismo tenant y actor.
4. Refinar documentos antes de fijar contratos de IA/OCR.
5. Seleccionar casos de uso de IA medibles y seguros.
6. Definir plantillas y generación a partir de ejemplos reales anonimizados.

## Riesgos iniciales

| Riesgo | Impacto | Mitigación inicial |
| --- | --- | --- |
| Alcance demasiado amplio para el MVP | Alto | Mantener una historia semilla por épica y priorizar un flujo vertical completo. |
| Datos sensibles y requisitos regulatorios variables | Alto | Minimización, RLS, retención explícita y revisión de seguridad antes de datos reales. |
| IA con respuestas incorrectas o sin trazabilidad | Alto | Referencias, revisión humana, límites, métricas y no presentar la IA como autoridad. |
| Complejidad multi-tenant prematura | Medio | Modelar la frontera desde el inicio, pero activar colaboración avanzada solo cuando haya caso real. |
| Dependencia de capacidades nativas | Medio | Adaptadores con fallback web y pruebas de permisos antes de integrar plugins. |
| OCR y documentos heterogéneos | Medio | Definir formatos soportados, estados de procesamiento y manejo de fallos parciales. |

## Criterio de entrada de una historia

Una historia pasa a `Lista para desarrollo` cuando tiene actor, valor, alcance, criterios de aceptación, reglas de negocio, NFR, dependencias, riesgos y estrategia de pruebas.

## Criterio de salida de una historia

Debe cumplir la Definition of Done del repositorio: tipos, pruebas, lint, build, accesibilidad, viewport móvil, estados de carga/error/vacío, documentación sincronizada y revisión del diff.

## Fuentes relacionadas

- [Mapa de requisitos](../01-product/requirements-map.md)
- [Línea base de entrega](delivery-baseline.md)
- [Contexto del proyecto](../00-overview/product-and-project-context.md)
