# Monitoring Dashboard Guide

## Overview

This guide provides comprehensive monitoring setup and configuration for the SecureVibe authentication service.

## Key Metrics to Monitor

### Application Metrics

| Metric | Type | Threshold | Description |
|--------|------|-----------|-------------|
| `http_requests_total` | Counter | - | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | p95 < 500ms | Request duration |
| `http_requests_in_flight` | Gauge | < 1000 | Concurrent requests |
| `http_request_errors_total` | Counter | < 1% | Failed requests |
| `auth_success_total` | Counter | - | Successful authentications |
| `auth_failure_total` | Counter | < 5% | Failed authentications |
| `mfa_success_total` | Counter | - | Successful MFA attempts |
| `mfa_failure_total` | Counter | < 10% | Failed MFA attempts |

### Database Metrics

| Metric | Type | Threshold | Description |
|--------|------|-----------|-------------|
| `db_connections_active` | Gauge | < 80% of max | Active DB connections |
| `db_connections_idle` | Gauge | < 50 | Idle connections |
| `db_query_duration_seconds` | Histogram | p95 < 100ms | Query duration |
| `db_slow_queries_total` | Counter | < 10/min | Slow queries (>100ms) |
| `db_transactions_total` | Counter | - | Total transactions |
| `db_transaction_errors_total` | Counter | < 1% | Failed transactions |

### Cache Metrics

| Metric | Type | Threshold | Description |
|--------|------|-----------|-------------|
| `cache_hits_total` | Counter | - | Cache hits |
| `cache_misses_total` | Counter | < 20% | Cache misses |
| `cache_hit_ratio` | Gauge | > 80% | Cache hit ratio |
| `cache_size_bytes` | Gauge | < 1GB | Cache size |
| `cache_evictions_total` | Counter | < 100/min | Cache evictions |

### System Metrics

| Metric | Type | Threshold | Description |
|--------|------|-----------|-------------|
| `process_cpu_usage` | Gauge | < 70% | CPU usage |
| `process_memory_usage_bytes` | Gauge | < 2GB | Memory usage |
| `process_memory_heap_used_bytes` | Gauge | < 1.5GB | Heap memory |
| `process_memory_heap_total_bytes` | Gauge | < 2GB | Total heap |
| `process_gc_duration_seconds` | Histogram | p95 < 100ms | GC duration |
| `process_event_loop_lag_seconds` | Gauge | < 100ms | Event loop lag |

### Business Metrics

| Metric | Type | Threshold | Description |
|--------|------|-----------|-------------|
| `active_users` | Gauge | - | Active users |
| `new_registrations_total` | Counter | - | New registrations |
| `login_attempts_total` | Counter | - | Login attempts |
| `password_resets_total` | Counter | - | Password resets |
| `mfa_enabled_users` | Gauge | > 80% | Users with MFA enabled |

## Alert Thresholds

### Critical Alerts

```yaml
# Critical alerts - immediate action required
alerts:
  - name: HighErrorRate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    action: Investigate immediately
    
  - name: DatabaseDown
    condition: db_up == 0
    duration: 1m
    severity: critical
    action: Check database connectivity
    
  - name: HighMemoryUsage
    condition: memory_usage > 90%
    duration: 5m
    severity: critical
    action: Check for memory leaks
    
  - name: HighCPUUsage
    condition: cpu_usage > 90%
    duration: 10m
    severity: critical
    action: Scale up or investigate
    
  - name: ServiceDown
    condition: service_up == 0
    duration: 1m
    severity: critical
    action: Restart service
```

### Warning Alerts

```yaml
# Warning alerts - investigate soon
alerts:
  - name: ElevatedErrorRate
    condition: error_rate > 1%
    duration: 10m
    severity: warning
    action: Monitor closely
    
  - name: SlowResponseTime
    condition: p95_latency > 1s
    duration: 10m
    severity: warning
    action: Investigate performance
    
  - name: LowCacheHitRatio
    condition: cache_hit_ratio < 70%
    duration: 15m
    severity: warning
    action: Review cache strategy
    
  - name: HighConnectionCount
    condition: db_connections > 80%
    duration: 10m
    severity: warning
    action: Review connection pool
```

### Info Alerts

```yaml
# Info alerts - informational
alerts:
  - name: DeploymentComplete
    condition: deployment_status == "success"
    severity: info
    action: Verify deployment
    
  - name: BackupComplete
    condition: backup_status == "success"
    severity: info
    action: Verify backup
    
  - name: ScalingEvent
    condition: replica_count_changed
    severity: info
    action: Review scaling
```

## Grafana Dashboard Setup

### 1. Install Grafana

```bash
# Using Helm
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set persistence.enabled=true \
  --set persistence.size=10Gi \
  --set adminPassword=securevibe123
```

### 2. Configure Prometheus Data Source

```yaml
# prometheus-datasource.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: monitoring
data:
  datasources.yaml: |
    apiVersion: 1
    datasources:
      - name: Prometheus
        type: prometheus
        url: http://prometheus:9090
        access: proxy
        isDefault: true
        editable: true
```

### 3. Create Dashboard

```json
{
  "dashboard": {
    "title": "SecureVibe Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{path}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_errors_total[5m])",
            "legendFormat": "Errors"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p95"
          }
        ]
      },
      {
        "title": "Active Connections",
        "type": "stat",
        "targets": [
          {
            "expr": "db_connections_active",
            "legendFormat": "Active"
          }
        ]
      },
      {
        "title": "Cache Hit Ratio",
        "type": "gauge",
        "targets": [
          {
            "expr": "cache_hit_ratio",
            "legendFormat": "Hit Ratio"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "process_memory_usage_bytes / 1024 / 1024 / 1024",
            "legendFormat": "GB"
          }
        ]
      },
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "process_cpu_usage * 100",
            "legendFormat": "%"
          }
        ]
      },
      {
        "title": "Event Loop Lag",
        "type": "graph",
        "targets": [
          {
            "expr": "process_event_loop_lag_seconds * 1000",
            "legendFormat": "ms"
          }
        ]
      }
    ]
  }
}
```

### 4. Import Dashboard

```bash
# Using Grafana CLI
grafana-cli admin import-dashboard \
  --config /etc/grafana/grafana.ini \
  --dashboard securevibe-dashboard.json

# Or via API
curl -X POST \
  http://admin:securevibe123@grafana:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @securevibe-dashboard.json
```

## Log Aggregation (ELK/Loki)

### 1. Install Loki

```bash
# Using Helm
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set loki.persistence.enabled=true \
  --set loki.persistence.size=20Gi
```

### 2. Configure Promtail

```yaml
# promtail-config.yaml
server:
  http_listen_port: 9080

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: securevibe
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: securevibe
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: pod
      - source_labels: [__meta_kubernetes_namespace]
        target_label: namespace
```

### 3. Log Queries

```logql
# Error logs
{app="securevibe", level="error"} |= "error"

# Slow requests
{app="securevibe"} |= "duration" | duration > 1000

# Authentication failures
{app="securevibe"} |= "auth" |= "failed"

# Database errors
{app="securevibe"} |= "database" |= "error"

# Rate of errors
rate({app="securevibe", level="error"}[5m])

# Top error messages
topk(10, count_over_time({app="securevibe", level="error"}[1h]))
```

## APM Setup (Datadog/New Relic)

### Datadog Setup

```javascript
// securevibe/server.js
const tracer = require('dd-trace').init({
  service: 'securevibe',
  env: process.env.NODE_ENV,
  logInjection: true,
  analytics: true,
  runtimeMetrics: true
});

// Enable distributed tracing
tracer.use('express', {
  hooks: {
    request: (span, req) => {
      span.setTag('user.id', req.user?.id);
      span.setTag('user.email', req.user?.email);
    }
  }
});
```

```yaml
# datadog.yaml
api_key: ${DATADOG_API_KEY}
site: datadoghq.com
logs:
  enabled: true
tracing:
  enabled: true
  analytics_enabled: true
process:
  enabled: true
  container_collection:
    enabled: true
```

### New Relic Setup

```javascript
// securevibe/server.js
const newrelic = require('newrelic');

// Custom instrumentation
newrelic.setTransactionName('auth-login');
newrelic.addCustomAttribute('userId', user.id);
newrelic.addCustomAttribute('authMethod', 'password');

// Error tracking
newrelic.noticeError(error, {
  userId: user.id,
  endpoint: req.path,
  method: req.method
});
```

```yaml
# newrelic.yml
app_name: SecureVibe
license_key: ${NEW_RELIC_LICENSE_KEY}
log_level: info
high_security: false
attributes:
  include:
    - request.headers.*
    - request.parameters.*
    - response.headers.*
```

## Custom Metrics

### 1. Business Metrics

```javascript
// securevibe/utils/metrics.js
const promClient = require('prom-client');

// Business metrics
const businessMetrics = {
  activeUsers: new promClient.Gauge({
    name: 'active_users',
    help: 'Number of active users',
    labelNames: ['tenant']
  }),
  
  newRegistrations: new promClient.Counter({
    name: 'new_registrations_total',
    help: 'Total new registrations',
    labelNames: ['tenant', 'method']
  }),
  
  loginAttempts: new promClient.Counter({
    name: 'login_attempts_total',
    help: 'Total login attempts',
    labelNames: ['tenant', 'method', 'status']
  }),
  
  mfaEnabledUsers: new promClient.Gauge({
    name: 'mfa_enabled_users',
    help: 'Number of users with MFA enabled',
    labelNames: ['tenant']
  })
};

// Update metrics
function updateBusinessMetrics() {
  const tenants = await Tenant.find({});
  
  for (const tenant of tenants) {
    const activeUsers = await User.count({
      tenant: tenant.id,
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const mfaEnabled = await User.count({
      tenant: tenant.id,
      mfaEnabled: true
    });
    
    businessMetrics.activeUsers.set({ tenant: tenant.id }, activeUsers);
    businessMetrics.mfaEnabledUsers.set({ tenant: tenant.id }, mfaEnabled);
  }
}

// Schedule updates
setInterval(updateBusinessMetrics, 60000); // Every minute
```

### 2. Security Metrics

```javascript
// Security metrics
const securityMetrics = {
  failedAuthAttempts: new promClient.Counter({
    name: 'failed_auth_attempts_total',
    help: 'Total failed authentication attempts',
    labelNames: ['tenant', 'ip', 'method']
  }),
  
  suspiciousActivity: new promClient.Counter({
    name: 'suspicious_activity_total',
    help: 'Total suspicious activity detected',
    labelNames: ['tenant', 'type']
  }),
  
  blockedRequests: new promClient.Counter({
    name: 'blocked_requests_total',
    help: 'Total blocked requests',
    labelNames: ['tenant', 'reason']
  }),
  
  rateLimitExceeded: new promClient.Counter({
    name: 'rate_limit_exceeded_total',
    help: 'Total rate limit exceeded',
    labelNames: ['tenant', 'endpoint']
  })
};
```

## Alerting

### 1. Alertmanager Configuration

```yaml
# alertmanager.yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
      
    - match:
        severity: warning
      receiver: 'slack'
      
    - match:
        severity: info
      receiver: 'email'

receivers:
  - name: 'default'
    email_configs:
      - to: 'team@securevibe.com'
        from: 'alerts@securevibe.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@securevibe.com'
        auth_password: '${SMTP_PASSWORD}'
        
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
        
  - name: 'slack'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts'
        title: 'SecureVibe Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
        
  - name: 'email'
    email_configs:
      - to: 'oncall@securevibe.com'
        from: 'alerts@securevibe.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@securevibe.com'
        auth_password: '${SMTP_PASSWORD}'
```

### 2. Alert Rules

```yaml
# alert-rules.yaml
groups:
  - name: securevibe_alerts
    interval: 30s
    rules:
      # Critical alerts
      - alert: HighErrorRate
        expr: rate(http_request_errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
          
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL database is not responding"
          
      - alert: HighMemoryUsage
        expr: process_memory_usage_bytes / process_memory_heap_total_bytes > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
          
      # Warning alerts
      - alert: ElevatedErrorRate
        expr: rate(http_request_errors_total[5m]) > 0.01
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Elevated error rate"
          description: "Error rate is {{ $value | humanizePercentage }}"
          
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow response time"
          description: "p95 latency is {{ $value }}s"
          
      - alert: LowCacheHitRatio
        expr: cache_hit_ratio < 0.7
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Low cache hit ratio"
          description: "Cache hit ratio is {{ $value | humanizePercentage }}"
```

## Dashboard Panels

### 1. Overview Dashboard

```json
{
  "title": "SecureVibe Overview",
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8},
      "targets": [
        {
          "expr": "rate(http_requests_total[5m])",
          "legendFormat": "{{method}} {{path}}"
        }
      ]
    },
    {
      "title": "Error Rate",
      "type": "graph",
      "gridPos": {"x": 12, "y": 0, "w": 12, "h": 8},
      "targets": [
        {
          "expr": "rate(http_request_errors_total[5m])",
          "legendFormat": "Errors"
        }
      ]
    },
    {
      "title": "Response Time",
      "type": "graph",
      "gridPos": {"x": 0, "y": 8, "w": 12, "h": 8},
      "targets": [
        {
          "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
          "legendFormat": "p50"
        },
        {
          "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
          "legendFormat": "p95"
        },
        {
          "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))",
          "legendFormat": "p99"
        }
      ]
    },
    {
      "title": "Active Users",
      "type": "stat",
      "gridPos": {"x": 12, "y": 8, "w": 6, "h": 8},
      "targets": [
        {
          "expr": "active_users",
          "legendFormat": "Active Users"
        }
      ]
    },
    {
      "title": "Cache Hit Ratio",
      "type": "gauge",
      "gridPos": {"x": 18, "y": 8, "w": 6, "h": 8},
      "targets": [
        {
          "expr": "cache_hit_ratio * 100",
          "legendFormat": "%"
        }
      ]
    }
  ]
}
```

### 2. Database Dashboard

```json
{
  "title": "Database Performance",
  "panels": [
    {
      "title": "Active Connections",
      "type": "graph",
      "targets": [
        {
          "expr": "db_connections_active",
          "legendFormat": "Active"
        },
        {
          "expr": "db_connections_idle",
          "legendFormat": "Idle"
        }
      ]
    },
    {
      "title": "Query Duration",
      "type": "graph",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m]))",
          "legendFormat": "p95"
        }
      ]
    },
    {
      "title": "Slow Queries",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(db_slow_queries_total[5m])",
          "legendFormat": "Slow Queries/min"
        }
      ]
    }
  ]
}
```

## Monitoring Best Practices

### 1. Alert Fatigue Prevention

- Set appropriate thresholds
- Use alert grouping
- Implement alert suppression during maintenance
- Review and tune alerts regularly
- Use severity levels appropriately

### 2. Dashboard Organization

- Create role-specific dashboards
- Use consistent naming conventions
- Include context and descriptions
- Set appropriate time ranges
- Use annotations for events

### 3. Log Management

- Use structured logging
- Include correlation IDs
- Log at appropriate levels
- Rotate logs regularly
- Archive old logs

### 4. Performance Monitoring

- Monitor key business metrics
- Track SLA compliance
- Monitor resource utilization
- Track capacity planning
- Monitor cost metrics

## Related Documentation

- [Incident Response Runbook](./runbooks/incident-response.md)
- [Performance Tuning Runbook](./runbooks/performance-tuning.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
