# Product — Visión y alcance de CasePilot

- Estado: propuesta inicial
- Última actualización: 2026-08-02
- Nivel: Product

## Descripción general

CasePilot es un SaaS de gestión de trabajo profesional que combina un mini CRM, gestión de casos y documentación con asistencia fuerte de IA. Está pensado para profesionales independientes y, posteriormente, para estudios pequeños que necesitan convertir información dispersa en trabajo organizado, consultable y reutilizable.

La experiencia debe sentirse simple para una persona que trabaja sola, pero tener una base multi-tenant que permita crecer hacia equipos, roles y espacios compartidos sin mezclar datos entre clientes o estudios.

## Visión

Que un profesional pueda abrir CasePilot y encontrar, entender y preparar todo lo necesario para avanzar un caso, sin perder tiempo buscando información en múltiples sistemas.

## Misión de la primera etapa

Centralizar clientes, casos, documentos y conocimiento profesional en un espacio seguro, y usar IA para reducir tareas repetitivas de búsqueda, lectura, resumen y preparación documental bajo revisión humana.

## Objetivos de producto

1. Permitir que un profesional cree su cuenta y empiece a trabajar en un espacio personal con baja fricción.
2. Proveer una vista consistente de clientes, casos, documentos, fechas y notas.
3. Reducir el tiempo necesario para localizar información y comprender documentación.
4. Reutilizar leyes, manuales, modelos y plantillas sin duplicar trabajo.
5. Preparar documentos con contexto del cliente y del caso, manteniendo control y revisión del profesional.
6. Diseñar desde el inicio una base web + Capacitor/Ionic mobile-first.
7. Proteger la información profesional mediante aislamiento de tenant, autorización backend y trazabilidad.

## Objetivos de negocio

- Validar la utilidad del producto con profesionales independientes antes de expandirlo a estudios.
- Crear una propuesta SaaS con valor recurrente basado en organización, productividad y uso responsable de IA.
- Reducir el tiempo de incorporación de nuevos usuarios mediante onboarding y una experiencia clara.
- Habilitar una expansión natural desde el plan individual hacia espacios con colaboradores.
- Construir una base de datos de conocimiento y documentos que aumente la retención, sin convertir el producto en un repositorio opaco.
- Medir adopción, frecuencia de uso, valor de las funciones de IA y conversión a planes pagos cuando exista una estrategia comercial definida.

## Propuesta de valor

> CasePilot reúne clientes, casos, documentos y conocimiento profesional en un espacio seguro, y ayuda a convertir esa información en acciones y documentos revisables.

## Personas iniciales

### Profesional independiente

Trabaja solo o con apoyo administrativo limitado. Necesita comenzar rápido, encontrar información desde el teléfono y no quiere configurar un sistema empresarial.

### Profesional especializado en documentación

Gestiona muchos documentos, modelos, leyes o manuales. Valora OCR, búsqueda, chat documental, referencias y generación a partir de plantillas.

### Administrador de estudio pequeño

Necesita separar espacios, invitar colaboradores, asignar permisos y mantener una visión compartida de los casos sin exponer información de otros tenants.

## Alcance inicial por módulos

| Épica | Alcance base | Estado documental |
| --- | --- | --- |
| 1. Autenticación | Cuenta, sesión, perfil, seguridad, autorización y multi-tenant | Detallada en esta etapa |
| 2. Gestión de clientes | Cartera, contacto, etiquetas, campos, notas y timeline | Estructura base |
| 3. Gestión de casos | Casos/expedientes/proyectos, estados, IA, notas, prioridades, recordatorios y vencimientos | Estructura base |
| 4. Gestión documental | Archivos, carpetas, etiquetas y versiones | Estructura base |
| 5. IA documental | Chat sobre documentos, chat global, consultas y OCR | Estructura base |
| 6. Base de conocimiento | Leyes, manuales, documentos, plantillas y consultas IA | Estructura base |
| 7. Generador documental | Generación mediante plantillas y autocompletado | Estructura base |

El detalle y la cobertura de cada épica están en el [mapa de requisitos](requirements-map.md).

## Fuera de alcance inicial

Estas capacidades pueden aparecer en etapas futuras, pero no son compromiso de la primera entrega:

- portal completo para clientes externos;
- mensajería omnicanal, WhatsApp, email transaccional avanzado o llamadas;
- facturación, cobros y contabilidad del estudio;
- firma electrónica avanzada o validación notarial externa;
- automatización autónoma de decisiones profesionales;
- soporte de todas las jurisdicciones, formatos y taxonomías legales desde el primer release;
- aplicaciones nativas independientes con lógica duplicada.

## Principios de producto

- **Asistencia, no sustitución:** la IA propone y explica; el profesional revisa y decide.
- **Privacidad por diseño:** el aislamiento y la autorización se resuelven en backend, no solo ocultando elementos de UI.
- **Mobile-first:** una pantalla móvil estrecha es el mínimo soportado, no una adaptación posterior.
- **Trazabilidad:** documentos, cambios, referencias IA y acciones sensibles deben poder auditarse según el alcance de cada módulo.
- **Progresión simple:** una persona sola debe poder usar el producto sin entender la arquitectura multi-tenant.
- **Extensibilidad controlada:** se agregan paquetes y adaptadores solo cuando exista una frontera real y consumidores concretos.

## Indicadores a definir

Los valores objetivo se definirán luego de entrevistas y un primer prototipo. La instrumentación deberá contemplar, como mínimo:

- porcentaje de registros que completan onboarding;
- tiempo hasta crear el primer cliente y el primer caso;
- frecuencia de retorno y sesiones activas;
- tiempo para encontrar un documento o respuesta relevante;
- uso y aceptación de sugerencias de IA;
- documentos generados y revisados;
- errores de autorización, aislamiento o procesamiento documental;
- retención por segmento y conversión entre planes.

## Dependencias y preguntas abiertas

- jurisdicciones y mercados iniciales;
- proveedores y límites de modelos de IA;
- política de retención, residencia y eliminación de documentos;
- roles exactos para estudios y colaboradores externos;
- estrategia de planes, límites de almacenamiento y consumo de IA;
- alcance de OCR y formatos soportados;
- taxonomía común para `caso`, `expediente` y `proyecto`.

## Documentos relacionados

- [Mapa de requisitos](requirements-map.md)
- [Epic 1 — Autenticación](epics/epic-01-authentication/README.md)
- [Roadmap inicial](../07-project-management/roadmap.md)
- [Contexto y estado del proyecto](../00-overview/product-and-project-context.md)
