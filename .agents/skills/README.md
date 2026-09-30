# Skills de agentes

Las skills son procedimientos reutilizables. Antes de usarlas, el agente debe cargar las instrucciones de `.agents/instructions/` aplicables al cambio.

Todas siguen [Estructura y límites del monorepo](../../docs/architecture/monorepo-structure.md): las aplicaciones y sus features viven en `src/apps/`; las capacidades técnicas generales se agrupan por runtime en `src/libs/backend/`, `src/libs/frontend/` y `src/libs/mobile/`. Las librerías nunca importan desde aplicaciones.

## Skills disponibles

| Skill | Usar cuando |
| --- | --- |
| [monorepo-code-placement](monorepo-code-placement/SKILL.md) | se decide dónde colocar código, tests, contratos, documentación, infraestructura o CI/CD dentro del monorepo |
| [feature-delivery](feature-delivery/SKILL.md) | se implementa una funcionalidad completa que puede cruzar UI, librerías, servicios, contratos, datos y tests |
| [mobile-first-ui](mobile-first-ui/SKILL.md) | se crea o modifica una pantalla, componente, formulario o flujo responsive |

Una skill no autoriza despliegues ni operaciones remotas. Solo define el orden de trabajo y los criterios de salida.
