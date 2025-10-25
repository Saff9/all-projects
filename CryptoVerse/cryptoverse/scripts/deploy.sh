#!/bin/bash

# ==========================================
# CryptoVerse Deployment Script
# ==========================================
# Usage: ./deploy.sh [environment] [version]
# Example: ./deploy.sh production v1.0.0
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
KUBERNETES_DIR="${PROJECT_ROOT}/infrastructure/kubernetes"

# Default values
ENVIRONMENT="${1:-staging}"
VERSION="${2:-latest}"
NAMESPACE="cryptoverse"
TIMEOUT="300s"

# ==========================================
# Helper Functions
# ==========================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
    echo ""
    echo "=========================================="
    echo "  CryptoVerse Deployment Script"
    echo "=========================================="
    echo ""
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check helm (optional)
    if ! command -v helm &> /dev/null; then
        log_warning "helm is not installed. Some features may not be available."
    fi
    
    # Check docker
    if ! command -v docker &> /dev/null; then
        log_warning "docker is not installed. Cannot build images locally."
    fi
    
    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

validate_environment() {
    log_info "Validating environment: ${ENVIRONMENT}"
    
    case "${ENVIRONMENT}" in
        staging)
            NAMESPACE="cryptoverse-staging"
            ;;
        production)
            NAMESPACE="cryptoverse"
            ;;
        *)
            log_error "Invalid environment: ${ENVIRONMENT}. Use 'staging' or 'production'."
            exit 1
            ;;
    esac
    
    log_success "Environment validated: ${ENVIRONMENT} (namespace: ${NAMESPACE})"
}

# ==========================================
# Deployment Functions
# ==========================================

create_namespace() {
    log_info "Creating namespace if not exists..."
    
    kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Namespace ready: ${NAMESPACE}"
}

apply_secrets() {
    log_info "Applying secrets..."
    
    # Check if secrets file exists
    if [ -f "${KUBERNETES_DIR}/secrets.yaml" ]; then
        # Check if secrets are already applied
        if kubectl get secret cryptoverse-secrets -n "${NAMESPACE}" &> /dev/null; then
            log_warning "Secrets already exist. Skipping..."
            log_warning "To update secrets, delete them first or use kubectl create secret"
        else
            kubectl apply -f "${KUBERNETES_DIR}/secrets.yaml" -n "${NAMESPACE}"
            log_success "Secrets applied"
        fi
    else
        log_warning "Secrets file not found. Skipping..."
    fi
}

apply_configmaps() {
    log_info "Applying ConfigMaps..."
    
    kubectl apply -f "${KUBERNETES_DIR}/configmap.yaml" -n "${NAMESPACE}"
    
    log_success "ConfigMaps applied"
}

deploy_database() {
    log_info "Deploying database..."
    
    # Check if using managed database
    if [ "${USE_MANAGED_DB}" = "true" ]; then
        log_info "Using managed database. Skipping PostgreSQL deployment..."
        return
    fi
    
    kubectl apply -f "${KUBERNETES_DIR}/postgres-deployment.yaml" -n "${NAMESPACE}"
    
    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=postgres -n "${NAMESPACE}" --timeout="${TIMEOUT}" || true
    
    log_success "Database deployed"
}

deploy_redis() {
    log_info "Deploying Redis..."
    
    kubectl apply -f "${KUBERNETES_DIR}/redis-deployment.yaml" -n "${NAMESPACE}"
    
    # Wait for Redis to be ready
    log_info "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redis -n "${NAMESPACE}" --timeout="${TIMEOUT}" || true
    
    log_success "Redis deployed"
}

deploy_api() {
    log_info "Deploying API with version: ${VERSION}..."
    
    # Update image tag in deployment
    if [ "${VERSION}" != "latest" ]; then
        sed -i.bak "s|cryptoverse/api:latest|cryptoverse/api:${VERSION}|g" "${KUBERNETES_DIR}/api-deployment.yaml"
    fi
    
    kubectl apply -f "${KUBERNETES_DIR}/api-deployment.yaml" -n "${NAMESPACE}"
    kubectl apply -f "${KUBERNETES_DIR}/api-service.yaml" -n "${NAMESPACE}"
    
    # Restore original file
    if [ -f "${KUBERNETES_DIR}/api-deployment.yaml.bak" ]; then
        mv "${KUBERNETES_DIR}/api-deployment.yaml.bak" "${KUBERNETES_DIR}/api-deployment.yaml"
    fi
    
    # Wait for deployment
    log_info "Waiting for API deployment to complete..."
    kubectl rollout status deployment/cryptoverse-api -n "${NAMESPACE}" --timeout="${TIMEOUT}"
    
    log_success "API deployed"
}

deploy_frontend() {
    log_info "Deploying Frontend with version: ${VERSION}..."
    
    # Update image tag in deployment
    if [ "${VERSION}" != "latest" ]; then
        sed -i.bak "s|cryptoverse/frontend:latest|cryptoverse/frontend:${VERSION}|g" "${KUBERNETES_DIR}/frontend-deployment.yaml"
    fi
    
    kubectl apply -f "${KUBERNETES_DIR}/frontend-deployment.yaml" -n "${NAMESPACE}"
    kubectl apply -f "${KUBERNETES_DIR}/frontend-service.yaml" -n "${NAMESPACE}"
    
    # Restore original file
    if [ -f "${KUBERNETES_DIR}/frontend-deployment.yaml.bak" ]; then
        mv "${KUBERNETES_DIR}/frontend-deployment.yaml.bak" "${KUBERNETES_DIR}/frontend-deployment.yaml"
    fi
    
    # Wait for deployment
    log_info "Waiting for Frontend deployment to complete..."
    kubectl rollout status deployment/cryptoverse-frontend -n "${NAMESPACE}" --timeout="${TIMEOUT}"
    
    log_success "Frontend deployed"
}

deploy_ingress() {
    log_info "Deploying Ingress..."
    
    kubectl apply -f "${KUBERNETES_DIR}/ingress.yaml" -n "${NAMESPACE}"
    
    log_success "Ingress deployed"
}

run_migrations() {
    log_info "Running database migrations..."
    
    # Create a migration job or use API endpoint
    kubectl exec -it deployment/cryptoverse-api -n "${NAMESPACE}" -- \
        npx prisma migrate deploy || log_warning "Migration command failed or not available"
    
    log_success "Migrations completed"
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    echo ""
    log_info "Pods:"
    kubectl get pods -n "${NAMESPACE}"
    
    echo ""
    log_info "Services:"
    kubectl get services -n "${NAMESPACE}"
    
    echo ""
    log_info "Ingress:"
    kubectl get ingress -n "${NAMESPACE}"
    
    echo ""
    log_info "Horizontal Pod Autoscalers:"
    kubectl get hpa -n "${NAMESPACE}"
    
    # Check pod health
    READY_PODS=$(kubectl get pods -n "${NAMESPACE}" -o json | jq -r '.items[] | select(.status.phase=="Running") | .status.containerStatuses[] | select(.ready==true) | .name' | wc -l)
    TOTAL_PODS=$(kubectl get pods -n "${NAMESPACE}" -o json | jq -r '.items[] | .status.containerStatuses[] | .name' | wc -l)
    
    echo ""
    log_info "Pod Health: ${READY_PODS}/${TOTAL_PODS} containers ready"
    
    if [ "${READY_PODS}" -eq "${TOTAL_PODS}" ]; then
        log_success "All pods are healthy"
    else
        log_warning "Some pods are not ready. Check the status above."
    fi
}

print_deployment_info() {
    echo ""
    echo "=========================================="
    log_success "Deployment Complete!"
    echo "=========================================="
    echo ""
    echo "Environment: ${ENVIRONMENT}"
    echo "Namespace: ${NAMESPACE}"
    echo "Version: ${VERSION}"
    echo ""
    echo "Useful Commands:"
    echo "  View pods:     kubectl get pods -n ${NAMESPACE}"
    echo "  View logs:     kubectl logs -f deployment/cryptoverse-api -n ${NAMESPACE}"
    echo "  Port forward:  kubectl port-forward svc/cryptoverse-api-service 3001:3001 -n ${NAMESPACE}"
    echo "  Rollback:      kubectl rollout undo deployment/cryptoverse-api -n ${NAMESPACE}"
    echo ""
}

# ==========================================
# Main Deployment Flow
# ==========================================

main() {
    print_banner
    
    log_info "Starting deployment..."
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Version: ${VERSION}"
    echo ""
    
    # Pre-deployment checks
    check_prerequisites
    validate_environment
    
    # Deploy in order
    create_namespace
    apply_configmaps
    apply_secrets
    deploy_database
    deploy_redis
    deploy_api
    deploy_frontend
    deploy_ingress
    
    # Post-deployment
    run_migrations
    verify_deployment
    print_deployment_info
}

# ==========================================
# Rollback Function
# ==========================================

rollback() {
    log_warning "Rolling back deployment..."
    
    kubectl rollout undo deployment/cryptoverse-api -n "${NAMESPACE}"
    kubectl rollout undo deployment/cryptoverse-frontend -n "${NAMESPACE}"
    
    kubectl rollout status deployment/cryptoverse-api -n "${NAMESPACE}" --timeout="${TIMEOUT}"
    kubectl rollout status deployment/cryptoverse-frontend -n "${NAMESPACE}" --timeout="${TIMEOUT}"
    
    log_success "Rollback completed"
}

# ==========================================
# Script Entry Point
# ==========================================

# Handle command line arguments
case "${1}" in
    rollback)
        ENVIRONMENT="${2:-staging}"
        validate_environment
        rollback
        ;;
    *)
        main
        ;;
esac