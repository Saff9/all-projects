# Lead Bot Deployment Guide

This guide will help you deploy the Lead Bot to production using Docker and Render.

## 🚀 Quick Start

### 1. Environment Setup

1. **Copy environment variables template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your environment variables:**
   ```bash
   # Required
   BOT_TOKEN=your_telegram_bot_token_here
   WEBHOOK_URL=https://your-service-name.onrender.com
   
   # Optional
   ADMIN_ID=your_telegram_user_id_here
   LOG_LEVEL=INFO
   ```

### 2. Local Development

```bash
# Start in development mode
./deploy.sh development

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### 3. Production Deployment

#### Option A: Using Render (Recommended)

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure environment variables in Render dashboard:**
   - `BOT_TOKEN`: Your Telegram bot token
   - `WEBHOOK_URL`: Your Render service URL (e.g., `https://your-service.onrender.com`)
   - `ADMIN_ID`: Your Telegram user ID (optional)
   - `LOG_LEVEL`: `INFO` (recommended)

4. **Set build command:**
   ```
   docker build -t leads-bot .
   ```

5. **Set start command:**
   ```
   python main.py
   ```

6. **Deploy!**

#### Option B: Using Docker Compose

```bash
# Build and deploy
./deploy.sh production

# Monitor deployment
docker-compose ps
docker-compose logs
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BOT_TOKEN` | ✅ | Telegram bot token from @BotFather |
| `WEBHOOK_URL` | ✅ | Your service URL (e.g., `https://your-service.onrender.com`) |
| `DB_NAME` | ❌ | Database filename (default: `leads.db`) |
| `ADMIN_ID` | ❌ | Telegram user ID for admin notifications |
| `LOG_LEVEL` | ❌ | Logging level (DEBUG, INFO, WARNING, ERROR) |
| `ENVIRONMENT` | ❌ | Environment indicator (development, production) |

### Webhook Configuration

The bot uses webhooks for receiving Telegram updates. Ensure your webhook URL is accessible from Telegram's servers.

**For Render:**
- Use the provided service URL
- No additional configuration needed

**For local development:**
- Use a tool like ngrok for testing: `ngrok http 10000`
- Update `WEBHOOK_URL` to your ngrok URL

## 📊 Monitoring

### Health Checks

The bot includes a health check endpoint:
- **URL:** `http://localhost:8080/health`
- **Response:** JSON status with timestamp and service info

### Logging

Logs are written to:
- **Console:** Real-time logging during development
- **File:** `bot.log` in production (when `ENVIRONMENT=production`)

### Metrics

The bot tracks:
- Lead creation success/failure rates
- Database operations
- Webhook responses
- Error occurrences

## 🔒 Security

### Best Practices

1. **Use strong environment variables**
2. **Enable webhook secrets** (optional)
3. **Monitor logs for suspicious activity**
4. **Keep dependencies updated**

### Rate Limiting

The bot includes built-in rate limiting:
- **5 requests per 10 seconds per user**
- **Prevents spam and abuse**

### Input Validation

All user inputs are validated:
- **Names:** 2-50 characters, letters and spaces only
- **Phone numbers:** 7-15 digits
- **Email addresses:** Valid email format
- **Messages:** 5-500 characters

## 🐛 Troubleshooting

### Common Issues

**Bot not responding:**
- Check `BOT_TOKEN` is correct
- Verify webhook URL is accessible
- Check logs for errors

**Database issues:**
- Ensure write permissions to `data/` directory
- Check disk space
- Verify SQLite is available

**Webhook errors:**
- Test webhook URL with curl
- Check firewall settings
- Verify SSL certificate (if using HTTPS)

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

## 🔄 Maintenance

### Database Backups

```bash
# Backup database
cp data/leads.db data/leads.db.backup

# Restore database
cp data/leads.db.backup data/leads.db
```

### Updates

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Redeploy:**
   ```bash
   ./deploy.sh production
   ```

### Monitoring Commands

```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f

# Restart service
docker-compose restart

# Stop service
docker-compose down
```

## 📈 Performance

### Resource Usage

- **Memory:** ~100-200MB
- **CPU:** Low usage, scales with traffic
- **Storage:** Database grows with leads

### Scaling

For high traffic:
1. **Horizontal scaling:** Deploy multiple instances
2. **Database:** Consider PostgreSQL for large datasets
3. **Caching:** Add Redis for session management

## 🧪 Testing

### Local Testing

1. **Start development server:**
   ```bash
   ./deploy.sh development
   ```

2. **Test with ngrok:**
   ```bash
   ngrok http 10000
   ```

3. **Update webhook URL in Telegram:**
   ```bash
   curl -F "url=https://your-ngrok-url" https://api.telegram.org/botYOUR_TOKEN/setWebhook
   ```

### Automated Tests

```bash
# Run tests (when available)
python -m pytest tests/
```

## 📞 Support

For issues and questions:
1. Check the [GitHub Issues](https://github.com/your-repo/leads-bot/issues)
2. Review logs for error details
3. Test with minimal configuration
4. Contact support with detailed error information

## 📋 Checklist

- [ ] Environment variables configured
- [ ] Bot token obtained from @BotFather
- [ ] Webhook URL accessible
- [ ] Database permissions set
- [ ] Health check endpoint working
- [ ] Logs configured
- [ ] Monitoring in place
- [ ] Backup strategy defined