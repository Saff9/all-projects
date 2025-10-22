#!/bin/bash

# ==========================================
# CryptoVerse API Health Check Script
# ==========================================
# This script performs comprehensive health checks
# on the CryptoVerse API service
#
# Usage: ./healthcheck-api.sh [api_url]
# Example: ./healthcheck-api.sh https://api.cryptoverse.example.com
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${1:-http://localhost:3001}"
TIMEOUT=10
MAX_RETRIES=3
RETRY_DELAY=5

# Health check endpoints
HEALTH_LIVE="/api/health/live"
HEALTH_READY="/api/health/ready"
HEALTH_DETAILED="/api/health"

# ==========================================
# Helper Functions
# ==========================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_header() {
    echo ""
    echo "=========================================="
    echo "  CryptoVerse API Health Check"
    echo "=========================================="
    echo "API URL: ${API_URL}"
    echo "Time: $(date -Iseconds)"
    echo ""
}

# ==========================================
# Health Check Functions
# ==========================================

check_http_status() {
    local url="${1}"
    local expected_status="${2:-200}"
    local description="${3}"
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${TIMEOUT}" "${url}" 2>/dev/null || echo "000")
    
    if [ "${status}" = "${expected_status}" ]; then
        log_success "${description} (HTTP ${status})"
        return 0
    else
        log_error "${description} (Expected: ${expected_status}, Got: ${status})"
        return 1
    fi
}

check_response_time() {
    local url="${1}"
    local max_time="${2:-2000}"  # milliseconds
    
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time "${TIMEOUT}" "${url}" 2>/dev/null || echo "0")
    local response_ms=$(echo "${response_time} * 1000" | bc | cut -d. -f1)
    
    if [ "${response_ms}" -le "${max_time}" ]; then
        log_success "Response time: ${response_ms}ms (threshold: ${max_time}ms)"
        return 0
    else
        log_warning "Slow response time: ${response_ms}ms (threshold: ${max_time}ms)"
        return 1
    fi
}

check_json_field() {
    local url="${1}"
    local field="${2}"
    local expected_value="${3}"
    local description="${4}"
    
    local response=$(curl -s --max-time "${TIMEOUT}" "${url}" 2>/dev/null || echo "{}")
    local actual_value=$(echo "${response}" | jq -r ".${field}" 2>/dev/null || echo "null")
    
    if [ "${actual_value}" = "${expected_value}" ]; then
        log_success "${description}: ${actual_value}"
        return 0
    else
        log_error "${description} (Expected: ${expected_value}, Got: ${actual_value})"
        return 1
    fi
}

# ==========================================
# Individual Health Checks
# ==========================================

check_liveness() {
    log_info "Checking liveness probe..."
    
    for i in $(seq 1 ${MAX_RETRIES}); do
        if check_http_status "${API_URL}${HEALTH_LIVE}" "200" "Liveness probe"; then
            return 0
        fi
        
        if [ "${i}" -lt "${MAX_RETRIES}" ]; then
            log_warning "Retry ${i}/${MAX_RETRIES} in ${RETRY_DELAY}s..."
            sleep "${RETRY_DELAY}"
        fi
    done
    
    return 1
}

check_readiness() {
    log_info "Checking readiness probe..."
    
    for i in $(seq 1 ${MAX_RETRIES}); do
        if check_http_status "${API_URL}${HEALTH_READY}" "200" "Readiness probe"; then
            return 0
        fi
        
        if [ "${i}" -lt "${MAX_RETRIES}" ]; then
            log_warning "Retry ${i}/${MAX_RETRIES} in ${RETRY_DELAY}s..."
            sleep "${RETRY_DELAY}"
        fi
    done
    
    return 1
}

check_database() {
    log_info "Checking database connection..."
    
    local response=$(curl -s --max-time "${TIMEOUT}" "${API_URL}${HEALTH_DETAILED}" 2>/dev/null || echo "{}")
    local db_status=$(echo "${response}" | jq -r '.components.database.status // "unknown"' 2>/dev/null || echo "unknown")
    
    if [ "${db_status}" = "healthy" ] || [ "${db_status}" = "up" ]; then
        log_success "Database connection: ${db_status}"
        return 0
    else
        log_error "Database connection: ${db_status}"
        return 1
    fi
}

check_redis() {
    log_info "Checking Redis connection..."
    
    local response=$(curl -s --max-time "${TIMEOUT}" "${API_URL}${HEALTH_DETAILED}" 2>/dev/null || echo "{}")
    local redis_status=$(echo "${response}" | jq -r '.components.redis.status // "unknown"' 2>/dev/null || echo "unknown")
    
    if [ "${redis_status}" = "healthy" ] || [ "${redis_status}" = "up" ]; then
        log_success "Redis connection: ${redis_status}"
        return 0
    else
        log_error "Redis connection: ${redis_status}"
        return 1
    fi
}

check_api_version() {
    log_info "Checking API version..."
    
    local response=$(curl -s --max-time "${TIMEOUT}" "${API_URL}${HEALTH_DETAILED}" 2>/dev/null || echo "{}")
    local version=$(echo "${response}" | jq -r '.version // .info.version // "unknown"' 2>/dev/null || echo "unknown")
    
    if [ "${version}" != "unknown" ] && [ "${version}" != "null" ]; then
        log_success "API Version: ${version}"
        return 0
    else
        log_warning "Could not determine API version"
        return 0
    fi
}

check_ssl_certificate() {
    log_info "Checking SSL certificate..."
    
    if [[ "${API_URL}" != https* ]]; then
        log_info "Not using HTTPS, skipping SSL check"
        return 0
    fi
    
    local host=$(echo "${API_URL}" | sed 's|https://||' | cut -d'/' -f1)
    local cert_info=$(echo | openssl s_client -servername "${host}" -connect "${host}:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
    
    if [ -n "${cert_info}" ]; then
        local expiry=$(echo "${cert_info}" | grep "notAfter" | cut -d= -f2)
        log_success "SSL Certificate valid until: ${expiry}"
        return 0
    else
        log_warning "Could not verify SSL certificate"
        return 0
    fi
}

check_rate_limiting() {
    log_info "Checking rate limiting headers..."
    
    local headers=$(curl -s -I --max-time "${TIMEOUT}" "${API_URL}${HEALTH_LIVE}" 2>/dev/null || echo "")
    
    if echo "${headers}" | grep -qi "x-ratelimit"; then
        log_success "Rate limiting headers present"
        return 0
    else
        log_info "Rate limiting headers not detected (may be handled upstream)"
        return 0
    fi
}

check_cors() {
    log_info "Checking CORS configuration..."
    
    local cors_header=$(curl -s -I --max-time "${TIMEOUT}" -H "Origin: https://cryptoverse.example.com" "${API_URL}${HEALTH_LIVE}" 2>/dev/null | grep -i "access-control-allow-origin" || echo "")
    
    if [ -n "${cors_header}" ]; then
        log_success "CORS configured: ${cors_header}"
        return 0
    else
        log_info "CORS headers not detected (may be handled by proxy)"
        return 0
    fi
}

check_security_headers() {
    log_info "Checking security headers..."
    
    local headers=$(curl -s -I --max-time "${TIMEOUT}" "${API_URL}${HEALTH_LIVE}" 2>/dev/null || echo "")
    local pass=true
    
    # Check X-Content-Type-Options
    if echo "${headers}" | grep -qi "x-content-type-options: nosniff"; then
        log_success "X-Content-Type-Options: nosniff"
    else
        log_warning "Missing X-Content-Type-Options header"
        pass=false
    fi
    
    # Check X-Frame-Options
    if echo "${headers}" | grep -qi "x-frame-options"; then
        log_success "X-Frame-Options present"
    else
        log_warning "Missing X-Frame-Options header"
        pass=false
    fi
    
    if [ "${pass}" = true ]; then
        return 0
    else
        return 1
    fi
}

# ==========================================
# Main Health Check
# ==========================================

run_all_checks() {
    local failed=0
    
    print_header
    
    # Critical checks
    check_liveness || ((failed++))
    check_readiness || ((failed++))
    check_database || ((failed++))
    check_redis || ((failed++))
    
    # Performance checks
    check_response_time "${API_URL}${HEALTH_LIVE}" 2000 || true
    
    # Information checks
    check_api_version || true
    check_ssl_certificate || true
    
    # Security checks
    check_rate_limiting || true
    check_cors || true
    check_security_headers || true
    
    echo ""
    echo "=========================================="
    
    if [ "${failed}" -eq 0 ]; then
        log_success "All critical health checks passed!"
        echo "=========================================="
        echo ""
        exit 0
    else
        log_error "${failed} critical health check(s) failed!"
        echo "=========================================="
        echo ""
        exit 1
    fi
}

# ==========================================
# Kubernetes Health Check Mode
# ==========================================

k8s_health_check() {
    # Simple check for Kubernetes probes
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${API_URL}${HEALTH_LIVE}" 2>/dev/null || echo "000")
    
    if [ "${status}" = "200" ]; then
        exit 0
    else
        exit 1
    fi
}

# ==========================================
# Script Entry Point
# ==========================================

case "${1}" in
    --k8s)
        API_URL="${2:-http://localhost:3001}"
        k8s_health_check
        ;;
    --help)
        echo "Usage: $0 [api_url|--k8s api_url]"
        echo ""
        echo "Options:"
        echo "  api_url    Full URL to the API (default: http://localhost:3001)"
        echo "  --k8s      Run in Kubernetes probe mode (simple pass/fail)"
        echo "  --help     Show this help message"
        ;;
    *)
        run_all_checks
        ;;
esac