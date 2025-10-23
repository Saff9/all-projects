# ==========================================
# CryptoVerse Terraform Providers
# ==========================================

# ==========================================
# Kubernetes Provider
# ==========================================

provider "kubernetes" {
  # Configuration options - choose one based on your setup
  
  # Option 1: Use kubeconfig file
  # config_path    = "~/.kube/config"
  # config_context = "your-context-name"
  
  # Option 2: Use in-cluster config (when running in Kubernetes)
  # host                   = "https://kubernetes.default.svc"
  # cluster_ca_certificate = file("/var/run/secrets/kubernetes.io/serviceaccount/ca.crt")
  # token                  = file("/var/run/secrets/kubernetes.io/serviceaccount/token")
  
  # Option 3: Use explicit configuration
  # host                   = "https://your-cluster-endpoint"
  # cluster_ca_certificate = file("~/.kube/ca.crt")
  # client_certificate     = file("~/.kube/client.crt")
  # client_key             = file("~/.kube/client.key")
  
  # Option 4: Use exec plugin (recommended for cloud providers)
  # exec {
  #   api_version = "client.authentication.k8s.io/v1beta1"
  #   command     = "aws"
  #   args        = ["eks", "get-token", "--cluster-name", "your-cluster-name"]
  # }
  
  # Option 5: GKE
  # exec {
  #   api_version = "client.authentication.k8s.io/v1beta1"
  #   command     = "gcloud"
  #   args        = ["auth", "print-access-token"]
  # }
  
  # Option 6: Azure AKS
  # exec {
  #   api_version = "client.authentication.k8s.io/v1beta1"
  #   command     = "kubelogin"
  #   args        = ["get-token", "--environment", "AzurePublicCloud", "--server-id", "server-id", "--client-id", "client-id", "--tenant-id", "tenant-id"]
  # }
}

# ==========================================
# Helm Provider
# ==========================================

provider "helm" {
  kubernetes {
    # Same configuration options as kubernetes provider
    config_path = "~/.kube/config"
  }
  
  # Registry configuration (if using private Helm repos)
  # registry {
  #   url      = "oci://your-registry.io"
  #   username = "username"
  #   password = "password"
  # }
}

# ==========================================
# kubectl Provider
# ==========================================

provider "kubectl" {
  # Configuration for kubectl provider
  # Used for applying raw Kubernetes manifests
  
  config_path = "~/.kube/config"
  
  # Or use explicit configuration
  # host                   = "https://your-cluster-endpoint"
  # cluster_ca_certificate = file("~/.kube/ca.crt")
  # client_certificate     = file("~/.kube/client.crt")
  # client_key             = file("~/.kube/client.key")
}

# ==========================================
# Optional Cloud Providers
# ==========================================

# AWS Provider (uncomment if using AWS)
# provider "aws" {
#   region = "us-east-1"
#   
#   default_tags {
#     tags = {
#       Project     = "CryptoVerse"
#       Environment = var.environment
#       ManagedBy   = "Terraform"
#     }
#   }
# }

# Google Cloud Provider (uncomment if using GCP)
# provider "google" {
#   project = "your-project-id"
#   region  = "us-central1"
#   
#   default_labels = {
#     project     = "cryptoverse"
#     environment = var.environment
#     managed_by  = "terraform"
#   }
# }

# Azure Provider (uncomment if using Azure)
# provider "azurerm" {
#   features {}
#   
#   subscription_id = "your-subscription-id"
#   
#   # Skip provider registration if not authorized
#   skip_provider_registration = true
# }

# ==========================================
# Terraform Provider Configuration
# ==========================================

# Random provider for generating secrets
provider "random" {
  # No configuration needed
}