output "gcp_project_id" {
  description = "GCP project ID for DEV."
  value       = var.gcp_project_id
}

output "gcp_region" {
  description = "GCP region for DEV."
  value       = var.gcp_region
}

output "wif_deployer_sa" {
  description = "GitHub Environment var WIF_DEPLOYER_SA."
  value       = module.iam.deployer_service_account_email
}

output "api_runtime_sa" {
  description = "Cloud Run API runtime service account email."
  value       = module.iam.api_runtime_service_account_email
}

output "api_migrator_sa" {
  description = "Cloud Run API migrator service account email."
  value       = module.iam.api_migrator_service_account_email
}

output "artifact_registry_repo" {
  description = "GitHub Environment var ARTIFACT_REGISTRY_REPO."
  value       = module.artifact_registry.repository_id
}

output "artifact_registry_url" {
  description = "Full Artifact Registry Docker URL."
  value       = module.artifact_registry.repository_url
}

output "cloud_run_service" {
  description = "GitHub Environment var CLOUD_RUN_SERVICE."
  value       = module.cloud_run.service_name
}

output "cloud_run_migrate_job" {
  description = "GitHub Environment var CLOUD_RUN_MIGRATE_JOB."
  value       = module.cloud_run.migrate_job_name
}

output "dev_api_url" {
  description = "GitHub Environment var DEV_API_URL."
  value       = module.cloud_run.service_uri
}

output "firebase_hosting_site" {
  description = "GitHub Environment var FIREBASE_HOSTING_SITE."
  value       = module.firebase.hosting_site_id
}

output "firebase_hosting_url" {
  description = "Public HTTPS URL of CasePilot Web DEV."
  value       = module.firebase.hosting_default_url
}

output "firebase_web_api_key" {
  description = "GitHub Environment var FIREBASE_WEB_API_KEY (public Firebase Web config)."
  value       = module.firebase.firebase_api_key
}

output "firebase_web_auth_domain" {
  description = "GitHub Environment var FIREBASE_WEB_AUTH_DOMAIN."
  value       = module.firebase.firebase_auth_domain
}

output "firebase_web_project_id" {
  description = "GitHub Environment var FIREBASE_WEB_PROJECT_ID."
  value       = module.firebase.firebase_project_id
}

output "firebase_web_app_id" {
  description = "GitHub Environment var FIREBASE_WEB_APP_ID."
  value       = module.firebase.web_app_id
}

output "runtime_password_secret_id" {
  description = "Secret Manager ID for runtime DB password."
  value       = module.secret_manager.runtime_password_secret_id
}

output "migrator_password_secret_id" {
  description = "Secret Manager ID for migrator DB password."
  value       = module.secret_manager.migrator_password_secret_id
}
