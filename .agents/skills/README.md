# Skills de agentes

Las skills son procedimientos reutilizables. Antes de usarlas, el agente debe cargar las instrucciones de `.agents/instructions/` aplicables al cambio.

## Skills disponibles

| Skill | Usar cuando |
| --- | --- |
| `monorepo-code-placement` | se decide dónde colocar código, tests, contratos, documentación, infraestructura o CI/CD dentro del monorepo |
| `feature-delivery` | se implementa una funcionalidad completa que puede cruzar UI, librerías, servicios, contratos, datos y tests |
| `mobile-first-ui` | se crea o modifica una pantalla, componente, formulario o flujo responsive |

Una skill no autoriza despliegues ni operaciones remotas. Solo define el orden de trabajo y los criterios de salida.
