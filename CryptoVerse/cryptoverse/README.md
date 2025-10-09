# CryptoVerse

A production-ready crypto Telegram Mini App with mining mechanics, character collection, and achievement system.

## 🚀 Features

- **Telegram Mini App Integration** - Seamless integration with Telegram WebApp API
- **Mining System** - Tap-to-mine mechanics with passive income generation
- **Character Collection** - Collect and upgrade unique crypto characters
- **Achievement System** - Unlock achievements and earn rewards
- **Quest System** - Complete daily and weekly quests
- **Leaderboard** - Compete with other players globally
- **Airdrop Integration** - Token distribution and reward claiming

## 🏗️ Architecture

This project follows a monorepo architecture using Turborepo and pnpm.

```
cryptoverse/
├── apps/
│   ├── api/          # NestJS Backend API
│   └── frontend/     # Next.js Telegram Mini App
├── packages/
│   ├── shared/       # Shared utilities and types
│   └── database/     # Prisma schema and migrations
├── infrastructure/
│   ├── docker/       # Docker configurations
│   ├── kubernetes/   # Kubernetes manifests
│   ├── nginx/        # Nginx reverse proxy
│   ├── monitoring/   # Prometheus & Grafana configs
│   ├── terraform/    # Terraform IaC
│   └── env/          # Environment templates
└── scripts/          # Deployment and utility scripts
```

## 📋 Prerequisites

- Node.js 20+
- pnpm 9.0+
- Docker (optional, for containerized development)
- PostgreSQL 15+
- Redis 7+
- kubectl (for Kubernetes deployment)
- Helm (optional, for Helm-based deployment)

## 🛠️ Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cryptoverse

# Install dependencies
pnpm install

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/frontend/.env.example apps/frontend/.env

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed the database (optional)
pnpm db:seed
```

### Development

```bash
# Start all services in development mode
pnpm dev

# Start specific service
pnpm api:dev      # Start API server
pnpm frontend:dev # Start frontend dev server
```

### Build

```bash
# Build all packages and apps
pnpm build

# Build specific app
pnpm api:build
pnpm frontend:build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter=@cryptoverse/api
```

### Linting & Formatting

```bash
# Lint all files
pnpm lint

# Format all files
pnpm format

# Check formatting
pnpm format:check
```

## 📦 Package Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development servers |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |

---

## 🚢 Deployment

### Quick Start with Docker Compose

```bash
# Build and run all services
cd infrastructure/docker
docker-compose up -d

# Build specific service
docker-compose build api
docker-compose build frontend

# View logs
docker-compose logs -f api
docker-compose logs -f frontend
```

### Kubernetes Deployment

#### Prerequisites

1. Kubernetes cluster (v1.28+)
2. kubectl configured
3. Helm v3 (optional)
4. Container registry access

#### Option 1: Using kubectl

```bash
# Create namespace and apply configurations
kubectl apply -f infrastructure/kubernetes/namespace.yaml
kubectl apply -f infrastructure/kubernetes/configmap.yaml
kubectl apply -f infrastructure/kubernetes/secrets.yaml

# Deploy database (or use managed service)
kubectl apply -f infrastructure/kubernetes/postgres-deployment.yaml
kubectl apply -f infrastructure/kubernetes/redis-deployment.yaml

# Deploy applications
kubectl apply -f infrastructure/kubernetes/api-deployment.yaml
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml

# Deploy services and ingress
kubectl apply -f infrastructure/kubernetes/api-service.yaml
kubectl apply -f infrastructure/kubernetes/frontend-service.yaml
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

#### Option 2: Using Deployment Script

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production v1.0.0

# Rollback deployment
./scripts/deploy.sh rollback staging
```

#### Option 3: Using Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="staging.tfvars"

# Apply configuration
terraform apply -var-file="staging.tfvars"
```

### Environment-Specific Deployment

#### Staging

```bash
# Using kubectl
kubectl apply -k infrastructure/kubernetes/overlays/staging

# Using script
./scripts/deploy.sh staging
```

#### Production

```bash
# Using kubectl
kubectl apply -k infrastructure/kubernetes/overlays/production

# Using script
./scripts/deploy.sh production v1.0.0
```

---

## 🔧 Environment Variables

### API Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `development` |
| `PORT` | API server port | No | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRATION` | JWT token expiration | No | `7d` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Yes | - |
| `TELEGRAM_BOT_ID` | Telegram bot ID | Yes | - |
| `CORS_ORIGIN` | Allowed CORS origins | No | `*` |
| `LOG_LEVEL` | Logging level | No | `info` |

### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | API endpoint URL | Yes | - |
| `NEXT_PUBLIC_TELEGRAM_BOT_ID` | Telegram bot ID | Yes | - |
| `NEXT_PUBLIC_APP_NAME` | Application name | No | `CryptoVerse` |

### Production Environment Setup

1. Copy the example environment file:
   ```bash
   cp infrastructure/env/.env.production.example .env.production
   ```

2. Update all required values:
   ```bash
   # Generate secure secrets
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For ENCRYPTION_KEY
   ```

3. Create Kubernetes secrets:
   ```bash
   kubectl create secret generic cryptoverse-secrets \
     --from-literal=DATABASE_URL='your-database-url' \
     --from-literal=JWT_SECRET='your-jwt-secret' \
     --from-literal=TELEGRAM_BOT_TOKEN='your-bot-token' \
     -n cryptoverse
   ```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

The project includes comprehensive CI/CD pipelines:

#### Main Pipeline (`.github/workflows/ci.yml`)

- **Triggers**: Push to main/develop, Pull Requests
- **Jobs**:
  1. **Lint & Type Check** - Code quality validation
  2. **Unit Tests** - Run test suite with coverage
  3. **Build** - Build API and Frontend
  4. **Docker Build & Push** - Build and push container images
  5. **Deploy to Staging** - Automatic staging deployment (develop branch)
  6. **Deploy to Production** - Production deployment with manual approval (main branch)

#### Preview Deployments (`.github/workflows/preview.yml`)

- **Triggers**: Pull Request events
- **Features**:
  - Creates isolated preview environment per PR
  - Automatic cleanup on PR close
  - Comment with preview URL on PR

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/token |
| `KUBE_CONFIG` | Base64 encoded kubeconfig |
| `JWT_SECRET` | JWT signing secret |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `DATABASE_URL` | Database connection string |
| `API_URL` | Production API URL |

### Manual Deployment via GitHub Actions

1. Go to Actions tab in GitHub
2. Select "CryptoVerse CI/CD"
3. Click "Run workflow"
4. Select environment (staging/production)

---

## 📊 Monitoring & Logging

### Prometheus Metrics

The API exposes metrics at `/metrics` endpoint:

- HTTP request duration
- Request count by status
- Active connections
- Database query performance
- Redis operations
- Custom business metrics

### Grafana Dashboard

Import the pre-configured dashboard:

```bash
# Dashboard location
infrastructure/monitoring/grafana-dashboard.json
```

Dashboard panels include:
- Request rate and latency
- Error rate
- CPU and memory usage
- Database connections
- Redis performance
- Business metrics (users, tokens, etc.)

### Setting Up Monitoring

```bash
# Install Prometheus stack using Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Import Grafana dashboard
# 1. Open Grafana UI
# 2. Go to Dashboards > Import
# 3. Upload grafana-dashboard.json
```

### Log Aggregation

Recommended log aggregation solutions:
- **Loki** - For Kubernetes-native logging
- **ELK Stack** - Elasticsearch, Logstash, Kibana
- **Datadog** - Commercial solution

### Health Checks

```bash
# API health check
./infrastructure/health/healthcheck-api.sh https://api.cryptoverse.example.com

# Frontend health check
./infrastructure/health/healthcheck-frontend.sh https://cryptoverse.example.com

# Kubernetes probe mode
./infrastructure/health/healthcheck-api.sh --k8s http://localhost:3001
```

---

## 📈 Scaling Guidelines

### Horizontal Pod Autoscaler

The deployment includes HPA configurations:

| Service | Min Replicas | Max Replicas | Target CPU |
|---------|--------------|--------------|------------|
| API | 3 | 10 | 70% |
| Frontend | 2 | 5 | 70% |

### Manual Scaling

```bash
# Scale API deployment
kubectl scale deployment/cryptoverse-api --replicas=5 -n cryptoverse

# Scale frontend deployment
kubectl scale deployment/cryptoverse-frontend --replicas=3 -n cryptoverse
```

### Database Scaling

For production, consider:
- **Managed PostgreSQL**: AWS RDS, Google Cloud SQL, Azure Database
- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: PgBouncer or similar

### Redis Scaling

Options for Redis scaling:
- **Redis Cluster**: For high availability
- **Managed Redis**: AWS ElastiCache, Google Memorystore
- **Redis Sentinel**: For automatic failover

---

## 🔒 Security Best Practices

### Secrets Management

1. **Never commit secrets** to version control
2. Use **Kubernetes Secrets** or external secret managers
3. **Rotate secrets** regularly
4. Use **sealed-secrets** or **external-secrets-operator** for GitOps

### Network Security

1. **Network Policies** are configured to restrict pod-to-pod communication
2. **Ingress** uses TLS with modern cipher suites
3. **Rate limiting** is configured at ingress level

### Container Security

1. Containers run as **non-root user**
2. **Read-only root filesystem** where possible
3. **Security contexts** are defined for all pods
4. **Resource limits** prevent resource exhaustion

---

## 🐛 Troubleshooting

### Common Issues

#### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n cryptoverse

# Check logs
kubectl logs <pod-name> -n cryptoverse

# Check events
kubectl get events -n cryptoverse --sort-by='.lastTimestamp'
```

#### Database Connection Issues

```bash
# Verify database pod is running
kubectl get pods -l app.kubernetes.io/name=postgres -n cryptoverse

# Check database credentials
kubectl get secret postgres-credentials -n cryptoverse -o yaml

# Test connection from API pod
kubectl exec -it deployment/cryptoverse-api -n cryptoverse -- nc -zv postgres-service 5432
```

#### Ingress Not Working

```bash
# Check ingress status
kubectl get ingress -n cryptoverse

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Verify DNS resolution
nslookup cryptoverse.example.com
```

### Rollback

```bash
# Rollback API deployment
kubectl rollout undo deployment/cryptoverse-api -n cryptoverse

# Rollback to specific revision
kubectl rollout undo deployment/cryptoverse-api --to-revision=2 -n cryptoverse

# Check rollout history
kubectl rollout history deployment/cryptoverse-api -n cryptoverse
```

---

## 📁 Project Structure

### API (NestJS)

- `src/modules/` - Feature modules (auth, user, wallet, mining, etc.)
- `src/common/` - Shared utilities, guards, interceptors
- `src/config/` - Configuration files
- `src/database/` - Database related files

### Frontend (Next.js)

- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/stores/` - State management (Zustand)
- `src/services/` - API service layer
- `src/types/` - TypeScript types
- `src/utils/` - Utility functions

### Infrastructure

- `infrastructure/docker/` - Docker and Docker Compose files
- `infrastructure/kubernetes/` - Kubernetes manifests
- `infrastructure/nginx/` - Nginx configuration
- `infrastructure/monitoring/` - Prometheus and Grafana configs
- `infrastructure/terraform/` - Terraform IaC files
- `infrastructure/env/` - Environment templates
- `infrastructure/health/` - Health check scripts

### Scripts

- `scripts/deploy.sh` - Deployment script
- `scripts/seed-production.sh` - Production database seeding
- `scripts/backup.sh` - Database backup script

---

## 📚 Documentation

- [Architecture Documentation](../plans/ARCHITECTURE.md)
- [API Documentation](./apps/api/README.md)
- [Frontend Documentation](./apps/frontend/README.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [NestJS](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Turborepo](https://turbo.build/)
