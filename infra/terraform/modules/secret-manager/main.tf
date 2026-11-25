terraform {
  required_version = ">= 1.9.0, < 2.0.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.12.0, < 7.0.0"
    }
  }
}

# Secret containers only — secret versions (actual database credentials) are populated
# out-of-band via `gcloud secrets versions add` so credentials never exist in Git,
# GitHub Secrets, or Terraform state.

resource "google_secret_manager_secret" "db_runtime_password" {
  project   = var.project_id
  secret_id = var.runtime_password_secret_id

  replication {
    auto {}
  }

  labels = {
    env        = var.environment_short
    role       = "runtime"
    managed_by = "terraform"
  }
}

resource "google_secret_manager_secret" "db_migrator_password" {
  project   = var.project_id
  secret_id = var.migrator_password_secret_id

  replication {
    auto {}
  }

  labels = {
    env        = var.environment_short
    role       = "migrator"
    managed_by = "terraform"
  }
}

# Admin/owner connection string for Neon DEV. Accessible ONLY to explicitly authorized
# human developers/admins (and coding agents running under their gcloud session);
# NEVER granted to Cloud Run runtime, migrator, or CI/CD deployer service accounts.
resource "google_secret_manager_secret" "db_owner_url" {
  project   = var.project_id
  secret_id = var.owner_url_secret_id

  replication {
    auto {}
  }

  labels = {
    env        = var.environment_short
    role       = "owner"
    managed_by = "terraform"
  }
}

# Strict per-secret IAM isolation: runtime cannot read migrator credentials and vice versa.
resource "google_secret_manager_secret_iam_member" "runtime_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.db_runtime_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.runtime_service_account_email}"
}

resource "google_secret_manager_secret_iam_member" "migrator_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.db_migrator_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.migrator_service_account_email}"
}

# Authorized human developers/admins (e.g., "user:dev@example.com") who can access DEV secrets
# from any machine via `gcloud auth login` + `gcloud secrets versions access latest`.
resource "google_secret_manager_secret_iam_member" "owner_url_admins" {
  for_each = toset(var.secret_admin_members)

  project   = var.project_id
  secret_id = google_secret_manager_secret.db_owner_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = each.value
}

resource "google_secret_manager_secret_iam_member" "runtime_password_admins" {
  for_each = toset(var.secret_admin_members)

  project   = var.project_id
  secret_id = google_secret_manager_secret.db_runtime_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = each.value
}

resource "google_secret_manager_secret_iam_member" "migrator_password_admins" {
  for_each = toset(var.secret_admin_members)

  project   = var.project_id
  secret_id = google_secret_manager_secret.db_migrator_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = each.value
}
