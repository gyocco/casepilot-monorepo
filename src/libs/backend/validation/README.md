# Validation

`@casepilot/validation` reúne mecanismos de validación estructural para CasePilot API y futuras APIs backend. No conoce recursos, cuentas, relaciones ni casos de uso del producto. Las restricciones que adopta cada consumidor se seleccionan en su Application.

## Entradas públicas

- `@casepilot/validation`: validateId, uuidPattern, validateFields, FieldRule/FieldKind, validatePage, PaginationRules y validateVersion. Entrada pura sobre abstractions; no importa Node, NestJS, ORM ni apps.
- `@casepilot/validation/nestjs`: lectura técnica de bodies/campos/query parameters y PageMetadataHttpResponse. Solo Presentation/composición. NestJS common 12.1.2 es peer opcional para la entrada pura y obligatorio para este adaptador.

No usar deep imports ni reexportar el adaptador desde el núcleo. Los datos y las restricciones del producto permanecen en la app.

## Uso desde Application

```typescript
import { validateFields, validatePage } from '@casepilot/validation';

validateFields(input, [
  { name: 'label', kind: 'string', nullable: false, nonblank: true, maxLength: 80 },
  { name: 'price', kind: 'decimal', nullable: false, integerDigits: 8, fractionDigits: 2, nonnegative: true },
], false);
const page = validatePage(1, 200, 'label', 'asc', { maxPageSize: 500, sortFields: ['label'] });
```

El nombre de campo no activa validaciones de email, moneda o país. Los consumidores declaran pattern, choices, límites numéricos/de longitud, precisión decimal y signo. UUID, fechas, timestamps y JSON se verifican estructuralmente. JSON rechaza ciclos y números no finitos; maxJsonDepth es 100 por defecto como protección técnica, y cada consumidor puede fijar otro límite. Los patterns global/sticky no mutan lastIndex. Los JSON Pointers escapan caracteres especiales y no incluyen valores recibidos.

validateFields rechaza campos desconocidos, distingue altas y updates parciales y conserva la nulabilidad declarada. validatePage requiere la lista de campos sortable y el máximo por página; validateVersion requiere los límites. Estos helpers no deciden permisos, relaciones ni elegibilidad y no sustituyen los handlers.

El adaptador HTTP recibe listas de campos/choices elegidas por su transporte. Su parser JSON tiene un límite técnico de profundidad de 20; el filtro global traduce sus BadRequestException. PageMetadataHttpResponse copia solo campos públicos del response CQRS.

## Verificación

Desde la raíz: `pnpm check:validation`, `pnpm build:validation`, `pnpm test:validation`. Los comandos construyen abstractions y cqrs antes del check/build/test del paquete. La API incluye todos los paquetes en build:contracts.

[Pruebas de comportamiento](test/validation.test.ts) y [parsers HTTP](test/http.test.ts) verifican configuración de consumidores distintos, tipos, ausencia de políticas por nombre, parcial/nulabilidad, JSON, fechas y pointers. [Pruebas de arquitectura](test/architecture.test.ts) ejecutan el ESLint real y acreditan pureza/rechazo de apps y adaptadores. La API verifica la frontera HTTP mediante lint y grafo. Revisión semántica de reglas y futuros consumidores conserva su dueño. Decisión: [ADR 0016](../../../../docs/adr/0016-reusable-backend-mechanisms.md), CPA-005.
