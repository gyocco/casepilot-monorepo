---
name: architecture-rules-sync
description: Agrega, modifica o retira reglas de arquitectura de CasePilot y sincroniza las fuentes canónicas, su adopción, la cobertura documentada, ESLint, dependency-cruiser, ts-morph y las pruebas de los validadores. Úsala también para auditar o corregir divergencias entre documentación y checks del backend o del monorepo; el trabajo habitual de backend sigue usando backend-architecture.
metadata:
  short-description: Sincronizar reglas, documentación y validadores de CasePilot
---

# Sincronización de reglas de arquitectura

## Resultado esperado

Entrega cada cambio de regla junto con su documentación, implementación verificable y evidencia, en el mismo cambio. Conserva una fuente normativa por responsabilidad y enlaza las demás; no copies el catálogo dentro de esta skill ni generes reglas ejecutables a partir de frases sin analizar su significado.

Esta skill coordina el mantenimiento mediante los mecanismos existentes. No convierte automáticamente toda obligación en análisis estático ni acredita equivalencia semántica solo porque los checks pasen. Las restricciones de comportamiento conservan pruebas y revisión explícitas.

## Fuentes que debes cargar

Comienza por `AGENTS.md` y las instrucciones aplicables. Aplica [monorepo-code-placement](../monorepo-code-placement/SKILL.md) antes de crear o mover archivos y [backend-architecture](../backend-architecture/SKILL.md) para las decisiones backend. Si ya leíste estas fuentes vigentes en la tarea, reutiliza su contexto.

| Fuente | Responsabilidad canónica |
| --- | --- |
| [backend-architecture-baseline-rules.md](../../../docs/architecture/backend-architecture-baseline-rules.md) | Obligaciones backend, IDs estables, criterios de verificación y estado de las reglas. Lee el catálogo completo y obtén los IDs activos actuales. |
| [backend-architecture-baseline.md](../../../docs/architecture/backend-architecture-baseline.md) | Diseño reutilizable, responsabilidades, flujos y ejemplos compatibles con la normativa. |
| [monorepo-architecture.md](../../../docs/architecture/monorepo-architecture.md) | Propiedad de proyectos, apps/libs, runtimes y ubicación de código, tests y automatización. |
| [casepilot-backend-architecture.md](../../../docs/architecture/casepilot-backend-architecture.md) | Adopción de la base y decisiones particulares de CasePilot. |
| [Validación de CasePilot API](../../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md) | Comandos reales, cobertura por regla, versiones, alcance y límites de los checks implementados. |
| [Arquitectura frontend](../../../docs/architecture/frontend-architecture.md) y [reglas FRT](../../../docs/architecture/frontend-architecture-rules.md) | Diseño y obligaciones frontend de SPA/kit; son fuentes propias, sin imponer convenciones backend a Angular. |
| [Validadores frontend](../../../tools/frontend-architecture/README.md) | Gate multiproyecto de TS/templates/estilos/grafo/config, regresiones y límites por FRT. |
| [ADR 0007](../../../docs/adr/0007-automated-api-architecture-validation.md) y ADRs relacionados | Decisiones que justifican herramientas, fronteras y convenciones verificables. |

Revisa `git status --short` y busca con `rg` las referencias de cada regla, sección, checker y prueba afectados. Conserva cambios preexistentes. Inspecciona el código de los validadores y los scripts de los manifests; una descripción o un ID en un comentario no prueba que exista enforcement.

## 1. Precisar el cambio

Identifica si la tarea cambia una obligación, concreta una convención compatible, amplía cobertura o corrige documentación incorrecta. No cambies la normativa cuando el defecto está en el código o el checker. Una prueba verde, una supresión o un patrón existente no autorizan relajar una regla.

Para cada regla afectada determina:

- Identidad: ID BCK vigente, o documento/sección canónica para una regla propia del monorepo o de CasePilot.
- Semántica: obligación, prohibiciones, alcance, ejemplo permitido y ejemplo rechazado; diferencia observable respecto de la versión anterior.
- Impacto: capas, aplicaciones/proyectos propietarios, consumidores, patrones existentes y proyectos que hayan adoptado explícitamente la base.
- Evidencia: qué puede comprobarse estáticamente y qué requiere una prueba de comportamiento o revisión.

Comprueba compatibilidad con todas las reglas activas y las instrucciones superiores. La solicitud explícita del usuario de cambiar una decisión ya constituye autorización dentro de su alcance: registra esa decisión sin pedir la misma autorización otra vez. Si hay una incompatibilidad no autorizada, concreta el conflicto y una alternativa compatible antes de solicitar la decisión necesaria; continúa el trabajo independiente que sí esté autorizado.

## 2. Actualizar las fuentes

Actualiza primero la fuente responsable de la decisión, antes de introducir una implementación incompatible:

- **Alta backend:** usa el siguiente ID libre; no reutilices ni renumeres IDs. Escribe obligación, alcance y criterio verificable en el catálogo.
- **Modificación:** conserva el ID cuando evoluciona la misma obligación, actualiza revisión y registra el cambio de significado. Si una regla se sustituye por otra, conserva la anterior con estado, fecha y referencia al reemplazo/ADR.
- **Retiro:** conserva historia e identidad con estado explícito; no borres silenciosamente la obligación. Actualiza adopción, cobertura, checks y pruebas que dependían de ella.
- **Regla de monorepo o restricción particular:** edita su fuente propia; no conviertas una ruta de CasePilot o una decisión de producto en una obligación de la base reutilizable.

Sincroniza explicación, diagramas y ejemplos en la guía base; propiedad y rutas en la guía del monorepo; adopción y decisiones específicas en CasePilot, cuando el cambio los afecte. Busca y corrige referencias obsoletas en instrucciones, skills, README y contratos. Mantén las reglas no afectadas. Registra un ADR cuando cambie una frontera o decisión arquitectónica; para una corrección de redacción o cobertura compatible no inventes una nueva decisión.

## 3. Implementar la evidencia automatizada

Elige un mecanismo principal según la propiedad verificable. Revisa siempre los tres mecanismos por posibles dependencias del cambio; edita solo los afectados y justifica la cobertura compartida cuando exista.

| Mecanismo y archivo actual de la API | Usar para |
| --- | --- |
| [ESLint](../../../src/apps/casepilot/casepilot-api/eslint.config.mjs) | Restricciones locales de sintaxis, imports y uso de APIs; usa información de tipos si la propiedad la necesita. |
| [dependency-cruiser](../../../src/apps/casepilot/casepilot-api/dependency-cruiser.config.mjs) | Grafo de dependencias, ciclos, capas, aplicaciones, runtimes, paquetes y reexports alcanzables. |
| [ts-morph de casos de uso](../../../src/apps/casepilot/casepilot-api/tools/architecture/use-case-rules.ts), [estructura](../../../src/apps/casepilot/casepilot-api/tools/architecture/source-layout-rules.ts), [operaciones](../../../src/apps/casepilot/casepilot-api/tools/architecture/application-operation-rules.ts) y [lanzador](../../../src/apps/casepilot/casepilot-api/tools/architecture/check-structure.ts) | Ubicación de capas/database y tríos por operación, declaraciones, firmas, clases concretas, símbolos, relaciones entre tipos y llamadas resolubles. |

Incluye la identidad normativa en nombres/mensajes de los checks arquitectónicos y una explicación corregible. Delimita carpetas, fuentes, extensiones, resolución de imports, exclusiones e indirectas soportadas. No añadas prohibiciones más amplias que la obligación sin una decisión documentada, ni uses regex de texto para una propiedad que necesita símbolos o un grafo.

Conserva TypeScript nativo como primer paso del gate: el análisis de ts-morph no sustituye compilación ni todos los caminos de retorno de NodeNext. No amplíes ignores, rebajes severidad, habilites supresiones o alteres resolución para ocultar incumplimientos. Detecta un ámbito accidentalmente vacío mediante una prueba o comprobación de entrada cuando cambie la selección de fuentes.

Los checks de la API comienzan en su `src/`: no certifican el monorepo completo. Si una regla exige analizar otras apps o librerías, incorpora el alcance real y sus comandos con el propietario adecuado. Las verificaciones de una API permanecen en ella; solo las verificaciones genuinamente multiproyecto van a `tests/` y la automatización transversal a `tools/`. No crees paquetes o carpetas de placeholders para simular esa cobertura.

Para frontend usa los checkers reales de `tools/frontend-architecture/` y las regresiones de `tests/architecture/frontend/`, además de las configuraciones ESLint de SPA/kit. Analiza templates Angular, estilos y recursos con sus ASTs; no derives reglas de color o responsabilidades de UI exclusivamente del grafo de imports. Conserva la matriz FRT y evidencia de comportamiento del kit/SPA.

Cuando una obligación no pueda demostrarse estáticamente, automatiza la parte verificable y especifica la evidencia restante: por ejemplo, integración de rollback/concurrencia o pruebas de permisos del caso de uso. Documenta por qué no existe un check genérico y dónde se acredita el comportamiento; no escribas un checker superficial para marcar la regla como cubierta.

## 4. Probar el contrato de cada checker

Amplía las [suites locales de arquitectura](../../../src/apps/casepilot/casepilot-api/test/architecture/) usando sus patrones existentes:

- Un ejemplo permitido debe pasar y uno rechazado debe fallar por el ID/mensaje esperado de la regla, sin depender de un error de compilación, resolución o configuración ajeno.
- Una modificación debe probar la diferencia entre la semántica anterior y la nueva; conserva las regresiones de obligaciones que siguen activas.
- Según el mecanismo, prueba las variantes relevantes: imports de tipos, aliases, `.js`/paths TypeScript, barrels e indirectas; métodos calculados; retornos síncronos/asíncronos y clases con igual forma pero símbolos distintos.
- Si cambian globs, entry points o propiedad de proyectos, comprueba que los archivos de destino se analicen y que ejemplos válidos de otros ámbitos sigan permitidos.

Usa ESLint con su configuración real, dependency-cruiser real y proyectos ts-morph con resolución representativa, conforme a las suites existentes. Los tests en memoria pueden simplificar fixtures, pero no acreditan por sí solos compatibilidad del gate real. No crees archivos inválidos permanentes en `src/`, ejecutes casos de uso al escanearlos ni utilices la base de desarrollo para fixtures.

## 5. Sincronizar cobertura en ambas direcciones

Actualiza la matriz y las limitaciones en la guía local de validación en el mismo cambio. Mantén una entrada para cada ID backend activo; conserva trazabilidad de reglas retiradas cuando corresponda. Para reglas generales nuevas, añade su referencia canónica y alcance en una sección de cobertura del propietario, sin duplicar la normativa.

En la cobertura afectada identifica fuente/ID, mecanismo y checker concreto con enlace, tests con enlace, alcance acreditado y evidencia pendiente. Declara cobertura **parcial**, **completa para una propiedad delimitada** o **sin check estático**, según lo demostrado. No interpretes ausencia de código o de fallos como cobertura completa.

Revisa en dos direcciones:

1. **Documento → ejecución:** toda obligación nueva/modificada tiene un check y casos que acreditan la parte automatizable, o una razón explícita y evidencia alternativa para la parte restante.
2. **Ejecución → documento:** toda restricción arquitectónica añadida/modificada corresponde a una fuente vigente; sus mensajes, severidad, ámbito y tests coinciden con lo que la cobertura promete. No quedan checks obsoletos que bloqueen una regla retirada ni restricciones nuevas sin documentar.

No marques como cumplida una garantía de SQL, autorización, negocio o efectos externos a partir de un chequeo de imports. Si descubres una divergencia ajena al alcance, registra fuente, checker, efecto y pendiente; no la ocultes ni amplíes el cambio silenciosamente.

## 6. Verificar y entregar

Consulta los manifests actuales antes de ejecutar. Para frontend/kit ejecuta `pnpm check:web`; incluye los validadores, sus regresiones y los checks de producto. Chromium es un requisito local de e2e, documentado en el README web. Los comandos siguientes corresponden solo a cambios en los validadores o arquitectura implementada de la API, desde la raíz:

```bash
pnpm check:api:architecture
pnpm test:api
pnpm build:api
```

`test:api` incluye las suites arquitectónicas. `pnpm test:api:architecture` permite ejecutarlas aisladamente durante el desarrollo. Ejecuta `pnpm test:api:integration` si cambian persistencia, scopes, endpoints o comportamiento que requiera PostgreSQL efímero; requiere Docker. Añade los checks de otros paquetes realmente afectados. Si cambian dependencias, actualiza el lockfile y verifica una instalación congelada.

Para cambios exclusivamente documentales o de esta skill, valida frontmatter, enlaces locales, rutas y `git diff --check`; no inventes ejecución de checks de producto ni revisiones de viewport. Revisa el diff completo contra todas las reglas activas, no solo las mencionadas en la solicitud.

Entrega la identidad y el cambio semántico de las reglas afectadas, fuentes sincronizadas, checks/tests modificados, comandos ejecutados y resultado, cobertura residual y pendientes reales. Un cambio de regla automatizable queda incompleto si falta su checker, su regresión o la cobertura documentada. No declares sincronización completa si quedan contradicciones en el alcance modificado.
