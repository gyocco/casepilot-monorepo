terraform {
  required_version = ">= 1.9.0, < 2.0.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.12.0, < 7.0.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 6.12.0, < 7.0.0"
    }
  }
}

resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.project_id
}

resource "google_firebase_hosting_site" "spa" {
  provider = google-beta
  project  = google_firebase_project.default.project
  site_id  = var.hosting_site_id
}

resource "google_firebase_web_app" "spa" {
  provider     = google-beta
  project      = google_firebase_project.default.project
  display_name = var.web_app_display_name
}

data "google_firebase_web_app_config" "spa" {
  provider   = google-beta
  project    = google_firebase_project.default.project
  web_app_id = google_firebase_web_app.spa.app_id
}

resource "google_identity_platform_config" "auth" {
  provider                   = google-beta
  project                    = google_firebase_project.default.project
  autodelete_anonymous_users = true

  sign_in {
    allow_duplicate_emails = false

    anonymous {
      enabled = false
    }

    email {
      enabled           = var.enable_email_password_auth
      password_required = true
    }
  }

  authorized_domains = distinct(concat(
    [
      "localhost",
      "${var.project_id}.firebaseapp.com",
      "${var.project_id}.web.app",
      "${google_firebase_hosting_site.spa.site_id}.web.app",
      "${google_firebase_hosting_site.spa.site_id}.firebaseapp.com",
    ],
    var.extra_authorized_domains,
  ))
}

resource "google_identity_platform_default_supported_idp_config" "google" {
  count = var.enable_google_auth ? 1 : 0

  provider      = google-beta
  project       = google_firebase_project.default.project
  idp_id        = "google.com"
  enabled       = true
  client_id     = var.google_oauth_client_id
  client_secret = var.google_oauth_client_secret

  depends_on = [google_identity_platform_config.auth]
}
