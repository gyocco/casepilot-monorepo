# Skill: cambio de Supabase

## Cuándo usarla

Usa esta skill para cambios de tablas, columnas, relaciones, policies, RLS, Auth, Storage, Realtime, seed, Edge Functions, generación de tipos o consultas del cliente.

## Procedimiento obligatorio

1. Lee `.agents/instructions/30-supabase.md` y `50-security.md`, además de `docs/02-architecture/`, `docs/04-operations/` y `docs/05-reference/` relacionados.
2. Define el contrato, los actores, los datos sensibles, el comportamiento de borrado y los permisos esperados.
3. Crea una migración nueva o modifica la fuente declarativa elegida; nunca edites una migración aplicada.
4. Incluye constraints, índices, foreign keys, timestamps y RLS en el diseño, no como tareas posteriores.
5. Escribe policies explícitas para lectura, inserción, actualización y borrado. Incluye pruebas negativas para otro usuario/tenant y anónimo.
6. Mantén `seed.sql` determinista y sin datos reales. No metas definiciones de esquema en el seed.
7. Para Edge Functions, valida input, Auth, CORS, rate limits, idempotencia, timeouts, logs y secretos. No retornes trazas internas.
8. Ejecuta localmente `supabase db reset` y, si aplica, `supabase functions serve <nombre>`.
9. Regenera los tipos en la ubicación canónica y marca el archivo como generado.
10. Actualiza el cliente tipado, modelos de dominio, pruebas, documentación y ADR cuando corresponda.
11. Revisa el diff SQL completo. No ejecutes comandos remotos ni despliegues sin autorización explícita.

## Checklist de salida

- [ ] Migración nueva, ordenada y revisada.
- [ ] RLS habilitado y policies con casos positivos/negativos.
- [ ] Constraints e índices justificados.
- [ ] Seed reproducible o fixtures aislados.
- [ ] Tipos regenerados y no editados manualmente.
- [ ] Cliente/admin separados.
- [ ] Tests locales ejecutados o bloqueo documentado.
- [ ] Documentación/ADR actualizados.
