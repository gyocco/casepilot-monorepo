# Skills de agentes

Las skills son procedimientos reutilizables. Antes de usarlas, el agente debe cargar las instrucciones de `.agents/instructions/` aplicables al cambio.

## Skills disponibles

| Skill | Usar cuando |
| --- | --- |
| `feature-delivery` | se implementa una funcionalidad completa que puede cruzar UI, paquetes, datos y tests |
| `mobile-first-ui` | se crea o modifica una pantalla, componente, formulario o flujo responsive |
| `supabase-change` | se modifica esquema, RLS, seed, Edge Function, tipos o cliente Supabase |

Una skill no autoriza despliegues ni operaciones remotas. Solo define el orden de trabajo y los criterios de salida.
