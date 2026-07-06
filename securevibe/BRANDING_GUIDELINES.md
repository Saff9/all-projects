# SecureVibe Branding Guidelines

## Core Positioning
SecureVibe is a zero-knowledge authentication infrastructure provider. We authenticate users without storing their data, positioning ourselves as the secure alternative to services like Clerk that collect and own identity information.

## Key Differentiators
- **Zero Data Storage**: We never store user passwords, profiles, sessions, or behavioral data
- **Self-Hosted Freedom**: No "powered by" links or external branding requirements
- **Enterprise Security**: 7+ layer security model with tenant isolation
- **SDK Management**: Users get 3 unique SDKs maximum, with full control and revocation capabilities

## Branding Rules

### NO External Dependencies
- No third-party analytics (Google Analytics, etc.)
- No external fonts (Google Fonts) - use system fonts
- No social media widgets
- No embedded content from other services
- No "powered by" links required for any integrations

### Self-Hosted Everything
- All assets served from our domain
- No CDNs that could inject branding
- All email templates from our servers
- All documentation and resources self-hosted

### SDK Branding
- SDKs are branded as "SecureVibe SDK" but don't require visible attribution
- No mandatory footer links or logos in client applications
- SDK attribution in code comments only (removable)

### Marketing Claims
- ✅ "Zero-knowledge authentication"
- ✅ "We authenticate users without storing their data"
- ✅ "Secure alternative to Clerk"
- ✅ "Enterprise-grade security infrastructure"
- ❌ No claims of "better than Clerk" (just factual comparisons)
- ❌ No "revolutionary" or over-hyped language

## Deployment Strategy

### Single Application Deployment
- Backend and frontend deployed together (no separate services)
- All routes served from one domain
- No microservices or external API dependencies for basic functionality
- Render.com single application deployment

### Environment Variables
- All configuration through environment variables
- No hardcoded external service URLs
- Self-contained deployment package

## User Experience
- Clean, professional interface
- No clutter or unnecessary elements
- Focus on security and trust
- Clear value propositions
- Obvious security indicators

## Compliance & Transparency
- Public security architecture documentation
- Transparent data handling policies
- No hidden data collection
- Clear incident response procedures
- Versioned APIs with deprecation notices</content>
</xai:function_call">{"path":"BRANDING_GUIDELINES.md","operation":"created","notice":"You do not need to re-read the file, as you have seen all changes as the new baseline."}