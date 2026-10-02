# Exception handler

`@casepilot/exception-handler` proporciona un filtro HTTP global configurable para NestJS 12.1.2 sobre los [errores puros de abstractions](../abstractions/README.md). Es una capacidad técnica server-side reutilizable por APIs; no contiene decisiones de negocio ni importa desde apps, frontend o mobile. CasePilot API es su consumidor inicial.

## Entradas públicas

- `@casepilot/exception-handler`: reexporta por compatibilidad ApplicationError, UnexpectedError, ValidationError, NotFoundError, ForbiddenError, UnauthorizedError y sus opciones/detalles desde `@casepilot/abstractions`, conservando la identidad de sus constructores. No carga NestJS, Node, HTTP ni proveedores. Application consume los errores desde abstractions y decide cuándo emitirlos.
- `@casepilot/exception-handler/nestjs`: ExceptionHandlerModule, ProblemDetailsFilter, ProblemDetailsFactory y tipos de configuración/response. Solo transporte/composición; no se importa desde Domain/Application. No usar deep imports ni rutas a internals.

`UnauthroizedError` es un alias de `UnauthorizedError` que admite la grafía de la solicitud inicial. Ambos representan la misma clase.

## Uso

```typescript
import { ValidationError } from '@casepilot/abstractions';

throw new ValidationError('Email must be valid.', {
  details: [{ message: 'Invalid email format.', code: 'FORMAT', pointer: '/email' }],
});
```

En el módulo de composición NestJS:

```typescript
import { Module } from '@nestjs/common';
import { ExceptionHandlerModule } from '@casepilot/exception-handler/nestjs';

@Module({
  imports: [ExceptionHandlerModule.register({ exposeDetails: false })],
})
export class ApiModule {}
```

El módulo registra un `APP_FILTER` global que atiende errores de controllers, promesas/observables, guards, pipes y routing. Los filtros locales de controller/método pueden resolver una excepción antes del global; no agregarlos si se requiere el contrato uniforme. Usa HttpAdapterHost y no contiene tipos de Express. Se verifica con el adaptador Express de NestJS; otros adaptadores requieren su propia validación. Solo HTTP; no normaliza RPC/WebSockets ni excepciones de bootstrap o tareas fuera del ciclo HTTP.

## Mapeos y contrato

| Error | Status | Extensión `code` |
| --- | --- | --- |
| UnexpectedError | 500 | UNEXPECTED_ERROR |
| ValidationError | 400 | VALIDATION_ERROR |
| NotFoundError | 404 | NOT_FOUND_ERROR |
| ForbiddenError | 403 | FORBIDDEN_ERROR |
| UnauthorizedError | 401 | UNAUTHORIZED_ERROR |

Los HttpException de Nest conservan un status válido 400–599; 400/401/403/404 usan los códigos anteriores, otros 4xx usan HTTP_ERROR y otros 5xx UNEXPECTED_ERROR. Los errores desconocidos, incluidos strings, null y objetos con campos status/statusCode, se traducen a 500.

Todas las respuestas usan `Content-Type: application/problem+json` y `Cache-Control: no-store`. El body sigue [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html): type, title, status, instance y la extensión code. Status coincide con el HTTP real; title es la frase del status, salvo un mapeo explícito. Type es `about:blank` por defecto. Instance identifica cada ocurrencia con un `urn:uuid`, sin incluir URL, query string ni body del request.

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "instance": "urn:uuid:00000000-0000-4000-8000-000000000001",
  "code": "VALIDATION_ERROR"
}
```

Con exposeDetails se agregan detail (mensaje), stack y errors (detalles seleccionados) para los errores tipados. Los 4xx de Nest exponen solo mensajes string/arrays de strings, sin serializar propiedades arbitrarias de su response; los 404 usan un mensaje fijo para evitar revelar URLs. Los 5xx de Nest, errores desconocidos y causas de proveedor permanecen sanitizados incluso con detalle activo. No se recorren cause ni objetos técnicos; un cause circular tampoco rompe la respuesta.

Los mensajes, detalles y stack habilitados deben ser adecuados para la audiencia: no colocar SQL, credenciales, tokens ni datos personales en un error tipado. Guardar un error técnico como cause no autoriza a copiarlo al mensaje. El filtro no imprime el error ni implementa un sistema de logging.

## Configuración

El paquete no lee variables del proceso: exposeDetails es `false` por defecto y cada consumidor decide su política de ambiente. CasePilot usa `API_ERROR_DETAILS` validado por su configuración ([README API](../../../apps/casepilot/casepilot-api/README.md)).

`mappings` es una lista ordenada: el primer `instanceof` coincidente gana y los mapeos configurados preceden a los integrados. Permite extender o reemplazar códigos/status sin poner HTTP en la clase de error:

```typescript
class DependencyUnavailableError extends Error {}

ExceptionHandlerModule.register({
  exposeDetails: false,
  mappings: [{ error: DependencyUnavailableError, status: 503, code: 'DEPENDENCY_UNAVAILABLE' }],
});
```

Un mapeo exige status entero 400–599 y code no vacío. Type opcional debe ser una URI absoluta; un title específico debe acompañarse de su type específico. `exposeDetails: false` en un mapeo oculta detalles aunque el ambiente los habilite. Para clases custom ajenas a ApplicationError, la exposición requiere además `exposeDetails: true` en el mapeo; omitirlo mantiene sanitizados los errores técnicos. Ningún mapeo habilita detalles cuando la opción global es false. Alternativamente, se puede construir `new ProblemDetailsFilter(adapterHost, options)` y registrarlo mediante `app.useGlobalFilters(...)`; usar un único registro global.

## Verificación y límites arquitectónicos

Desde la raíz: `pnpm check:exception-handler`, `pnpm build:exception-handler` o `pnpm test:exception-handler`. Los comandos construyen primero abstractions. El check incluye tipos, lint, unitarias, integración HTTP y build. Las pruebas HTTP usan puertos efímeros, sin Docker, credenciales ni persistencia; las pruebas propias viven en `test/` de esta librería. Los contratos de errores se prueban en abstractions; [la prueba de compatibilidad](test/unit/errors.test.ts) acredita la identidad de las reexportaciones y el mapeo del UnexpectedError original.

[ESLint](eslint.config.mjs) protege la entrada pura: admite contratos locales y la entrada pública de abstractions, rechazando su adaptador TypeORM y deep imports. Prohíbe imports de apps (BCK-008/BCK-015), con [regresiones](test/unit/architecture.test.ts). [Unitarias](test/unit/problem-details.test.ts) e [integración HTTP](test/integration/nestjs.test.ts) acreditan mapeos, privacidad y contrato (BCK-016/BCK-019). La API también bloquea el adaptador en sus capas core mediante lint y grafo. El scanner ts-morph de handlers/repositorios no cambia: esta librería no incorpora casos de uso, repositorios ni transacciones. Los checks no acreditan semánticamente que todos los mensajes del consumidor estén libres de secretos ni verifican futuros consumidores: esa revisión conserva su dueño.

Requisitos: Node >=22.12.0; NestJS common/core 12.1.2 son peers opcionales para consumidores de la entrada pura y requeridos al usar `/nestjs`. Se reutilizan las dependencias y versiones del workspace, sin una librería externa de normalización. Referencias consultadas el 2026-10-02: [filtros de NestJS](https://docs.nestjs.com/exception-filters) y RFC 9457.
