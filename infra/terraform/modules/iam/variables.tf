variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "environment_short" {
  description = "Short environment slug used in service account IDs (e.g., dev, qa, prod)."
  type        = string
}

variable "workload_identity_pool_name" {
  description = "Full resource name of the Workload Identity Pool (projects/<num>/locations/global/workloadIdentityPools/<pool>)."
  type        = string
}

variable "github_repository" {
  description = "GitHub repository in owner/repo format allowed to impersonate the deployer service account."
  type        = string
}

variable "github_environment" {
  description = "GitHub Actions Environment name allowed to impersonate the deployer service account (e.g., dev)."
  type        = string
}
