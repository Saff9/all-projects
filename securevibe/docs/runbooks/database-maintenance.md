# Database Maintenance Runbook

## Overview

This runbook provides procedures for maintaining the SecureVibe PostgreSQL database.

## Maintenance Schedule

- **Weekly**: Index maintenance, statistics update
- **Monthly**: Vacuum full, analyze tables
- **Quarterly**: Archive old data, review performance
- **As Needed**: Emergency maintenance, schema changes

## Pre-Maintenance Checklist

- [ ] Maintenance window scheduled
- [ ] Stakeholders notified
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Maintenance mode enabled

## Maintenance Procedures

### 1. Enable Maintenance Mode

```bash
# Set environment variable
export MAINTENANCE_MODE=true

# Or update ConfigMap
kubectl patch configmap securevibe-config \
  -p '{"data":{"MAINTENANCE_MODE":"true"}}'

# Restart pods to apply
kubectl rollout restart deployment securevibe
```

### 2. Create Backup

```bash
# Full database backup
kubectl exec -it securevibe-db-0 -- pg_dump -U securevibe \
  -F c -f -b -v securevibe > backup-$(date +%Y%m%d-%H%M).sql

# Schema-only backup
kubectl exec -it securevibe-db-0 -- pg_dump -U securevibe \
  -s -f securevibe-schema-$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d-%H%M).sql \
  s3://securevibe-backups/database/
```

### 3. Database Vacuum

```bash
# Connect to database
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe

# Vacuum analyze (recommended for regular maintenance)
VACUUM ANALYZE;

# Vacuum full (for significant bloat)
VACUUM FULL;

# Vacuum specific table
VACUUM ANALYZE users;
VACUUM ANALYZE sessions;
VACUUM ANALYZE audit_logs;
```

### 4. Reindex Tables

```bash
# Reindex all tables
REINDEX DATABASE securevibe;

# Reindex specific table
REINDEX TABLE users;
REINDEX TABLE sessions;

# Reindex concurrently (faster for large databases)
REINDEX DATABASE CONCURRENTLY securevibe;
```

### 5. Update Statistics

```bash
# Update all statistics
ANALYZE;

# Update specific table statistics
ANALYZE users;
ANALYZE sessions;
ANALYZE audit_logs;

# Update with sample size
ANALYZE VERBOSE users;
```

### 6. Clean Old Data

```bash
# Archive old audit logs (older than 90 days)
INSERT INTO audit_logs_archive
SELECT * FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days';

DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days';

# Clean expired sessions (older than 30 days)
DELETE FROM sessions
WHERE expires_at < NOW();

# Clean old refresh tokens (older than 7 days)
DELETE FROM refresh_tokens
WHERE created_at < NOW() - INTERVAL '7 days';
```

### 7. Schema Changes

```bash
# Create migration file
# migrations/20240130000000_add_new_column.js

module.exports = {
  up: (pgm) => {
    pgm.addColumn('users', 'new_field', {
      type: 'string',
      default: ''
    });
  },
  down: (pgm) => {
    pgm.dropColumn('users', 'new_field');
  }
};

# Run migration
npm run migrate up

# Verify migration
npm run migrate:status
```

## Post-Maintenance Verification

### 1. Database Health

```bash
# Check database size
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe -c "
  SELECT pg_size_pretty(pg_database_size('securevibe'));
"

# Check table sizes
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe -c "
  SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Check index usage
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe -c "
  SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
  FROM pg_stat_user_indexes
  ORDER BY idx_scan DESC;
"
```

### 2. Performance Metrics

- [ ] Query time < 100ms (p95)
- [ ] Connection pool usage < 80%
- [ ] Lock wait time < 10ms
- [ ] Cache hit ratio > 95%

### 3. Application Health

```bash
# Test database connectivity
kubectl exec -it securevibe-db-0 -- psql -U securevibe -c "SELECT 1;"

# Test application health
curl https://api.securevibe.com/health/deep

# Test authentication flow
curl -X POST https://api.securevibe.com/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Maintenance Scenarios

### Scenario 1: Database Bloat

**Symptoms:**
- Large table sizes
- Slow queries
- High disk usage

**Actions:**
```bash
# Vacuum full
VACUUM FULL;

# Reindex
REINDEX DATABASE CONCURRENTLY securevibe;

# Monitor disk space
df -h
```

### Scenario 2: Slow Queries

**Symptoms:**
- High query times
- CPU spikes
- Lock contention

**Actions:**
```bash
# Enable slow query log
# Add to postgresql.conf
log_min_duration_statement = 1000
log_statement = 'all'

# Analyze slow queries
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe -c "
  SELECT 
    query,
    calls,
    total_time,
    mean_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"

# Add missing indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

### Scenario 3: Connection Pool Exhaustion

**Symptoms:**
- Connection errors
- High wait times
- Pool at capacity

**Actions:**
```bash
# Check active connections
kubectl exec -it securevibe-db-0 -- psql -U securevibe -c "
  SELECT count(*) FROM pg_stat_activity;
"

# Increase pool size
# Update config/database.js
module.exports = {
  pool: {
    min: 10,
    max: 50  // Increased from 20
  }
};

# Restart application
pm2 restart securevibe
```

### Scenario 4: Index Fragmentation

**Symptoms:**
- High index scan counts
- Low cache hit ratio
- Inefficient queries

**Actions:**
```bash
# Reindex fragmented indexes
REINDEX TABLE CONCURRENTLY users;
REINDEX TABLE CONCURRENTLY sessions;

# Update statistics
ANALYZE users;
ANALYZE sessions;
```

## Emergency Procedures

### Database Corruption

```bash
# 1. Stop application
kubectl scale deployment securevibe --replicas=0

# 2. Restore from backup
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe < backup.sql

# 3. Verify data integrity
npm run db:verify

# 4. Restart application
kubectl scale deployment securevibe --replicas=2
```

### Performance Degradation

```bash
# 1. Kill long-running queries
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe -c "
  SELECT pg_cancel_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'active'
  AND query_start < NOW() - INTERVAL '5 minutes';
"

# 2. Restart database
kubectl rollout restart statefulset securevibe-db

# 3. Monitor recovery
kubectl logs -f statefulset/securevibe-db
```

## Monitoring

### Key Metrics

- **Database Size**: Monitor growth rate
- **Table Sizes**: Identify largest tables
- **Index Usage**: Check efficiency
- **Query Performance**: Track slow queries
- **Connection Pool**: Monitor utilization
- **Lock Contention**: Track wait times
- **Cache Hit Ratio**: Target > 95%

### Alerts

```yaml
# Database alerts
groups:
  - name: securevibe_database
    rules:
      - alert: HighDatabaseSize
        expr: database_size_bytes > 100 * 1024 * 1024 * 1024  # 100GB
        for: 5m
        annotations:
          summary: "Database size exceeds threshold"
          
      - alert: SlowQueries
        expr: query_duration_p95 > 1000
        for: 5m
        annotations:
          summary: "Slow queries detected"
          
      - alert: ConnectionPoolExhaustion
        expr: connection_pool_usage > 90
        for: 2m
        annotations:
          summary: "Connection pool near capacity"
```

## Checklist

- [ ] Maintenance window scheduled
- [ ] Stakeholders notified
- [ ] Backup created
- [ ] Maintenance mode enabled
- [ ] Maintenance tasks completed
- [ ] Database health verified
- [ ] Performance metrics normal
- [ ] Application health verified
- [ ] Maintenance mode disabled
- [ ] Team notified
- [ ] Documentation updated

## Related Runbooks

- [Backup Recovery Runbook](./backup-recovery.md)
- [Incident Response Runbook](./incident-response.md)
- [Performance Tuning Runbook](./performance-tuning.md)
