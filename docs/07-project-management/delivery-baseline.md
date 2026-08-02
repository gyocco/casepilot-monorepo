# Línea base de entrega y evolución documental

- Estado: vigente para la etapa de definición
- Última actualización: 2026-08-02

## Objetivo

Definir cómo se transforman las ideas de producto en trabajo implementable sin perder el contexto original.

## Flujo de refinamiento

```text
Idea / objetivo de negocio
  → Product
  → Epic
  → Feature
  → User Story
  → Descripción + criterios + reglas + NFR
  → Implementación y pruebas
  → Documentación sincronizada
```

## Responsabilidad por nivel

| Nivel | Pregunta que debe responder |
| --- | --- |
| Product | ¿Qué problema resolvemos, para quién y con qué resultado de negocio? |
| Epic | ¿Qué módulo o capacidad grande agrupa el valor? |
| Feature | ¿Qué parte coherente del módulo se puede entregar y medir? |
| User Story | ¿Qué necesita un actor, qué valor obtiene y cómo sabremos que funciona? |

## Reglas para la documentación

- Usar Markdown, nombres `kebab-case` y enlaces relativos.
- Marcar el estado de cada requisito; no describir como disponible lo que solo está planificado.
- No escribir secretos, datos reales, tokens, dumps ni credenciales.
- Mantener requisitos de producto en `docs/01-product/` y decisiones técnicas en `docs/06-decisions/`.
- Cuando una historia se divida, conservar el ID original como contexto y enlazar las historias nuevas.
- Cuando una decisión cambie arquitectura, seguridad, Auth, datos o plataforma, crear o actualizar un ADR.

## Plantilla mínima de revisión

Antes de marcar una historia como `Lista para desarrollo`, revisar:

- actor y valor entendibles;
- criterios de aceptación observables;
- reglas de negocio separadas de decisiones de implementación;
- NFR de seguridad, accesibilidad, responsive, performance y resiliencia aplicables;
- dependencias, riesgos y estrategia de pruebas;
- estados loading, success, empty, error, retry y offline cuando corresponda;
- enlaces a arquitectura y ADRs;
- ausencia de secretos o datos reales.
