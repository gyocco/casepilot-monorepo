output "enabled_services" {
  description = "Set of enabled GCP service API names."
  value       = sort(keys(google_project_service.enabled))
}
