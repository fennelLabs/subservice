# DEPRECATED: This repository no longer uses Terraform
# Infrastructure is now managed via Kubernetes and Helm

terraform {
  required_version = ">= 1.0"
}

# Empty configuration - no resources to manage
# This file exists only to prevent Terraform Cloud integration errors

output "notice" {
  value = "DEPRECATED: This repository no longer uses Terraform. Infrastructure managed via Kubernetes/Helm."
}
