# Infra

Infraestructura como código y artefactos de runtime. Las áreas previstas son `terraform/`, `kubernetes/`, `helm/` y `docker/`. No se agregan configuraciones de proveedor ni secretos sin una decisión y un entorno documentados.

## Desarrollo local

[Dependencias locales de CasePilot](docker/README.md) contiene el entorno Docker Compose. Actualmente provee PostgreSQL con almacenamiento persistente en `127.0.0.1:55432`. Desde la raíz, `pnpm infra:up` crea la configuración local si hace falta y arranca las dependencias.
