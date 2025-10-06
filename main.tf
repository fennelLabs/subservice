# This repository no longer uses Terraform for infrastructure management
# Infrastructure is now managed via Kubernetes/Helm charts
# This file exists only to prevent Terraform Cloud errors

terraform {
  required_version = ">= 1.0"
  
  # Terraform Cloud backend - required for Terraform Cloud integration
  cloud {
    organization = "fennellabs"
    workspaces {
      name = "subservice"
    }
  }
  
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

# Empty placeholder resource - does nothing
resource "null_resource" "placeholder" {
  triggers = {
    note = "This repository no longer uses Terraform. Infrastructure is managed via Kubernetes."
  }
}

# Outputs to indicate the migration
output "migration_note" {
  value = "This repository has migrated from Terraform to Kubernetes/Helm chart deployment"
}
