# 60 — Documentación y decisiones

## Regla de sincronización

La documentación se actualiza en el mismo cambio que modifica una API, modelo, migration, variable, comando, integración, flujo de usuario, arquitectura o procedimiento operativo.

Consulta el [índice de documentación](../../docs/README.md) para elegir ubicación.

## Ubicación

- Código específico de `apps/web` o un paquete: README local y comentarios solo cuando aporten contexto no obvio.
- Producto y requisitos: `docs/01-product/`.
- Arquitectura, límites y diagramas: `docs/02-architecture/`.
- Setup, comandos y calidad: `docs/03-development/`.
- Deploy, migraciones operativas, observabilidad e incidentes: `docs/04-operations/`.
- APIs, variables, contratos y comandos de consulta: `docs/05-reference/`.
- Decisiones con alternativas y consecuencias: `docs/06-decisions/`.
- Roadmap, hitos y alcance: `docs/07-project-management/`.

No dupliques un procedimiento en varios lugares. Elige una fuente canónica y enlázala desde los demás.

## Documentación de paquetes

Cada paquete nuevo debe documentar:

- propósito y límites;
- consumidores permitidos;
- API pública y ejemplos mínimos;
- variables o requisitos de runtime;
- cómo ejecutar pruebas y build;
- qué no debe importarse desde él.

## ADRs

Crea un ADR cuando cambie una frontera de paquete, estrategia de datos, autenticación, plataforma web/native, dependencia estructural, política de seguridad o convención que otros agentes deban seguir.

Usa `docs/06-decisions/NNNN-titulo-corto.md`, incluye contexto, decisión, alternativas y consecuencias, y enlázalo desde el documento de arquitectura afectado.

## Referencias externas

Las recomendaciones sobre librerías deben enlazar a documentación oficial y indicar la versión o fecha cuando el comportamiento pueda cambiar. No copies páginas externas completas: resume la regla que aplica al proyecto y conserva el enlace.

## Calidad documental

- Markdown válido y enlaces relativos verificables.
- Nombres en `kebab-case`.
- Ejemplos sin secretos y comandos ejecutables desde una ruta clara.
- Estado explícito cuando una decisión sea propuesta, aceptada, reemplazada o descartada.
- Si un documento queda obsoleto, actualízalo o muévelo a `docs/90-archive/` con el motivo.
