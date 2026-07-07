# Deployment Runbook

## Overview

This runbook provides procedures for deploying the SecureVibe authentication service to production.

## Prerequisites

- [ ] Access to deployment environment
- [ ] Valid environment variables configured
- [ ] Database migrations prepared
- [ ] Tests passing in staging
- [ ] Rollback plan documented

## Pre-Deployment Checklist

### 1. Code Review

- [ ] All pull requests reviewed and approved
- [ ] Security scan passed
- [ ] Performance tests passed
- [ ] Documentation updated

### 2. Environment Preparation

```bash
# Set target environment
export NODE_ENV=production

# Verify environment variables
node securevibe/config/env-validator.js

# Check database connectivity
node -e "require('./securevibe/config/database').connectDB()"
```

### 3. Backup Current State

```bash
# Backup database
kubectl exec -it securevibe-db-0 -- pg_dump -U securevibe securevibe > backup-$(date +%Y%m%d).sql

# Backup configuration
kubectl get configmap securevibe-config -o yaml > config-backup.yaml
```

## Deployment Process

### Option 1: Kubernetes Deployment

```bash
# 1. Build and push Docker image
docker build -t securevibe:latest .
docker tag securevibe:latest registry.securevibe.com/securevibe:latest
docker push registry.securevibe.com/securevibe:latest

# 2. Update deployment
kubectl set image deployment/securevibe \
  securevibe=registry.securevibe.com/securevibe:latest

# 3. Watch rollout status
kubectl rollout status deployment/securevibe

# 4. Verify new pods are running
kubectl get pods -l app=securevibe
```

### Option 2: Render Deployment

```bash
# 1. Deploy using Render CLI
render deploy

# 2. Or push to trigger deployment
git push origin main

# 3. Monitor deployment logs
render logs --tail
```

### Option 3: Manual Deployment

```bash
# 1. SSH into server
ssh user@production-server

# 2. Pull latest code
cd /var/www/securevibe
git pull origin main

# 3. Install dependencies
npm ci --production

# 4. Run database migrations
npm run migrate

# 5. Restart application
pm2 restart securevibe

# 6. Verify health
curl https://api.securevibe.com/health
```

## Post-Deployment Verification

### 1. Health Checks

```bash
# Basic health check
curl https://api.securevibe.com/health

# Liveness probe
curl https://api.securevibe.com/health/live

# Readiness probe
curl https://api.securevibe.com/health/ready

# Deep health check
curl https://api.securevibe.com/health/deep
```

### 2. Smoke Tests

```bash
# Test authentication
curl -X POST https://api.securevibe.com/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test health endpoint
curl https://api.securevibe.com/health

# Test API versioning
curl -H "Accept-Version: v2" https://api.securevibe.com/health
```

### 3. Monitor Metrics

- [ ] Error rate < 1%
- [ ] Response time < 200ms (p95)
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] Database connections stable

## Rollback Procedures

If deployment fails:

### Immediate Rollback

```bash
# Kubernetes rollback
kubectl rollout undo deployment/securevibe

# Render rollback
# Revert to previous commit
git revert HEAD
git push origin main

# Manual rollback
pm2 restart securevibe
```

### Rollback Verification

- [ ] Health checks passing
- [ ] Error rates normalized
- [ ] User complaints stopped
- [ ] Metrics back to baseline

## Deployment Strategies

### Blue-Green Deployment

```bash
# Deploy to green environment
kubectl set image deployment/securevibe-green \
  securevibe=registry.securevibe.com/securevibe:latest

# Verify green is healthy
curl https://green-api.securevibe.com/health

# Switch traffic to green
kubectl patch service securevibe -p '{"spec":{"selector":{"app":"securevibe-green"}}}'
```

### Canary Deployment

```bash
# Deploy canary with 10% traffic
kubectl patch deployment securevibe-canary \
  -p '{"spec":{"replicas":1}}'

# Update service to route 10% to canary
kubectl patch service securevibe \
  -p '{"spec":{"selector":{"app":"securevibe-canary"}}}'

# Monitor canary metrics
# If healthy, increase traffic to 50%, then 100%

# If unhealthy, rollback immediately
kubectl rollout undo deployment/securevibe-canary
```

## Troubleshooting

### Deployment Fails to Start

```bash
# Check pod logs
kubectl logs -f deployment/securevibe

# Check pod status
kubectl describe pod <pod-name>

# Check resource limits
kubectl describe deployment securevibe | grep -A 5 Limits
```

### Database Migration Fails

```bash
# Check migration status
npm run migrate:status

# Rollback specific migration
npm run migrate:rollback -- --version=20240130000000

# Manual SQL execution
psql -h localhost -U securevibe -d securevibe -f migration.sql
```

### Health Checks Failing

```bash
# Check dependencies
curl https://api.securevibe.com/health/deep

# Restart dependencies if needed
kubectl rollout restart statefulset securevibe-db
kubectl rollout restart deployment securevibe-redis

# Check network policies
kubectl get networkpolicies
```

## Communication

### Pre-Deployment

- [ ] Notify team 1 hour before
- [ ] Schedule maintenance window
- [ ] Update status page

### During Deployment

- [ ] Post progress in #deployments channel
- [ ] Update every 5 minutes
- [ ] Alert on any failures

### Post-Deployment

- [ ] Announce successful deployment
- [ ] Share deployment notes
- [ ] Update documentation

## Checklist

- [ ] Pre-deployment checklist complete
- [ ] Backup created
- [ ] Deployment initiated
- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] Metrics within normal range
- [ ] Rollback plan tested
- [ ] Team notified
- [ ] Documentation updated
- [ ] Post-deployment monitoring active

## Related Runbooks

- [Rollback Runbook](./rollback.md)
- [Incident Response Runbook](./incident-response.md)
- [Scaling Runbook](./scaling.md)
