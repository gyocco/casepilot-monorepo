variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run service and job."
  type        = string
}

variable "environment_short" {
  description = "Short environment slug (e.g., dev)."
  type        = string
}

variable "app_env" {
  description = "CasePilot API APP_ENV value (development, staging, or production)."
  type        = string
}

variable "service_name" {
  description = "Cloud Run Service name (e.g., casepilot-api-dev)."
  type        = string
}

variable "migrate_job_name" {
  description = "Cloud Run Job name (e.g., casepilot-api-migrate-dev)."
  type        = string
}

variable "initial_image" {
  description = "Initial container image URI used at Terraform creation time; subsequent releases are rolled out by CI/CD."
  type        = string
}

variable "deletion_protection" {
  description = "Protect Cloud Run service and job against Terraform destruction (false in DEV, true in Prod)."
  type        = bool
  default     = false
}

variable "runtime_service_account_email" {
  description = "Service account email attached to the Cloud Run API Service."
  type        = string
}

variable "migrator_service_account_email" {
  description = "Service account email attached to the Cloud Run Migration Job."
  type        = string
}

variable "min_instance_count" {
  description = "Minimum Cloud Run instances (0 for scale-to-zero in DEV)."
  type        = number
  default     = 0
}

variable "max_instance_count" {
  description = "Maximum Cloud Run instances."
  type        = number
  default     = 2
}

variable "cpu_limit" {
  description = "vCPU limit for the Cloud Run API container."
  type        = string
  default     = "1"
}

variable "memory_limit" {
  description = "Memory limit for the Cloud Run API container."
  type        = string
  default     = "512Mi"
}

variable "api_error_details" {
  description = "Whether Problem Details responses expose diagnostic details."
  type        = bool
  default     = true
}

variable "cors_origins" {
  description = "Explicit list of allowed HTTP/HTTPS CORS origins for the SPA."
  type        = list(string)
}

variable "firebase_project_id" {
  description = "Firebase project ID used for ID token verification."
  type        = string
}

variable "database_runtime_host" {
  description = "PostgreSQL host for the API runtime (e.g., Neon pooled endpoint)."
  type        = string
}

variable "database_migrator_host" {
  description = "PostgreSQL host for schema migrations (e.g., Neon direct/unpooled endpoint)."
  type        = string
}

variable "database_port" {
  description = "PostgreSQL TCP port."
  type        = number
  default     = 5432
}

variable "database_name" {
  description = "PostgreSQL database name."
  type        = string
}

variable "database_schema" {
  description = "PostgreSQL target schema."
  type        = string
  default     = "public"
}

variable "database_runtime_user" {
  description = "PostgreSQL runtime username (minimum DML privileges)."
  type        = string
}

variable "database_migrator_user" {
  description = "PostgreSQL migrator username (DDL privileges)."
  type        = string
}

variable "database_runtime_password_secret_id" {
  description = "Secret Manager secret ID holding the runtime PostgreSQL password."
  type        = string
}

variable "database_migrator_password_secret_id" {
  description = "Secret Manager secret ID holding the migrator PostgreSQL password."
  type        = string
}

variable "database_runtime_statement_timeout_enabled" {
  description = "Enable PostgreSQL startup statement_timeout on runtime connections (false for PgBouncer/Neon pooled endpoints)."
  type        = bool
  default     = false
}

variable "database_migrator_statement_timeout_enabled" {
  description = "Enable PostgreSQL startup statement_timeout on direct migration connections."
  type        = bool
  default     = true
}

variable "database_runtime_connect_timeout_ms" {
  description = "Connect timeout in ms for API runtime (accounts for Neon scale-to-zero cold wake)."
  type        = number
  default     = 15000
}

variable "database_runtime_query_timeout_ms" {
  description = "Query timeout in ms for API runtime."
  type        = number
  default     = 15000
}

variable "database_migrator_connect_timeout_ms" {
  description = "Connect timeout in ms for migration job."
  type        = number
  default     = 30000
}

variable "database_migrator_query_timeout_ms" {
  description = "Query/DDL timeout in ms for migration job."
  type        = number
  default     = 60000
}

variable "database_runtime_pool_size" {
  description = "Maximum PostgreSQL client pool size per API instance."
  type        = number
  default     = 5
}
