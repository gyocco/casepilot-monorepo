variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "environment_short" {
  description = "Short environment slug (e.g., dev)."
  type        = string
}

variable "runtime_password_secret_id" {
  description = "Secret Manager ID for the runtime PostgreSQL role password."
  type        = string
  default     = "neon-db-runtime-password"
}

variable "migrator_password_secret_id" {
  description = "Secret Manager ID for the migrator PostgreSQL role password."
  type        = string
  default     = "neon-db-migrator-password"
}

variable "owner_url_secret_id" {
  description = "Secret Manager ID for the Neon admin/owner connection string (human admins only)."
  type        = string
  default     = "neon-db-owner-url"
}

variable "runtime_service_account_email" {
  description = "API runtime service account granted access ONLY to the runtime DB secret."
  type        = string
}

variable "migrator_service_account_email" {
  description = "API migrator service account granted access ONLY to the migrator DB secret."
  type        = string
}

variable "secret_admin_members" {
  description = "IAM members (e.g., user:dev@example.com or group:devs@example.com) allowed to read DEV database secrets via gcloud."
  type        = list(string)
  default     = []
}
