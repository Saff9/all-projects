# To Kit - Database Schema Design

## Overview
This document outlines the database schema for the To Kit SaaS platform. The schema is designed to be normalized, scalable, and optimized for performance while maintaining data integrity.

## Database Selection
- **Primary Database**: PostgreSQL 15
- **Connection Pooling**: PgBouncer
- **Migration Tool**: Alembic
- **ORM**: SQLAlchemy

## Schema Design

### Core Tables

#### 1. users
Stores user account information and authentication data.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 2. user_profiles
Stores additional user profile information.

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    company VARCHAR(255),
    website VARCHAR(500),
    location VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

#### 3. api_keys
Stores API keys for programmatic access.

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '{\"read\": true, \"write\": true, \"delete\": true}',
    rate_limit_per_minute INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
```

#### 4. sessions
Stores user session information.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_refresh_token_hash ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### File Management Tables

#### 5. files
Stores metadata for uploaded files.

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    compression_settings JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'deleted')),
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    original_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    is_compressed BOOLEAN DEFAULT false,
    compressed_file_size BIGINT,
    compression_ratio DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_checksum ON files(checksum);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_created_at ON files(created_at);
CREATE INDEX idx_files_file_type ON files(file_type);
```

#### 6. file_versions
Stores different versions of processed files.

```sql
CREATE TABLE file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    version_name VARCHAR(100),
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    compression_settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(file_id, version_number)
);

CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX idx_file_versions_version_number ON file_versions(version_number);
```

#### 7. file_metadata
Stores additional metadata for files.

```sql
CREATE TABLE file_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    metadata_key VARCHAR(100) NOT NULL,
    metadata_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(file_id, metadata_key)
);

CREATE INDEX idx_file_metadata_file_id ON file_metadata(file_id);
CREATE INDEX idx_file_metadata_metadata_key ON file_metadata(metadata_key);
```

### Compression Processing Tables

#### 8. compression_jobs
Tracks compression job processing.

```sql
CREATE TABLE compression_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    compression_type VARCHAR(20) NOT NULL CHECK (compression_type IN ('image', 'pdf', 'image_to_pdf')),
    target_size_kb INTEGER,
    quality_percentage INTEGER,
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_compression_jobs_file_id ON compression_jobs(file_id);
CREATE INDEX idx_compression_jobs_user_id ON compression_jobs(user_id);
CREATE INDEX idx_compression_jobs_status ON compression_jobs(status);
CREATE INDEX idx_compression_jobs_created_at ON compression_jobs(created_at);
```

#### 9. compression_settings
Stores default compression settings per user.

```sql
CREATE TABLE compression_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    compression_type VARCHAR(20) NOT NULL CHECK (compression_type IN ('image', 'pdf', 'image_to_pdf')),
    default_target_size_kb INTEGER DEFAULT 500,
    default_quality_percentage INTEGER DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, compression_type)
);

CREATE INDEX idx_compression_settings_user_id ON compression_settings(user_id);
```

### Audit and Logging Tables

#### 10. audit_logs
Tracks user actions and system events.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### 11. system_logs
Stores system-level logs and metrics.

```sql
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_level VARCHAR(10) NOT NULL CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    message TEXT NOT NULL,
    context JSONB,
    service_name VARCHAR(50) DEFAULT 'to-kit',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_logs_log_level ON system_logs(log_level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
```

### Analytics Tables

#### 12. user_activities
Tracks user engagement and usage patterns.

```sql
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);
```

#### 13. usage_metrics
Stores aggregated usage data.

```sql
CREATE TABLE usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value BIGINT NOT NULL,
    metric_unit VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, metric_type)
);

CREATE INDEX idx_usage_metrics_date ON usage_metrics(date);
CREATE INDEX idx_usage_metrics_metric_type ON usage_metrics(metric_type);
```

## Database Relationships

```mermaid
entity-relationship-diagram
    users ||--o{ user_profiles : "has"
    users ||--o{ api_keys : "has"
    users ||--o{ sessions : "has"
    users ||--o{ files : "uploads"
    users ||--o{ compression_jobs : "creates"
    users ||--o{ compression_settings : "has"
    users ||--o{ user_activities : "generates"
    
    files ||--o{ file_versions : "has"
    files ||--o{ file_metadata : "has"
    files ||o--o{ compression_jobs : "processed by"
    
    compression_jobs ||--o{ audit_logs : "logs"
    users ||--o{ audit_logs : "generates"
    
    user_activities ||--o{ audit_logs : "logs"
```

## Database Constraints

### Foreign Key Constraints
- All foreign keys use `ON DELETE CASCADE` where appropriate
- `ON DELETE SET NULL` used for optional relationships
- `ON DELETE RESTRICT` for critical relationships

### Check Constraints
- Email format validation
- Username length and character restrictions
- File size limits
- Compression quality percentages
- Status field validations

### Unique Constraints
- Email addresses must be unique
- Usernames must be unique
- API keys must be unique
- File checksums for duplicate detection

## Performance Optimization

### Indexing Strategy
- **Primary Keys**: UUID with B-tree indexes
- **Foreign Keys**: Indexed for join performance
- **Search Fields**: GIN indexes for JSONB fields
- **Date Fields**: B-tree indexes for time-based queries
- **Composite Indexes**: For common query patterns

### Partitioning Strategy
- **Audit Logs**: Partitioned by date (monthly)
- **System Logs**: Partitioned by date (weekly)
- **Usage Metrics**: Partitioned by date (daily)

### Query Optimization
- **Connection Pooling**: PgBouncer with proper configuration
- **Read Replicas**: For read-heavy operations
- **Query Caching**: Redis for frequently accessed data
- **Materialized Views**: For complex analytics queries

## Security Considerations

### Data Protection
- **Encryption**: Sensitive data encrypted at rest
- **Access Control**: Row-level security policies
- **Audit Trail**: Complete activity logging
- **Data Retention**: Automated cleanup of old data

### Backup Strategy
- **Automated Backups**: Daily full backups
- **Point-in-time Recovery**: WAL archiving
- **Backup Testing**: Regular restore testing
- **Off-site Storage**: Encrypted backups in separate region

This schema provides a solid foundation for the To Kit platform, ensuring data integrity, performance, and scalability while maintaining security and compliance requirements.