# SecureVibe SDK

Enterprise-grade authentication SDK for SecureVibe Zero-Knowledge Authentication Service.

## 🚀 Quick Start

### Installation

#### JavaScript/TypeScript
```bash
npm install @securevibe/sdk
# or
yarn add @securevibe/sdk
```

#### Python
```bash
pip install securevibe-sdk
```

#### Go
```bash
go get github.com/securevibe/sdk-go
```

### Basic Usage

#### JavaScript/TypeScript
```javascript
import { SecureVibeClient } from '@securevibe/sdk';

const client = new SecureVibeClient({
  tenantId: 'your-tenant-id',
  apiUrl: 'https://api.securevibe.com'
});

// Authenticate
const result = await client.authenticate({
  email: 'user@example.com',
  password: 'your-password'
});

if (result.success) {
  console.log('Authenticated:', result.token);
}
```

#### Python
```python
from securevibe_sdk import SecureVibeClient

client = SecureVibeClient(
    tenant_id='your-tenant-id',
    api_url='https://api.securevibe.com'
)

# Authenticate
result = client.authenticate(
    email='user@example.com',
    password='your-password'
)

if result.success:
    print(f"Authenticated: {result.token}")
```

#### Go
```go
import "github.com/securevibe/sdk-go"

client := securevibe.NewClient(&securevibe.Config{
    TenantID: "your-tenant-id",
    APIURL:   "https://api.securevibe.com",
})

// Authenticate
result, err := client.Authenticate(securevibe.AuthRequest{
    Email:    "user@example.com",
    Password: "your-password",
})

if err == nil && result.Success {
    fmt.Printf("Authenticated: %s\n", result.Token)
}
```

## 📚 Documentation

- [Installation Guide](docs/installation.md)
- [Authentication Guide](docs/authentication.md)
- [Session Management](docs/session-management.md)
- [Route Protection](docs/route-protection.md)
- [Error Handling](docs/error-handling.md)
- [Security Best Practices](docs/security.md)
- [API Reference](docs/api-reference.md)

## 🔧 CLI Tool

Install the CLI tool for quick setup and debugging:

```bash
npm install -g @securevibe/cli
# or
pip install securevibe-cli
```

### CLI Commands

```bash
# Initialize a new project
securevibe init

# Configure your tenant
securevibe configure

# Debug tokens
securevibe debug token <token>

# Generate API keys
securevibe keys generate

# Check status
securevibe status
```

## 🌐 Developer Portal

Access the [Developer Portal](https://developer.securevibe.com) for:

- API key management
- Usage analytics
- Documentation and guides
- Support and community

## 🧪 Examples

See the [examples](examples/) directory for complete applications:

- **Next.js App**: Full-stack authentication example
- **React SPA**: Single-page application
- **Express API**: Server-side authentication
- **Python Flask**: Python web application
- **Go Web App**: Go web application

## 🛡️ Security

This SDK implements enterprise-grade security:

- **Zero-Knowledge Architecture**: No sensitive data stored
- **End-to-End Encryption**: All data encrypted in transit and at rest
- **Secure Token Storage**: Automatic secure storage management
- **Automatic Token Rotation**: Seamless token refresh
- **Device Binding**: Cryptographic device attestation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.securevibe.com](https://docs.securevibe.com)
- **Support**: [support.securevibe.com](https://support.securevibe.com)
- **Security**: [security.securevibe.com](https://security.securevibe.com)

---

**Made with ❤️ by the SecureVibe Team**
