# SecureVibe Admin Guide

## Overview
SecureVibe is an enterprise-grade authentication service that provides secure user management, API key generation, and subscription tracking. This guide is for administrators managing the SecureVibe platform.

## Getting Started

### Initial Setup
1. Deploy SecureVibe to your hosting platform (Render/Vercel)
2. Set up MongoDB Atlas free cluster
3. Configure environment variables
4. Run `node utils/createAdmin.js` to create admin user
5. Access admin panel at `/api/admin`

### Admin Credentials
- Email: admin@securevibe.com
- Password: Admin123! (change immediately)

## Dashboard Features

### User Management
- View all registered users with pagination
- Search and filter users
- Update user roles (user/admin)
- Manage subscription status
- Track user verification status
- View user creation dates

### API Key Management
- Generate API keys for users
- Revoke API keys instantly
- Track API key usage (future feature)
- Secure key regeneration

### Statistics & Analytics
- Total user count
- Verified vs unverified users
- Paid vs free users
- Recent user registrations
- Subscription metrics

## Security Best Practices

### For Administrators
- Change default admin password immediately
- Enable 2FA on admin accounts
- Use strong, unique passwords
- Monitor login attempts
- Regular security audits

### User Security
- Enforce password policies
- Require email verification
- Monitor suspicious activities
- Rate limiting on all endpoints

## API Endpoints

### Authentication
```http
POST /api/admin/login
GET /api/admin/me
POST /api/admin/logout
```

### User Management
```http
GET /api/admin/users?page=1&limit=10
GET /api/admin/users/:id
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
POST /api/admin/users/:id/generate-api-key
POST /api/admin/users/:id/revoke-api-key
```

### Analytics
```http
GET /api/admin/stats
```

## Business Operations

### Subscription Management
- First 3 users per client: FREE
- After 3 users: $5/month per application
- Track subscription end dates
- Automated billing reminders

### Client Onboarding
1. Client signs up for SecureVibe
2. Admin creates API keys
3. Client integrates SecureVibe into their app
4. Monitor usage and billing

### Support & Troubleshooting
- Monitor error logs
- Check database connections
- Verify email configurations
- Handle user support requests

## Advanced Features

### Device Tracking
- Monitor user login devices
- Detect suspicious logins
- IP address tracking
- Session management

### Security Logs
- Failed login attempts
- API key usage
- Admin actions
- Security events

### Backup & Recovery
- Database backups
- Configuration exports
- Emergency admin access
- Data recovery procedures

## Enterprise Integrations

### Payment Processing
- Stripe integration for subscriptions
- Automated billing
- Invoice generation
- Payment tracking

### Monitoring & Analytics
- Real-time dashboards
- Performance metrics
- Error tracking
- User behavior analytics

### API Management
- Rate limiting per client
- Usage quotas
- API versioning
- Documentation portals

## Compliance & Security

### Data Protection
- GDPR compliance
- Data encryption at rest
- Secure data transmission
- User data portability

### Security Standards
- OWASP guidelines
- SOC 2 compliance
- Regular security audits
- Penetration testing

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check MongoDB Atlas credentials
   - Verify network connectivity
   - Check firewall settings

2. **Email Not Sending**
   - Verify Gmail app password
   - Check SMTP settings
   - Monitor email quotas

3. **API Rate Limiting**
   - Adjust rate limits in config
   - Monitor usage patterns
   - Implement client-side caching

### Emergency Procedures
- Admin account lockout recovery
- Database corruption recovery
- Security breach response
- Service outage handling

## Support

For technical support:
- Email: support@securevibe.com
- Documentation: https://docs.securevibe.com
- Emergency: +1-XXX-XXX-XXXX

---

**Protected by SecureVibe** 🛡️
