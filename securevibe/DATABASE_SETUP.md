# SecureVibe Database Setup Guide

SecureVibe supports both **MongoDB** and **PostgreSQL** databases with automatic schema creation and security optimizations.

## 🚀 Quick Start

### For MongoDB (Recommended for Development)
```bash
# 1. Install MongoDB locally or use MongoDB Atlas
# 2. Set environment variable
export MONGO_URI="mongodb://localhost:27017/securevibe"

# 3. Start SecureVibe
npm run dev
```

### For PostgreSQL (Recommended for Production)
```bash
# 1. Use Neon.tech, Supabase, or local PostgreSQL
# 2. Set environment variable
export DATABASE_URL="postgresql://user:password@host:5432/database"

# 3. Start SecureVibe
npm run dev
```

## 📊 Database Features

### ✅ Automatic Setup
- **Tables/Collections**: Created automatically on first run
- **Indexes**: Optimized for performance and security
- **Constraints**: Data validation and referential integrity
- **Migrations**: Safe schema updates with `alter: true`

### 🔒 Security Features
- **Encrypted Connections**: SSL/TLS enabled by default
- **Secure Indexes**: Optimized for authentication queries
- **Data Validation**: Schema-level constraints
- **Audit Trails**: Security event logging

## 🗄️ Supported Databases

### MongoDB
```bash
# Environment Variables
MONGO_URI=mongodb://localhost:27017/securevibe
# or
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/securevibe
```

**Auto-Created Collections:**
- `websiteusers` - User accounts with authentication
- `usersdks` - SDK management and keys
- `securityevents` - Audit logs

**Indexes Created:**
- `{email: 1}` (unique) - Email lookups
- `{verificationToken: 1}` - Email verification
- `{userId: 1, isActive: 1}` - Active SDK queries
- `{sdkId: 1}` (unique) - SDK identification

### PostgreSQL
```bash
# Environment Variables
DATABASE_URL=postgresql://user:password@host:5432/database
# or
POSTGRES_URI=postgresql://user:password@host:5432/database
```

**Auto-Created Tables:**
- `website_users` - User accounts
- `user_sdks` - SDK management
- `security_events` - Audit logs

**Constraints & Indexes:**
- Primary keys with UUID generation
- Foreign key relationships with CASCADE deletes
- Unique constraints on emails and SDK IDs
- JSONB storage for flexible event data

## 🛠️ Database Providers

### MongoDB Atlas (Cloud)
1. **Sign up**: https://mongodb.com/atlas
2. **Create cluster**: Free tier available
3. **Get connection string**: Format: `mongodb+srv://user:pass@cluster.mongodb.net/securevibe`
4. **Set environment**: `export MONGO_URI="your-connection-string"`

### Neon.tech (PostgreSQL)
1. **Sign up**: https://neon.tech
2. **Create project**: Free tier available
3. **Get connection string**: Format: `postgresql://user:pass@host.neon.tech/database`
4. **Set environment**: `export DATABASE_URL="your-connection-string"`

### Supabase (PostgreSQL)
1. **Sign up**: https://supabase.com
2. **Create project**: Free tier available
3. **Get connection string**: From project settings
4. **Set environment**: `export DATABASE_URL="your-connection-string"`

### Local Development

#### MongoDB Local
```bash
# Install MongoDB
# macOS
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb

# Default connection
export MONGO_URI="mongodb://localhost:27017/securevibe"
```

#### PostgreSQL Local
```bash
# Install PostgreSQL
# macOS
brew install postgresql
brew services start postgresql
createdb securevibe

# Ubuntu
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb securevibe

# Create user and grant permissions
sudo -u postgres psql
CREATE USER securevibe_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE securevibe TO securevibe_user;

# Connection string
export DATABASE_URL="postgresql://securevibe_user:your_password@localhost:5432/securevibe"
```

## 🔧 Environment Configuration

Create a `.env` file in the `securevibe` directory:

```bash
# For MongoDB
MONGO_URI=mongodb://localhost:27017/securevibe

# For PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/securevibe

# Required for all databases
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-chars

# Optional: Email configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📈 Database Schema

### Website Users Table/Collection
```sql
-- PostgreSQL
CREATE TABLE website_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT UNIQUE,
  verification_token_expiry TIMESTAMP,
  reset_password_token TEXT UNIQUE,
  reset_password_token_expiry TIMESTAMP,
  last_login TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  role VARCHAR(20) DEFAULT 'developer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User SDKs Table/Collection
```sql
-- PostgreSQL
CREATE TABLE user_sdks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES website_users(id) ON DELETE CASCADE,
  sdk_id TEXT UNIQUE NOT NULL,
  tenant_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  sdk_type VARCHAR(20) NOT NULL,
  public_key TEXT NOT NULL,
  private_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  revoked_reason VARCHAR(50),
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔍 Health Checks

SecureVibe includes automatic database health monitoring:

```javascript
// Check database health
const health = require('./config/database').checkDatabaseHealth();
console.log(health); // { status: 'healthy', type: 'mongodb|postgresql' }
```

## 🛡️ Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Enable SSL/TLS** for production connections
4. **Regular backups** of your database
5. **Monitor connection pools** and performance
6. **Implement rate limiting** at database level if needed

## 🔄 Migration Between Databases

To switch databases:

1. **Export data** from current database
2. **Set new environment variable** (MONGO_URI or DATABASE_URL)
3. **Restart application** - schemas create automatically
4. **Import data** if needed (users will need to re-register for security)

## 🚨 Troubleshooting

### Connection Issues
```
❌ MongoDB connection failed: Authentication failed
✅ Solution: Check username/password in connection string
```

```
❌ PostgreSQL connection failed: role does not exist
✅ Solution: Create database user and grant permissions
```

### Schema Issues
```
❌ Collection/Table already exists with different schema
✅ Solution: Drop collection/table or use different database name
```

### Performance Issues
- **MongoDB**: Check connection pool size and indexes
- **PostgreSQL**: Monitor query plans and add indexes as needed

## 📞 Support

If you encounter database issues:
1. Check the console logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure database server is running and accessible
4. Check firewall and security group settings for cloud databases

SecureVibe automatically handles schema creation and optimization, so you can focus on building your application! 🎉</content>
</xai:function_call">{"path":"DATABASE_SETUP.md","operation":"created","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}