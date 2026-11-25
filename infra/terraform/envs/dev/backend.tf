# Remote state stored in a versioned GCS bucket with Uniform Bucket-Level Access.
# Supply the bucket name via `-backend-config="bucket=<project-id>-tfstate"` during `terraform init`
# (see infra/terraform/bootstrap/README.md and .github/workflows/infra-*.yml).
terraform {
  backend "gcs" {
    prefix = "casepilot/dev"
  }
}
