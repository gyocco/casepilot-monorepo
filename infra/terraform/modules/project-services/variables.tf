variable "project_id" {
  description = "GCP project ID where APIs will be enabled."
  type        = string
}

variable "services" {
  description = "List of GCP API service names to enable."
  type        = list(string)
}
