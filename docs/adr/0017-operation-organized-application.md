# 0017 — Application por recurso, operación y código compartido

- Estado: aceptada e implementada.
- Fecha: 2026-10-03.
- Alcance: organización de Application, normativa base y validadores de CasePilot API.
- Evoluciona: [ADR 0009](0009-resource-organized-application.md), haciendo obligatoria la carpeta de operación; conserva capas únicas y contratos CQRS.

## Contexto

Los 28 recursos CRUD concentran diez clases de request/response y modelos auxiliares en un archivo `.models.ts`, con cinco handlers y sus reglas sueltos en la carpeta del recurso. Health también mantiene sus tres archivos directamente bajo el recurso. Trabajar en una operación obliga a editar un archivo de modelos que reúne varias responsabilidades.

El responsable solicita que cada operación reúna su request, handler y response obligatorio, y que el contenido reutilizado por varias operaciones viva en una carpeta shared del recurso.

## Decisión

Registrar [BCK-023](../architecture/backend-architecture-baseline-rules.md#bck-023--application-organizada-por-recurso-y-operacion) y sincronizar CPA-001. Cada operación usa `application/<recurso>/<operacion>/` y tres archivos con el mismo prefijo. Los contratos concretos se declaran en los archivos hermanos que utiliza su handler. Datos auxiliares exclusivos permanecen con el request; modelos compuestos, mappers y reglas reutilizados van a `<recurso>/shared/`. Los colaboradores de producto entre recursos conservan `application/shared/` y los mecanismos genéricos sus librerías propietarias.

Migrar las 140 operaciones CRUD y la query Health, actualizar composición, transporte y tests, preservando comportamiento, endpoints, persistencia y representación pública. No se mantienen barrels de compatibilidad para los antiguos archivos `.models.ts`.

Usar ts-morph como mecanismo principal para paths, trío obligatorio, declaraciones y símbolos. El grafo verifica que shared no alcance operaciones mediante imports de valores, tipos o reexports. ESLint conserva su cobertura recursiva de Application; no duplica comprobaciones que necesitan archivos hermanos o símbolos. Las pruebas positivas y negativas acreditan el nuevo contrato y la selección de todas las operaciones reales.

## Alternativas

Conservar la carpeta de operación opcional permite que reaparezcan los archivos agregados. Mover `.models.ts` completo a shared conservaría los contratos concretos de varias operaciones mezclados. Duplicar modelos de datos en cada response genera divergencias. Estas opciones se descartan.

## Consecuencias

Aumenta el número de archivos, con una responsabilidad y ubicación claras por contrato. Los imports internos cambian; los modelos concretos conservan nombres y forma. Shared depende de contratos y datos comunes, sin depender de operaciones. La extracción de duplicaciones y la elección del recurso correcto requieren revisión semántica, además de checks estáticos.

La cobertura y comandos reales se mantienen en la [guía local de validación](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md).

## Validación

Pasan `pnpm check:api:architecture`, `pnpm test:api`, `pnpm build:api` y `pnpm test:api:integration`: 17 pruebas unitarias, 114 arquitectónicas y 45 de integración con PostgreSQL efímero. Las nuevas regresiones verifican el trío de las 141 operaciones, contratos fuera de su carpeta, archivos vacíos/reexports, identidad por símbolo, colaboradores entre operaciones y dependencias de shared.

La comparación de las 630 declaraciones de Application con su versión anterior confirma cuerpos, propiedades, constructores y valores sin cambios; se modifican ubicación e imports. No hay cambios de UI que requieran viewport o revisión visual de accesibilidad. Se verifican enlaces locales y `git diff --check`.
