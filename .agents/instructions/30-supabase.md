# 30 — Supabase, PostgreSQL y backend

## Fuente de verdad y flujo de cambios

- `supabase/config.toml`, `supabase/migrations/`, `supabase/seed.sql`, `supabase/functions/` y cualquier `supabase/schemas/` versionado son la fuente de verdad del backend.
- Crea cambios con `supabase migration new <descripcion>` o el flujo declarativo adoptado por el proyecto. Revisa y limpia el SQL generado antes de aprobarlo.
- Una migración aplicada es inmutable. Para corregirla, crea otra migración forward, no edites el historial.
- Cada migración debe ser determinista, ordenable, reversible en el diseño cuando sea posible y contener un cambio lógico acotado.
- Después de una migración, ejecuta `supabase db reset` localmente y verifica que todas las migraciones y el seed se reproduzcan desde cero.
- Las modificaciones remotas deben llegar por migraciones y CI/CD. No ejecutes `supabase db push`, `db reset --linked`, `db pull` ni comandos destructivos contra un entorno remoto sin autorización explícita.

Referencias: [Local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows) y [Database migrations](https://supabase.com/docs/guides/deployment/database-migrations).

## Modelo de datos

- Usa claves primarias, foreign keys, `not null`, `check`, `unique` y defaults para expresar invariantes en PostgreSQL, no solo en TypeScript.
- Usa nombres consistentes en `snake_case` para tablas y columnas. Documenta excepciones.
- Añade índices basados en consultas reales y revisa el coste de cada índice en escrituras.
- Define timestamps y zona horaria de forma consistente; persiste instantes como `timestamptz` salvo una decisión documentada.
- Evita duplicar datos derivados sin una estrategia de consistencia.
- Define el comportamiento de borrado (`restrict`, `cascade`, soft delete) explícitamente para cada relación.
- No pongas lógica de negocio crítica solo en el cliente.

## RLS y autorización

- Toda tabla expuesta por la API debe tener Row Level Security habilitado. El estado por defecto debe ser deny-by-default hasta que existan políticas explícitas.
- Cada policy debe indicar tabla, operación, rol, condición de lectura y condición de escritura. Revisa `using` y `with check` por separado.
- Usa `auth.uid()` y relaciones verificables para autorizar acceso; no confíes en IDs enviados por el cliente.
- Prueba acceso permitido, acceso denegado, usuario anónimo, usuario de otro tenant y rol privilegiado.
- Ocultar una ruta o botón no es autorización. La base de datos y las funciones deben aplicar el límite de seguridad.
- `service_role` y cualquier clave de bypass de RLS son server-only; no se importan desde `apps/web` ni desde un paquete browser-safe.

La referencia base es [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Cliente y paquetes

- `packages/supabase-client` es la única frontera browser-safe para crear el cliente, exponer tipos y encapsular queries/commands de uso común.
- `packages/supabase-admin` solo puede consumirse en servidor, Edge Functions o procesos explícitamente protegidos. Si el runtime Deno no puede usarlo directamente, duplica únicamente el contrato mínimo en la frontera server-side, no lo fuerces dentro del bundle web.
- Las queries no deben filtrarse por todos los componentes. Crea funciones de acceso tipadas y mapea respuestas de persistencia a modelos de dominio cuando corresponda.
- Valida input antes de enviarlo y valida output cuando la fuente sea externa o crítica.
- Genera tipos desde el esquema y guárdalos en una ubicación canónica, preferiblemente `packages/supabase-client/src/generated/database.types.ts`. Marca el archivo como generado y no lo edites manualmente.

Consulta [Generating TypeScript Types](https://supabase.com/docs/guides/api/rest/generating-types).

## Edge Functions

- Cada función vive en `supabase/functions/<nombre>/` y tiene un propósito único.
- Valida método, headers, autenticación, payload y límites de tamaño antes de ejecutar trabajo.
- Distingue usuario anónimo, usuario autenticado y operación administrativa; aplica autorización dentro de la función.
- Usa variables de entorno para secretos, configura CORS de forma explícita y no devuelvas errores internos ni trazas al cliente.
- Diseña webhooks y operaciones reintentables para idempotencia. Controla timeouts, reintentos y efectos parciales.
- No registres tokens, contraseñas, PII innecesaria ni payloads completos en logs.
- Prueba localmente con `supabase functions serve` y documenta dependencias externas.

Referencia: [Supabase Edge Functions](https://supabase.com/docs/guides/functions).

## Seed y datos locales

- `supabase/seed.sql` contiene solo datos deterministas de desarrollo/pruebas, nunca datos reales o secretos.
- El seed debe ejecutarse después de migraciones y poder repetirse sin depender de orden manual.
- Evita schema statements dentro del seed; el esquema pertenece a migrations/schemas.
- Si un test necesita datos específicos, usa fixtures aislados o builders, no contamines el seed global.

Referencia: [Seeding your database](https://supabase.com/docs/guides/local-development/seeding-your-database).
