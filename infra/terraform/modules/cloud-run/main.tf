terraform {
  required_version = ">= 1.9.0, < 2.0.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.12.0, < 7.0.0"
    }
  }
}

# Cloud Run Job for coordinated schema migrations (BCK-017).
# Uses the exact same immutable container image as the API service, overriding the command
# to run `typeorm migration:run` against the direct (unpooled) PostgreSQL endpoint.
resource "google_cloud_run_v2_job" "migrate" {
  project             = var.project_id
  location            = var.region
  name                = var.migrate_job_name
  deletion_protection = var.deletion_protection

  template {
    template {
      service_account = var.migrator_service_account_email
      max_retries     = 0
      timeout         = "300s"

      containers {
        image   = var.initial_image
        command = ["node"]
        args    = ["./node_modules/typeorm/cli.js", "migration:run", "-d", "dist/infrastructure/database/data-source.js"]

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }

        env {
          name  = "APP_ENV"
          value = var.app_env
        }
        env {
          name  = "DATABASE_HOST"
          value = var.database_migrator_host
        }
        env {
          name  = "DATABASE_PORT"
          value = tostring(var.database_port)
        }
        env {
          name  = "DATABASE_NAME"
          value = var.database_name
        }
        env {
          name  = "DATABASE_USER"
          value = var.database_migrator_user
        }
        env {
          name  = "DATABASE_SCHEMA"
          value = var.database_schema
        }
        env {
          name  = "DATABASE_SSL"
          value = "true"
        }
        env {
          name  = "DATABASE_STATEMENT_TIMEOUT_ENABLED"
          value = tostring(var.database_migrator_statement_timeout_enabled)
        }
        env {
          name  = "DATABASE_CONNECT_TIMEOUT_MS"
          value = tostring(var.database_migrator_connect_timeout_ms)
        }
        env {
          name  = "DATABASE_QUERY_TIMEOUT_MS"
          value = tostring(var.database_migrator_query_timeout_ms)
        }
        env {
          name  = "DATABASE_POOL_SIZE"
          value = "2"
        }
        env {
          name  = "AUTH_FIREBASE_PROJECT_ID"
          value = var.firebase_project_id
        }
        env {
          name = "DATABASE_PASSWORD"
          value_source {
            secret_key_ref {
              secret  = var.database_migrator_password_secret_id
              version = "latest"
            }
          }
        }
      }
    }
  }

  labels = {
    env        = var.environment_short
    component  = "casepilot-api-migrate"
    managed_by = "terraform"
  }

  lifecycle {
    ignore_changes = [
      template[0].template[0].containers[0].image,
      client,
      client_version,
    ]
  }
}

# Cloud Run Service for the NestJS API runtime.
# Connects to the pooled PostgreSQL endpoint with min_instance_count=0 (free tier scale-to-zero).
resource "google_cloud_run_v2_service" "api" {
  project             = var.project_id
  location            = var.region
  name                = var.service_name
  ingress             = "INGRESS_TRAFFIC_ALL"
  deletion_protection = var.deletion_protection

  template {
    service_account = var.runtime_service_account_email
    timeout         = "60s"

    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }

    containers {
      image = var.initial_image

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = var.cpu_limit
          memory = var.memory_limit
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }

      startup_probe {
        http_get {
          path = "/health"
          port = 8080
        }
        initial_delay_seconds = 3
        timeout_seconds       = 5
        period_seconds        = 5
        failure_threshold     = 6
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 8080
        }
        initial_delay_seconds = 10
        timeout_seconds       = 5
        period_seconds        = 30
        failure_threshold     = 3
      }

      env {
        name  = "APP_ENV"
        value = var.app_env
      }
      env {
        name  = "API_HOST"
        value = "0.0.0.0"
      }
      env {
        name  = "API_ERROR_DETAILS"
        value = tostring(var.api_error_details)
      }
      env {
        name  = "CORS_ORIGINS"
        value = join(",", var.cors_origins)
      }
      env {
        name  = "AUTH_FIREBASE_PROJECT_ID"
        value = var.firebase_project_id
      }
      env {
        name  = "DATABASE_HOST"
        value = var.database_runtime_host
      }
      env {
        name  = "DATABASE_PORT"
        value = tostring(var.database_port)
      }
      env {
        name  = "DATABASE_NAME"
        value = var.database_name
      }
      env {
        name  = "DATABASE_USER"
        value = var.database_runtime_user
      }
      env {
        name  = "DATABASE_SCHEMA"
        value = var.database_schema
      }
      env {
        name  = "DATABASE_SSL"
        value = "true"
      }
      env {
        name  = "DATABASE_STATEMENT_TIMEOUT_ENABLED"
        value = tostring(var.database_runtime_statement_timeout_enabled)
      }
      env {
        name  = "DATABASE_CONNECT_TIMEOUT_MS"
        value = tostring(var.database_runtime_connect_timeout_ms)
      }
      env {
        name  = "DATABASE_QUERY_TIMEOUT_MS"
        value = tostring(var.database_runtime_query_timeout_ms)
      }
      env {
        name  = "DATABASE_POOL_SIZE"
        value = tostring(var.database_runtime_pool_size)
      }
      env {
        name = "DATABASE_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = var.database_runtime_password_secret_id
            version = "latest"
          }
        }
      }
    }
  }

  labels = {
    env        = var.environment_short
    component  = "casepilot-api"
    managed_by = "terraform"
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }
}

# Allow public HTTPS ingress to Cloud Run; the NestJS global BearerAuthGuard protects all
# product endpoints with Firebase Auth (only /health and /health/database are public).
resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  project  = var.project_id
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
