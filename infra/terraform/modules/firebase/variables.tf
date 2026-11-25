variable "project_id" {
  description = "GCP / Firebase project ID."
  type        = string
}

variable "hosting_site_id" {
  description = "Firebase Hosting site ID for the Angular SPA (e.g., casepilot-dev-web)."
  type        = string
}

variable "web_app_display_name" {
  description = "Display name of the Firebase Web App."
  type        = string
  default     = "CasePilot Web (DEV)"
}

variable "enable_email_password_auth" {
  description = "Enable Email/Password authentication in Firebase Auth."
  type        = bool
  default     = true
}

variable "enable_google_auth" {
  description = "Enable Google Sign-In OAuth provider in Firebase Auth."
  type        = bool
  default     = false
}

variable "google_oauth_client_id" {
  description = "Google OAuth 2.0 Web Client ID (required only when enable_google_auth is true)."
  type        = string
  default     = ""
}

variable "google_oauth_client_secret" {
  description = "Google OAuth 2.0 Web Client Secret (required only when enable_google_auth is true)."
  type        = string
  default     = ""
  sensitive   = true
}

variable "extra_authorized_domains" {
  description = "Additional authorized domains for Firebase Auth (e.g., custom DEV domains)."
  type        = list(string)
  default     = []
}
