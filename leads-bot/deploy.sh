#!/bin/bash

# Deployment script for leads-bot
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="leads-bot"

echo "🚀 Starting deployment for $PROJECT_NAME ($ENVIRONMENT environment)"

# Check if required environment variables are set
check_env_vars() {
    if [ -z "$BOT_TOKEN" ]; then
        echo "❌ Error: BOT_TOKEN environment variable is required"
        echo "Please set it or create a .env file with your bot token"
        exit 1
    fi
    
    if [ -z "$WEBHOOK_URL" ]; then
        echo "❌ Error: WEBHOOK_URL environment variable is required"
        echo "Please set it or create a .env file with your webhook URL"
        exit 1
    fi
}

# Create necessary directories
setup_directories() {
    echo "📁 Setting up directories..."
    mkdir -p data logs
    chmod 755 data logs
}

# Build Docker image
build_image() {
    echo "🔨 Building Docker image..."
    docker build -t $PROJECT_NAME:latest .
    echo "✅ Docker image built successfully"
}

# Deploy using docker-compose
deploy() {
    echo "🚀 Deploying $PROJECT_NAME..."
    
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "🔧 Starting in development mode..."
        docker-compose up -d
    else
        echo "🏭 Starting in production mode..."
        docker-compose up -d --remove-orphans
        
        # Wait for service to be healthy
        echo "⏳ Waiting for service to be healthy..."
        sleep 10
        
        # Check health
        if docker-compose ps | grep -q "healthy"; then
            echo "✅ Service is healthy"
        else
            echo "⚠️  Service may still be starting up. Check logs with: docker-compose logs"
        fi
    fi
}

# Show deployment status
show_status() {
    echo ""
    echo "📊 Deployment Status:"
    docker-compose ps
    echo ""
    echo "📋 Logs:"
    docker-compose logs --tail=20
    echo ""
    echo "🔗 Health Check:"
    curl -s http://localhost:8080/health || echo "Health check endpoint not available yet"
}

# Clean up old images
cleanup() {
    echo "🧹 Cleaning up old Docker images..."
    docker image prune -f
}

# Main deployment flow
main() {
    check_env_vars
    setup_directories
    
    case "$ENVIRONMENT" in
        "development")
            echo "🔧 Development mode selected"
            ;;
        "production")
            echo "🏭 Production mode selected"
            ;;
        *)
            echo "⚠️  Unknown environment: $ENVIRONMENT"
            echo "Usage: $0 [development|production]"
            exit 1
            ;;
    esac
    
    build_image
    deploy
    show_status
    cleanup
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test your bot by sending /start to it on Telegram"
    echo "2. Monitor logs with: docker-compose logs -f"
    echo "3. Stop the service with: docker-compose down"
    echo ""
    echo "🔗 Service URLs:"
    echo "- Bot: $WEBHOOK_URL"
    echo "- Health: http://localhost:8080/health"
}

# Run main function
main "$@"