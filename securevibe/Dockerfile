# =============================================================================
# SecureVibe - Production Dockerfile
# Multi-stage build with security hardening
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# Install production dependencies only
# -----------------------------------------------------------------------------
FROM node:20-alpine AS dependencies

# Security: Create non-root user early
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY securevibe/package*.json ./

# Install production dependencies only
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 2: Builder
# Build the application (if needed)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files and source code
COPY securevibe/package*.json ./
COPY securevibe/ ./

# Build the application (includes web build)
RUN npm run build 2>/dev/null || echo "No build step required"

# -----------------------------------------------------------------------------
# Stage 3: Production
# Minimal runtime image with security hardening
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Security: Install security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init ca-certificates && \
    rm -rf /var/cache/apk/*

# Security: Create non-root user
RUN addgroup -g 1001 -S securevibe && \
    adduser -S securevibe -u 1001 -G securevibe

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=dependencies --chown=securevibe:securevibe /app/node_modules ./node_modules
COPY --from=dependencies --chown=securevibe:securevibe /app/package*.json ./

# Copy application code
COPY --chown=securevibe:securevibe securevibe/server.js ./
COPY --chown=securevibe:securevibe securevibe/config ./config/
COPY --chown=securevibe:securevibe securevibe/middleware ./middleware/
COPY --chown=securevibe:securevibe securevibe/models ./models/
COPY --chown=securevibe:securevibe securevibe/routes ./routes/
COPY --chown=securevibe:securevibe securevibe/utils ./utils/
COPY --chown=securevibe:securevibe securevibe/public ./public/
COPY --chown=securevibe:securevibe securevibe/client-sdk ./client-sdk/
# Types directory is optional for runtime, skip copying to avoid build issues

# Copy built web assets if they exist
COPY --from=builder --chown=securevibe:securevibe /app/dist ./dist
COPY --from=builder --chown=securevibe:securevibe /app/build ./build

# Security: Remove unnecessary tools and files
RUN rm -rf /usr/local/lib/node_modules/npm && \
    rm -rf /usr/local/bin/npm && \
    rm -rf /usr/local/bin/npx && \
    rm -rf /root/.npm && \
    rm -rf /tmp/*

# Security: Set proper permissions
RUN chmod -R 550 /app && \
    (mkdir -p /app/logs && chmod 770 /app/logs || true)

# Security: Use non-root user
USER securevibe

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Security: Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server.js"]