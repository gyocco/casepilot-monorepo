# Configuración de agentes de CasePilot

`.agents/` contiene las instrucciones operativas y los flujos reutilizables para agentes de código. El agente debe comenzar por el [`AGENTS.md`](../AGENTS.md) de la raíz; ese archivo define qué instrucciones cargar y las restricciones de mayor prioridad del proyecto.

## Estructura

```text
.agents/
├── README.md
├── instructions/
│   ├── README.md
│   ├── 00-project-context.md
│   ├── 10-architecture.md
│   ├── 20-frontend-platform.md
│   ├── 40-quality-testing.md
│   ├── 50-security.md
│   ├── 60-documentation.md
│   └── 90-workflow.md
└── skills/
    ├── README.md
    ├── feature-delivery/
    │   └── SKILL.md
    ├── monorepo-code-placement/
    │   └── SKILL.md
    ├── backend-architecture/
    │   └── SKILL.md
    ├── architecture-rules-sync/
    │   └── SKILL.md
    └── mobile-first-ui/
        └── SKILL.md
```

## Cómo se aplica

- `instructions/` contiene políticas generales que deben mantenerse consistentes durante todo el trabajo.
- `skills/` contiene procedimientos paso a paso para tareas que se repiten; una skill no reemplaza las restricciones de `instructions/`.
- Las reglas del usuario y del sistema siempre tienen prioridad sobre estas reglas locales.
- Todo trabajo backend carga la [arquitectura](../docs/architecture/backend-architecture-baseline.md), las [reglas obligatorias](../docs/architecture/backend-architecture-baseline-rules.md) y la skill [backend-architecture](skills/backend-architecture/SKILL.md). La [arquitectura particular de CasePilot](../docs/architecture/casepilot-backend-architecture.md) registra la adopción íntegra de esa base reutilizable. La skill consulta el catálogo vigente; no mantiene una copia de sus reglas.
- Agregar, modificar o retirar reglas, y sincronizar documentación con verificaciones, requiere [architecture-rules-sync](skills/architecture-rules-sync/SKILL.md). Coordina las fuentes con los validadores de API y frontend, sus pruebas y cobertura real. Para frontend carga [diseño](../docs/architecture/frontend-architecture.md), [reglas FRT](../docs/architecture/frontend-architecture-rules.md) y [cobertura](../tools/frontend-architecture/README.md).
- Si una excepción es necesaria, el agente debe explicarla en el cambio, registrar un ADR cuando sea una decisión arquitectónica y actualizar la instrucción si la excepción se vuelve permanente.

## Documentación relacionada

- [Mapa del monorepo](../README.md)
- [Índice de documentación](../docs/README.md)
- [Arquitectura del monorepo](../docs/architecture/monorepo-architecture.md)
- [Skills disponibles](skills/README.md)

Consulta el índice de documentación para encontrar los documentos de desarrollo, operaciones y ADRs disponibles. Las áreas sin contenido se incorporarán cuando exista una responsabilidad real.
