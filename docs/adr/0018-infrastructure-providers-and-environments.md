# 0018 — Proveedores de infraestructura y PostgreSQL por ambiente

- Estado: aceptada; implementación remota pendiente.
- Fecha: 2026-10-04.
- Alcance: identidad, runtime API, hosting SPA, bases remotas y CI/CD de CasePilot.

## Contexto

CasePilot necesita proveedores que permitan empezar con un costo bajo y evolucionar hacia ambientes profesionales. La API existente usa NestJS/TypeORM/PostgreSQL y configuración externa; el desarrollo local y las pruebas ya tienen PostgreSQL propio. El usuario decidió los proveedores y exige que cada ambiente pueda elegir Neon o Cloud SQL sin acoplar el negocio al destino.

## Decisión

Adoptar Firebase Authentication para identidad, Google Cloud Run para la API, Firebase Hosting para la SPA, Neon PostgreSQL inicialmente y GitHub Actions para CI/CD. Google Cloud SQL for PostgreSQL es una opción aceptada para migración futura o para otros ambientes, incluidos QA/producción.

La configuración de conexión y el uso de PostgreSQL son independientes del proveedor. Se admite, por ejemplo, DEV en Neon y QA/Prod en Cloud SQL al mismo tiempo. Cambiar de destino en cualquiera de las dos direcciones mantiene casos de uso, contratos y persistencia PostgreSQL; las diferencias técnicas se resuelven mediante configuración y adaptadores de infraestructura. La compatibilidad efectiva debe probarse en ambos proveedores.

El montaje de servicios, recursos y automatización con GitHub Actions se realizará en una tarea futura. Esta decisión no provisiona recursos ni habilita despliegues. La fuente canónica de proveedores, ambientes, configuración, límites y pendientes es [Infraestructura, proveedores y ambientes](../architecture/infrastructure-providers.md).

## Alternativas consideradas

- Cloud SQL en todos los ambientes desde el inicio: conserva PostgreSQL y el ecosistema Google, pero no es el proveedor inicial elegido.
- Railway o Render para la API/base y Auth0 para identidad: considerados durante la comparación y no seleccionados.
- Acoplar repositorios o negocio a una API propietaria de base de datos: incompatible con la independencia requerida.

## Consecuencias

- Neon y Cloud SQL pueden coexistir con configuración, bases y credenciales aisladas por ambiente.
- Las migraciones tienen una fuente coordinada y las diferencias de conectividad quedan fuera del núcleo backend.
- Cambiar la conexión no transfiere datos. Una migración requiere un procedimiento validado, tratamiento de escrituras y recuperación.
- GitHub Actions automatizará verificaciones, aprovisionamiento y releases cuando se implemente la infraestructura.
- Las reglas BCK/CPA existentes se mantienen; elegir proveedores no añade cobertura automatizada ni acredita despliegues.
