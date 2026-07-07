# Incident Response Runbook

## Overview

This runbook provides procedures for responding to incidents affecting the SecureVibe authentication service.

## Severity Levels

| Severity | Description | Response Time | Escalation |
|-----------|-------------|----------------|-------------|
| P1 - Critical | Service completely down, data breach, or security incident | < 15 minutes | Immediate executive notification |
| P2 - High | Major functionality degraded, significant user impact | < 30 minutes | Engineering lead notification |
| P3 - Medium | Partial functionality degraded, moderate user impact | < 1 hour | Team lead notification |
| P4 - Low | Minor issues, minimal user impact | < 4 hours | Standard ticket queue |

## Incident Response Process

### 1. Detection and Triage

**When an incident is detected:**

1. **Acknowledge the incident**
   - Update incident status to "Acknowledged"
   - Assign severity level based on impact
   - Notify on-call engineer

2. **Gather initial information**
   ```bash
   # Check service health
   curl https://api.securevibe.com/health/deep
   
   # Check error rates
   # Use monitoring dashboard or logs
   ```

3. **Determine impact scope**
   - Affected users/regions
   - Affected features/endpoints
   - Business impact assessment

### 2. Investigation

**Investigation steps:**

1. **Check system status**
   - Review health check endpoints
   - Check database connectivity
   - Verify Redis cache status
   - Review external service dependencies

2. **Review logs and metrics**
   ```bash
   # Check recent error logs
   tail -n 100 securevibe/logs/error.log
   
   # Check application logs
   tail -n 100 securevibe/logs/app.log
   
   # Review metrics in monitoring dashboard
   ```

3. **Identify root cause**
   - Correlate error patterns
   - Check recent deployments
   - Review configuration changes
   - Analyze performance metrics

### 3. Mitigation

**Immediate actions to restore service:**

1. **Restart affected services**
   ```bash
   # Graceful restart
   pm2 restart securevibe
   
   # Or use systemd
   systemctl restart securevibe
   ```

2. **Scale resources if needed**
   ```bash
   # Scale up Kubernetes deployment
   kubectl scale deployment securevibe --replicas=4
   
   # Or adjust HPA
   kubectl autoscale deployment securevibe --min=2 --max=8
   ```

3. **Enable maintenance mode** (if necessary)
   ```javascript
   // In server.js
   app.use((req, res, next) => {
     if (process.env.MAINTENANCE_MODE === 'true') {
       return res.status(503).json({
         success: false,
         message: 'System under maintenance'
       });
     }
     next();
   });
   ```

4. **Rollback recent changes** (if deployment-related)
   ```bash
   # Rollback to previous version
   git revert HEAD~1
   # Redeploy
   ```

### 4. Resolution

**Steps to fully resolve the incident:**

1. **Implement permanent fix**
   - Code changes for bugs
   - Configuration updates
   - Infrastructure improvements

2. **Test the fix**
   - Verify in staging environment
   - Run integration tests
   - Perform smoke tests

3. **Deploy to production**
   ```bash
   # Deploy fix
   npm run deploy:production
   
   # Verify deployment
   curl https://api.securevibe.com/health
   ```

4. **Monitor for recurrence**
   - Watch error rates
   - Monitor performance metrics
   - Review user feedback

### 5. Post-Incident Activities

**After incident resolution:**

1. **Update incident record**
   - Document timeline
   - Record root cause
   - Note resolution steps
   - Calculate downtime

2. **Conduct post-mortem**
   - Schedule meeting within 48 hours
   - Create post-mortem document
   - Identify action items

3. **Update documentation**
   - Update runbooks
   - Add known issues to FAQ
   - Improve monitoring/alerts

## Common Incident Scenarios

### Database Connection Failure

**Symptoms:**
- Health check shows database unhealthy
- Authentication requests failing
- High database connection errors in logs

**Resolution:**
```bash
# Check database status
kubectl exec -it securevibe-db-0 -- psql -U securevibe -c "SELECT 1;"

# Restart database if needed
kubectl rollout restart statefulset securevibe-db

# Check connection pool
# Review connection pool settings in config/database.js
```

### High Memory Usage

**Symptoms:**
- OOM kills in logs
- Slow response times
- Memory > 90% threshold

**Resolution:**
```bash
# Check memory usage
kubectl top pods

# Trigger garbage collection
# Node.js will auto-trigger, but can force if needed
# Send SIGUSR2 to process

# Scale up resources
kubectl set resources deployment securevibe \
  --limits=memory=4Gi \
  --requests=memory=2Gi
```

### API Rate Limit Breach

**Symptoms:**
- 429 errors increasing
- Legitimate users blocked
- High request volume

**Resolution:**
```bash
# Check rate limit configuration
# Review middleware/rateLimiter.js

# Adjust limits temporarily
# Increase windowMs or max

# Implement IP whitelisting for known good actors
```

### Authentication Service Degradation

**Symptoms:**
- Slow login times
- Increased authentication failures
- MFA verification delays

**Resolution:**
```bash
# Check external services
# Verify email service status
# Check SMS provider status

# Review authentication logs
grep "auth" securevibe/logs/app.log | tail -50

# Restart authentication service if needed
pm2 restart securevibe
```

## Communication Procedures

### Internal Communication

1. **Slack/Teams notification**
   - Post in #incidents channel
   - Include severity and status
   - Update every 30 minutes during active incident

2. **Email notification**
   - Send to engineering team
   - Include incident details
   - Escalate to management for P1/P2

### External Communication

1. **Status page update**
   - Update status.securevibe.com
   - Post incident details
   - Provide ETA for resolution

2. **Customer notification**
   - Send email to affected users
   - Post on social media (if major)
   - Update in-app notifications

## Escalation Matrix

| Time Elapsed | Severity | Action |
|--------------|----------|--------|
| 15 minutes | P1 | Notify VP Engineering |
| 30 minutes | P1 | Notify CTO |
| 1 hour | P2 | Notify Engineering Director |
| 2 hours | P2 | Notify VP Engineering |
| 4 hours | P3 | Notify Engineering Manager |

## Tools and Resources

- **Monitoring**: Grafana dashboard
- **Logs**: ELK Stack / Loki
- **Alerting**: PagerDuty / Opsgenie
- **Communication**: Slack, Email
- **Incident Tracking**: Jira / Linear
- **Status Page**: status.securevibe.com

## Checklist

- [ ] Incident acknowledged
- [ ] Severity assigned
- [ ] On-call engineer notified
- [ ] Initial investigation started
- [ ] Root cause identified
- [ ] Mitigation implemented
- [ ] Service restored
- [ ] Permanent fix deployed
- [ ] Monitoring verified
- [ ] Incident documented
- [ ] Post-mortem scheduled
- [ ] Runbooks updated

## Related Runbooks

- [Deployment Runbook](./deployment.md)
- [Rollback Runbook](./rollback.md)
- [Security Incident Runbook](./security-incident.md)
