# ==========================================
# CryptoVerse Terraform Outputs
# ==========================================

# ==========================================
# Namespace Outputs
# ==========================================

output "namespace_name" {
  description = "Name of the created namespace"
  value       = kubernetes_namespace.cryptoverse.metadata[0].name
}

# ==========================================
# API Outputs
# ==========================================

output "api_deployment_name" {
  description = "Name of the API deployment"
  value       = "cryptoverse-api"
}

output "api_service_name" {
  description = "Name of the API service"
  value       = "cryptoverse-api-service"
}

output "api_service_url" {
  description = "Internal URL for the API service"
  value       = "http://cryptoverse-api-service.${var.namespace}.svc.cluster.local:3001"
}

# ==========================================
# Frontend Outputs
# ==========================================

output "frontend_deployment_name" {
  description = "Name of the Frontend deployment"
  value       = "cryptoverse-frontend"
}

output "frontend_service_name" {
  description = "Name of the Frontend service"
  value       = "cryptoverse-frontend-service"
}

output "frontend_service_url" {
  description = "Internal URL for the Frontend service"
  value       = "http://cryptoverse-frontend-service.${var.namespace}.svc.cluster.local:3000"
}

# ==========================================
# Database Outputs
# ==========================================

output "postgres_service_name" {
  description = "Name of the PostgreSQL service"
  value       = var.use_managed_database ? "managed-postgres" : "postgres-service"
}

output "postgres_service_url" {
  description = "Internal URL for the PostgreSQL service"
  value       = var.use_managed_database ? "External managed database" : "postgres-service.${var.namespace}.svc.cluster.local:5432"
}

# ==========================================
# Redis Outputs
# ==========================================

output "redis_service_name" {
  description = "Name of the Redis service"
  value       = var.use_managed_redis ? "managed-redis" : "redis-service"
}

output "redis_service_url" {
  description = "Internal URL for the Redis service"
  value       = var.use_managed_redis ? "External managed Redis" : "redis-service.${var.namespace}.svc.cluster.local:6379"
}

# ==========================================
# Ingress Outputs
# ==========================================

output "frontend_url" {
  description = "Public URL for the frontend"
  value       = var.tls_enabled ? "https://${var.domain}" : "http://${var.domain}"
}

output "api_url" {
  description = "Public URL for the API"
  value       = var.tls_enabled ? "https://${var.api_subdomain}.${var.domain}" : "http://${var.api_subdomain}.${var.domain}"
}

# ==========================================
# ConfigMap and Secret Outputs
# ==========================================

output "configmap_name" {
  description = "Name of the ConfigMap"
  value       = kubernetes_config_map.cryptoverse_config.metadata[0].name
}

output "secret_name" {
  description = "Name of the Secret"
  value       = kubernetes_secret.cryptoverse_secrets.metadata[0].name
}

# ==========================================
# Monitoring Outputs
# ==========================================

output "grafana_dashboard_url" {
  description = "URL for Grafana dashboard (if monitoring is enabled)"
  value       = var.enable_monitoring ? "http://grafana.${var.grafana_namespace}.svc.cluster.local:80" : "Monitoring not enabled"
}

# ==========================================
# Deployment Commands
# ==========================================

output "kubectl_commands" {
  description = "Useful kubectl commands"
  value = <<-EOT
    # Get all resources in namespace
    kubectl get all -n ${var.namespace}
    
    # View API logs
    kubectl logs -f deployment/cryptoverse-api -n ${var.namespace}
    
    # View Frontend logs
    kubectl logs -f deployment/cryptoverse-frontend -n ${var.namespace}
    
    # Port forward API locally
    kubectl port-forward svc/cryptoverse-api-service 3001:3001 -n ${var.namespace}
    
    # Port forward Frontend locally
    kubectl port-forward svc/cryptoverse-frontend-service 3000:3000 -n ${var.namespace}
    
    # Check deployment status
    kubectl rollout status deployment/cryptoverse-api -n ${var.namespace}
    kubectl rollout status deployment/cryptoverse-frontend -n ${var.namespace}
  EOT
}

# ==========================================
# Connection Information
# ==========================================

output "connection_info" {
  description = "Connection information summary"
  value = {
    environment     = var.environment
    namespace       = var.namespace
    frontend_url    = var.tls_enabled ? "https://${var.domain}" : "http://${var.domain}"
    api_url         = var.tls_enabled ? "https://${var.api_subdomain}.${var.domain}" : "http://${var.api_subdomain}.${var.domain}"
    api_replicas    = var.api_replicas
    frontend_replicas = var.frontend_replicas
  }
}