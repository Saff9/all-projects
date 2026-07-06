# SecureVibe Enterprise Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying SecureVibe, our enterprise-grade authentication service. As a senior engineer with 15+ years of experience in security and scalable systems, I've written this guide to ensure successful deployment across different environments.

## Prerequisites Checklist

### Required Accounts
- [ ] MongoDB Atlas account (free tier available)
- [ ] Gmail account (for email notifications)
- [ ] Google Cloud Console account (for OAuth)
- [ ] Render.com or Vercel account (for hosting)

### System Requirements
- [ ] Node.js 18+ LTS installed
- [ ] Git client installed
- [ ] SSH keys configured (for private repos)
- [ ] Domain name (optional, for custom branding)

## Environment Setup

### 1. MongoDB Atlas Configuration

**Step 1: Create Cluster**
```bash
# Access https://cloud.mongodb.com/
# 1. Create account → New Project → Build a Cluster
# 2. Choose FREE tier (M0 Sandbox)
# 3. Select region closest to your users (e.g., AWS / us-east-1)
# 4. Create cluster name: "securevibe-prod"
```

**Step 2: Database User Setup**
```bash
# In Atlas Dashboard:
# 1. Database Access → Add New Database User
# 2. Authentication Method: Password
# 3. Username: securevibe_user
# 4. Password: [Generate strong password]
# 5. Built-in Role: Read and write to any database
```

**Step 3: Network Access**
```bash
# Network Access → Add IP Address
# For development: Add your current IP
# For production: Add 0.0.0.0/0 (allow all) - we'll secure this later
```

**Step 4: Connection String**
```bash
# Clusters → Connect → Connect your application
# Copy the connection string, it should look like:
# mongodb+srv://securevibe_user:<password>@securevibe-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 2. Gmail SMTP Configuration

**Step 1: Enable 2-Factor Authentication**
```bash
# Gmail Settings → Security → 2-Step Verification → Enable
```

**Step 2: Generate App Password**
```bash
# Gmail Settings → Security → App passwords
# 1. Select "Mail" and your device
# 2. Generate password (16-character code)
# 3. Save this password - you'll need it later
```

### 3. Google OAuth Setup

**Step 1: Create Project**
```bash
# Access https://console.cloud.google.com/
# 1. New Project → Name: "SecureVibe Auth"
# 2. APIs & Services → OAuth consent screen
# 3. User Type: External
# 4. App name: SecureVibe
# 5. Support email: your-email@gmail.com
```

**Step 2: Create Credentials**
```bash
# APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client IDs
# 1. Application type: Web application
# 2. Name: SecureVibe Web Client
# 3. Authorized redirect URIs:
#    - For development: http://localhost:5000/api/auth/google/callback
#    - For production: https://your-domain.com/api/auth/google/callback
# 4. Copy Client ID and Client Secret
```

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/securevibe.git
cd securevibe

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### 2. Environment Configuration

**Create .env file:**
```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

**.env file contents:**
```env
# Database Configuration
MONGO_URI=mongodb+srv://securevibe_user:your_password_here@securevibe-prod.xxxxx.mongodb.net/securevibe?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_64_characters
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here_minimum_64_characters

# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000

# Security (generate strong passwords)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Production Environment (leave as is for dev)
NODE_ENV=development
```

### 3. Generate Secure Secrets

**For JWT secrets, use this command:**
```bash
# Generate 64-character secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Never use:**
- Dictionary words
- Personal information
- Short strings (< 64 characters)
- Reused passwords

### 4. Database Initialization

```bash
# Start the server to create collections
npm run dev

# In another terminal, create admin user
node utils/createAdmin.js

# Expected output:
# Admin user created successfully
# Email: admin@securevibe.com
# Password: Admin123!
# Please change the password after first login
```

### 5. Verify Setup

```bash
# Check health endpoint
curl http://localhost:5000/api/health

# Should return:
{
  "success": true,
  "message": "SecureVibe API is running",
  "timestamp": "2024-01-15T10:17:00.000Z",
  "uptime": 123.456,
  "poweredBy": "SecureVibe"
}
```

## Production Deployment

### Option 1: Render (Recommended)

**Step 1: Connect Repository**
```bash
# 1. Go to https://render.com/
# 2. Connect GitHub account
# 3. Search for your securevibe repository
# 4. Click "Connect"
```

**Step 2: Configure Web Service**
```yaml
# render.yaml (already created in repo)
services:
  - type: web
    name: securevibe-api
    runtime: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

**Step 3: Environment Variables**
```bash
# In Render Dashboard → Service → Environment
# Add all variables from your .env file
# Important: Use production URLs for FRONTEND_URL and API_BASE_URL
```

**Step 4: Custom Domain (Optional)**
```bash
# Render Dashboard → Service → Settings → Custom Domain
# Add your domain (e.g., auth.yourcompany.com)
# Update DNS records as instructed
```

**Step 5: SSL Certificate**
```bash
# Render provides free SSL automatically
# Your site will be available at https://your-service.onrender.com
```

### Option 2: Vercel

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
vercel login
```

**Step 2: Deploy**
```bash
# From project root
vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Set build settings (use defaults)
# - Configure environment variables
```

**Step 3: Configure Domain**
```bash
# Vercel Dashboard → Project → Settings → Domains
# Add custom domain and configure DNS
```

## Security Hardening

### 1. Environment Security

**Never commit sensitive data:**
```bash
# Add to .gitignore
.env
.env.local
.env.production
config/secrets.json
```

**Use environment-specific configs:**
```javascript
// config/production.js
module.exports = {
  database: {
    uri: process.env.MONGO_URI,
    options: {
      ssl: true,
      sslValidate: true,
      sslCA: process.env.CA_CERT
    }
  },
  security: {
    jwtExpiry: '24h', // Shorter in production
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    }
  }
};
```

### 2. Network Security

**Configure MongoDB Atlas:**
```bash
# Atlas Dashboard → Network Access
# Remove 0.0.0.0/0 access
# Add only your server IPs:
# - Render: Get static IPs from Render docs
# - Vercel: Use IP allowlisting or VPN
```

**API Security Headers:**
```javascript
// middleware/security.js already includes:
- Helmet for security headers
- CORS configuration
- XSS protection
- CSRF protection
```

### 3. Monitoring and Alerts

**Set up monitoring:**
```bash
# Health check endpoint: /api/health
# Status endpoint: /api/auth/status
# Error logging: Automatic in crashHandler.js

# Recommended: Set up external monitoring
# - UptimeRobot for uptime monitoring
# - Sentry for error tracking
# - DataDog for performance monitoring
```

## Performance Optimization

### 1. Database Optimization

**Create indexes:**
```javascript
// models/User.js - Add indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'securityLogs.timestamp': -1 });
userSchema.index({ createdAt: -1 });
```

**Connection pooling:**
```javascript
// config/database.js
mongoose.connect(uri, {
  maxPoolSize: 10, // Adjust based on load
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 2. Caching Strategy

**Implement Redis (optional):**
```bash
# For session storage and API response caching
npm install redis
```

### 3. CDN and Assets

**Static asset optimization:**
```javascript
// server.js - Enable gzip compression
const compression = require('compression');
app.use(compression());
```

## Backup and Recovery

### 1. Database Backups

**MongoDB Atlas backups:**
```bash
# Atlas Dashboard → Backup → Enable automated backups
# Schedule: Daily at 02:00 UTC
# Retention: 7 days rolling
```

### 2. Configuration Backups

**Environment variables:**
```bash
# Use a password manager (1Password, LastPass)
# Document all environment variables
# Create restore scripts
```

### 3. Emergency Procedures

**Incident response plan:**
```bash
# 1. Identify the issue
# 2. Isolate affected systems
# 3. Restore from backup if needed
# 4. Update security measures
# 5. Communicate with stakeholders
```

## Scaling Considerations

### Horizontal Scaling

**Load balancer setup:**
```bash
# For multiple instances:
# 1. Use Redis for session storage
# 2. Configure sticky sessions
# 3. Implement database connection pooling
```

### Vertical Scaling

**Resource monitoring:**
```bash
# Monitor these metrics:
# - CPU usage (>80% = scale up)
# - Memory usage (>85% = scale up)
# - Database connections (>80% of pool = scale up)
# - Response time (>500ms = investigate)
```

## Troubleshooting

### Common Issues

**Database connection failed:**
```bash
# Check MongoDB Atlas:
# 1. Network access whitelist
# 2. Database user credentials
# 3. Cluster region and status
```

**Application won't start:**
```bash
# Check logs:
npm run dev
# Look for:
# - Missing environment variables
# - Port conflicts
# - Permission issues
```

**High latency:**
```bash
# Performance checklist:
# 1. Database query optimization
# 2. Add missing indexes
# 3. Implement caching
# 4. Check network latency
```

### Debug Mode

**Enable detailed logging:**
```javascript
// Add to .env
DEBUG=securevibe:*
NODE_ENV=development
```

**Check system resources:**
```bash
# On the server
top
df -h
free -h
netstat -tlnp
```

## Maintenance Procedures

### Weekly Tasks
- [ ] Review security logs
- [ ] Check database performance
- [ ] Update dependencies
- [ ] Monitor error rates

### Monthly Tasks
- [ ] Security vulnerability scan
- [ ] Performance optimization
- [ ] Backup verification
- [ ] SSL certificate renewal

### Quarterly Tasks
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Disaster recovery testing
- [ ] Compliance review

## Support and Documentation

### Internal Documentation
- [ ] Admin Guide: `guides/ADMIN_GUIDE.md`
- [ ] Developer Guide: `guides/DEVELOPER_GUIDE.md`
- [ ] API Documentation: `/api/docs` (future)
- [ ] Incident Response Plan

### External Resources
- [ ] MongoDB Atlas Documentation
- [ ] Render/Vercel Documentation
- [ ] Node.js Security Best Practices
- [ ] OWASP Security Guidelines

## Final Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Database connections tested
- [ ] Admin user created and password changed
- [ ] SSL certificates valid
- [ ] DNS records configured
- [ ] Monitoring tools set up
- [ ] Backup procedures tested

### Post-Launch
- [ ] First user registration tested
- [ ] Email notifications working
- [ ] Payment processing functional
- [ ] Performance benchmarks established
- [ ] Support channels configured

---

## Emergency Contacts

**System Administration:**
- Primary: [Your Name] - [Your Phone] - [Your Email]
- Secondary: [Backup Contact]

**Infrastructure:**
- Hosting Provider: Render/Vercel Support
- Database: MongoDB Atlas Support

**Security:**
- Incident Response: [Security Team Contact]

---

*This deployment guide was written by a senior engineer with extensive experience in enterprise-scale application deployment and security. Follow these procedures carefully to ensure a secure, reliable, and scalable SecureVibe installation.*
