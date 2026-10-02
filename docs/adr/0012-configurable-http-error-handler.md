# 0012 — Errores compartidos y Problem Details configurable

- Estado: aceptada e implementada.
- Fecha: 2026-10-02.
- Alcance: librería backend exception-handler y contrato HTTP de CasePilot API.

## Contexto

La API solo normalizaba la indisponibilidad de Health mediante un filtro específico. Se requiere una librería general con errores tipados, status coherentes, Problem Details y control del detalle por ambiente.

## Decisión

Implementar `@casepilot/exception-handler` en la ubicación prevista por el monorepo. Su entrada principal contiene vocabulario y datos de error puros; `/nestjs` contiene el filtro global y mapeos. Application conserva la interpretación funcional de los errores y no conoce HTTP. No se modifica el catálogo BCK ni se agrega una regla CPA.

La API registra un único filtro global mediante ExceptionHandlerModule y HttpAdapterHost. Representa fallos HTTP según RFC 9457, con application/problem+json, type/title/status/instance y code. Instance es una URN UUID por ocurrencia. Los errores integrados se mapean a 500/400/404/403/401; los custom tienen mapeos explícitos en composición. Health conserva 503 con código DATABASE_UNAVAILABLE y adopta el mismo body, sustituyendo `{ "status": "unavailable" }` del contrato inicial del ADR 0003. Las respuestas exitosas no cambian.

`API_ERROR_DETAILS` acepta true/false y respeta la precedencia de archivos/proceso existente. Por defecto habilita detalle en local/test/development y lo oculta en staging/production. El paquete es independiente del ambiente y oculta detalles por defecto. La opción global habilita mensajes, stack y detalles seleccionados de errores tipados; los errores desconocidos, causas y 5xx genéricos de Nest nunca se serializan. Mapeos custom requieren opt-in para exponer mensajes de clases ajenas al vocabulario puro. Health permanece sanitizado en ambos modos. Esta selección respeta BCK-016; el consumidor evita incluir secretos en mensajes/detalles intencionalmente públicos.

ESLint y dependency-cruiser protegen BCK-008 para impedir el adaptador Nest en Domain/Application, incluyendo barrels alcanzables. El lint propio de la librería protege su entrada pura y BCK-015. Las pruebas HTTP verifican status/body, guards/pipes, promesas/observables, routing y privacidad. Ts-morph conserva sus scanners de layout, casos de uso y data access: no aparecen contratos nuevos en esos ámbitos. Evidencia y límites: [README del paquete](../../src/libs/backend/exception-handler/README.md) y [cobertura API](../../src/apps/casepilot/casepilot-api/docs/architecture-validation.md).

## Alternativas

Un middleware Express de cuatro argumentos acopla el manejo al adaptador y no sustituye el ciclo de excepciones de Nest. Repetir filtros por endpoint dispersa el contrato. Usar HttpException dentro de Application viola la independencia del núcleo. Serializar cualquier Error completo expone información privada y puede fallar con referencias circulares.

## Consecuencias

El body 503 de Health cambia y sus consumidores deben usar status/code del nuevo contrato OpenAPI 0.2.0. Los errores de producto permanecen en Application y sus mapeos en composición. Pruebas y README mantienen sus propietarios. No se agregan dependencias externas nuevas, cambios de persistencia ni UI; otros transportes y futuros consumidores deben aportar su propia integración y verificación.
