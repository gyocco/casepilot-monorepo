# Contratos CQRS

Paquete privado del workspace `@casepilot/cqrs`: bases de modelos y contrato TypeScript para handlers invocados directamente. No depende de NestJS, ORM, transporte ni proveedor y no tiene dependencias de runtime. Sus consumidores son APIs, workers y otros procesos backend; no se importa desde apps web/mobile.

## API pública

```ts
import { Request, Response, type Handler } from '@casepilot/cqrs';
```

- `Request`: clase abstracta base de todos los inputs de una operación.
- `Response`: clase abstracta base de sus outputs.
- `Handler<TRequest extends Request, TResponse extends Response>`: interfaz única con `execute(request: TRequest): Promise<TResponse>`, común a commands y queries.

Las bases tienen marcas protegidas distintas declaradas solo para tipos. Un objeto de igual forma o una Response usada como Request no cumple el contrato. Las bases no añaden campos emitidos, validación, estado de negocio ni I/O. Los modelos concretos heredan de la base correspondiente, y sus constructores llaman a `super()`.

Ejemplo en Application del consumidor:

```ts
import { Request, Response, type Handler } from '@casepilot/cqrs';

export class ReadItemRequest extends Request {
  constructor(public readonly id: string) { super(); }
}

export class ReadItemResponse extends Response {
  constructor(public readonly found: boolean) { super(); }
}

export class ReadItemHandler implements Handler<ReadItemRequest, ReadItemResponse> {
  execute(_request: ReadItemRequest): Promise<ReadItemResponse> {
    return Promise.resolve(new ReadItemResponse(false));
  }
}

const response = await new ReadItemHandler().execute(new ReadItemRequest('example'));
```

Las dependencias se reciben por construcción y se configuran en la composición del host. Request/Response concretos y negocio pertenecen a la app. Los errores se propagan al caller mediante el rechazo de la Promise. La librería no impone nombres de clases ni políticas: CasePilot API exige además [CPA-002](../../../../docs/architecture/casepilot-backend-architecture.md#cpa-002--contratos-cqrs-compartidos-e-invocacion-directa) y BCK-004/BCK-005.

## Límites

El paquete contiene contratos generales, bases y exports públicos. No incorpora modelos de CasePilot, reglas, repositorios, validación, transacciones, decorators, dispatcher ni middleware. No separa contratos entre commands y queries. Sus fuentes importan únicamente archivos propios del mismo directorio; no importan apps, Node, frameworks o proveedores.

Consumir únicamente `@casepilot/cqrs`, sin imports de `src/`, `dist/` o módulos privados. `Handler` se importa como tipo; `Request` y `Response` son clases ESM necesarias para la herencia. La ausencia de escrituras en una query requiere revisar su implementación; el contrato genérico no acredita esa semántica.

## Comandos y consumo

Requisitos: Node.js 22.12 o superior y pnpm 10.13.1. No necesita variables, Docker ni servicios externos. Desde la raíz:

```bash
pnpm install --frozen-lockfile
pnpm build:cqrs
pnpm check:cqrs
pnpm test:cqrs
```

Desde este paquete: `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm check`. `check` ejecuta tipos, lint, pruebas y build. Las pruebas acreditan la herencia nominal, tipos de entrada/salida, Promise, invocación directa y propagación de errores.

El manifest exporta declaraciones en `dist/index.d.ts` y ESM en `dist/index.js`. Los consumidores declaran `"@casepilot/cqrs": "workspace:*"` y construyen la librería antes de compilar o ejecutar. Los scripts de CasePilot API coordinan ese build automáticamente para sus verificaciones, tests y build. Los artefactos `dist/` y `build/` están ignorados por Git.

Decisión y evolución: [ADR 0010](../../../../docs/adr/0010-shared-cqrs-contracts.md).
