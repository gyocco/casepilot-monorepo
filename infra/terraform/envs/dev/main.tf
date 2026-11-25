locals {
  environment_short = "dev"
  app_env           = "development"

  # Explicitly excludes sqladmin.googleapis.com in DEV (Neon Free Tier is used per ADR 0021).
  required_services = [
    "artifactregistry.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "firebase.googleapis.com",
    "firebasehosting.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "identitytoolkit.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "serviceusage.googleapis.com",
  ]
}

module "project_services" {
  source = "../../modules/project-services"

  project_id = var.gcp_project_id
  services   = local.required_services
}

module "iam" {
  source = "../../modules/iam"

  project_id                  = var.gcp_project_id
  environment_short           = local.environment_short
  workload_identity_pool_name = var.workload_identity_pool_name
  github_repository           = var.github_repository
  github_environment          = var.github_environment

  depends_on = [module.project_services]
}

module "artifact_registry" {
  source = "../../modules/artifact-registry"

  project_id                     = var.gcp_project_id
  region                         = var.gcp_region
  repository_id                  = var.artifact_registry_repo_id
  environment_short              = local.environment_short
  keep_recent_count              = 5
  deployer_service_account_email = module.iam.deployer_service_account_email
  runtime_service_account_email  = module.iam.api_runtime_service_account_email
  migrator_service_account_email = module.iam.api_migrator_service_account_email

  depends_on = [module.project_services]
}

module "secret_manager" {
  source = "../../modules/secret-manager"

  project_id                     = var.gcp_project_id
  environment_short              = local.environment_short
  runtime_password_secret_id     = "neon-db-runtime-password"
  migrator_password_secret_id    = "neon-db-migrator-password"
  runtime_service_account_email  = module.iam.api_runtime_service_account_email
  migrator_service_account_email = module.iam.api_migrator_service_account_email

  depends_on = [module.project_services]
}

module "firebase" {
  source = "../../modules/firebase"

  project_id                 = var.gcp_project_id
  hosting_site_id            = var.firebase_hosting_site_id
  web_app_display_name       = "CasePilot Web (DEV)"
  enable_email_password_auth = var.enable_email_password_auth
  enable_google_auth         = var.enable_google_auth
  google_oauth_client_id     = var.google_oauth_client_id
  google_oauth_client_secret = var.google_oauth_client_secret
  extra_authorized_domains   = var.extra_authorized_domains

  depends_on = [module.project_services]
}

module "cloud_run" {
  source = "../../modules/cloud-run"

  project_id                     = var.gcp_project_id
  region                         = var.gcp_region
  environment_short              = local.environment_short
  app_env                        = local.app_env
  service_name                   = "casepilot-api-${local.environment_short}"
  migrate_job_name               = "casepilot-api-migrate-${local.environment_short}"
  initial_image                  = var.initial_api_image
  runtime_service_account_email  = module.iam.api_runtime_service_account_email
  migrator_service_account_email = module.iam.api_migrator_service_account_email

  min_instance_count = 0
  max_instance_count = 2
  cpu_limit          = "1"
  memory_limit       = "512Mi"
  api_error_details  = true

  cors_origins        = distinct(concat(module.firebase.allowed_cors_origins, var.extra_cors_origins))
  firebase_project_id = module.firebase.firebase_project_id

  database_runtime_host                       = var.database_runtime_host
  database_migrator_host                      = var.database_migrator_host
  database_port                               = var.database_port
  database_name                               = var.database_name
  database_schema                             = var.database_schema
  database_runtime_user                       = var.database_runtime_user
  database_migrator_user                      = var.database_migrator_user
  database_runtime_password_secret_id         = module.secret_manager.runtime_password_secret_id
  database_migrator_password_secret_id        = module.secret_manager.migrator_password_secret_id
  database_runtime_statement_timeout_enabled  = false
  database_migrator_statement_timeout_enabled = true
  database_runtime_connect_timeout_ms         = 15000
  database_runtime_query_timeout_ms           = 15000
  database_migrator_connect_timeout_ms        = 30000
  database_migrator_query_timeout_ms          = 60000
  database_runtime_pool_size                  = 5

  depends_on = [
    module.project_services,
    module.artifact_registry,
    module.secret_manager,
    module.firebase,
  ]
}
