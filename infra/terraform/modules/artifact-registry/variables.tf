variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "region" {
  description = "GCP region for the Artifact Registry repository."
  type        = string
}

variable "repository_id" {
  description = "Artifact Registry repository ID (e.g., casepilot-dev)."
  type        = string
}

variable "environment_short" {
  description = "Short environment slug (e.g., dev)."
  type        = string
}

variable "keep_recent_count" {
  description = "Number of most recent tagged image versions to retain."
  type        = number
  default     = 5
}

variable "deployer_service_account_email" {
  description = "Service account email granted roles/artifactregistry.writer."
  type        = string
}

variable "runtime_service_account_email" {
  description = "API runtime service account email granted roles/artifactregistry.reader."
  type        = string
}

variable "migrator_service_account_email" {
  description = "API migrator service account email granted roles/artifactregistry.reader."
  type        = string
}
