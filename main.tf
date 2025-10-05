# DEPRECATED: This repository no longer uses Terraform

terraform {
  required_version = ">= 1.0"
  
  # Terraform Cloud requires cloud or remote backend
  # Using minimal cloud configuration
  cloud {
    organization = "fennellabs"
    
    workspaces {
      name = "subservice"
    }
  }
}

# Placeholder - no actual resources
resource "null_resource" "deprecation_notice" {
  triggers = {
    message = "This repository no longer uses Terraform for infrastructure management"
  }
}

output "deprecation_notice" {
  value = "This repository no longer uses Terraform. Infrastructure is managed via Kubernetes and Helm."
}
