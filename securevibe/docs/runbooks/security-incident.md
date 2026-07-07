# Security Incident Runbook

## Overview

This runbook provides procedures for responding to security incidents affecting the SecureVibe authentication service.

## Severity Levels

| Severity | Description | Response Time | Notification |
|-----------|-------------|----------------|-------------|
| Critical | Data breach, active attack, credential exposure | < 15 minutes | Executive team, legal, PR |
| High | Unauthorized access, privilege escalation | < 30 minutes | VP Engineering, security team |
| Medium | Suspicious activity, potential vulnerability | < 2 hours | Engineering lead, security team |
| Low | Minor security issue, policy violation | < 24 hours | Team lead |

## Incident Response Process

### 1. Detection and Triage

**When a security incident is detected:**

1. **Acknowledge immediately**
   - Update incident status to "Acknowledged"
   - Assign severity level
   - Notify security team

2. **Initial assessment**
   ```bash
   # Check for active attacks
   grep -i "attack\|breach\|unauthorized" securevibe/logs/error.log | tail -100
   
   # Check authentication failures
   grep "auth.*fail" securevibe/logs/app.log | tail -50
   
   # Review rate limit violations
   grep "rate.*limit" securevibe/logs/app.log | tail -50
   ```

3. **Determine scope**
   - Affected users/accounts
   - Data potentially exposed
   - Systems compromised
   - Attack vector identified

### 2. Containment

**Immediate actions to limit damage:**

1. **Block malicious IPs**
   ```bash
   # Get attacking IPs from logs
   grep "attack" securevibe/logs/app.log | awk '{print $1}' | sort -u
   
   # Add to firewall
   # Update security groups in AWS
   aws ec2 authorize-security-group-ingress \
     --group-id sg-xxx \
     --protocol tcp \
     --port 5000 \
     --cidr <malicious-ip>/32
   ```

2. **Disable compromised accounts**
   ```bash
   # Connect to database
   kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe
   
   # Disable accounts
   UPDATE users SET is_disabled = true WHERE id = '<compromised-user-id>';
   
   # Invalidate all sessions
   DELETE FROM sessions WHERE user_id = '<compromised-user-id>';
   ```

3. **Enable enhanced monitoring**
   ```bash
   # Increase log verbosity
   export LOG_LEVEL=debug
   
   # Enable additional monitoring
   # Add security alerts to monitoring system
   ```

4. **Rotate secrets**
   ```bash
   # Rotate JWT secrets
   # Generate new secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Update environment variables
   # Update .env file
   # Update Kubernetes secrets
   kubectl create secret generic securevibe-secrets \
     --from-literal=JWT_SECRET=<new-secret>
   
   # Restart services
   kubectl rollout restart deployment securevibe
   ```

### 3. Eradication

**Steps to remove threat:**

1. **Patch vulnerabilities**
   ```bash
   # Update dependencies
   npm audit fix
   
   # Apply security patches
   npm update
   
   # Redeploy with fixes
   npm run deploy:production
   ```

2. **Remove malware/backdoors**
   ```bash
   # Scan for malicious files
   # Use security scanner
   # Review recent code changes
   git log --all --oneline -20
   ```

3. **Clean compromised systems**
   ```bash
   # Rebuild containers from trusted base
   docker build --no-cache -t securevibe:clean .
   
   # Redeploy clean containers
   kubectl set image deployment/securevibe \
     securevibe=registry.securevibe.com/securevibe:clean
   ```

### 4. Recovery

**Steps to restore normal operations:**

1. **Restore from backups**
   ```bash
   # Verify backup integrity
   # Restore database from last known good backup
   kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe < backup.sql
   ```

2. **Reset credentials**
   ```bash
   # Force password reset for affected users
   # Send password reset emails
   # Invalidate all refresh tokens
   ```

3. **Verify system integrity**
   ```bash
   # Run security scans
   npm audit
   
   # Verify no unauthorized changes
   git diff HEAD~10 HEAD
   
   # Check for suspicious processes
   kubectl exec -it <pod> -- ps aux
   ```

### 5. Post-Incident Activities

**After incident resolution:**

1. **Conduct forensic analysis**
   - Preserve logs for investigation
   - Analyze attack vectors
   - Identify root cause
   - Document timeline

2. **Notify affected parties**
   - Notify affected users
   - Report to authorities (if required)
   - Inform stakeholders
   - Update status page

3. **Improve defenses**
   - Update security policies
   - Implement additional controls
   - Enhance monitoring
   - Update runbooks

## Common Security Incidents

### Incident 1: Brute Force Attack

**Symptoms:**
- High rate of failed login attempts
- Multiple IPs attempting authentication
- Rate limit violations

**Response:**
```bash
# 1. Identify attacking IPs
grep "auth.*fail" securevibe/logs/app.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# 2. Block IPs
# Update firewall rules
# Add to IP blacklist in rate limiter

# 3. Implement CAPTCHA
# Enable CAPTCHA for suspicious IPs
# Update middleware/captcha.js

# 4. Increase rate limiting
# Reduce windowMs
# Lower max requests
```

### Incident 2: SQL Injection

**Symptoms:**
- Suspicious SQL queries in logs
- Database errors with injection patterns
- Unauthorized data access

**Response:**
```bash
# 1. Identify vulnerable endpoints
grep -i "union\|select\|drop" securevibe/logs/app.log

# 2. Patch vulnerabilities
# Use parameterized queries
# Implement input validation
# Add SQL injection prevention

# 3. Rotate database credentials
# Generate new database password
# Update connection string
# Restart database

# 4. Audit data access
# Review recent database queries
# Check for unauthorized access
```

### Incident 3: Data Breach

**Symptoms:**
- Unauthorized data access confirmed
- Credentials exposed
- Data found on dark web

**Response:**
```bash
# 1. Immediate containment
# Disable all affected services
# Block all external access
# Enable maintenance mode

# 2. Assessment
# Determine scope of breach
# Identify affected data
# Assess impact

# 3. Notification
# Notify legal team
# Notify affected users
# Report to authorities (if required)

# 4. Recovery
# Restore from backups
# Reset all credentials
# Implement additional security
```

### Incident 4: DDoS Attack

**Symptoms:**
- Massive traffic spike
- Service degradation
- High resource usage

**Response:**
```bash
# 1. Enable DDoS protection
# Use Cloudflare or AWS Shield
# Enable rate limiting
# Implement challenge-response

# 2. Scale resources
# Increase pod replicas
# Enable auto-scaling
# Add CDN

# 3. Filter traffic
# Block malicious IPs
# Implement geo-blocking
# Use WAF rules

# 4. Monitor and adjust
# Watch attack patterns
# Adjust filters in real-time
# Document attack vectors
```

### Incident 5: Unauthorized Access

**Symptoms:**
- Privilege escalation detected
- Access to restricted resources
- Suspicious admin actions

**Response:**
```bash
# 1. Identify compromised accounts
# Review audit logs
# Check for unusual access patterns
# Identify affected users

# 2. Disable accounts
# Lock compromised accounts
# Invalidate all sessions
# Force password reset

# 3. Review permissions
# Audit role assignments
# Check for privilege escalation
# Review access controls

# 4. Strengthen authentication
# Enable MFA for all users
# Implement session timeout
# Add device fingerprinting
```

## Communication Procedures

### Internal Communication

1. **Security team notification**
   - Immediate for critical/high
   - Include incident details
   - Provide initial assessment

2. **Executive notification**
   - Within 15 minutes for critical
   - Within 30 minutes for high
   - Include business impact

3. **Engineering notification**
   - Full details for technical response
   - Include containment procedures

### External Communication

1. **User notification**
   - Email affected users
   - Provide guidance on next steps
   - Offer support resources

2. **Public notification**
   - Update status page
   - Post on social media (if major)
   - Issue press release (if critical)

3. **Regulatory notification**
   - GDPR notification within 72 hours
   - Report to authorities (if required)
   - Document all communications

## Tools and Resources

- **SIEM**: Security Information and Event Management
- **IDS/IPS**: Intrusion Detection/Prevention System
- **WAF**: Web Application Firewall
- **DDoS Protection**: Cloudflare, AWS Shield
- **Forensics**: Security analysis tools
- **Communication**: Slack, Email, PagerDuty

## Checklist

- [ ] Incident acknowledged
- [ ] Severity assigned
- [ ] Security team notified
- [ ] Initial assessment complete
- [ ] Containment initiated
- [ ] Threat identified
- [ ] Eradication in progress
- [ ] Recovery initiated
- [ ] System integrity verified
- [ ] Affected parties notified
- [ ] Forensic analysis complete
- [ ] Post-incident review scheduled
- [ ] Runbooks updated
- [ ] Security improvements documented

## Related Runbooks

- [Incident Response Runbook](./incident-response.md)
- [Backup Recovery Runbook](./backup-recovery.md)
- [Deployment Runbook](./deployment.md)
