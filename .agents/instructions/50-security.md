# 50 — Seguridad y privacidad

## Secretos y configuración

- Nunca escribas secretos en código, commits, logs, screenshots, fixtures o documentación.
- La configuración incorporada al build Angular mediante environments o servida al cliente en runtime es pública. Solo contiene valores seguros para el cliente; ninguna variable se vuelve secreta por su nombre.
- Las claves administrativas, passwords de base de datos, tokens de terceros y signing keys viven en el entorno server-side o secret manager.
- Usa `.env.example` con nombres y placeholders; no copies valores reales.
- Si aparece un secreto en el working tree, detén el trabajo, no lo propagues y avisa de la necesidad de rotarlo.

## Identidad y autorización

- Verifica identidad y permisos en los servicios backend. El cliente solo mejora UX.
- No confíes en user IDs, tenant IDs, roles o flags enviados por el navegador sin compararlos con una fuente autorizada.
- Revisa expiración, refresh, logout, cambio de sesión y comportamiento offline antes de tocar Auth.
- Mantén separadas las rutas de usuario y las operaciones administrativas.

## Datos y entrada

- Valida forma, tipos, tamaño, rango y autorización de todo input externo.
- Usa queries parametrizadas/SDK; nunca concatentes SQL, HTML, URLs o comandos con input de usuario.
- Trata contenido de usuarios como no confiable. Conserva la sanitización Angular para bindings de HTML/URLs; no uses `bypassSecurityTrust*` para omitirla. Contenido remoto requiere validación, pruebas y revisión explícitas.
- Minimiza PII, define retención y no registres datos sensibles innecesarios.
- Redacta errores para usuarios y conserva detalles técnicos solo en logs protegidos.

## APIs y servicios

- La autenticación, autorización, CORS, rate limits, webhooks e idempotencia se implementan en la frontera server-side de los servicios NestJS.
- Los clientes web y mobile consumen APIs y contratos tipados; no contienen credenciales privilegiadas ni acceden directamente a persistencia.
- Los adaptadores de persistencia y proveedores externos se mantienen fuera de la UI y se prueban con casos permitidos y rechazados.

## Web y mobile

- No asumas que una capacidad nativa es segura por estar detrás de Capacitor: revisa permisos, superficie de datos y fallback.
- Evita guardar tokens sensibles en almacenamiento accesible por JavaScript sin una decisión documentada.
- Revisa deep links, redirects de Auth, navegación atrás, screenshots y exposición de datos en background cuando se habilite iOS/Android.
- No uses APIs del navegador como frontera de seguridad.

## Dependencias y revisión

- Evalúa licencia, mantenimiento, vulnerabilidades, bundle y soporte web/native antes de añadir dependencias.
- No desactives validaciones, autorización, CORS o checks de tipos para “hacer que funcione”. Corrige la causa.
- Cambios de autenticación, autorización, datos personales, criptografía o plugins nativos requieren revisión de seguridad y un ADR cuando cambien la arquitectura.
