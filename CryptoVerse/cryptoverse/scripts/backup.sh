#!/bin/bash

# ==========================================
# CryptoVerse Database Backup Script
# ==========================================
# This script creates backups of the PostgreSQL database
# and optionally uploads them to cloud storage
#
# Usage: ./backup.sh [environment] [options]
# Options:
#   --upload    Upload backup to cloud storage
#   --retain N  Retain last N backups (default: 7)
#
# Example: ./backup.sh production --upload --retain 14
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
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)

# Default values
ENVIRONMENT="${1:-staging}"
UPLOAD_TO_CLOUD=false
RETAIN_COUNT=7

# Parse arguments
shift
while [[ $# -gt 0 ]]; do
    case $1 in
        --upload)
            UPLOAD_TO_CLOUD=true
            shift
            ;;
        --retain)
            RETAIN_COUNT="$2"
            shift 2
            ;;
        *)
            log_warning "Unknown option: $1"
            shift
            ;;
    esac
done

# Namespace based on environment
case "${ENVIRONMENT}" in
    staging)
        NAMESPACE="cryptoverse-staging"
        ;;
    production)
        NAMESPACE="cryptoverse"
        ;;
    *)
        NAMESPACE="cryptoverse"
        ;;
esac

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
    echo "  CryptoVerse Database Backup Script"
    echo "=========================================="
    echo ""
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    # Check if cluster is accessible
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Create backup directory
    mkdir -p "${BACKUP_DIR}"
    
    log_success "Prerequisites check passed"
}

# ==========================================
# Backup Functions
# ==========================================

get_postgres_pod() {
    kubectl get pods -n "${NAMESPACE}" -l app.kubernetes.io/name=postgres -o jsonpath='{.items[0].metadata.name}'
}

get_database_credentials() {
    # Get database credentials from secret
    DB_USER=$(kubectl get secret postgres-credentials -n "${NAMESPACE}" -o jsonpath='{.data.POSTGRES_USER}' | base64 -d)
    DB_NAME=$(kubectl get secret postgres-credentials -n "${NAMESPACE}" -o jsonpath='{.data.POSTGRES_DB}' | base64 -d)
    DB_PASSWORD=$(kubectl get secret postgres-credentials -n "${NAMESPACE}" -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d)
}

create_database_backup() {
    log_info "Creating database backup..."
    
    local POD_NAME=$(get_postgres_pod)
    
    if [ -z "${POD_NAME}" ]; then
        log_error "PostgreSQL pod not found"
        exit 1
    fi
    
    log_info "Found PostgreSQL pod: ${POD_NAME}"
    
    get_database_credentials
    
    # Backup filename
    BACKUP_FILE="${BACKUP_DIR}/cryptoverse_${ENVIRONMENT}_${TIMESTAMP}.sql.gz"
    
    log_info "Creating backup: ${BACKUP_FILE}"
    
    # Create backup using pg_dump
    kubectl exec -n "${NAMESPACE}" "${POD_NAME}" -- \
        pg_dump -U "${DB_USER}" -d "${DB_NAME}" --format=plain --no-owner --no-acl | \
        gzip > "${BACKUP_FILE}"
    
    # Get backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    
    log_success "Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})"
    
    # Create metadata file
    cat > "${BACKUP_FILE}.meta" <<EOF
timestamp=${TIMESTAMP}
environment=${ENVIRONMENT}
database=${DB_NAME}
size=${BACKUP_SIZE}
pod=${POD_NAME}
created_at=$(date -Iseconds)
EOF
    
    log_success "Metadata file created"
}

create_redis_backup() {
    log_info "Creating Redis backup..."
    
    local REDIS_POD=$(kubectl get pods -n "${NAMESPACE}" -l app.kubernetes.io/name=redis -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "${REDIS_POD}" ]; then
        log_warning "Redis pod not found, skipping Redis backup"
        return
    fi
    
    REDIS_BACKUP_FILE="${BACKUP_DIR}/redis_${ENVIRONMENT}_${TIMESTAMP}.rdb"
    
    # Trigger Redis BGSAVE
    kubectl exec -n "${NAMESPACE}" "${REDIS_POD}" -- redis-cli BGSAVE
    
    # Wait for save to complete
    sleep 5
    
    # Copy RDB file
    kubectl cp "${NAMESPACE}/${REDIS_POD}:/data/dump.rdb" "${REDIS_BACKUP_FILE}"
    
    log_success "Redis backup created: ${REDIS_BACKUP_FILE}"
}

verify_backup() {
    log_info "Verifying backup integrity..."
    
    if [ -f "${BACKUP_FILE}" ]; then
        # Test gzip integrity
        if gzip -t "${BACKUP_FILE}" 2>/dev/null; then
            log_success "Backup integrity verified"
        else
            log_error "Backup integrity check failed"
            exit 1
        fi
    else
        log_error "Backup file not found"
        exit 1
    fi
}

upload_to_cloud() {
    if [ "${UPLOAD_TO_CLOUD}" = true ]; then
        log_info "Uploading backup to cloud storage..."
        
        # Check for cloud storage tools
        if command -v aws &> /dev/null; then
            # AWS S3 upload
            S3_BUCKET="${S3_BACKUP_BUCKET:-cryptoverse-backups}"
            S3_PATH="s3://${S3_BUCKET}/${ENVIRONMENT}/${DATE}"
            
            aws s3 cp "${BACKUP_FILE}" "${S3_PATH}/$(basename ${BACKUP_FILE})"
            aws s3 cp "${BACKUP_FILE}.meta" "${S3_PATH}/$(basename ${BACKUP_FILE}).meta"
            
            log_success "Backup uploaded to S3: ${S3_PATH}"
            
        elif command -v gsutil &> /dev/null; then
            # Google Cloud Storage upload
            GCS_BUCKET="${GCS_BACKUP_BUCKET:-cryptoverse-backups}"
            GCS_PATH="gs://${GCS_BUCKET}/${ENVIRONMENT}/${DATE}"
            
            gsutil cp "${BACKUP_FILE}" "${GCS_PATH}/$(basename ${BACKUP_FILE})"
            gsutil cp "${BACKUP_FILE}.meta" "${GCS_PATH}/$(basename ${BACKUP_FILE}).meta"
            
            log_success "Backup uploaded to GCS: ${GCS_PATH}"
            
        elif command -v az &> /dev/null; then
            # Azure Blob Storage upload
            AZ_CONTAINER="${AZ_BACKUP_CONTAINER:-cryptoverse-backups}"
            
            az storage blob upload --container-name "${AZ_CONTAINER}" \
                --file "${BACKUP_FILE}" \
                --name "${ENVIRONMENT}/${DATE}/$(basename ${BACKUP_FILE})"
            
            log_success "Backup uploaded to Azure Blob Storage"
            
        else
            log_warning "No cloud storage CLI found. Skipping upload."
            log_warning "Install aws-cli, gsutil, or azure-cli to enable cloud uploads."
        fi
    fi
}

cleanup_old_backups() {
    log_info "Cleaning up old backups (retaining last ${RETAIN_COUNT})..."
    
    # List all backup files for this environment
    cd "${BACKUP_DIR}"
    
    # Count backups
    BACKUP_COUNT=$(ls -1 cryptoverse_${ENVIRONMENT}_*.sql.gz 2>/dev/null | wc -l)
    
    if [ "${BACKUP_COUNT}" -gt "${RETAIN_COUNT}" ]; then
        # Delete old backups
        ls -1t cryptoverse_${ENVIRONMENT}_*.sql.gz | tail -n +$((RETAIN_COUNT + 1)) | while read file; do
            log_info "Deleting old backup: ${file}"
            rm -f "${file}" "${file}.meta"
        done
        
        log_success "Old backups cleaned up"
    else
        log_info "No old backups to clean up (${BACKUP_COUNT} backups, retaining ${RETAIN_COUNT})"
    fi
}

print_backup_summary() {
    echo ""
    echo "=========================================="
    log_success "Backup Complete!"
    echo "=========================================="
    echo ""
    echo "Environment: ${ENVIRONMENT}"
    echo "Namespace: ${NAMESPACE}"
    echo "Backup File: ${BACKUP_FILE}"
    echo "Backup Size: ${BACKUP_SIZE}"
    echo "Uploaded to Cloud: ${UPLOAD_TO_CLOUD}"
    echo ""
    echo "To restore this backup, run:"
    echo "  ./restore.sh ${ENVIRONMENT} ${BACKUP_FILE}"
    echo ""
}

# ==========================================
# Restore Function (for reference)
# ==========================================

restore_backup() {
    local RESTORE_FILE="${1}"
    
    if [ ! -f "${RESTORE_FILE}" ]; then
        log_error "Backup file not found: ${RESTORE_FILE}"
        exit 1
    fi
    
    log_warning "This will replace the current database!"
    read -p "Are you sure you want to restore? (yes/no) " -r
    echo ""
    
    if [[ ! $REPLY == "yes" ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
    
    local POD_NAME=$(get_postgres_pod)
    get_database_credentials
    
    log_info "Restoring database from: ${RESTORE_FILE}"
    
    # Drop existing connections
    kubectl exec -n "${NAMESPACE}" "${POD_NAME}" -- \
        psql -U "${DB_USER}" -d postgres -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();"
    
    # Drop and recreate database
    kubectl exec -n "${NAMESPACE}" "${POD_NAME}" -- \
        psql -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
    kubectl exec -n "${NAMESPACE}" "${POD_NAME}" -- \
        psql -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"
    
    # Restore backup
    gunzip -c "${RESTORE_FILE}" | kubectl exec -i -n "${NAMESPACE}" "${POD_NAME}" -- \
        psql -U "${DB_USER}" -d "${DB_NAME}"
    
    log_success "Database restored successfully"
}

# ==========================================
# Main Backup Flow
# ==========================================

main() {
    print_banner
    
    log_info "Starting backup..."
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Namespace: ${NAMESPACE}"
    echo ""
    
    check_prerequisites
    create_database_backup
    create_redis_backup
    verify_backup
    upload_to_cloud
    cleanup_old_backups
    print_backup_summary
}

# ==========================================
# Script Entry Point
# ==========================================

# Handle restore command
if [ "${1}" = "restore" ]; then
    if [ -z "${2}" ]; then
        log_error "Please specify backup file to restore"
        echo "Usage: ./backup.sh restore <backup_file>"
        exit 1
    fi
    ENVIRONMENT="${3:-staging}"
    restore_backup "${2}"
else
    main
fi