# Performance Tuning Runbook

## Overview

This runbook provides procedures for optimizing the performance of the SecureVibe authentication service.

## Performance Metrics

### Key Indicators

| Metric | Target | Warning | Critical |
|---------|--------|----------|----------|
| Response Time (p95) | < 200ms | > 200ms | > 500ms |
| Error Rate | < 1% | > 1% | > 5% |
| CPU Usage | < 70% | > 70% | > 90% |
| Memory Usage | < 80% | > 80% | > 90% |
| Database Query Time | < 100ms | > 100ms | > 500ms |
| Event Loop Lag | < 50ms | > 50ms | > 100ms |
| Connection Pool Usage | < 80% | > 80% | > 95% |

## Tuning Procedures

### 1. Application-Level Tuning

#### Node.js Optimization

```javascript
// Enable production mode
const NODE_ENV = process.env.NODE_ENV || 'production';

// Optimize garbage collection
if (global.gc) {
  // Trigger GC during low traffic
  setInterval(() => {
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
      global.gc();
    }
  }, 60000); // Every minute
}

// Optimize event loop
// Use async/await properly
// Avoid blocking operations
// Use worker threads for CPU-intensive tasks
```

#### Connection Pool Tuning

```javascript
// config/database.js
module.exports = {
  pool: {
    min: 5,           // Minimum connections
    max: 20,          // Maximum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  }
};
```

#### Caching Strategy

```javascript
// utils/cacheManager.js
// Implement multi-level caching

// Level 1: In-memory cache (hot data)
const localCache = new Map();

// Level 2: Redis cache (warm data)
const redisCache = require('./cacheManager');

// Level 3: Database (cold data)
// Cache TTL: 5 minutes for hot, 1 hour for warm
```

### 2. Database Tuning

#### PostgreSQL Configuration

```sql
-- postgresql.conf optimizations

-- Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 128MB

-- Connection settings
max_connections = 200
shared_preload_libraries = 'all'

-- Query planning
random_page_cost = 1.1
effective_io_concurrency = 200

-- Logging
log_min_duration_statement = 1000
log_checkpoints = on
```

#### Index Optimization

```sql
-- Create composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_users_email_verified 
  ON users(email, is_verified);

CREATE INDEX CONCURRENTLY idx_sessions_user_expires 
  ON sessions(user_id, expires_at);

-- Partial indexes for large tables
CREATE INDEX CONCURRENTLY idx_audit_logs_created_date 
  ON audit_logs(created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '30 days';
```

#### Query Optimization

```sql
-- Use EXPLAIN ANALYZE to identify slow queries
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'test@example.com';

-- Add appropriate indexes based on query patterns
-- Avoid SELECT *
-- Use LIMIT for pagination
-- Use JOINs efficiently
```

### 3. Redis Tuning

#### Configuration

```conf
# redis.conf optimizations

maxmemory 2gb
maxmemory-policy allkeys-lru
tcp-backlog 511
timeout 300
tcp-keepalive 60

# Persistence
save 900 1
save 300 10
save 60 10000
```

#### Connection Pooling

```javascript
// utils/cacheManager.js
const redis = require('redis').createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: 3,
  retryStrategy: require('redis').strategies.FAST_RETRY,
  enableReadyCheck: true,
  enableOfflineQueue: true
});
```

### 4. Network Optimization

#### Keep-Alive Settings

```javascript
// server.js
const server = app.listen(process.env.PORT || 5000, () => {
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds
});
```

#### Compression

```javascript
// Enable compression
const compression = require('compression');
app.use(compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

#### HTTP/2

```javascript
// Enable HTTP/2
const spdy = require('spdy');
const server = spdy.createServer({
  spdy: {
    ssl: true,
    protocols: ['h2']
  }
}, app);
```

## Performance Testing

### Load Testing

```bash
# Using k6
k6 run --vus 100 --duration 5m load-test.js

# Using Apache Bench
ab -n 1000 -c 100 https://api.securevibe.com/health

# Using wrk
wrk -t12 -c400 -d30s https://api.securevibe.com/api/v2/auth/login
```

### Profiling

```bash
# Enable CPU profiling
node --prof server.js

# Generate profile report
node --prof-process isolate-*.log > profile.txt

# Visualize with 0x
0x profile.txt

# Memory profiling
node --heap-prof server.js
```

## Monitoring and Analysis

### Real-Time Monitoring

```bash
# Monitor key metrics
# Use Grafana dashboard
# Set up alerts for thresholds

# Monitor slow queries
# Enable slow query log in PostgreSQL
# Review regularly

# Monitor event loop lag
# Use utils/profiler.js eventLoopMonitor
```

### Performance Analysis

```bash
# Analyze logs for patterns
grep "slow" securevibe/logs/app.log | tail -100

# Check database statistics
kubectl exec -it securevibe-db-0 -- psql -U securevibe -d securevibe -c "
  SELECT 
    schemaname,
    tablename,
    seq_scan,
    idx_scan,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
  FROM pg_stat_user_tables
  ORDER BY seq_scan DESC;
"

# Review connection pool usage
# Check active connections
# Monitor wait times
```

## Common Performance Issues

### Issue 1: Slow Authentication

**Symptoms:**
- Login requests taking > 500ms
- High database query times
- User complaints

**Solutions:**
```sql
-- Add indexes on email
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Cache user lookups
-- Implement Redis caching for active sessions

-- Optimize password hashing
-- Use bcrypt with appropriate cost factor
```

### Issue 2: High Memory Usage

**Symptoms:**
- OOM kills
- Memory > 90%
- Slow garbage collection

**Solutions:**
```javascript
// Implement memory monitoring
// Use utils/resourceOptimizer.js memoryMonitor

// Optimize data structures
// Use streams for large payloads
// Implement object pooling

// Tune garbage collection
if (global.gc) {
  // Trigger GC strategically
  setInterval(() => global.gc(), 300000); // Every 5 minutes
}
```

### Issue 3: Database Connection Pool Exhaustion

**Symptoms:**
- Connection errors
- High wait times
- Pool at capacity

**Solutions:**
```javascript
// Increase pool size
module.exports = {
  pool: {
    min: 10,
    max: 50  // Increased from 20
  }
};

// Implement connection timeout
// Add retry logic with exponential backoff

// Monitor pool usage
// Add alerts for high usage
```

### Issue 4: High CPU Usage

**Symptoms:**
- CPU > 80%
- Slow response times
- Event loop lag

**Solutions:**
```javascript
// Profile CPU usage
// Use utils/profiler.js

// Optimize algorithms
// Use caching to reduce computation
// Implement worker threads for CPU-intensive tasks

// Use cluster mode for multi-core utilization
const cluster = require('cluster');
if (cluster.isMaster) {
  const numCPUs = require('os').cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}
```

## Optimization Checklist

- [ ] Performance baseline established
- [ ] Bottlenecks identified
- [ ] Optimization plan created
- [ ] Changes implemented
- [ ] Performance tested
- [ ] Metrics verified
- [ ] Documentation updated
- [ ] Team trained on changes

## Related Runbooks

- [Scaling Runbook](./scaling.md)
- [Database Maintenance Runbook](./database-maintenance.md)
- [Incident Response Runbook](./incident-response.md)
