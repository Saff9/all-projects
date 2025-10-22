#!/bin/bash

# ==========================================
# CryptoVerse Frontend Health Check Script
# ==========================================
# This script performs comprehensive health checks
# on the CryptoVerse Frontend service
#
# Usage: ./healthcheck-frontend.sh [frontend_url]
# Example: ./healthcheck-frontend.sh https://cryptoverse.example.com
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="${1:-http://localhost:3000}"
TIMEOUT=10
MAX_RETRIES=3
RETRY_DELAY=5

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
    echo "  CryptoVerse Frontend Health Check"
    echo "=========================================="
    echo "Frontend URL: ${FRONTEND_URL}"
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
    local max_time="${2:-3000}"  # milliseconds
    
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

# ==========================================
# Individual Health Checks
# ==========================================

check_homepage() {
    log_info "Checking homepage..."
    
    for i in $(seq 1 ${MAX_RETRIES}); do
        if check_http_status "${FRONTEND_URL}" "200" "Homepage accessible"; then
            return 0
        fi
        
        if [ "${i}" -lt "${MAX_RETRIES}" ]; then
            log_warning "Retry ${i}/${MAX_RETRIES} in ${RETRY_DELAY}s..."
            sleep "${RETRY_DELAY}"
        fi
    done
    
    return 1
}

check_health_endpoint() {
    log_info "Checking health endpoint..."
    
    # Next.js API route for health
    if check_http_status "${FRONTEND_URL}/api/health" "200" "Health endpoint"; then
        return 0
    fi
    
    # Fallback: check if homepage returns 200
    log_info "Health endpoint not available, checking homepage..."
    check_http_status "${FRONTEND_URL}" "200" "Homepage fallback"
}

check_static_assets() {
    log_info "Checking static assets..."
    
    # Get the HTML content
    local html=$(curl -s --max-time "${TIMEOUT}" "${FRONTEND_URL}" 2>/dev/null || echo "")
    
    # Find JavaScript files
    local js_files=$(echo "${html}" | grep -oP 'src="[^"]*\.js"' | head -3 | sed 's/src="//g' | sed 's/"//g')
    
    if [ -z "${js_files}" ]; then
        log_warning "No JavaScript files found in HTML"
        return 0
    fi
    
    local pass=true
    for js_file in ${js_files}; do
        local full_url="${FRONTEND_URL}${js_file}"
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${TIMEOUT}" "${full_url}" 2>/dev/null || echo "000")
        
        if [ "${status}" = "200" ]; then
            log_success "Static asset: ${js_file}"
        else
            log_error "Static asset failed: ${js_file} (HTTP ${status})"
            pass=false
        fi
    done
    
    if [ "${pass}" = true ]; then
        return 0
    else
        return 1
    fi
}

check_nextjs_static() {
    log_info "Checking Next.js static files..."
    
    # Check _next/static directory
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${TIMEOUT}" "${FRONTEND_URL}/_next/static/" 2>/dev/null || echo "000")
    
    # 403 or 404 is acceptable for directory listing
    if [ "${status}" = "403" ] || [ "${status}" = "404" ]; then
        log_success "Next.js static directory exists (HTTP ${status})"
        return 0
    elif [ "${status}" = "200" ]; then
        log_success "Next.js static directory accessible"
        return 0
    else
        log_warning "Unexpected status for _next/static: ${status}"
        return 0
    fi
}

check_favicon() {
    log_info "Checking favicon..."
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${TIMEOUT}" "${FRONTEND_URL}/favicon.ico" 2>/dev/null || echo "000")
    
    if [ "${status}" = "200" ]; then
        log_success "Favicon accessible"
        return 0
    else
        log_warning "Favicon not found (HTTP ${status})"
        return 0
    fi
}

check_manifest() {
    log_info "Checking web app manifest..."
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${TIMEOUT}" "${FRONTEND_URL}/manifest.json" 2>/dev/null || echo "000")
    
    if [ "${status}" = "200" ]; then
        log_success "Web app manifest accessible"
        return 0
    else
        log_info "Web app manifest not found (HTTP ${status})"
        return 0
    fi
}

check_robots_txt() {
    log_info "Checking robots.txt..."
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${TIMEOUT}" "${FRONTEND_URL}/robots.txt" 2>/dev/null || echo "000")
    
    if [ "${status}" = "200" ]; then
        log_success "robots.txt accessible"
        return 0
    else
        log_info "robots.txt not found (HTTP ${status})"
        return 0
    fi
}

check_ssl_certificate() {
    log_info "Checking SSL certificate..."
    
    if [[ "${FRONTEND_URL}" != https* ]]; then
        log_info "Not using HTTPS, skipping SSL check"
        return 0
    fi
    
    local host=$(echo "${FRONTEND_URL}" | sed 's|https://||' | cut -d'/' -f1)
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

check_security_headers() {
    log_info "Checking security headers..."
    
    local headers=$(curl -s -I --max-time "${TIMEOUT}" "${FRONTEND_URL}" 2>/dev/null || echo "")
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
    
    # Check X-XSS-Protection
    if echo "${headers}" | grep -qi "x-xss-protection"; then
        log_success "X-XSS-Protection present"
    else
        log_warning "Missing X-XSS-Protection header"
    fi
    
    # Check Content-Security-Policy
    if echo "${headers}" | grep -qi "content-security-policy"; then
        log_success "Content-Security-Policy present"
    else
        log_warning "Missing Content-Security-Policy header"
    fi
    
    if [ "${pass}" = true ]; then
        return 0
    else
        return 1
    fi
}

check_cache_headers() {
    log_info "Checking cache headers..."
    
    local headers=$(curl -s -I --max-time "${TIMEOUT}" "${FRONTEND_URL}" 2>/dev/null || echo "")
    
    # Check Cache-Control
    if echo "${headers}" | grep -qi "cache-control"; then
        local cache_control=$(echo "${headers}" | grep -i "cache-control" | head -1)
        log_success "Cache-Control: ${cache_control}"
        return 0
    else
        log_info "No Cache-Control header found"
        return 0
    fi
}

check_html_structure() {
    log_info "Checking HTML structure..."
    
    local html=$(curl -s --max-time "${TIMEOUT}" "${FRONTEND_URL}" 2>/dev/null || echo "")
    
    # Check for basic HTML structure
    if echo "${html}" | grep -qi "<!DOCTYPE html>"; then
        log_success "Valid HTML5 doctype"
    else
        log_warning "Missing HTML5 doctype"
    fi
    
    # Check for title
    if echo "${html}" | grep -qi "<title>"; then
        local title=$(echo "${html}" | grep -oP '(?<=<title>)[^<]+' | head -1)
        log_success "Page title: ${title}"
    else
        log_warning "Missing page title"
    fi
    
    # Check for meta viewport
    if echo "${html}" | grep -qi "viewport"; then
        log_success "Viewport meta tag present"
    else
        log_warning "Missing viewport meta tag"
    fi
    
    return 0
}

check_api_connectivity() {
    log_info "Checking API connectivity from frontend..."
    
    # Check if frontend can reach API
    local api_url="${API_URL:-${FRONTEND_URL}/api}"
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${TIMEOUT}" "${api_url}" 2>/dev/null || echo "000")
    
    if [ "${status}" = "200" ] || [ "${status}" = "401" ] || [ "${status}" = "404" ]; then
        log_success "API reachable from frontend (HTTP ${status})"
        return 0
    else
        log_warning "API may not be reachable (HTTP ${status})"
        return 0
    fi
}

# ==========================================
# Main Health Check
# ==========================================

run_all_checks() {
    local failed=0
    
    print_header
    
    # Critical checks
    check_homepage || ((failed++))
    check_health_endpoint || ((failed++))
    check_static_assets || ((failed++))
    
    # Performance checks
    check_response_time "${FRONTEND_URL}" 3000 || true
    
    # Structure checks
    check_html_structure || true
    check_nextjs_static || true
    
    # Asset checks
    check_favicon || true
    check_manifest || true
    check_robots_txt || true
    
    # Security checks
    check_ssl_certificate || true
    check_security_headers || true
    check_cache_headers || true
    
    # Integration checks
    check_api_connectivity || true
    
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
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${FRONTEND_URL}" 2>/dev/null || echo "000")
    
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
        FRONTEND_URL="${2:-http://localhost:3000}"
        k8s_health_check
        ;;
    --help)
        echo "Usage: $0 [frontend_url|--k8s frontend_url]"
        echo ""
        echo "Options:"
        echo "  frontend_url    Full URL to the frontend (default: http://localhost:3000)"
        echo "  --k8s           Run in Kubernetes probe mode (simple pass/fail)"
        echo "  --help          Show this help message"
        ;;
    *)
        run_all_checks
        ;;
esac