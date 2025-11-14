# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. **Email** the maintainer directly (see contact form on website)
3. Include as much detail as possible: steps to reproduce, impact assessment, and suggested fix

We will respond within **48 hours** and work to resolve the issue promptly.

## UPI Payment Security

- The UPI ID is stored with base64 encoding as a basic obfuscation layer — it is **not** encrypted
- All payments are processed through the user's own UPI app (GPay, PhonePe, Paytm, etc.)
- No payment data is collected, stored, or transmitted by this website
- The `upi://pay?` deep link protocol is an industry standard used by NPCI

## Scope

This policy applies to the Kongvael Holdings website codebase. Third-party services (UPI apps, Vercel hosting) have their own security policies.

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | ✅        |
| Older   | ❌        |
