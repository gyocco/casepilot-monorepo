# Skills de agentes

Las skills son procedimientos reutilizables. Antes de usarlas, el agente debe cargar las instrucciones de `.agents/instructions/` aplicables al cambio.

Todas siguen [Arquitectura del monorepo](../../docs/architecture/monorepo-architecture.md): las aplicaciones y sus features viven en `src/apps/`; las capacidades técnicas generales se agrupan por runtime en `src/libs/backend/`, `src/libs/frontend/` y `src/libs/mobile/`. Las librerías nunca importan desde aplicaciones.

## Skills disponibles

| Skill | Usar cuando |
| --- | --- |
| [monorepo-code-placement](monorepo-code-placement/SKILL.md) | se decide dónde colocar código, tests, contratos, documentación, infraestructura o CI/CD dentro del monorepo |
| [backend-architecture](backend-architecture/SKILL.md) | se diseña, implementa o revisa backend de CasePilot; es obligatoria para aplicar la arquitectura y todas las reglas backend vigentes |
| [architecture-rules-sync](architecture-rules-sync/SKILL.md) | se agregan, modifican o retiran reglas de arquitectura, o se sincronizan las fuentes canónicas con ESLint, dependency-cruiser, ts-morph, cobertura y pruebas |
| [feature-delivery](feature-delivery/SKILL.md) | se implementa una funcionalidad completa que puede cruzar UI, librerías, servicios, contratos, datos y tests |
| [mobile-first-ui](mobile-first-ui/SKILL.md) | se crea o modifica una pantalla, componente, formulario o flujo responsive |

Una skill no autoriza despliegues ni operaciones remotas. Solo define el orden de trabajo y los criterios de salida.

Ejemplo de uso: `$architecture-rules-sync agrega una regla de arquitectura para <restricción> y sincroniza documentación, checks, cobertura y pruebas`. También puede invocarse para auditar divergencias sin autorizar cambios de significado en las reglas.
