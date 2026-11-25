terraform {
  required_version = ">= 1.9.0, < 2.0.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.12.0, < 7.0.0"
    }
  }
}

# Dedicated least-privilege Service Accounts for DEV.
# Note: sa-terraform-dev is bootstrapped once (see infra/terraform/bootstrap/) so Terraform
# itself can authenticate via Workload Identity Federation before applying this module.

resource "google_service_account" "deployer" {
  project      = var.project_id
  account_id   = "sa-deployer-${var.environment_short}"
  display_name = "CasePilot CI/CD Deployer (${upper(var.environment_short)})"
  description  = "Impersonated by GitHub Actions via OIDC to push images, run migrations, and deploy API/SPA."
}

resource "google_service_account" "api_runtime" {
  project      = var.project_id
  account_id   = "sa-api-runtime-${var.environment_short}"
  display_name = "CasePilot API Runtime (${upper(var.environment_short)})"
  description  = "Runtime identity for the Cloud Run API service. Reads runtime DB secret and verifies Firebase Auth revocations."
}

resource "google_service_account" "api_migrator" {
  project      = var.project_id
  account_id   = "sa-api-migrator-${var.environment_short}"
  display_name = "CasePilot API Migrator (${upper(var.environment_short)})"
  description  = "Execution identity for the Cloud Run migration job. Reads migrator DB secret only."
}

# --- Deployer permissions (scoped to deployment operations) ---

resource "google_project_iam_member" "deployer_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_project_iam_member" "deployer_firebase_hosting_admin" {
  project = var.project_id
  role    = "roles/firebasehosting.admin"
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

# Allow deployer to actAs ONLY the API runtime and migrator service accounts (not project-wide).
resource "google_service_account_iam_member" "deployer_act_as_runtime" {
  service_account_id = google_service_account.api_runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_service_account_iam_member" "deployer_act_as_migrator" {
  service_account_id = google_service_account.api_migrator.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deployer.email}"
}

# Restrict Workload Identity Federation impersonation of sa-deployer to the exact GitHub repo + environment.
resource "google_service_account_iam_member" "deployer_wif_user" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${var.workload_identity_pool_name}/attribute.repository_env/${var.github_repository}/${var.github_environment}"
}

# --- API Runtime permissions ---

# Required by firebase-admin verifyIdToken(token, checkRevoked=true) via Application Default Credentials.
resource "google_project_iam_member" "api_runtime_firebase_auth_viewer" {
  project = var.project_id
  role    = "roles/firebaseauth.viewer"
  member  = "serviceAccount:${google_service_account.api_runtime.email}"
}

resource "google_project_iam_member" "api_runtime_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.api_runtime.email}"
}

# --- API Migrator permissions ---

resource "google_project_iam_member" "api_migrator_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.api_migrator.email}"
}
