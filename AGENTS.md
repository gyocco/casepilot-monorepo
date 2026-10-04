# AGENTS.md — CasePilot

Este archivo es el punto de entrada obligatorio para cualquier agente que trabaje en el repositorio. Aplica a todo el monorepo. Si en el futuro aparece otro `AGENTS.md` dentro de una subcarpeta, sus reglas serán más específicas para esa carpeta, siempre respetando las instrucciones del sistema y del usuario.

## Arranque obligatorio

Antes de modificar código, configuración o documentación:

1. Lee este archivo y [`.agents/README.md`](.agents/README.md).
2. Lee [`.agents/instructions/README.md`](.agents/instructions/README.md).
3. Lee las instrucciones numeradas relevantes. Para cambios normales de producto, carga como mínimo `00`, `10`, `20`, `40`, `50`, `60` y `90`. Este proyecto no usa Supabase; no añadas instrucciones, configuración ni dependencias de esa plataforma.
4. Consulta la documentación local enlazada desde `docs/README.md` y desde la instrucción específica.
5. Busca primero patrones existentes en el repositorio antes de crear una abstracción nueva.

Para trabajo de backend, el agente DEBE leer [Arquitectura base backend](docs/architecture/backend-architecture-baseline.md) y [Reglas obligatorias de la arquitectura base backend](docs/architecture/backend-architecture-baseline-rules.md), y aplicar la skill [backend-architecture](.agents/skills/backend-architecture/SKILL.md). También DEBE leer la [adopción particular de CasePilot](docs/architecture/casepilot-backend-architecture.md). Las reglas activas del backend son obligatorias; no se admiten excepciones locales ni implícitas. Un cambio de regla autorizado debe registrarse y sincronizarse antes de implementar una arquitectura incompatible.

Para agregar, modificar o retirar reglas de arquitectura, o corregir divergencias entre documentación y validadores, el agente DEBE aplicar [architecture-rules-sync](.agents/skills/architecture-rules-sync/SKILL.md). La misma tarea sincroniza fuentes canónicas, adopción, cobertura, checks ESLint/dependency-cruiser/ts-morph afectados y sus pruebas; no basta con editar la regla escrita.

## Nivel de las reglas

Las palabras `MUST`/`DEBE`, `MUST NOT`/`NO DEBE`, `SHOULD`/`DEBERÍA` y `MAY`/`PUEDE` tienen el siguiente significado:

- `MUST` y `MUST NOT`: restricciones obligatorias. Una excepción necesita una justificación escrita y revisión explícita.
- `SHOULD`: práctica esperada salvo que exista una razón técnica documentada.
- `MAY`: opción válida cuando encaja con el diseño existente.

## Dirección del proyecto

CasePilot comparte un único código de producto entre:

- la aplicación browser en `src/apps/casepilot/casepilot-web/`;
- la API desplegable en `src/apps/casepilot/casepilot-api/`, implementada con NestJS y TypeScript;
- la aplicación móvil en `src/apps/casepilot/casepilot-mobile/`, empaquetada con Capacitor/Ionic.

La API contiene una base NestJS/TypeORM y health checks; la web tiene una base Angular con login placeholder y mobile sigue pendiente. Las capacidades técnicas reutilizables se agrupan por runtime en `src/libs/backend/`, `src/libs/frontend/` y `src/libs/mobile/`. La guía detallada es [Arquitectura del monorepo](docs/architecture/monorepo-architecture.md); los comandos backend están en el [README de la API](src/apps/casepilot/casepilot-api/README.md).

La SPA usa Angular 21 LTS y TypeScript, Angular Material mediante `pilot-ui-kit` y Tailwind CSS; la compatibilidad futura con Capacitor se conserva. Los proveedores elegidos son Firebase Authentication, Google Cloud Run, Firebase Hosting, Neon PostgreSQL inicialmente y GitHub Actions. Cloud SQL for PostgreSQL puede sustituir a Neon o coexistir en otros ambientes; conexión y uso de PostgreSQL deben ser independientes del proveedor. La fuente canónica es [Infraestructura, proveedores y ambientes](docs/architecture/infrastructure-providers.md); el aprovisionamiento y los pipelines de despliegue se implementarán en una tarea futura.

Para trabajo frontend DEBE leer [arquitectura frontend](docs/architecture/frontend-architecture.md), [reglas obligatorias FRT](docs/architecture/frontend-architecture-rules.md) y [cobertura ejecutable](tools/frontend-architecture/README.md). Se prohíben colores y paths de recursos hardcoded en componentes: usa tokens y recursos por nombre del kit. Las reglas nuevas se sincronizan con los validadores y sus regresiones; `pnpm check:web` ejecuta el gate frontend completo.

Por eso, toda decisión de UI y plataforma DEBE funcionar primero en una pantalla móvil estrecha y NO DEBE introducir una dependencia innecesaria del navegador o del sistema operativo. Las diferencias nativas deben aislarse detrás de adaptadores y mantenerse fuera de la lógica de dominio.

## Restricciones no negociables

- No exponer secretos, claves privadas ni tokens de administrador en código cliente, bundles Angular, logs o documentación.
- No acceder a persistencia directamente desde componentes Angular. La UI consume APIs NestJS y contratos tipados; los adaptadores técnicos compartidos de persistencia viven en `src/libs/backend/` y el acceso específico de una feature permanece en el módulo backend que la posee.
- No introducir Supabase como solución de datos, autenticación, storage, realtime o backend gestionado.
- No poner código específico de una app dentro de `libs/`; las librerías deben ser reutilizables y no importar desde `apps/`.
- No crear layouts desktop-first: las clases sin prefijo representan el mínimo móvil y las variantes responsive mejoran la experiencia en pantallas mayores.
- No introducir APIs web o nativas directamente en múltiples lugares. Crear un adaptador compartido y probar el fallback web.
- No saltarse lint, type-check, build, pruebas o revisión de accesibilidad sin dejar constancia de la razón.
- No realizar despliegues, operaciones remotas destructivas ni cambios irreversibles sin autorización explícita.

## Flujo mínimo de trabajo

1. Entender el objetivo, el alcance y las restricciones.
2. Revisar `git status`, la estructura y los patrones existentes.
3. Identificar las capas afectadas: app, servicio, librería, contratos, tests, infraestructura y docs.
4. Implementar el cambio más pequeño que mantenga las fronteras arquitectónicas.
5. Añadir o actualizar pruebas y documentación en el mismo cambio.
6. Ejecutar las verificaciones disponibles y revisar el diff completo.
7. Informar qué se cambió, qué se verificó y qué queda pendiente.

## Definition of Done

Un cambio está terminado solo cuando:

- compila y pasa el lint aplicable;
- tiene tipos explícitos y no introduce `any` sin justificación;
- cubre el comportamiento nuevo con pruebas proporcionales al riesgo;
- se validó en viewport móvil y, cuando corresponda, en viewport amplio;
- se revisaron accesibilidad, estados de carga/error/vacío y navegación;
- no rompe la futura ejecución web + Capacitor;
- actualiza `docs/` o el README local si cambió una decisión, contrato, comando o estructura;
- no deja secretos, archivos generados ni cambios no relacionados.
