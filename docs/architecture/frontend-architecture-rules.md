# Reglas obligatorias del frontend de CasePilot

- Estado: aceptadas; implementación y evidencia en esta tarea.
- Fecha: 2026-10-04.
- Alcance: SPA Angular y `pilot-ui-kit`. Mobile adoptará sus checks antes de declarar cobertura.
- Decisión: [ADR 0020](../adr/0020-frontend-foundation-and-theming.md).

Este es el catálogo normativo frontend. Diseño y ejemplos: [arquitectura frontend](frontend-architecture.md). La cobertura ejecutable y sus límites se documentan con los validadores; no se presupone que un análisis estático demuestre seguridad, accesibilidad o semántica de negocio.

## FRT-001 — Propiedad y entradas públicas

Las features, rutas y composición DEBEN permanecer en la aplicación; los componentes visuales reutilizables y mecanismos de tema DEBEN permanecer en `pilot-ui-kit`. Las librerías NO DEBEN importar aplicaciones. El frontend NO DEBE importar backend, Node, persistencia ni herramientas/tests de desarrollo. La app DEBE consumir el kit exclusivamente por sus entradas públicas; se prohíben deep imports y rutas relativas a su implementación.

## FRT-002 — Features y dirección de dependencias

Cada grupo de páginas/casos de uso DEBE tener dueño en `src/features/<feature>/`. Una feature NO DEBE importar otra feature, tampoco mediante barrels o dependencias intermedias. `core/`, `shared/` y `shell/` NO DEBEN depender de features ni de composición raíz. El punto de composición raíz puede cargar una feature mediante su archivo de rutas público. Una página/componente NO DEBE importar directamente `data-access/`; usa estado/fachadas y contratos tipados. La clasificación de responsabilidades conserva revisión semántica.

## FRT-003 — Componentes Angular

Los componentes nuevos DEBEN ser standalone, usar `ChangeDetectionStrategy.OnPush` y tener contratos de entrada/salida tipados. La SPA usa prefijo `cp`; el kit usa `pilot`. TypeScript y templates DEBEN mantener tipos estrictos, sin `any`, supresiones ni rebajas de severidad para ocultar errores. Las suscripciones y recursos DEBEN tener propietario y liberación.

## FRT-004 — Colores semánticos

Queda prohibido fijar colores en componentes, templates, estilos o recursos SVG: hex, funciones de color, nombres de colores y paletas Tailwind predeterminadas. Todos los consumidores DEBEN usar los tokens públicos del kit: constantes TypeScript, nombres CSS registrados o utilidades Tailwind semánticas derivadas de esas variables. `currentColor`, `inherit` y `transparent` son mecanismos de herencia/transparencia, no colores de marca.

Los valores concretos de una paleta solo se declaran en `pilot-ui-kit/src/theme/default-colors.ts` y en manifiestos `src/theme/*.theme.ts` de la app: asignan valores a roles tipados; nunca sirven como estilos de componentes. Estas son las fuentes de datos del tema, no excepciones para hardcodear colores en la UI. El kit centraliza también la traducción a roles Material. No se redefinen variables de color en consumidores.

## FRT-005 — Recursos por nombre

Los componentes DEBEN referenciar recursos por nombre lógico y usar el renderer del kit; NO DEBEN contener URLs/paths de logos, iconos, imágenes, vídeos, GIFs o animaciones. La aplicación instala archivos en `public/themes/` y registra sus paths solo en manifiestos de tema. El kit NO DEBE conocer nombres, archivos ni rutas específicos de CasePilot. Los SVG monocromos usan herencia; los recursos binarios/ilustraciones se revisan visualmente.

## FRT-006 — Cambio de tema coherente

Un tema DEBE declarar todos los roles de color y un conjunto de recursos tipado. Los recursos faltantes en variantes DEBEN resolver al tema inicial; los nombres inexistentes DEBEN fallar con un error corregible. Se DEBEN validar temas, IDs y URLs antes de modificar el estado. El cambio DEBE actualizar variables globales, estado observable y recursos, incluidos componentes Material/overlays. Las animaciones DEBEN tener alternativa para reduced motion o controles sin autoplay. Esta regla requiere pruebas de comportamiento.

## FRT-007 — Integraciones en adaptadores

HTTP/proveedores DEBEN estar en `core/` técnico o `data-access/` de su feature, sin acceso directo desde páginas/componentes o el kit. Las APIs web/nativas DEBEN estar detrás de adaptadores; acceso DOM para temas se centraliza en el host del kit. La UI NO DEBE usar persistencia PostgreSQL. Firebase Authentication se integrará después; permisos y negocio pertenecen a NestJS.

## FRT-008 — Configuración pública y seguridad

Todo valor entregado al navegador es público. Se prohíben SDKs administrativos, secretos y credenciales de persistencia en cliente. URLs/HTML externos DEBEN validarse; no se permite omitir la sanitización de Angular. La ausencia de imports peligrosos no acredita ausencia de secretos: conserva revisión y pruebas de seguridad específicas.

## FRT-009 — Rutas y composición

Las features DEBEN cargarse con lazy routes; las rutas públicas de una feature solo componen sus páginas y rutas hijas. El layout transversal pertenece a `shell/`. El login inicial DEBE ser un placeholder sin formulario, credenciales, integración ni simulación de sesión. Las rutas desconocidas DEBEN tener una resolución explícita.

## FRT-010 — Gate real y pruebas de validadores

Fuentes y tests propios DEBEN permanecer con su proyecto. Los validadores que analizan SPA y kit viven en `tools/frontend-architecture/`; sus regresiones multiproyecto en `tests/architecture/frontend/`. El gate DEBE rechazar ámbitos vacíos, ciclos e imports irresolubles, y analizar TS, templates, CSS/SCSS y SVG de los proyectos participantes. Cada prohibición automatizada DEBE tener un ejemplo permitido y uno rechazado mediante el checker real. Nuevas reglas DEBEN sincronizar catálogo, diseño, cobertura, herramientas y pruebas.

## FRT-011 — Mobile-first y accesibilidad

El layout DEBE funcionar en móvil estrecho, conservar HTML semántico, foco visible, nombres accesibles, teclado y un scroll principal. Material aporta componentes accesibles, pero NO sustituye pruebas de navegación, contraste y estados. Tailwind usa estilos base móviles y mejoras responsive. Las APIs del sistema operativo NO DEBEN impedir la futura ejecución con Capacitor.

## FRT-012 — Material a través del kit

La SPA usa Angular Material y Tailwind CSS. Los componentes Material reutilizables DEBEN encapsularse en el kit para mantener contratos y temas consistentes; las features consumen componentes `pilot-*`. El kit no incluye páginas, permisos ni servicios de producto. Ionic no se instala en esta SPA; la decisión mobile sigue pendiente sin comprometer la compatibilidad Capacitor.
