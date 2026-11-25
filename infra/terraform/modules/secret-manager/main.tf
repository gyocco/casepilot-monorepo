terraform {
  required_version = ">= 1.9.0, < 2.0.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.12.0, < 7.0.0"
    }
  }
}

# Secret containers only — secret versions (actual database passwords) are populated
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
