terraform {
  required_version = ">= 1.0"
  
  # This configuration does nothing - it's a placeholder
  backend "local" {
    path = "terraform.tfstate.deprecated"
  }
}

# No resources - this is a placeholder only
output "deprecation_notice" {
  value = "This repository no longer uses Terraform. Infrastructure is managed via Kubernetes and Helm."
}
