#!/usr/bin/env bash
set -euo pipefail

# One-time idempotent bootstrap for the CasePilot GCP DEV project.
# Creates ONLY the prerequisites Terraform cannot create before authenticating:
#   1. Minimal bootstrap APIs (IAM, STS, IAM Credentials, Resource Manager, Storage, Billing Budgets)
#   2. Versioned GCS bucket for remote Terraform state (UBLA + public access prevention)
#   3. Workload Identity Pool & GitHub OIDC Provider restricted to this repository
#   4. `sa-terraform-dev` Service Account with WIF binding for GitHub Actions `dev` environment
#
# Usage:
#   GCP_PROJECT_ID="casepilot-dev" \
#   GCP_REGION="us-east1" \
#   GITHUB_REPOSITORY="owner/casepilot-monorepo" \
#   BILLING_ACCOUNT_ID="XXXXXX-XXXXXX-XXXXXX" \
#   bash infra/terraform/bootstrap/bootstrap-gcp.sh

GCP_PROJECT_ID="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID (e.g., casepilot-dev)}"
GCP_REGION="${GCP_REGION:-us-east1}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:?Set GITHUB_REPOSITORY (e.g., owner/casepilot-monorepo)}"
GITHUB_ENVIRONMENT="${GITHUB_ENVIRONMENT:-dev}"
TF_STATE_BUCKET="${TF_STATE_BUCKET:-${GCP_PROJECT_ID}-tfstate}"
WIF_POOL_ID="${WIF_POOL_ID:-github-actions-pool}"
WIF_PROVIDER_ID="${WIF_PROVIDER_ID:-github-actions-provider}"
TERRAFORM_SA_ID="${TERRAFORM_SA_ID:-sa-terraform-dev}"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID:-}"

echo "==> Targeting GCP project: ${GCP_PROJECT_ID} (region: ${GCP_REGION})"
gcloud config set project "${GCP_PROJECT_ID}" >/dev/null

PROJECT_NUMBER="$(gcloud projects describe "${GCP_PROJECT_ID}" --format='value(projectNumber)')"
echo "==> Project number: ${PROJECT_NUMBER}"

echo "==> Enabling bootstrap APIs..."
gcloud services enable \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  serviceusage.googleapis.com \
  storage.googleapis.com \
  sts.googleapis.com

echo "==> Ensuring GCS Terraform state bucket: gs://${TF_STATE_BUCKET}"
if ! gcloud storage buckets describe "gs://${TF_STATE_BUCKET}" >/dev/null 2>&1; then
  gcloud storage buckets create "gs://${TF_STATE_BUCKET}" \
    --project="${GCP_PROJECT_ID}" \
    --location="${GCP_REGION}" \
    --uniform-bucket-level-access \
    --public-access-prevention
fi
gcloud storage buckets update "gs://${TF_STATE_BUCKET}" \
  --versioning \
  --uniform-bucket-level-access \
  --public-access-prevention >/dev/null

echo "==> Ensuring Workload Identity Pool: ${WIF_POOL_ID}"
if ! gcloud iam workload-identity-pools describe "${WIF_POOL_ID}" \
  --project="${GCP_PROJECT_ID}" --location="global" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "${WIF_POOL_ID}" \
    --project="${GCP_PROJECT_ID}" \
    --location="global" \
    --display-name="GitHub Actions OIDC Pool" \
    --description="OIDC federation for GitHub Actions CI/CD without static JSON keys."
fi

WIF_POOL_NAME="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL_ID}"

echo "==> Ensuring Workload Identity OIDC Provider: ${WIF_PROVIDER_ID}"
ATTRIBUTE_MAPPING="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.environment=assertion.environment,attribute.repository_env=assertion.repository + '/' + assertion.environment,attribute.ref=assertion.ref"
ATTRIBUTE_CONDITION="assertion.repository == '${GITHUB_REPOSITORY}'"

if ! gcloud iam workload-identity-pools providers describe "${WIF_PROVIDER_ID}" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="${WIF_POOL_ID}" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "${WIF_PROVIDER_ID}" \
    --project="${GCP_PROJECT_ID}" \
    --location="global" \
    --workload-identity-pool="${WIF_POOL_ID}" \
    --display-name="GitHub Actions OIDC Provider" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="${ATTRIBUTE_MAPPING}" \
    --attribute-condition="${ATTRIBUTE_CONDITION}"
else
  gcloud iam workload-identity-pools providers update-oidc "${WIF_PROVIDER_ID}" \
    --project="${GCP_PROJECT_ID}" \
    --location="global" \
    --workload-identity-pool="${WIF_POOL_ID}" \
    --attribute-mapping="${ATTRIBUTE_MAPPING}" \
    --attribute-condition="${ATTRIBUTE_CONDITION}"
fi

TERRAFORM_SA_EMAIL="${TERRAFORM_SA_ID}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
echo "==> Ensuring Terraform Service Account: ${TERRAFORM_SA_EMAIL}"
if ! gcloud iam service-accounts describe "${TERRAFORM_SA_EMAIL}" --project="${GCP_PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${TERRAFORM_SA_ID}" \
    --project="${GCP_PROJECT_ID}" \
    --display-name="CasePilot Terraform IaC (DEV)" \
    --description="Impersonated by GitHub Actions OIDC to plan and apply DEV Terraform state."
fi

echo "==> Binding minimal project roles to ${TERRAFORM_SA_EMAIL}..."
for ROLE in \
  roles/serviceusage.serviceUsageAdmin \
  roles/iam.serviceAccountAdmin \
  roles/resourcemanager.projectIamAdmin \
  roles/artifactregistry.admin \
  roles/secretmanager.admin \
  roles/run.admin \
  roles/firebase.admin \
  roles/identitytoolkit.admin; do
  gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
    --member="serviceAccount:${TERRAFORM_SA_EMAIL}" \
    --role="${ROLE}" \
    --quiet >/dev/null
done

echo "==> Granting Terraform state bucket access to ${TERRAFORM_SA_EMAIL}..."
gcloud storage buckets add-iam-policy-binding "gs://${TF_STATE_BUCKET}" \
  --member="serviceAccount:${TERRAFORM_SA_EMAIL}" \
  --role="roles/storage.objectAdmin" \
  --quiet >/dev/null

echo "==> Binding GitHub OIDC Workload Identity User to ${TERRAFORM_SA_EMAIL}..."
# Allow GitHub Environment `dev` (used by both infra-plan and infra-apply-dev) to impersonate sa-terraform-dev.
gcloud iam service-accounts add-iam-policy-binding "${TERRAFORM_SA_EMAIL}" \
  --project="${GCP_PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WIF_POOL_NAME}/attribute.repository_env/${GITHUB_REPOSITORY}/${GITHUB_ENVIRONMENT}" \
  --quiet >/dev/null

if [[ -n "${BILLING_ACCOUNT_ID}" ]]; then
  echo "==> Creating monthly DEV Budget Alert (USD \$10 with 10% / 50% / 100% thresholds = \$1 / \$5 / \$10)..."
  gcloud services enable billingbudgets.googleapis.com
  gcloud billing budgets create \
    --billing-account="${BILLING_ACCOUNT_ID}" \
    --display-name="CasePilot DEV Free-Tier Guardrail (\$10)" \
    --budget-amount="10USD" \
    --filter-projects="projects/${PROJECT_NUMBER}" \
    --threshold-rule=percent=0.1 \
    --threshold-rule=percent=0.5 \
    --threshold-rule=percent=1.0 || echo "WARN: Budget alert may already exist or require Billing Account Admin permission."
fi

WIF_PROVIDER_FULL="${WIF_POOL_NAME}/providers/${WIF_PROVIDER_ID}"

cat <<EOF

====================================================================
Bootstrap complete! Save these non-sensitive values for Terraform and
GitHub Environment '${GITHUB_ENVIRONMENT}' variables:

  TF_STATE_BUCKET             = ${TF_STATE_BUCKET}
  GCP_PROJECT_ID              = ${GCP_PROJECT_ID}
  GCP_REGION                  = ${GCP_REGION}
  WORKLOAD_IDENTITY_POOL_NAME = ${WIF_POOL_NAME}
  WIF_PROVIDER                = ${WIF_PROVIDER_FULL}
  WIF_TERRAFORM_SA            = ${TERRAFORM_SA_EMAIL}
====================================================================
EOF
