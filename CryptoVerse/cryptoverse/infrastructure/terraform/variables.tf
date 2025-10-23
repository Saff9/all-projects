# ==========================================
# CryptoVerse Terraform Variables
# ==========================================

# ==========================================
# General Configuration
# ==========================================

variable "environment" {
  description = "Deployment environment (staging, production)"
  type        = string
  default     = "staging"
  
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "namespace" {
  description = "Kubernetes namespace for CryptoVerse"
  type        = string
  default     = "cryptoverse"
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "cryptoverse"
}

# ==========================================
# API Configuration
# ==========================================

variable "api_image" {
  description = "Docker image for the API"
  type        = string
  default     = "cryptoverse/api:latest"
}

variable "api_replicas" {
  description = "Number of API replicas"
  type        = number
  default     = 3
}

variable "api_cpu_request" {
  description = "CPU request for API pods"
  type        = string
  default     = "250m"
}

variable "api_cpu_limit" {
  description = "CPU limit for API pods"
  type        = string
  default     = "500m"
}

variable "api_memory_request" {
  description = "Memory request for API pods"
  type        = string
  default     = "256Mi"
}

variable "api_memory_limit" {
  description = "Memory limit for API pods"
  type        = string
  default     = "512Mi"
}

variable "api_min_replicas" {
  description = "Minimum replicas for API HPA"
  type        = number
  default     = 3
}

variable "api_max_replicas" {
  description = "Maximum replicas for API HPA"
  type        = number
  default     = 10
}

variable "api_target_cpu_utilization" {
  description = "Target CPU utilization for API HPA"
  type        = number
  default     = 70
}

# ==========================================
# Frontend Configuration
# ==========================================

variable "frontend_image" {
  description = "Docker image for the Frontend"
  type        = string
  default     = "cryptoverse/frontend:latest"
}

variable "frontend_replicas" {
  description = "Number of Frontend replicas"
  type        = number
  default     = 2
}

variable "frontend_cpu_request" {
  description = "CPU request for Frontend pods"
  type        = string
  default     = "100m"
}

variable "frontend_cpu_limit" {
  description = "CPU limit for Frontend pods"
  type        = string
  default     = "250m"
}

variable "frontend_memory_request" {
  description = "Memory request for Frontend pods"
  type        = string
  default     = "128Mi"
}

variable "frontend_memory_limit" {
  description = "Memory limit for Frontend pods"
  type        = string
  default     = "256Mi"
}

variable "frontend_min_replicas" {
  description = "Minimum replicas for Frontend HPA"
  type        = number
  default     = 2
}

variable "frontend_max_replicas" {
  description = "Maximum replicas for Frontend HPA"
  type        = number
  default     = 5
}

# ==========================================
# Database Configuration
# ==========================================

variable "database_url" {
  description = "PostgreSQL connection URL"
  type        = string
  sensitive   = true
}

variable "postgres_storage_size" {
  description = "Storage size for PostgreSQL"
  type        = string
  default     = "20Gi"
}

variable "postgres_cpu_request" {
  description = "CPU request for PostgreSQL"
  type        = string
  default     = "250m"
}

variable "postgres_memory_request" {
  description = "Memory request for PostgreSQL"
  type        = string
  default     = "512Mi"
}

variable "postgres_cpu_limit" {
  description = "CPU limit for PostgreSQL"
  type        = string
  default     = "1000m"
}

variable "postgres_memory_limit" {
  description = "Memory limit for PostgreSQL"
  type        = string
  default     = "1Gi"
}

variable "use_managed_database" {
  description = "Use managed database service instead of self-hosted"
  type        = bool
  default     = false
}

# ==========================================
# Redis Configuration
# ==========================================

variable "redis_url" {
  description = "Redis connection URL"
  type        = string
  sensitive   = true
}

variable "redis_storage_size" {
  description = "Storage size for Redis"
  type        = string
  default     = "5Gi"
}

variable "redis_cpu_request" {
  description = "CPU request for Redis"
  type        = string
  default     = "100m"
}

variable "redis_memory_request" {
  description = "Memory request for Redis"
  type        = string
  default     = "128Mi"
}

variable "redis_cpu_limit" {
  description = "CPU limit for Redis"
  type        = string
  default     = "500m"
}

variable "redis_memory_limit" {
  description = "Memory limit for Redis"
  type        = string
  default     = "512Mi"
}

variable "use_managed_redis" {
  description = "Use managed Redis service instead of self-hosted"
  type        = bool
  default     = false
}

# ==========================================
# Authentication Configuration
# ==========================================

variable "jwt_secret" {
  description = "JWT secret key for authentication"
  type        = string
  sensitive   = true
}

variable "jwt_expiration" {
  description = "JWT token expiration time"
  type        = string
  default     = "7d"
}

# ==========================================
# Telegram Configuration
# ==========================================

variable "telegram_bot_token" {
  description = "Telegram Bot Token"
  type        = string
  sensitive   = true
}

variable "telegram_bot_id" {
  description = "Telegram Bot ID"
  type        = string
  sensitive   = true
}

# ==========================================
# Ingress Configuration
# ==========================================

variable "domain" {
  description = "Main domain for the application"
  type        = string
  default     = "cryptoverse.example.com"
}

variable "api_subdomain" {
  description = "Subdomain for the API"
  type        = string
  default     = "api"
}

variable "tls_enabled" {
  description = "Enable TLS for ingress"
  type        = bool
  default     = true
}

variable "tls_secret_name" {
  description = "Name of the TLS secret"
  type        = string
  default     = "cryptoverse-tls"
}

variable "cert_manager_issuer" {
  description = "Cert-manager cluster issuer name"
  type        = string
  default     = "letsencrypt-prod"
}

variable "use_cert_manager" {
  description = "Use cert-manager for TLS certificates"
  type        = bool
  default     = true
}

# ==========================================
# CORS Configuration
# ==========================================

variable "cors_origin" {
  description = "Allowed CORS origins"
  type        = string
  default     = "*"
}

# ==========================================
# Logging Configuration
# ==========================================

variable "log_level" {
  description = "Log level (debug, info, warn, error)"
  type        = string
  default     = "info"
  
  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.log_level)
    error_message = "Log level must be one of: debug, info, warn, error."
  }
}

# ==========================================
# Monitoring Configuration
# ==========================================

variable "enable_monitoring" {
  description = "Enable Prometheus monitoring"
  type        = bool
  default     = true
}

variable "prometheus_namespace" {
  description = "Namespace where Prometheus is deployed"
  type        = string
  default     = "monitoring"
}

variable "grafana_namespace" {
  description = "Namespace where Grafana is deployed"
  type        = string
  default     = "monitoring"
}

# ==========================================
# Resource Tags
# ==========================================

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}