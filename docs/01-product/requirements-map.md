# Mapa de requisitos del producto

- Estado: línea base propuesta
- Última actualización: 2026-08-02
- Fuente de verdad: documentos enlazados desde esta página

## Estructura estándar

CasePilot documenta el producto en cuatro niveles:

```text
Product
└── Epic (módulo)
    └── Feature (parte del módulo)
        └── User Story
            ├── Descripción y alcance
            ├── Criterios de aceptación
            ├── Reglas de negocio
            └── Requisitos no funcionales
```

Una épica puede distribuirse en varios archivos de features. Cada historia debe conservar un identificador estable, expresar valor para un actor y declarar cómo se verificará.

## Estados documentales

| Estado | Significado |
| --- | --- |
| Propuesta | Idea documentada para discusión; puede cambiar sin compatibilidad hacia atrás. |
| Backlog | Alcance aceptado para priorización, aún no necesariamente planificado. |
| En definición | Se está refinando con reglas, contratos y ejemplos suficientes para desarrollo. |
| Lista para desarrollo | La historia tiene alcance, criterios, riesgos y dependencias revisados. |
| En desarrollo | Existe implementación activa. |
| Verificación | Implementada y pendiente de pruebas/revisión final. |
| Completada | Cumple Definition of Done y está disponible en el alcance declarado. |
| Futura | Se conserva como dirección, sin compromiso de la etapa actual. |

## Épicas

| ID | Épica | Cobertura en esta versión | Estado |
| --- | --- | --- | --- |
| EPIC-01 | [Autenticación](epics/epic-01-authentication/README.md) | Siete features y 23 historias base detalladas | En definición |
| EPIC-02 | [Gestión de clientes](epics/epic-02-client-management.md) | Una feature y una historia semilla | Propuesta |
| EPIC-03 | [Gestión de casos / expedientes](epics/epic-03-case-management.md) | Una feature y una historia semilla | Propuesta |
| EPIC-04 | [Gestión documental](epics/epic-04-document-management.md) | Una feature y una historia semilla | Propuesta |
| EPIC-05 | [IA documental](epics/epic-05-document-ai.md) | Una feature y una historia semilla | Propuesta |
| EPIC-06 | [Base de conocimiento](epics/epic-06-knowledge-base.md) | Una feature y una historia semilla | Propuesta |
| EPIC-07 | [Generador documental](epics/epic-07-document-generator.md) | Una feature y una historia semilla | Propuesta |

## Convención de identificadores

- Épicas: `EPIC-01` a `EPIC-07`.
- Features: `FEAT-AUTH-01`, `FEAT-CLI-01`, etc.
- Historias de autenticación: `US-AUTH-001`, `US-AUTH-002`, etc.
Los identificadores no deben reciclarse. Si una historia se divide, la original se marca como `reemplazada` o `dividida` y se enlazan sus historias hijas.

## Criterio de expansión futura

Las épicas 2 a 7 tienen una historia semilla intencionalmente amplia. En iteraciones futuras cada una deberá dividirse por flujo de negocio, actor, estado y riesgo. La expansión no debe borrar el contexto original: debe conservar la historia semilla como vínculo de alcance.

## Documentos relacionados

- [Visión y alcance](product-vision-and-scope.md)
- [Roadmap](../07-project-management/roadmap.md)
- [Plantilla de User Story](../templates/user-story.md)
