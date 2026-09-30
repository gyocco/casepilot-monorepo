# AGENTS.md — CasePilot

Este archivo es el punto de entrada obligatorio para cualquier agente que trabaje en el repositorio. Aplica a todo el monorepo. Si en el futuro aparece otro `AGENTS.md` dentro de una subcarpeta, sus reglas serán más específicas para esa carpeta, siempre respetando las instrucciones del sistema y del usuario.

## Arranque obligatorio

Antes de modificar código, configuración o documentación:

1. Lee este archivo y [`.agents/README.md`](.agents/README.md).
2. Lee [`.agents/instructions/README.md`](.agents/instructions/README.md).
3. Lee las instrucciones numeradas relevantes. Para cambios normales de producto, carga como mínimo `00`, `10`, `20`, `40`, `50`, `60` y `90`. Este proyecto no usa Supabase; no añadas instrucciones, configuración ni dependencias de esa plataforma.
4. Consulta la documentación local enlazada desde `docs/README.md` y desde la instrucción específica.
5. Busca primero patrones existentes en el repositorio antes de crear una abstracción nueva.

## Nivel de las reglas

Las palabras `MUST`/`DEBE`, `MUST NOT`/`NO DEBE`, `SHOULD`/`DEBERÍA` y `MAY`/`PUEDE` tienen el siguiente significado:

- `MUST` y `MUST NOT`: restricciones obligatorias. Una excepción necesita una justificación escrita y revisión explícita.
- `SHOULD`: práctica esperada salvo que exista una razón técnica documentada.
- `MAY`: opción válida cuando encaja con el diseño existente.

## Dirección del proyecto

CasePilot comparte un único código de producto entre:

- las aplicaciones browser en `src/web-ui/apps/`;
- los servicios desplegables en `src/services/apps/`, implementados con NestJS y TypeScript;
- las futuras aplicaciones móviles en `src/mobile-ui/apps/`, empaquetadas con Capacitor/Ionic.

Por eso, toda decisión de UI y plataforma DEBE funcionar primero en una pantalla móvil estrecha y NO DEBE introducir una dependencia innecesaria del navegador o del sistema operativo. Las diferencias nativas deben aislarse detrás de adaptadores y mantenerse fuera de la lógica de dominio.

## Restricciones no negociables

- No exponer secretos, claves privadas ni tokens de administrador en código cliente, bundles Vite, logs o documentación.
- No acceder a persistencia directamente desde componentes React. El acceso pasa por `src/web-ui/libs`, APIs NestJS, `src/services/libs` y contratos tipados.
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
