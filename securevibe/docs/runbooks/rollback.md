# Rollback Runbook

## Overview

This runbook provides procedures for rolling back the SecureVibe service to a previous stable state.

## When to Rollback

- Deployment causes critical issues
- Database migration fails
- Security vulnerability discovered
- Performance degradation > 50%
- Error rate increases > 10x baseline
- User complaints > 100/hour

## Pre-Rollback Checklist

- [ ] Identify rollback target (commit/tag)
- [ ] Verify backup availability
- [ ] Notify stakeholders
- [ ] Prepare rollback plan
- [ ] Schedule maintenance window
- [ ] Document current state

## Rollback Procedures

### Option 1: Git Rollback

```bash
# 1. Identify previous stable commit
git log --oneline -10

# 2. Checkout previous commit
git checkout <commit-hash>

# 3. Verify code state
git log -1

# 4. Push rollback commit
git push origin HEAD --force

# 5. Trigger deployment
# This will trigger automatic deployment
```

### Option 2: Kubernetes Rollback

```bash
# 1. Check deployment history
kubectl rollout history deployment/securevibe

# 2. Rollback to previous revision
kubectl rollout undo deployment/securevibe

# 3. Monitor rollback status
kubectl rollout status deployment/securevibe

# 4. Verify pods are running
kubectl get pods -l app=securevibe
```

### Option 3: Database Rollback

```bash
# 1. Stop application writes
# Set maintenance mode
export MAINTENANCE_MODE=true

# 2. Restore database from backup
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe < backup-20240129.sql

# 3. Run rollback migrations
npm run migrate:rollback -- --to-version=20240128000000

# 4. Verify data integrity
npm run db:verify

# 5. Disable maintenance mode
unset MAINTENANCE_MODE
```

### Option 4: Configuration Rollback

```bash
# 1. Restore previous configuration
kubectl apply -f configmap-backup.yaml

# 2. Restart services
kubectl rollout restart deployment/securevibe

# 3. Verify configuration
kubectl describe configmap securevibe-config
```

## Rollback Verification

### 1. Health Checks

```bash
# Basic health
curl https://api.securevibe.com/health

# Deep health
curl https://api.securevibe.com/health/deep

# Readiness
curl https://api.securevibe.com/health/ready
```

### 2. Functional Tests

```bash
# Test authentication
curl -X POST https://api.securevibe.com/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test user endpoints
curl -H "Authorization: Bearer <token>" \
  https://api.securevibe.com/api/v2/users/me

# Test dashboard
curl -H "Authorization: Bearer <token>" \
  https://api.securevibe.com/api/v2/dashboard/stats
```

### 3. Monitor Metrics

- [ ] Error rate returns to baseline
- [ ] Response time < 200ms (p95)
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] Database connections stable
- [ ] Redis operations normal

## Post-Rollback Activities

### 1. Stabilization

- [ ] Monitor for 30 minutes
- [ ] Check for recurring issues
- [ ] Verify all services healthy
- [ ] Review error logs

### 2. Root Cause Analysis

- [ ] Document what caused rollback
- [ ] Identify preventive measures
- [ ] Update testing procedures
- [ ] Review deployment process

### 3. Communication

- [ ] Notify team of rollback completion
- [ ] Update status page
- [ ] Communicate with affected users
- [ ] Document lessons learned

## Rollback Scenarios

### Scenario 1: Failed Deployment

**Symptoms:**
- New pods not starting
- Health checks failing
- High error rate

**Actions:**
```bash
# Immediate rollback
kubectl rollout undo deployment/securevibe

# Investigate failure
kubectl logs -f deployment/securevibe --tail=100

# Fix issue and redeploy
```

### Scenario 2: Database Migration Failure

**Symptoms:**
- Migration errors in logs
- Database connection failures
- Data inconsistency

**Actions:**
```bash
# Rollback migrations
npm run migrate:rollback

# Restore from backup if needed
psql -h localhost -U securevibe -d securevibe < backup.sql

# Verify data integrity
npm run db:verify
```

### Scenario 3: Configuration Error

**Symptoms:**
- Service not responding
- Wrong environment variables
- Feature flags incorrect

**Actions:**
```bash
# Restore previous config
kubectl apply -f configmap-backup.yaml

# Restart services
kubectl rollout restart deployment/securevibe

# Verify configuration
kubectl exec -it <pod> -- env | sort
```

### Scenario 4: Security Issue

**Symptoms:**
- Unauthorized access attempts
- Data breach indicators
- Vulnerability detected

**Actions:**
```bash
# Immediate rollback
git revert HEAD
git push origin main

# Enable maintenance mode
export MAINTENANCE_MODE=true

# Investigate security issue
# Follow security incident runbook
```

## Emergency Rollback

If critical issues persist after rollback:

```bash
# 1. Stop all traffic
kubectl scale deployment securevibe --replicas=0

# 2. Investigate offline
# Review logs, metrics, backups

# 3. Restore from known good state
# Use last known good backup or commit

# 4. Gradual traffic restoration
kubectl scale deployment securevibe --replicas=1
# Monitor before scaling up
```

## Rollback Decision Tree

```
Is service critical?
├─ Yes → Immediate rollback (all scenarios)
└─ No
    └─ Is user impact significant?
        ├─ Yes → Rollback within 15 minutes
        └─ No
            └─ Can issue be fixed quickly?
                ├─ Yes → Fix in place, no rollback
                └─ No → Rollback within 1 hour
```

## Tools and Resources

- **Version Control**: Git
- **Orchestration**: kubectl / Helm
- **Monitoring**: Grafana
- **Logs**: ELK / Loki
- **Backups**: S3 / RDS snapshots

## Checklist

- [ ] Rollback target identified
- [ ] Backup verified
- [ ] Stakeholders notified
- [ ] Rollback initiated
- [ ] Health checks passing
- [ ] Functional tests passing
- [ ] Metrics normalized
- [ ] Root cause documented
- [ ] Team notified
- [ ] Documentation updated

## Related Runbooks

- [Deployment Runbook](./deployment.md)
- [Incident Response Runbook](./incident-response.md)
- [Database Maintenance Runbook](./database-maintenance.md)
