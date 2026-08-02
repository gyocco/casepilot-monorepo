# Línea base de desarrollo

- Estado: vigente para la base actual
- Última actualización: 2026-08-02

## Estado actual

La aplicación ejecutable actual es `apps/web`, construida con React, Vite, Ionic React y Tailwind CSS. La configuración local de Supabase está en `supabase/`. Los módulos de producto todavía no están implementados.

## Requisitos y comandos actuales

Desde `apps/web/`:

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Desde la raíz, Supabase local solo cuando el cambio lo requiera y Docker esté disponible:

```bash
supabase start
```

No ejecutar `supabase db push`, despliegues ni operaciones remotas como parte de una verificación implícita.

## Calidad mínima

Todo cambio de código debe revisar, según el alcance:

- type-check y build de la app/paquete;
- lint sin nuevos errores;
- unit tests de dominio, validadores y mapeadores;
- integration tests para contratos, RLS y adaptadores;
- e2e para Auth, navegación, permisos y flujos críticos;
- revisión manual móvil, teclado, focus, accesibilidad y estados de red.

Los scripts de test que se incorporen deben documentarse aquí y en el README del proyecto afectado.

## Organización esperada

- `apps/web/src/`: rutas, páginas, features y composición específica de la aplicación.
- `packages/`: dominio, UI, cliente de datos, admin server-side o plataforma solo cuando exista una frontera real.
- `tests/`: pruebas que crucen apps, paquetes o infraestructura.
- `tooling/`: scripts y configuración compartida, sin lógica de negocio.
- `docs/`: requisitos, arquitectura, operación, contratos y decisiones de largo plazo.

## Reglas para nuevas features

1. Localizar primero patrones y contratos existentes.
2. Mantener componentes visuales separados de queries, credenciales y autorización.
3. No acceder a la base de datos directamente desde componentes React.
4. Añadir estados `loading`, `success`, `empty`, `error`, `retry` y `offline` cuando correspondan.
5. Diseñar móvil primero y probar la futura compatibilidad web/native.
6. Actualizar la User Story, las pruebas y la documentación afectada en el mismo cambio.

## Variables y secretos

Las variables `VITE_*` son públicas y solo pueden contener configuración segura para el cliente. Secretos, tokens administrativos, `service_role`, passwords y claves privadas viven fuera del bundle, en el entorno server-side o gestor de secretos correspondiente.

## Fuentes relacionadas

- [README de la app web](../../apps/web/README.md)
- [Línea base de arquitectura](../02-architecture/architecture-baseline.md)
- [Línea base de entrega](../07-project-management/delivery-baseline.md)
- [Instrucciones de calidad](../../.agents/instructions/40-quality-testing.md)
