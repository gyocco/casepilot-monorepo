# Instrucciones para agentes

Estas instrucciones son la política técnica del repositorio. Se leen después de `AGENTS.md` y antes de implementar cambios.

Las rutas y fronteras se basan en [Estructura y límites del monorepo](../../docs/architecture/monorepo-structure.md): aplicaciones en `src/apps/<producto>/<app>/` y capacidades técnicas reutilizables en `src/libs/backend/`, `src/libs/frontend/` y `src/libs/mobile/`. Las features y reglas de negocio específicas permanecen en la app o módulo que las posee.

## Orden y alcance

| Archivo | Alcance |
| --- | --- |
| `00-project-context.md` | contexto, objetivo de plataforma y fuentes de verdad |
| `10-architecture.md` | capas, dependencias y ubicación del código |
| `20-frontend-platform.md` | React, Vite, Tailwind, Ionic y Capacitor |
| `40-quality-testing.md` | calidad, pruebas, accesibilidad y performance |
| `50-security.md` | secretos, permisos, datos sensibles y seguridad de cliente |
| `60-documentation.md` | documentación, ADRs y sincronización con el código |
| `90-workflow.md` | proceso de trabajo, verificación y límites operativos |

Para un cambio de frontend se leen `00`, `10`, `20`, `40`, `50`, `60` y `90`. Para un cambio de backend NestJS se revisan además `10`, `40`, `50` y `60`. No se debe crear una instrucción de Supabase: esa plataforma está fuera de la arquitectura del proyecto.

## Precedencia

1. Instrucciones del sistema y del usuario.
2. `AGENTS.md` más cercano al archivo modificado.
3. Estas instrucciones numeradas.
4. Documentación local en `docs/`.
5. Convenciones existentes del código, siempre que no contradigan lo anterior.

## Regla de mantenimiento

Una instrucción debe ser normativa, verificable y específica de este proyecto. Las recomendaciones generales deben enlazar a documentación oficial. Si una regla deja de ser cierta, actualiza primero esta fuente de verdad y después el código dependiente.
