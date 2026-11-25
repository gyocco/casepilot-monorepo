# Terraform — Ambiente DEV (`development`)

Composición Terraform del ambiente DEV remoto de CasePilot sobre **Google Cloud + Neon PostgreSQL (Free Tier)** ([ADR 0021](../../../../docs/adr/0021-gcp-absolute-dev-infrastructure.md)).

## Módulos compuestos

| Módulo | Responsabilidad |
| --- | --- |
| `../../modules/project-services` | Habilita únicamente las APIs GCP necesarias (sin `sqladmin.googleapis.com` en DEV). |
| `../../modules/iam` | Service Accounts de mínimo privilegio (`sa-deployer-dev`, `sa-api-runtime-dev`, `sa-api-migrator-dev`), `roles/firebaseauth.viewer` para verificación de revocación por ADC y binding OIDC/WIF restringido al repo + environment `dev`. |
| `../../modules/artifact-registry` | Repositorio Docker con limpieza automática (retiene últimas 5 imágenes etiquetadas y borra sin etiqueta > 7 días). |
| `../../modules/secret-manager` | Contenedores de secretos `neon-db-runtime-password` y `neon-db-migrator-password` con IAM estricto por secreto. |
| `../../modules/firebase` | Proyecto Firebase, Identity Platform (Email/Password + dominios autorizados DEV), Web App pública y sitio Firebase Hosting. |
| `../../modules/cloud-run` | Cloud Run Job `casepilot-api-migrate-dev` (host direct) y Cloud Run Service `casepilot-api-dev` (host pooled, `min=0`, `max=2`, `1 vCPU`, `512Mi`). |

## Comandos locales de validación (sin credenciales remotas)

```bash
terraform fmt -check -recursive ../..
terraform init -backend=false
terraform validate
tflint --recursive
```

Para el bootstrap único inicial y la configuración del backend GCS, consulta [`../../bootstrap/README.md`](../../bootstrap/README.md).
