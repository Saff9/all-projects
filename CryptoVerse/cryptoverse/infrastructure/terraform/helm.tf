# ==========================================
# CryptoVerse Helm Releases
# ==========================================

# ==========================================
# NGINX Ingress Controller
# ==========================================

resource "helm_release" "nginx_ingress" {
  count = var.enable_monitoring ? 1 : 0
  
  name       = "nginx-ingress"
  namespace  = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  version    = "4.8.3"
  
  create_namespace = true
  
  set {
    name  = "controller.service.type"
    value = "LoadBalancer"
  }
  
  set {
    name  = "controller.replicaCount"
    value = "2"
  }
  
  set {
    name  = "controller.resources.requests.cpu"
    value = "100m"
  }
  
  set {
    name  = "controller.resources.requests.memory"
    value = "128Mi"
  }
  
  set {
    name  = "controller.resources.limits.cpu"
    value = "500m"
  }
  
  set {
    name  = "controller.resources.limits.memory"
    value = "512Mi"
  }
  
  set {
    name  = "controller.config.proxy-body-size"
    value = "10m"
  }
  
  set {
    name  = "controller.config.proxy-connect-timeout"
    value = "15"
  }
  
  set {
    name  = "controller.config.proxy-read-timeout"
    value = "60"
  }
  
  set {
    name  = "controller.config.proxy-send-timeout"
    value = "60"
  }
}

# ==========================================
# cert-manager
# ==========================================

resource "helm_release" "cert_manager" {
  count = var.use_cert_manager ? 1 : 0
  
  name       = "cert-manager"
  namespace  = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  version    = "1.13.2"
  
  create_namespace = true
  
  set {
    name  = "installCRDs"
    value = "true"
  }
  
  set {
    name  = "replicaCount"
    value = "2"
  }
  
  set {
    name  = "resources.requests.cpu"
    value = "50m"
  }
  
  set {
    name  = "resources.requests.memory"
    value = "64Mi"
  }
  
  set {
    name  = "resources.limits.cpu"
    value = "200m"
  }
  
  set {
    name  = "resources.limits.memory"
    value = "256Mi"
  }
}

# ==========================================
# Prometheus Stack (Monitoring)
# ==========================================

resource "helm_release" "prometheus_stack" {
  count = var.enable_monitoring ? 1 : 0
  
  name       = "prometheus-stack"
  namespace  = var.prometheus_namespace
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "52.0.0"
  
  create_namespace = true
  
  # Prometheus configuration
  set {
    name  = "prometheus.prometheusSpec.replicas"
    value = "1"
  }
  
  set {
    name  = "prometheus.prometheusSpec.retention"
    value = "15d"
  }
  
  set {
    name  = "prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage"
    value = "50Gi"
  }
  
  # Grafana configuration
  set {
    name  = "grafana.replicas"
    value = "1"
  }
  
  set {
    name  = "grafana.persistence.enabled"
    value = "true"
  }
  
  set {
    name  = "grafana.persistence.size"
    value = "10Gi"
  }
  
  set {
    name  = "grafana.adminPassword"
    value = "admin"  # Change this in production!
  }
  
  # Alertmanager configuration
  set {
    name  = "alertmanager.alertmanagerSpec.replicas"
    value = "1"
  }
  
  # Disable components we don't need
  set {
    name  = "kubeStateMetrics.enabled"
    value = "true"
  }
  
  set {
    name  = "nodeExporter.enabled"
    value = "true"
  }
  
  values = [
    <<-EOT
      prometheus:
        prometheusSpec:
          serviceMonitorSelectorNilUsesHelmValues: false
          podMonitorSelectorNilUsesHelmValues: false
          additionalScrapeConfigs:
            - job_name: 'cryptoverse-api'
              kubernetes_sd_configs:
                - role: pod
                  namespaces:
                    names:
                      - ${var.namespace}
              relabel_configs:
                - source_labels: [__meta_kubernetes_pod_label_app_kubernetes_io_name]
                  action: keep
                  regex: cryptoverse-api
                - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
                  action: keep
                  regex: true
                - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
                  action: replace
                  target_label: __metrics_path__
                  regex: (.+)
                - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
                  action: replace
                  regex: ([^:]+)(?::\d+)?;(\d+)
                  replacement: $1:$2
                  target_label: __address__
      grafana:
        dashboards:
          default:
            cryptoverse:
              file: dashboards/cryptoverse.json
        dashboardProviders:
          dashboardproviders.yaml:
            apiVersion: 1
            providers:
              - name: 'default'
                orgId: 1
                folder: ''
                type: file
                disableDeletion: false
                editable: true
                options:
                  path: /var/lib/grafana/dashboards/default
    EOT
  ]
  
  depends_on = [
    kubernetes_namespace.cryptoverse
  ]
}

# ==========================================
# Redis (Optional - using Helm instead of manifests)
# ==========================================

resource "helm_release" "redis" {
  count = !var.use_managed_redis ? 1 : 0
  
  name       = "redis"
  namespace  = kubernetes_namespace.cryptoverse.metadata[0].name
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "redis"
  version    = "18.0.0"
  
  set {
    name  = "architecture"
    value = "standalone"
  }
  
  set {
    name  = "auth.enabled"
    value = "false"
  }
  
  set {
    name  = "master.resources.requests.cpu"
    value = var.redis_cpu_request
  }
  
  set {
    name  = "master.resources.requests.memory"
    value = var.redis_memory_request
  }
  
  set {
    name  = "master.resources.limits.cpu"
    value = var.redis_cpu_limit
  }
  
  set {
    name  = "master.resources.limits.memory"
    value = var.redis_memory_limit
  }
  
  set {
    name  = "master.persistence.size"
    value = var.redis_storage_size
  }
  
  set {
    name  = "metrics.enabled"
    value = "true"
  }
  
  depends_on = [
    kubernetes_namespace.cryptoverse
  ]
}

# ==========================================
# PostgreSQL (Optional - using Helm instead of manifests)
# ==========================================

resource "helm_release" "postgresql" {
  count = !var.use_managed_database ? 1 : 0
  
  name       = "postgresql"
  namespace  = kubernetes_namespace.cryptoverse.metadata[0].name
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = "13.0.0"
  
  set {
    name  = "architecture"
    value = "standalone"
  }
  
  set {
    name  = "auth.database"
    value = "cryptoverse"
  }
  
  set {
    name  = "auth.username"
    value = "cryptoverse_user"
  }
  
  set {
    name  = "auth.password"
    value = "change-me-in-production"
  }
  
  set {
    name  = "primary.resources.requests.cpu"
    value = var.postgres_cpu_request
  }
  
  set {
    name  = "primary.resources.requests.memory"
    value = var.postgres_memory_request
  }
  
  set {
    name  = "primary.resources.limits.cpu"
    value = var.postgres_cpu_limit
  }
  
  set {
    name  = "primary.resources.limits.memory"
    value = var.postgres_memory_limit
  }
  
  set {
    name  = "primary.persistence.size"
    value = var.postgres_storage_size
  }
  
  set {
    name  = "metrics.enabled"
    value = "true"
  }
  
  depends_on = [
    kubernetes_namespace.cryptoverse
  ]
}