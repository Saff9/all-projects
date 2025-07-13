# ── Stage 1: Build dependencies ───────────────────────────────────────────
FROM python:3.11-alpine AS builder

# Build deps for C extensions (lxml, cryptography, etc.)
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    openssl-dev \
    g++ \
    libxml2-dev \
    libxslt-dev

WORKDIR /build

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Minimal production image ─────────────────────────────────────
FROM python:3.11-alpine AS production

# Runtime-only system libs
RUN apk add --no-cache libxml2 libxslt curl

WORKDIR /app

# Copy only installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY . .

# Create data directory for SQLite
RUN mkdir -p /data && chmod 777 /data

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV DB_PATH=/data/agentx.db

# Health check for Render & Docker
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production: 1-2 workers (low memory), configurable
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${WORKERS:-1}"
