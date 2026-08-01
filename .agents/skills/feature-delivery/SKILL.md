# Skill: entrega de funcionalidad

## Cuándo usarla

Usa esta skill cuando una funcionalidad atraviese dos o más capas: pantalla, feature, paquete reusable, Supabase, autenticación, tests o documentación.

## Procedimiento

1. Define el objetivo, usuario, criterios de aceptación y estados `loading`, `success`, `empty`, `error` y `offline` si aplican.
2. Lee `docs/01-product/`, `docs/02-architecture/` y `docs/03-development/` relacionados. Busca ADRs existentes.
3. Mapea la funcionalidad por capas:
   - UI específica en `apps/web`;
   - UI reutilizable en `packages/ui-components`;
   - dominio puro en `packages/domain-models`;
   - acceso a datos en `packages/supabase-client`;
   - privilegios en Edge Function o `packages/supabase-admin`;
   - capabilities en `packages/platform`.
4. Define primero contratos y modelos tipados. Mantén la lógica de dominio fuera de React, Ionic y Supabase.
5. Implementa la experiencia móvil primero con `IonPage` y componentes Ionic apropiados. Añade mejoras responsive para pantallas grandes.
6. Implementa carga, errores recuperables, validación de entrada, autorización y feedback accesible.
7. Añade pruebas unitarias de reglas y mapeos, integración de datos/permisos y e2e del flujo crítico cuando corresponda.
8. Actualiza README local, `docs/` y ADRs si cambió una decisión, contrato, variable o procedimiento.
9. Ejecuta lint, type-check, build y pruebas relevantes. Revisa el diff y el working tree.

## Criterios de salida

- La funcionalidad no importa desde `apps` hacia `packages`.
- No hay acceso de admin ni secretos en el bundle cliente.
- El comportamiento está cubierto para permisos aceptados y rechazados.
- La pantalla funciona en móvil, web amplia, teclado y navegación atrás.
- La documentación permite reproducir la funcionalidad desde un checkout limpio.
