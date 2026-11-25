output "deployer_service_account_email" {
  description = "Email of the CI/CD deployer service account."
  value       = google_service_account.deployer.email
}

output "api_runtime_service_account_email" {
  description = "Email of the Cloud Run API runtime service account."
  value       = google_service_account.api_runtime.email
}

output "api_migrator_service_account_email" {
  description = "Email of the Cloud Run migration job service account."
  value       = google_service_account.api_migrator.email
}
