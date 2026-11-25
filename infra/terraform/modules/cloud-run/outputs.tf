output "service_name" {
  description = "Cloud Run Service name."
  value       = google_cloud_run_v2_service.api.name
}

output "service_uri" {
  description = "Public HTTPS URI of the Cloud Run API service."
  value       = google_cloud_run_v2_service.api.uri
}

output "migrate_job_name" {
  description = "Cloud Run Migration Job name."
  value       = google_cloud_run_v2_job.migrate.name
}
