# 🤖 Lead Bot

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-20.7-green.svg)](https://github.com/python-telegram-bot/python-telegram-bot)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](https://docker.com)
[![Render](https://img.shields.io/badge/Render-Deployed-green.svg)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Powerful, production-ready Telegram bot for collecting and managing leads with smart scoring, duplicate detection, and comprehensive monitoring.**

## ✨ Features

- 🤖 **Conversational Lead Collection** - Friendly, interactive form-based lead collection
- 🎯 **Smart Lead Scoring** - Automatic scoring based on contact information and message quality  
- 🔄 **Duplicate Detection** - Prevents duplicate leads using SHA256 fingerprinting
- 🛡️ **Rate Limiting** - Protects against spam and abuse (5 requests per 10 seconds)
- 👑 **Admin Dashboard** - View and manage leads through Telegram commands
- 🚀 **Production Ready** - Docker support, health checks, monitoring, and comprehensive logging
- 🔒 **Security First** - Input validation, sanitization, and error handling
- 📊 **Real-time Monitoring** - Health checks, logging, and performance metrics

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Telegram Bot Token (get from [@BotFather](https://t.me/BotFather))
- [Render account](https://render.com) (for deployment) or Docker (for local)

### 1. Setup

```bash
# Clone the repository
git clone <repository-url>
cd leads-bot

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

### 2. Configuration

Edit your `.env` file:

```bash
# Required
BOT_TOKEN=your_telegram_bot_token_here
WEBHOOK_URL=https://your-service-name.onrender.com

# Optional  
ADMIN_ID=your_telegram_user_id_here
LOG_LEVEL=INFO
ENVIRONMENT=production
```

### 3. Local Development

```bash
# Start in development mode
./deploy.sh development

# View logs
docker-compose logs -f

# Run deployment tests
python test_deployment.py
```

### 4. Production Deployment

#### Using Render (Recommended)

1. 🔄 Connect your GitHub repository to Render
2. 🌐 Create a new Web Service  
3. ⚙️ Configure environment variables
4. 🚀 Deploy!

#### Using Docker Compose

```bash
# Build and deploy
./deploy.sh production
```

## 🏗️ Architecture

```
leads-bot/
├── 📁 main.py              # Application entry point
├── 📁 config.py            # Environment configuration  
├── 📁 health.py            # Health check endpoint
├── 📁 handlers/            # Telegram bot handlers
│   ├── 📄 setup.py         # Business setup commands
│   ├── 📄 form.py          # Lead collection form
│   └── 📄 admin.py         # Admin management commands
├── 📁 services/            # Business logic
│   ├── 📄 lead_service.py  # Lead creation and management
│   ├── 📄 scoring.py       # Lead scoring algorithm
│   └── 📄 notify_service.py # Admin notifications
├── 📁 core/                # Core utilities
│   ├── 📄 logger.py        # Logging configuration
│   ├── 📄 ratelimiter.py   # Rate limiting
│   ├── 📄 sanitizer.py     # Input validation and sanitization
│   ├── 📄 validators.py    # Input validation
│   └── 📄 fingerprint.py   # Duplicate detection
├── 📁 db/                  # Database layer
│   ├── 📄 models.py        # Database schema
│   ├── 📄 database.py      # Database connection
│   └── 📄 repo.py          # Database operations
├── 🐳 Dockerfile           # Docker configuration
├── 🐳 docker-compose.yml   # Local development setup
├── ☁️ render.yaml          # Render deployment config
└── 📋 deployment/          # Deployment scripts and docs
```

## 🤖 Bot Commands

### For Businesses (Admins)

| Command | Description |
|---------|-------------|
| `/setup` | Register your business |
| `/leads` | View all collected leads |
| `/export` | Export leads (coming soon) |
| `/stats` | View lead statistics (coming soon) |

### For Customers

| Command | Description |
|---------|-------------|
| `/start` | Begin lead collection conversation |
| `/cancel` | Cancel current conversation |

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BOT_TOKEN` | ✅ | - | Telegram bot token from @BotFather |
| `WEBHOOK_URL` | ✅ | - | Your service URL for webhooks |
| `DB_NAME` | ❌ | `leads.db` | Database filename |
| `ADMIN_ID` | ❌ | - | Telegram user ID for admin notifications |
| `LOG_LEVEL` | ❌ | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR) |
| `ENVIRONMENT` | ❌ | `production` | Environment indicator |

### Webhook Configuration

The bot uses webhooks for receiving Telegram updates. The webhook URL should be accessible from Telegram's servers.

**For Render:** Use the provided service URL  
**For local development:** Use ngrok for testing

## 📊 Monitoring & Health

### Health Checks

- **Endpoint:** `http://localhost:8080/health`
- **Response:** JSON status with timestamp and service info
- **Monitoring:** Built-in Docker and Render health checks

### Logging

- **Console:** Real-time logging during development
- **File:** `bot.log` in production
- **Levels:** Configurable via `LOG_LEVEL` environment variable

### Metrics Tracked

- ✅ Lead creation success/failure rates
- ✅ Database operations
- ✅ Webhook responses  
- ✅ Error occurrences

## 🔒 Security Features

### Built-in Protections

- **Rate Limiting:** 5 requests per 10 seconds per user
- **Input Validation:** All user inputs are validated and sanitized
- **Duplicate Detection:** Prevents duplicate leads using SHA256 fingerprints
- **Error Handling:** Graceful error handling prevents crashes
- **Environment Security:** Secure configuration management

### Best Practices

1. 🔑 Use strong, unique bot tokens
2. 🔐 Enable webhook secrets for additional security
3. 📊 Monitor logs for suspicious activity
4. 🔄 Keep dependencies updated

## 🐛 Troubleshooting

### Common Issues

**Bot not responding:**
```bash
# Check BOT_TOKEN is correct
echo $BOT_TOKEN

# Verify webhook URL is accessible  
curl -I $WEBHOOK_URL

# Check logs for errors
docker-compose logs --tail=50
```

**Database issues:**
```bash
# Ensure write permissions
ls -la data/

# Check disk space
df -h

# Verify SQLite is available
sqlite3 --version
```

**Webhook errors:**
```bash
# Test webhook URL
curl http://localhost:10000/webhook

# Check firewall settings
netstat -tlnp | grep 10000
```

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=DEBUG ./deploy.sh development
```

### Health Check

Test service health:
```bash
curl http://localhost:8080/health
```

## 🧪 Testing

### Deployment Readiness

Run comprehensive tests:
```bash
python test_deployment.py
```

### Local Testing

1. Start development server:
   ```bash
   ./deploy.sh development
   ```

2. Test with ngrok:
   ```bash
   ngrok http 10000
   ```

3. Update webhook URL in Telegram:
   ```bash
   curl -F "url=https://your-ngrok-url" https://api.telegram.org/botYOUR_TOKEN/setWebhook
   ```

## 📈 Performance

### Resource Usage

- **Memory:** ~100-200MB
- **CPU:** Low usage, scales with traffic
- **Storage:** Database grows with leads

### Scaling Options

For high traffic:
1. **Horizontal scaling:** Deploy multiple instances
2. **Database:** Consider PostgreSQL for large datasets
3. **Caching:** Add Redis for session management

## 🔄 Maintenance

### Database Backups

```bash
# Backup database
cp data/leads.db data/leads.db.backup

# Restore database
cp data/leads.db.backup data/leads.db
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Redeploy
./deploy.sh production
```

## 📞 Support

For issues and questions:

1. 🔍 Check the [GitHub Issues](https://github.com/your-repo/leads-bot/issues)
2. 📋 Review logs for error details
3. 🧪 Test with minimal configuration
4. 📧 Contact support with detailed error information

## 📋 Deployment Checklist

- [ ] ✅ Environment variables configured
- [ ] ✅ Bot token obtained from @BotFather
- [ ] ✅ Webhook URL accessible
- [ ] ✅ Database permissions set
- [ ] ✅ Health check endpoint working
- [ ] ✅ Logs configured
- [ ] ✅ Monitoring in place
- [ ] ✅ Backup strategy defined

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. 🔧 Make your changes
4. 🧪 Add tests for new functionality
5. 📤 Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [python-telegram-bot](https://github.com/python-telegram-bot/python-telegram-bot) for the excellent Telegram bot framework
- [Render](https://render.com) for the fantastic deployment platform
- All contributors and testers

---

## 🚀 Get Started Now!

```bash
# Quick start
git clone <repository-url>
cd leads-bot
cp .env.example .env
# Edit .env with your bot token
./deploy.sh production
```

**Made with ❤️ for businesses that want to collect leads efficiently**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)