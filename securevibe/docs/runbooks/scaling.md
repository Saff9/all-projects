# Scaling Runbook

## Overview

This runbook provides procedures for scaling the SecureVibe authentication service to handle increased load.

## Scaling Triggers

Scale up when:
- CPU usage > 70% for 10 minutes
- Memory usage > 80% for 10 minutes
- Response time > 500ms (p95) for 5 minutes
- Error rate > 5% for 5 minutes
- Queue depth > 1000
- Active connections > 80% of pool

Scale down when:
- CPU usage < 30% for 30 minutes
- Memory usage < 40% for 30 minutes
- Response time < 100ms (p95) for 30 minutes
- Queue depth < 100
- Active connections < 20% of pool

## Pre-Scaling Checklist

- [ ] Verify scaling triggers
- [ ] Check resource availability
- [ ] Review cost implications
- [ ] Notify stakeholders
- [ ] Document scaling action

## Scaling Procedures

### Option 1: Kubernetes Horizontal Pod Autoscaler (HPA)

```bash
# 1. Check current HPA status
kubectl get hpa securevibe

# 2. Adjust HPA if needed
kubectl autoscale deployment securevibe \
  --min=2 \
  --max=10 \
  --cpu-percent=70 \
  --memory-percent=80

# 3. Monitor scaling
kubectl get hpa securevibe --watch
```

### Option 2: Manual Scaling

```bash
# Scale up
kubectl scale deployment securevibe --replicas=6

# Scale down
kubectl scale deployment securevibe --replicas=2

# Monitor scaling
kubectl rollout status deployment/securevibe
```

### Option 3: Vertical Scaling (Resource Limits)

```bash
# Increase resource limits
kubectl set resources deployment securevibe \
  --limits=cpu=2,memory=4Gi \
  --requests=cpu=1,memory=2Gi

# Verify new limits
kubectl describe deployment securevibe | grep -A 10 Resources
```

### Option 4: Database Scaling

```bash
# Scale RDS instance
aws rds modify-db-instance \
  --db-instance-identifier securevibe-db \
  --db-instance-class db.r6g.xlarge \
  --apply-immediately

# Scale connection pool
# Update config/database.js
module.exports = {
  pool: {
    min: 10,
    max: 50  // Increased from 20
  }
};
```

### Option 5: Redis Scaling

```bash
# Scale ElastiCache cluster
aws elasticache modify-replication-group \
  --replication-group-id securevibe-redis \
  --node-type cache.r6g.large \
  --num-cache-nodes 3 \
  --apply-immediately

# Update Redis configuration
# Update config/redis.js
module.exports = {
  maxmemory: '4gb',
  maxmemory-policy: 'allkeys-lru'
};
```

## Scaling Strategies

### Predictive Scaling

```bash
# Monitor trends
# Use Grafana to identify patterns
# Look for daily/weekly peaks

# Schedule scaling
# Use Kubernetes CronHPA for scheduled scaling
apiVersion: autoscaling/v2
kind: CronHorizontalPodAutoscaler
metadata:
  name: securevibe-cron-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: securevibe
  jobs:
    - name: scale-up-morning
      schedule: "0 8 * * 1-5"  # 8 AM weekdays
      targetReplicas: 6
    - name: scale-down-evening
      schedule: "0 20 * * 1-5"  # 8 PM weekdays
      targetReplicas: 2
```

### Event-Based Scaling

```bash
# Scale for events
# Marketing campaigns
# Product launches
# Peak traffic periods

# Example: Scale up before campaign
kubectl scale deployment securevibe --replicas=8
# Schedule scale down after campaign
kubectl scale deployment securevibe --replicas=2
```

## Post-Scaling Verification

### 1. Health Checks

```bash
# Verify all pods healthy
kubectl get pods -l app=securevibe

# Check health endpoints
curl https://api.securevibe.com/health/deep
```

### 2. Performance Metrics

- [ ] CPU usage within target range
- [ ] Memory usage within target range
- [ ] Response time < 200ms (p95)
- [ ] Error rate < 1%
- [ ] Queue depth normalized

### 3. Load Distribution

```bash
# Check load balancer
kubectl get svc securevibe

# Verify endpoints
kubectl get endpoints securevibe

# Check pod distribution
kubectl top pods -l app=securevibe
```

## Scaling Scenarios

### Scenario 1: Sudden Traffic Spike

**Symptoms:**
- Rapid increase in requests
- Response time degradation
- Error rate increase

**Actions:**
```bash
# Immediate scale up
kubectl scale deployment securevibe --replicas=10

# Enable rate limiting
# Adjust middleware/rateLimiter.js

# Monitor closely
# Watch metrics every minute
```

### Scenario 2: Gradual Growth

**Symptoms:**
- Slow increase in baseline metrics
- Consistent high resource usage
- Need for capacity planning

**Actions:**
```bash
# Adjust HPA targets
kubectl patch hpa securevibe \
  -p '{"spec":{"targetCPUUtilizationPercentage":60}}'

# Plan infrastructure upgrades
# Schedule database scaling
# Review cost optimization
```

### Scenario 3: Seasonal Traffic

**Symptoms:**
- Predictable traffic patterns
- Regular peak periods
- Known low-traffic times

**Actions:**
```bash
# Implement scheduled scaling
# Use CronHPA for predictable patterns

# Optimize costs
# Scale down during low-traffic periods
# Use spot instances for non-critical workloads
```

## Cost Optimization

### Right-Sizing

```bash
# Analyze resource usage
kubectl top pods -l app=securevibe --sort-by=memory

# Adjust requests/limits
kubectl set resources deployment securevibe \
  --requests=cpu=500m,memory=1Gi \
  --limits=cpu=1,memory=2Gi
```

### Auto-Scaling Limits

```bash
# Set maximum replicas
kubectl patch hpa securevibe \
  -p '{"spec":{"maxReplicas":10}}'

# Set minimum replicas
kubectl patch hpa securevibe \
  -p '{"spec":{"minReplicas":2}}'
```

## Troubleshooting

### Scaling Not Triggering

```bash
# Check HPA metrics
kubectl describe hpa securevibe

# Check metrics server
kubectl get --raw /apis/metrics.k8s.io/v1beta1/namespaces/default/podmetrics

# Verify metrics availability
kubectl get apiservices | grep metrics
```

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name>

# Check resource quotas
kubectl describe namespace default | grep -A 10 ResourceQuota

# Check node capacity
kubectl describe nodes | grep -A 5 Allocated
```

### Database Connection Issues

```bash
# Check connection pool
# Review config/database.js

# Monitor active connections
kubectl exec -it securevibe-db-0 -- psql -U securevibe -c "SELECT count(*) FROM pg_stat_activity;"

# Adjust pool size if needed
```

## Monitoring

### Key Metrics

- **CPU Usage**: Target 50-70%
- **Memory Usage**: Target 60-80%
- **Response Time**: Target < 200ms (p95)
- **Error Rate**: Target < 1%
- **Queue Depth**: Target < 100
- **Active Connections**: Target 60-80% of pool

### Alerts

```yaml
# Prometheus alerting rules
groups:
  - name: securevibe_scaling
    rules:
      - alert: HighCPUUsage
        expr: cpu_usage_percent > 70
        for: 10m
        annotations:
          summary: "High CPU usage detected"
          
      - alert: HighMemoryUsage
        expr: memory_usage_percent > 80
        for: 10m
        annotations:
          summary: "High memory usage detected"
          
      - alert: HighResponseTime
        expr: response_time_p95 > 500
        for: 5m
        annotations:
          summary: "High response time detected"
```

## Checklist

- [ ] Scaling triggers verified
- [ ] Scaling action initiated
- [ ] New pods healthy
- [ ] Health checks passing
- [ ] Performance metrics normalized
- [ ] Load distribution verified
- [ ] Cost impact reviewed
- [ ] Team notified
- [ ] Documentation updated

## Related Runbooks

- [Deployment Runbook](./deployment.md)
- [Incident Response Runbook](./incident-response.md)
- [Performance Tuning Runbook](./performance-tuning.md)
