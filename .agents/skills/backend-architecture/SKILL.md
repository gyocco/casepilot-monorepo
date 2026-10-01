---
name: backend-architecture
description: Diseña, implementa o revisa backend de CasePilot con NestJS y TypeORM conforme a su arquitectura y todas sus reglas obligatorias vigentes. Úsala para commands, queries, modelos, repositorios, transacciones, transportes, integraciones o fronteras backend; no para cambios exclusivamente de UI ni para imponer estas reglas a otros proyectos.
metadata:
  short-description: Aplicar la arquitectura y las reglas backend de CasePilot
---

# Arquitectura backend de CasePilot

## Propósito y fuentes

Mantén cada decisión del cambio compatible con la base reutilizable adoptada por CasePilot, su arquitectura particular y todas las reglas activas. La reutilización de los documentos base no autoriza imponerlos automáticamente a otros productos. Esta skill guía el trabajo; no sustituye ni copia el catálogo normativo y no autoriza despliegues, cambios remotos o ampliaciones del alcance.

Carga las instrucciones aplicables desde `AGENTS.md` y después lee:

1. [Reglas obligatorias de la arquitectura base backend](../../../docs/architecture/backend-architecture-baseline-rules.md), completas y en su versión vigente. Identifica sus IDs activos; no dependas de una lista fija incorporada a esta skill.
2. [Arquitectura base backend](../../../docs/architecture/backend-architecture-baseline.md), para ubicar responsabilidades, flujos y mecanismos técnicos.
3. [Arquitectura particular de CasePilot](../../../docs/architecture/casepilot-backend-architecture.md), que adopta íntegramente la base y registra las decisiones específicas.
4. [Arquitectura del monorepo](../../../docs/architecture/monorepo-architecture.md), para elegir dueño y ubicación.
5. [ADR 0002](../../../docs/adr/0002-backend-application-owned-business-logic.md) y los ADRs adicionales relacionados con la decisión concreta.

Si ya cargaste esas fuentes vigentes en esta tarea, reutiliza su contexto. Las instrucciones directas del usuario tienen prioridad. Si autorizan cambiar una decisión, sincroniza la normativa y la guía antes del cambio incompatible, sin pedir de nuevo una autorización existente. No inventes excepciones ni interpretes un patrón previo contrario como autorización.

## Antes de diseñar o editar

- Revisa `git status --short`, el `AGENTS.md` más cercano y los patrones existentes con `rg`.
- Identifica contexto propietario, transportes, casos de uso, contratos, persistencia, librerías, consumidores y pruebas afectados. No crees capas o paquetes vacíos.
- Distingue decisiones del producto de mecanismos técnicos. En CasePilot el nombre Domain no permite ubicar allí comportamiento de negocio: la decisión explícita es Application como propietario exclusivo.
- Para cada command/query afectado, define su única clase request, su única clase response y el handler; incluye todos los inputs, también identidad/contexto verificado, dentro del request.
- Descompón la persistencia necesaria en operaciones individuales. Haz visible en Application cualquier secuencia, regla, escritura relacionada y límite transaccional.
- Si propones compartir negocio entre hosts, comprueba la frontera de paquetes vigente. No lo coloques en `libs/backend` ni importes una app desde otra para evitar una decisión arquitectónica.

Usa `monorepo-code-placement` cuando debas crear o mover archivos. Mantén pruebas y documentación con su dueño y no cambies reglas para facilitar una implementación.

Si la tarea agrega, modifica o retira reglas, o cambia su cobertura automatizada, aplica también [architecture-rules-sync](../architecture-rules-sync/SKILL.md) para sincronizar las fuentes, ESLint, dependency-cruiser, ts-morph y sus pruebas. Esta coordinación no sustituye la revisión de todo el catálogo.

## Durante el cambio

Trabaja en el orden que requiera la tarea, conservando estos puntos de revisión:

| Superficie | Comprobación que evita incumplimientos |
| --- | --- |
| Command/query | Un argumento request obligatorio, un response concreto en todos los retornos exitosos y negocio ejecutado en Application. |
| Domain y modelos | Datos/contratos sin reglas ocultas en constructores, métodos, getters, estructuras de valores o decoradores. |
| Transporte | Mapeo, validación técnica y delegación; sin reglas, repositorios o composición de varios casos de uso. |
| Puertos e imports | Tipos internos, binding en composición, sin ORM/framework/proveedor en el núcleo ni ciclos. |
| Repositorio/lectura | Una operación de I/O de su entidad/relaciones, sin políticas, otros repositorios, efectos externos o transacción propia. |
| Scope transaccional | Operaciones coordinadas por Application y recursos vinculados al mismo scope sin mutar singletons. |
| TypeORM y DDL | Revisar comportamiento real de save/remove, cascadas, huérfanos, listeners, subscribers, triggers, relaciones lazy y opciones transaccionales. |
| Contextos/libs | Dueño explícito, API pública y mecanismo general separado de reglas del producto. |

Esta tabla señala lugares fáciles de pasar por alto; no reemplaza ninguna regla del documento vigente. Revisa también las reglas nuevas que se agreguen después.

Los ejemplos oficiales de NestJS/TypeORM son referencias de API, no autorizaciones para introducir negocio en entidades/controllers o para usar defaults incompatibles. Verifica la versión concreta si una opción técnica importa para el cambio.

## Revisión y evidencia

1. Revisa el diff completo y el recorrido observable: entrada, request, handler, dependencias, cada I/O, transacción, efectos y response/error. Inspecciona también configuración, relaciones y hooks que puedan producir trabajo oculto.
2. Evalúa todas las reglas activas. Para cada regla afectada reúne evidencia de cumplimiento; para las no aplicables identifica la razón. Una regla no verificada no equivale a una regla cumplida.
3. Ejecuta lint, type-check, build y pruebas disponibles pertinentes. Verifica reglas/permisos en Application e I/O, rollback, scope y concurrencia en integración cuando el riesgo lo requiera. No acredites atomicidad a partir del nombre de un método o de una sola llamada ORM.
4. Corrige incumplimientos dentro del alcance autorizado y vuelve a verificar lo afectado. No reescribas código ajeno al alcance por encontrar una infracción preexistente: informa ubicación, impacto y regla, y evita agravarla.
5. Actualiza fuentes canónicas, README/contratos y ADRs cuando cambie una decisión autorizada. Registra limitaciones reales; el scaffold puede no tener checks ejecutables.

En una revisión, reporta cada hallazgo con ID de regla, archivo/línea, comportamiento incompatible y corrección concreta. En una implementación, resume cambio, evidencia y pendientes relevantes. No declares terminado un cambio que infringe una regla activa ni prometas que la skill es un enforcement automático.

## Conflictos y límites

Si el resultado pedido no puede lograrse respetando una regla y no existe autorización para cambiarla, completa primero el análisis y el trabajo compatible que corresponda. Explica la incompatibilidad concreta citando y enlazando la regla y presenta una alternativa compatible. Solicita una decisión solo cuando realmente sea necesaria; no suspendas trabajo por una preferencia de implementación que puedas resolver dentro de la arquitectura.

Si una instrucción de esta skill exige dejar trabajo pendiente o pedir una decisión, cita el pasaje aplicable de este `SKILL.md`, además de la regla normativa. No conviertas un ADR, una prueba verde o una supresión en permiso para romper restricciones.

No agregues ni modifiques reglas obligatorias por iniciativa propia para hacer pasar el cambio. Las nuevas reglas solicitadas por el usuario se incorporan con ID estable, compatibilidad comprobada y criterio verificable. Al retomar trabajo posterior, vuelve a consultar el catálogo si cambió desde su última lectura.
