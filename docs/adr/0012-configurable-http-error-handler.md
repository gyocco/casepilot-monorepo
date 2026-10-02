# 0012 — Errores compartidos y Problem Details configurable

- Estado: aceptada e implementada.
- Fecha: 2026-10-02.
- Alcance: abstracciones de errores backend, librería exception-handler y contrato HTTP de CasePilot API.

## Contexto

La API solo normalizaba la indisponibilidad de Health mediante un filtro específico. Se requiere una librería general con errores tipados, status coherentes, Problem Details y control del detalle por ambiente.

## Decisión

Implementar `@casepilot/exception-handler` en la ubicación prevista por el monorepo. El vocabulario y los datos de error puros pertenecen a `@casepilot/abstractions`; la entrada principal de exception-handler los reexporta por compatibilidad y `/nestjs` contiene el filtro global y mapeos. El adaptador depende de abstractions, sin dependencia inversa. Application conserva la interpretación funcional de los errores y no conoce HTTP. No se modifica el catálogo BCK ni se agrega una regla CPA.

La API registra un único filtro global mediante ExceptionHandlerModule y HttpAdapterHost. Representa fallos HTTP según RFC 9457, con application/problem+json, type/title/status/instance y code. Instance es una URN UUID por ocurrencia. Los errores integrados se mapean a 500/400/404/403/401; los custom pueden tener mapeos explícitos en composición. Health traduce la indisponibilidad de persistencia a UnexpectedError de abstractions y usa el mapeo estándar 500 con código UNEXPECTED_ERROR. Se eliminan HealthDatabaseUnavailableError y su mapping específico. Las respuestas exitosas no cambian.

`API_ERROR_DETAILS` acepta true/false y respeta la precedencia de archivos/proceso existente. Por defecto habilita detalle en local/test/development y lo oculta en staging/production. El paquete es independiente del ambiente y oculta detalles por defecto. La opción global habilita mensajes, stack y detalles seleccionados de errores tipados; los errores desconocidos, causas y 5xx genéricos de Nest nunca se serializan. Mapeos custom requieren opt-in para exponer mensajes de clases ajenas al vocabulario puro. Health usa el mensaje genérico de UnexpectedError; con detalle activo incluye ese mensaje y su stack, sin datos del driver. Esta selección respeta BCK-016; el consumidor evita incluir secretos en mensajes/detalles intencionalmente públicos.

ESLint y dependency-cruiser protegen BCK-008 para impedir el adaptador Nest en Domain/Application, incluyendo barrels alcanzables. El lint propio de la librería protege su entrada pura y BCK-015. Las pruebas HTTP verifican status/body, guards/pipes, promesas/observables, routing y privacidad. Ts-morph conserva sus scanners de layout, casos de uso y data access: no aparecen contratos nuevos en esos ámbitos. Evidencia y límites: [README del paquete](../../src/libs/backend/exception-handler/README.md) y [cobertura API](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md).

## Alternativas

Un middleware Express de cuatro argumentos acopla el manejo al adaptador y no sustituye el ciclo de excepciones de Nest. Repetir filtros por endpoint dispersa el contrato. Usar HttpException dentro de Application viola la independencia del núcleo. Serializar cualquier Error completo expone información privada y puede fallar con referencias circulares.

## Consecuencias

El contrato inicial del ADR 0003 devolvía 503 con `{ "status": "unavailable" }`; OpenAPI 0.2.0 introdujo Problem Details con DATABASE_UNAVAILABLE. OpenAPI 0.3.0 adopta el error compartido, status 500 y UNEXPECTED_ERROR: sus consumidores deben actualizarse. Los errores de producto permanecen en Application y sus mapeos en composición. Pruebas y README mantienen sus propietarios. No se agregan dependencias externas nuevas, cambios de persistencia ni UI; otros transportes y futuros consumidores deben aportar su propia integración y verificación.
