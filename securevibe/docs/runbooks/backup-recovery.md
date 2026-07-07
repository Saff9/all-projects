# Backup and Recovery Runbook

## Overview

This runbook provides procedures for backing up and recovering the SecureVibe authentication service data.

## Backup Strategy

### Backup Types

| Type | Frequency | Retention | Location |
|-------|-----------|------------|----------|
| Database Full | Daily | 30 days | S3 |
| Database Incremental | Hourly | 7 days | S3 |
| Configuration | On change | 90 days | S3 |
| Logs | Daily | 30 days | S3 |
| Secrets | On change | 90 days | AWS Secrets Manager |

## Backup Procedures

### 1. Database Backup

```bash
# Full database backup
kubectl exec -it securevibe-db-0 -- pg_dump -U securevibe \
  -F c -f -b -v securevibe > backup-$(date +%Y%m%d-%H%M).sql

# Compress backup
gzip backup-$(date +%Y%m%d-%H%M).sql

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d-%H%M).sql.gz \
  s3://securevibe-backups/database/

# Verify backup
aws s3 ls s3://securevibe-backups/database/ | grep $(date +%Y%m%d)
```

### 2. Configuration Backup

```bash
# Export Kubernetes ConfigMaps
kubectl get configmap securevibe-config -o yaml > config-backup-$(date +%Y%m%d).yaml

# Export Secrets (encrypted)
kubectl get secret securevibe-secrets -o yaml > secrets-backup-$(date +%Y%m%d).yaml

# Upload to S3
aws s3 cp config-backup-$(date +%Y%m%d).yaml \
  s3://securevibe-backups/config/

# Upload to AWS Secrets Manager
aws secretsmanager put-secret-value \
  --secret-id securevibe-config-$(date +%Y%m%d) \
  --secret-string file://config-backup-$(date +%Y%m%d).yaml
```

### 3. Log Backup

```bash
# Archive application logs
kubectl logs -l app=securevibe --since=24h > logs-$(date +%Y%m%d).log

# Compress logs
gzip logs-$(date +%Y%m%d).log

# Upload to S3
aws s3 cp logs-$(date +%Y%m%d).log.gz \
  s3://securevibe-backups/logs/

# Verify upload
aws s3 ls s3://securevibe-backups/logs/ | grep $(date +%Y%m%d)
```

### 4. Automated Backup Script

```bash
#!/bin/bash
# backup.sh - Automated backup script

DATE=$(date +%Y%m%d-%H%M)
BACKUP_DIR="/tmp/backups"
S3_BUCKET="s3://securevibe-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Starting database backup..."
kubectl exec -it securevibe-db-0 -- pg_dump -U securevibe \
  -F c -f -b -v securevibe > $BACKUP_DIR/database-$DATE.sql
gzip $BACKUP_DIR/database-$DATE.sql
aws s3 cp $BACKUP_DIR/database-$DATE.sql.gz $S3_BUCKET/database/

# Configuration backup
echo "Backing up configuration..."
kubectl get configmap securevibe-config -o yaml > $BACKUP_DIR/config-$DATE.yaml
aws s3 cp $BACKUP_DIR/config-$DATE.yaml $S3_BUCKET/config/

# Logs backup
echo "Backing up logs..."
kubectl logs -l app=securevibe --since=24h > $BACKUP_DIR/logs-$DATE.log
gzip $BACKUP_DIR/logs-$DATE.log
aws s3 cp $BACKUP_DIR/logs-$DATE.log.gz $S3_BUCKET/logs/

# Cleanup old backups
echo "Cleaning up old backups..."
aws s3 ls $S3_BUCKET/database/ | awk '{print $4}' | sort | head -n -30 | \
  xargs -I {} aws s3 rm $S3_BUCKET/database/{}

echo "Backup completed: $DATE"
```

### 5. Schedule Backups

```bash
# Kubernetes CronJob
apiVersion: batch/v1
kind: CronJob
metadata:
  name: securevibe-backup
spec:
  schedule: "0 2 * * *"  # 2 AM daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: securevibe/backup:latest
            command: ["/backup.sh"]
          restartPolicy: OnFailure
```

## Recovery Procedures

### 1. Database Recovery

```bash
# 1. Stop application
kubectl scale deployment securevibe --replicas=0

# 2. Download backup from S3
aws s3 cp s3://securevibe-backups/database/backup-20240129.sql.gz .

# 3. Decompress backup
gunzip backup-20240129.sql.gz

# 4. Restore database
kubectl exec -i securevibe-db-0 -- psql -U securevibe -d securevibe < backup-20240129.sql

# 5. Verify data integrity
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe -c "
  SELECT COUNT(*) FROM users;
  SELECT COUNT(*) FROM sessions;
  SELECT COUNT(*) FROM audit_logs;
"

# 6. Restart application
kubectl scale deployment securevibe --replicas=2

# 7. Verify health
curl https://api.securevibe.com/health/deep
```

### 2. Point-in-Time Recovery (PITR)

```bash
# 1. Enable WAL archiving
# In postgresql.conf
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'
archive_timeout = 300

# 2. Create recovery point
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe -c "
  SELECT pg_create_restore_point('before-incident');
"

# 3. Restore to specific point
# In recovery.conf
restore_command = 'pg_restore -l /var/lib/postgresql/archive/%f %p'

# 4. Restart database in recovery mode
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe -c "
  SELECT pg_wal_replay_resume();
"
```

### 3. Configuration Recovery

```bash
# 1. Download configuration backup
aws s3 cp s3://securevibe-backups/config/config-20240129.yaml .

# 2. Apply configuration
kubectl apply -f config-20240129.yaml

# 3. Restart services
kubectl rollout restart deployment securevibe

# 4. Verify configuration
kubectl describe configmap securevibe-config
```

### 4. Secrets Recovery

```bash
# 1. Retrieve from AWS Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id securevibe-secrets-20240129 \
  --query SecretString \
  --output text > secrets.yaml

# 2. Create Kubernetes secret
kubectl create secret generic securevibe-secrets \
  --from-env-file=secrets.yaml

# 3. Restart services
kubectl rollout restart deployment securevibe
```

## Recovery Scenarios

### Scenario 1: Data Corruption

**Symptoms:**
- Database errors
- Inconsistent data
- Application crashes

**Recovery:**
```bash
# 1. Identify corruption
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe -c "
  SELECT * FROM pg_stat_database_corruption;
"

# 2. Restore from last known good backup
# Follow database recovery procedure

# 3. Verify data integrity
# Run data validation checks

# 4. Investigate root cause
# Review logs
# Check for hardware issues
```

### Scenario 2: Accidental Data Deletion

**Symptoms:**
- Missing records
- User reports of lost data
- Audit log shows deletions

**Recovery:**
```bash
# 1. Identify deleted data
# Review audit logs
# Check transaction logs

# 2. Restore from backup
# Use PITR if available
# Otherwise use latest backup

# 3. Verify restoration
# Confirm data restored
# Notify affected users
```

### Scenario 3: Ransomware Attack

**Symptoms:**
- Files encrypted
- Ransom note
- System locked

**Recovery:**
```bash
# 1. Isolate affected systems
# Disconnect from network
# Stop all services

# 2. Assess damage
# Identify affected data
# Check for lateral movement

# 3. Restore from clean backup
# Use offline backup
# Verify backup integrity

# 4. Rebuild systems
# Rebuild from scratch
# Apply security patches
# Update credentials

# 5. Report incident
# Contact authorities
# Document attack vectors
```

### Scenario 4: Disaster Recovery

**Symptoms:**
- Complete system failure
- Data center outage
- Natural disaster

**Recovery:**
```bash
# 1. Activate DR site
# Switch to backup region
# Update DNS to point to DR

# 2. Restore from offsite backup
# Use cross-region backup
# Verify data integrity

# 3. Gradual traffic restoration
# Monitor performance
# Scale up gradually

# 4. Investigate root cause
# Document failure
# Implement preventive measures
```

## Backup Verification

### Integrity Checks

```bash
# 1. Verify backup size
ls -lh backup-*.sql

# 2. Check backup format
file backup-*.sql

# 3. Test restore (in staging)
# Restore to staging database
# Verify data integrity

# 4. Validate checksums
sha256sum backup-*.sql
```

### Restoration Testing

```bash
# 1. Test database restore
# Restore to test environment
# Run validation queries

# 2. Test application
# Start application with restored data
# Run smoke tests

# 3. Verify functionality
# Test authentication flow
# Test user operations
# Verify data consistency
```

## Monitoring

### Backup Monitoring

```yaml
# Prometheus alerts for backups
groups:
  - name: securevibe_backups
    rules:
      - alert: BackupFailed
        expr: backup_success == 0
        for: 5m
        annotations:
          summary: "Backup failed"
          
      - alert: BackupOld
        expr: time() - backup_timestamp > 86400  # 24 hours
        annotations:
          summary: "Backup is older than 24 hours"
          
      - alert: BackupSizeSmall
        expr: backup_size_bytes < 100 * 1024 * 1024  # 100MB
        annotations:
          summary: "Backup size is suspiciously small"
```

### Recovery Monitoring

```yaml
# Recovery process monitoring
groups:
  - name: securevibe_recovery
    rules:
      - alert: RecoverySlow
        expr: recovery_duration_seconds > 3600  # 1 hour
        annotations:
          summary: "Recovery is taking too long"
          
      - alert: RecoveryFailed
        expr: recovery_success == 0
        for: 10m
        annotations:
          summary: "Recovery failed"
```

## Checklist

### Backup Checklist

- [ ] Backup schedule configured
- [ ] Backup script tested
- [ ] Backup location verified
- [ ] Retention policy set
- [ ] Encryption enabled
- [ ] Monitoring configured
- [ ] Recovery procedures documented
- [ ] Team trained

### Recovery Checklist

- [ ] Incident assessed
- [ ] Backup identified
- [ ] Backup verified
- [ ] Recovery plan created
- [ ] Stakeholders notified
- [ ] Recovery initiated
- [ ] Data integrity verified
- [ ] Application tested
- [ ] Functionality verified
- [ ] Monitoring active
- [ ] Documentation updated

## Related Runbooks

- [Database Maintenance Runbook](./database-maintenance.md)
- [Incident Response Runbook](./incident-response.md)
- [Security Incident Runbook](./security-incident.md)
