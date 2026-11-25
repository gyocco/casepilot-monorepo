output "runtime_password_secret_id" {
  description = "Secret ID for the runtime PostgreSQL password."
  value       = google_secret_manager_secret.db_runtime_password.secret_id
}

output "migrator_password_secret_id" {
  description = "Secret ID for the migrator PostgreSQL password."
  value       = google_secret_manager_secret.db_migrator_password.secret_id
}

output "owner_url_secret_id" {
  description = "Secret ID for the Neon admin/owner connection string."
  value       = google_secret_manager_secret.db_owner_url.secret_id
}
