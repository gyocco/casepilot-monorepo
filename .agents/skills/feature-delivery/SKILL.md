# Skill: entrega de funcionalidad

## Cuándo usarla

Usa esta skill cuando una funcionalidad atraviese dos o más capas: pantalla, feature, librería reusable, servicio NestJS, contrato, autenticación, tests o documentación.

## Procedimiento

1. Define el objetivo, usuario, criterios de aceptación y estados `loading`, `success`, `empty`, `error` y `offline` si aplican.
2. Consulta el [índice de documentación](../../../docs/README.md) y [Arquitectura del monorepo](../../../docs/architecture/monorepo-architecture.md). Lee los documentos de producto y desarrollo y los ADRs relacionados que existan; no asumas documentos ni carpetas todavía ausentes.
   Si el cambio afecta backend, aplica la skill [backend-architecture](../backend-architecture/SKILL.md) y consulta las [reglas obligatorias vigentes](../../../docs/architecture/backend-architecture-baseline-rules.md).
3. Mapea la funcionalidad por capas:
   - UI específica en `src/apps/casepilot/casepilot-web/` o `src/apps/casepilot/casepilot-mobile/`;
   - UI técnica reutilizable en `src/libs/frontend/`;
   - dominio, aplicación e infraestructura específicos de una feature en la app o módulo que los posee, por ejemplo dentro de `src/apps/casepilot/casepilot-api/`;
   - mecanismos técnicos backend generales en `src/libs/backend/<capability>/`;
   - contratos entre procesos en `contracts/`;
   - adaptadores de dispositivo y plataforma generales en `src/libs/mobile/`, o junto a la app si solo tienen un consumidor.
4. Define primero contratos y modelos tipados. Mantén la lógica de negocio fuera de Angular, Ionic, NestJS y proveedores concretos; en backend implementa todas las reglas y casos de uso exclusivamente en Application, con Domain limitado a modelos y contratos.
5. Implementa la experiencia móvil primero con HTML semántico, Angular Router y componentes del UI kit sobre Material, conforme a [arquitectura frontend](../../../docs/architecture/frontend-architecture.md) y [reglas FRT](../../../docs/architecture/frontend-architecture-rules.md). Usa tokens y recursos por nombre; añade mejoras responsive para pantallas grandes.
6. Implementa carga, errores recuperables, validación de entrada, autorización y feedback accesible.
7. Añade pruebas unitarias de reglas y mapeos, integración de datos/permisos y e2e del flujo crítico cuando corresponda.
8. Actualiza README local, `docs/` y ADRs si cambió una decisión, contrato, variable o procedimiento.
9. Ejecuta lint, type-check, build y pruebas relevantes. Revisa el diff y el working tree.

## Criterios de salida

- Las librerías no importan desde `src/apps/`; las apps consumen librerías compatibles con su runtime sin crear ciclos.
- No hay acceso de admin ni secretos en el bundle cliente.
- El comportamiento está cubierto para permisos aceptados y rechazados.
- La pantalla funciona en móvil, web amplia, teclado y navegación atrás.
- La documentación permite reproducir la funcionalidad desde un checkout limpio.
