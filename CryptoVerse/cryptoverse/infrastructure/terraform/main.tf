# ==========================================
# CryptoVerse Terraform Main Configuration
# ==========================================
# This is the main Terraform configuration file for
# deploying CryptoVerse infrastructure
# ==========================================

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.14"
    }
  }
  
  # Backend configuration - choose one based on your preference
  # Uncomment the backend you want to use
  
  # S3 Backend (AWS)
  # backend "s3" {
  #   bucket         = "cryptoverse-terraform-state"
  #   key            = "cryptoverse/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "cryptoverse-terraform-locks"
  # }
  
  # GCS Backend (Google Cloud)
  # backend "gcs" {
  #   bucket = "cryptoverse-terraform-state"
  #   prefix = "cryptoverse"
  # }
  
  # Azure Backend
  # backend "azurerm" {
  #   resource_group_name  = "cryptoverse-terraform"
  #   storage_account_name = "cryptoversetfstate"
  #   container_name       = "tfstate"
  #   key                  = "cryptoverse.tfstate"
  # }
}

# ==========================================
# Namespace
# ==========================================

resource "kubernetes_namespace" "cryptoverse" {
  metadata {
    name = var.namespace
    labels = {
      name                                = var.namespace
      "app.kubernetes.io/name"            = "cryptoverse"
      "app.kubernetes.io/part-of"         = "cryptoverse-platform"
      "app.kubernetes.io/managed-by"      = "terraform"
    }
  }
}

# ==========================================
# ConfigMap
# ==========================================

resource "kubernetes_config_map" "cryptoverse_config" {
  metadata {
    name      = "cryptoverse-config"
    namespace = kubernetes_namespace.cryptoverse.metadata[0].name
    labels = {
      "app.kubernetes.io/name"      = "cryptoverse"
      "app.kubernetes.io/component" = "config"
    }
  }
  
  data = {
    NODE_ENV                     = var.environment
    APP_NAME                     = "CryptoVerse"
    API_PORT                     = "3001"
    FRONTEND_PORT                = "3000"
    DB_HOST                      = "postgres-service"
    DB_PORT                      = "5432"
    DB_NAME                      = "cryptoverse"
    REDIS_HOST                   = "redis-service"
    REDIS_PORT                   = "6379"
    JWT_EXPIRATION               = "7d"
    RATE_LIMIT_TTL               = "60"
    RATE_LIMIT_MAX               = "100"
    CORS_ORIGIN                  = var.cors_origin
    LOG_LEVEL                    = var.log_level
    MINING_COOLDOWN_SECONDS      = "3600"
    CHARACTER_MAX_LEVEL          = "50"
    LEADERBOARD_CACHE_TTL        = "300"
    ACHIEVEMENT_NOTIFICATION_ENABLED = "true"
  }
}

# ==========================================
# Secrets
# ==========================================

resource "kubernetes_secret" "cryptoverse_secrets" {
  metadata {
    name      = "cryptoverse-secrets"
    namespace = kubernetes_namespace.cryptoverse.metadata[0].name
    labels = {
      "app.kubernetes.io/name"      = "cryptoverse"
      "app.kubernetes.io/component" = "secrets"
    }
  }
  
  data = {
    DATABASE_URL       = base64encode(var.database_url)
    JWT_SECRET         = base64encode(var.jwt_secret)
    TELEGRAM_BOT_TOKEN = base64encode(var.telegram_bot_token)
    TELEGRAM_BOT_ID    = base64encode(var.telegram_bot_id)
    REDIS_URL          = base64encode(var.redis_url)
  }
  
  type = "Opaque"
}

# ==========================================
# Output
# ==========================================

output "namespace" {
  description = "The namespace where CryptoVerse is deployed"
  value       = kubernetes_namespace.cryptoverse.metadata[0].name
}

output "configmap_name" {
  description = "The name of the ConfigMap"
  value       = kubernetes_config_map.cryptoverse_config.metadata[0].name
}

output "secret_name" {
  description = "The name of the Secret"
  value       = kubernetes_secret.cryptoverse_secrets.metadata[0].name
}