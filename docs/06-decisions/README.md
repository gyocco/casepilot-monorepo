# 06 — Decisions

Registra decisiones técnicas relevantes mediante Architecture Decision Records (ADR).

## Convención de un ADR

Usa `NNNN-titulo-corto.md`, por ejemplo `0001-separar-cliente-admin-de-supabase.md`, con estas secciones:

```md
# ADR NNNN: Título

- Estado: propuesta | aceptada | reemplazada | descartada
- Fecha: AAAA-MM-DD

## Contexto
## Decisión
## Alternativas consideradas
## Consecuencias
```

Una decisión aceptada no se reescribe para ocultar su historial. Si deja de aplicar, se marca como `reemplazada` y se enlaza el ADR que la sustituye.

## ADRs actuales

- [ADR 0001 — Autenticación y aislamiento multi-tenant](0001-autenticacion-y-aislamiento-multi-tenant.md) — propuesta inicial.
