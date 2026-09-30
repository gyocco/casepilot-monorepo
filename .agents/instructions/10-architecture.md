# 10 — Arquitectura y límites

## Capas recomendadas

Mantén una dirección de dependencias simple:

```text
src/web-ui/apps/* y src/mobile-ui/apps/*
  ├── rutas, páginas y composición de features
  ├── libs frontend de su workspace
  └── contratos compartidos

src/services/apps/*
  ├── bootstrap, transporte y composición del servicio NestJS
  ├── src/services/libs/* para dominio, aplicación e infraestructura
  └── contracts para APIs, eventos y mensajes

contracts/
  ├── openapi
  ├── protobuf
  └── events
```

Las aplicaciones pueden consumir librerías y contratos. Las librerías no deben importar código desde `apps/`. La lógica de dominio no debe depender de React, Ionic, NestJS, APIs del navegador ni una implementación concreta de persistencia.

## Dónde colocar cada cosa

### `src/web-ui/apps/` y `src/mobile-ui/apps/`

Usa estas carpetas para composición específica de cada aplicación:

- `src/`: bootstrap, rutas, páginas y composición local;
- features que solo tengan sentido para esa aplicación;
- configuración y scripts propios de su runtime;
- README local con comandos y variables no sensibles.

El código que pueda reutilizarse en más de una aplicación debe vivir en `src/web-ui/libs/` o `src/mobile-ui/libs/` según el consumidor real.

### `src/web-ui/libs/` y `src/mobile-ui/libs/`

Agrupan features, acceso a datos, UI, plataforma y utilidades frontend. Una librería debe ser reusable, testeable y tener una frontera clara. No debe convertirse en un cajón de componentes o helpers sin dueño.

### `src/services/apps/`

Contiene deployables NestJS con TypeScript: APIs públicas o administrativas, workers y schedulers. Cada servicio tiene su propio bootstrap, configuración, health checks y límites operativos.

### `src/services/libs/`

Separa por dominio (`orders`, `customers`, `billing`, `identity`) y por responsabilidad (`domain`, `application`, `infrastructure`, `contracts`). `platform` y `shared` solo deben contener capacidades realmente transversales. La persistencia y las integraciones externas se aíslan en `infrastructure` o adaptadores equivalentes.

### `contracts/`

Contiene contratos independientes de tecnología: OpenAPI para APIs HTTP, protobuf para comunicación binaria cuando exista una necesidad real y esquemas de eventos versionados. No debe duplicar modelos internos de dominio.

## Reglas de diseño

- Una función, módulo o componente debe tener una responsabilidad explicable en una frase.
- Modela los estados relevantes explícitamente: loading, success, empty, error y offline cuando aplique.
- Valida y transforma datos en los bordes; no propagues respuestas crudas de integraciones por toda la UI.
- Evita dependencias circulares y barrels que oculten ciclos.
- Usa contratos tipados entre clientes y servicios.
- Una nueva dependencia externa necesita justificar su necesidad, impacto en bundle/runtime, licencia, mantenimiento y alternativa.
- Cambios transversales de arquitectura, persistencia, autenticación o plataforma requieren un ADR en `docs/adr/`.

## Regla de reusabilidad

Antes de copiar lógica:

1. Comprueba si ya existe una librería o adaptador equivalente.
2. Si la lógica es de dominio y no depende de runtime, considera `src/services/libs/<dominio>/domain`.
3. Si es acceso a datos o una integración backend, usa `src/services/libs/<dominio>/infrastructure`.
4. Si es visual y se repetirá entre aplicaciones frontend, usa la librería frontend correspondiente.
5. Si es un contrato entre procesos o tecnologías, ubícalo en `contracts/`.

Una abstracción compartida debe tener consumidores reales o un contrato claramente planificado.
