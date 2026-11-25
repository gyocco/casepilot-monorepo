variable "gcp_project_id" {
  description = "Dedicated GCP project ID for the DEV environment (e.g., casepilot-dev)."
  type        = string
}

variable "gcp_region" {
  description = "GCP region for Cloud Run and Artifact Registry (us-east1 aligns closely with Neon aws-us-east-1 and stays in GCP free tier)."
  type        = string
  default     = "us-east1"
}

variable "github_repository" {
  description = "GitHub repository in owner/repo format authorized via Workload Identity Federation."
  type        = string
}

variable "github_environment" {
  description = "GitHub Actions Environment name authorized for DEV deployments."
  type        = string
  default     = "dev"
}

variable "workload_identity_pool_name" {
  description = "Full resource name of the bootstrapped WIF pool (projects/<project-number>/locations/global/workloadIdentityPools/<pool-id>)."
  type        = string
}

variable "artifact_registry_repo_id" {
  description = "Artifact Registry Docker repository ID."
  type        = string
  default     = "casepilot-dev"
}

variable "firebase_hosting_site_id" {
  description = "Globally unique Firebase Hosting site ID for CasePilot Web DEV."
  type        = string
}

variable "enable_email_password_auth" {
  description = "Enable Email/Password sign-in in Firebase Authentication DEV."
  type        = bool
  default     = true
}

variable "enable_google_auth" {
  description = "Enable Google Sign-In in Firebase Authentication DEV."
  type        = bool
  default     = false
}

variable "google_oauth_client_id" {
  description = "Google OAuth 2.0 Web Client ID (only needed when enable_google_auth = true)."
  type        = string
  default     = ""
}

variable "google_oauth_client_secret" {
  description = "Google OAuth 2.0 Web Client Secret (only needed when enable_google_auth = true)."
  type        = string
  default     = ""
  sensitive   = true
}

variable "extra_cors_origins" {
  description = "Optional extra explicit HTTP/HTTPS CORS origins for DEV (Firebase Hosting origins are included automatically)."
  type        = list(string)
  default     = []
}

variable "extra_authorized_domains" {
  description = "Optional extra authorized domains for Firebase Authentication (e.g., custom DEV domain)."
  type        = list(string)
  default     = []
}

variable "database_runtime_host" {
  description = "PostgreSQL host for the API runtime (Neon pooled endpoint: ep-xxx-pooler.<region>.aws.neon.tech)."
  type        = string
}

variable "database_migrator_host" {
  description = "PostgreSQL host for schema migrations (Neon direct/unpooled endpoint: ep-xxx.<region>.aws.neon.tech)."
  type        = string
}

variable "database_port" {
  description = "PostgreSQL TCP port."
  type        = number
  default     = 5432
}

variable "database_name" {
  description = "PostgreSQL database name in Neon DEV."
  type        = string
  default     = "casepilot_dev"
}

variable "database_schema" {
  description = "PostgreSQL schema name."
  type        = string
  default     = "public"
}

variable "database_runtime_user" {
  description = "PostgreSQL runtime username (least-privilege DML role)."
  type        = string
  default     = "casepilot_app"
}

variable "database_migrator_user" {
  description = "PostgreSQL migrator username (DDL role for migrations)."
  type        = string
  default     = "casepilot_migrator"
}

variable "initial_api_image" {
  description = "Bootstrap container image for initial Cloud Run creation; CI/CD deploys immutable sha-<short_sha> images thereafter."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}
