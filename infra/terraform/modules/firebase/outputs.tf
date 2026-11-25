output "firebase_project_id" {
  description = "Firebase project ID."
  value       = google_firebase_project.default.project
}

output "hosting_site_id" {
  description = "Firebase Hosting site ID."
  value       = google_firebase_hosting_site.spa.site_id
}

output "hosting_default_url" {
  description = "Default HTTPS URL of the Firebase Hosting site."
  value       = google_firebase_hosting_site.spa.default_url
}

output "web_app_id" {
  description = "Public Firebase Web App ID (firebase.appId)."
  value       = google_firebase_web_app.spa.app_id
}

output "firebase_api_key" {
  description = "Public Firebase Web API key (firebase.apiKey — safe for browser app-config.json)."
  value       = data.google_firebase_web_app_config.spa.api_key
}

output "firebase_auth_domain" {
  description = "Public Firebase Auth domain (firebase.authDomain)."
  value       = data.google_firebase_web_app_config.spa.auth_domain
}

output "allowed_cors_origins" {
  description = "Hosting HTTPS origins to allow in Cloud Run API CORS_ORIGINS."
  value = [
    "https://${google_firebase_hosting_site.spa.site_id}.web.app",
    "https://${google_firebase_hosting_site.spa.site_id}.firebaseapp.com",
  ]
}
