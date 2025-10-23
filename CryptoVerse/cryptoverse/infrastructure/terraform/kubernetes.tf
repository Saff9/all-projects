# ==========================================
# CryptoVerse Kubernetes Resources via Terraform
# ==========================================

# ==========================================
# API Deployment
# ==========================================

resource "kubernetes_deployment" "api" {
  metadata {
    name      = "cryptoverse-api"
    namespace = kubernetes_namespace.cryptoverse.metadata[0].name
    labels = {
      "app.kubernetes.io/name"      = "cryptoverse-api"
      "app.kubernetes.io/component" = "api"
      "app.kubernetes.io/part-of"   = "cryptoverse"
    }
  }
  
  spec {
    replicas = var.api_replicas
    
    selector {
      match_labels = {
        "app.kubernetes.io/name"      = "cryptoverse-api"
        "app.kubernetes.io/component" = "api"
      }
    }
    
    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_surge       = 1
        max_unavailable = 0
      }
    }
    
    template {
      metadata {
        labels = {
          "app.kubernetes.io/name"      = "cryptoverse-api"
          "app.kubernetes.io/component" = "api"
          "app.kubernetes.io/part-of"   = "cryptoverse"
        }
        annotations = {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "3001"
          "prometheus.io/path"   = "/metrics"
        }
      }
      
      spec {
        security_context {
          run_as_non_root = true
          run_as_user     = 1001
          run_as_group    = 1001
          fs_group        = 1001
        }
        
        container {
          name  = "api"
          image = var.api_image
          
          port {
            name           = "http"
            container_port = 3001
            protocol       = "TCP"
          }
          
          env_from {
            config_map_ref {
              name = kubernetes_config_map.cryptoverse_config.metadata[0].name
            }
          }
          
          env_from {
            secret_ref {
              name = kubernetes_secret.cryptoverse_secrets.metadata[0].name
            }
          }
          
          resources {
            requests = {
              cpu    = var.api_cpu_request
              memory = var.api_memory_request
            }
            limits = {
              cpu    = var.api_cpu_limit
              memory = var.api_memory_limit
            }
          }
          
          liveness_probe {
            http_get {
              path = "/api/health/live"
              port = "http"
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }
          
          readiness_probe {
            http_get {
              path = "/api/health/ready"
              port = "http"
            }
            initial_delay_seconds = 10
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 3
          }
          
          security_context {
            allow_privilege_escalation = false
            read_only_root_filesystem  = true
          }
          
          volume {
            name = "tmp"
            empty_dir {}
          }
        }
        
        volume {
          name = "tmp"
          empty_dir {}
        }
      }
    }
  }
}

# ==========================================
# API Service
# ==========================================

resource "kubernetes_service" "api" {
  metadata {
    name      = "cryptoverse-api-service"
    namespace = kubernetes_namespace.cryptoverse.metadata[0].name
    labels = {
      "app.kubernetes.io/name"      = "cryptoverse-api"
      "app.kubernetes.io/component" = "service"
    }
  }
  
  spec {
    type = "ClusterIP"
    
    selector = {
      "app.kubernetes.io/name"      = "cryptoverse-api"
      "app.kubernetes.io/component" = "api"
    }
    
    port {
      name        = "http"
      port        = 3001
      target_port = "http"
      protocol    = "TCP"
    }
  }
}

# ==========================================
# API Horizontal Pod Autoscaler
# ==========================================

resource "kubernetes_horizontal_pod_autoscaler_v2" "api" {
  metadata {
    name      = "cryptoverse-api-hpa"
    namespace = kubernetes_namespace.cryptoverse.metadata[0].name
    labels = {
      "app.kubernetes.io/name"      = "cryptoverse-api"
      "app.kubernetes.io/component" = "autoscaler"
    }
  }
  
  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.api.metadata[0].name
    }
    
    min_replicas = var.api_min_replicas
    max_replicas = var.api_max_replicas
    
    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type               = "Utilization"
          average_utilization = var.api_target_cpu_utilization
        }
      }
    }
    
    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type               = "Utilization"
          average_utilization = 80
        }
      }
    }
  }
}

# ==========================================
# Frontend Deployment
# ==========================================

resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "cryptoverse-frontend"
    namespace = kubernetes_namespace.cryptoverse.metadata[0].name
    labels = {
      "app.kubernetes.io/name"      = "cryptoverse-frontend"
      "app.kubernetes.io/component" = "frontend"
      "app.kubernetes.io/part-of"   = "cryptoverse"
    }
  }
  
  spec {
    replicas = var.frontend_replicas
    
    selector {
      match_labels = {
        "app.kubernetes.io/name"      = "cryptoverse-frontend"
        "app.kubernetes.io/component" = "frontend"
      }
    }
    
    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_surge       = 1
        max_unavailable = 0
      }
    }
    
    template {
      metadata {
        labels = {
          "app.kubernetes.io/name"      = "cryptoverse-frontend"
          "app.kubernetes.io/component" = "frontend"
          "app.kubernetes.io/part-of"   = "cryptoverse"
        }
      }
      
      spec {
        security_context {
          run_as_non_root = true
          run_as_user     = 1001
          run_as_group    = 1001
          fs_group        = 1001
        }
        
        container {
          name  = "frontend"
          image = var.frontend_image
          
          port {
            name           = "http"
            container_port = 3000
            protocol       = "TCP"
          }
          
          env {
            name  = "NEXT_PUBLIC_API_URL"
            value = var.tls_enabled ? "https://${var.api_subdomain}.${var.domain}" : "http://${var.api_subdomain}.${var.domain}"
          }
          
          resources {
            requests = {
              cpu    = var.frontend_cpu_request
              memory = var.frontend_memory_request
            }
            limits = {
              cpu    = var.frontend_cpu_limit
              memory = var.frontend_memory_limit
            }
          }
          
          liveness_probe {
            http_get {
              path = "/api/health"
              port = "http"
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }
          
          readiness_probe {
            http_get {
              path = "/api/health"
              port = "http"
            }
            initial_delay_seconds = 10
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 3
          }
          
          security_context {
            allow_privilege_escalation = false
            read_only_root_filesystem  = true
          }
          
          volume {
            name = "tmp"
            empty_dir {}
          }
        }
        
        volume {
          name = "tmp"
          empty_dir {}
        }
      }
    }
  }
}

# ==========================================
# Frontend Service
# ==========================================

resource "kubernetes_service" "frontend" {
  metadata {
    name      = "cryptoverse-frontend-service"
    namespace = kubernetes_namespace.cryptoverse.metadata[0].name
    labels = {
      "app.kubernetes.io/name"      = "cryptoverse-frontend"
      "app.kubernetes.io/component" = "service"
    }
  }
  
  spec {
    type = "ClusterIP"
    
    selector = {
      "app.kubernetes.io/name"      = "cryptoverse-frontend"
      "app.kubernetes.io/component" = "frontend"
    }
    
    port {
      name        = "http"
      port        = 3000
      target_port = "http"
      protocol    = "TCP"
    }
  }
}

# ==========================================
# Frontend Horizontal Pod Autoscaler
# ==========================================

resource "kubernetes_horizontal_pod_autoscaler_v2" "frontend" {
  metadata {
    name      = "cryptoverse-frontend-hpa"
    namespace = kubernetes_namespace.cryptoverse.metadata[0].name
    labels = {
      "app.kubernetes.io/name"      = "cryptoverse-frontend"
      "app.kubernetes.io/component" = "autoscaler"
    }
  }
  
  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.frontend.metadata[0].name
    }
    
    min_replicas = var.frontend_min_replicas
    max_replicas = var.frontend_max_replicas
    
    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type               = "Utilization"
          average_utilization = 70
        }
      }
    }
  }
}