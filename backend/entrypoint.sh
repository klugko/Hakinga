#!/bin/bash
# =============================================================================
# Hakinga Backend - Entrypoint Script
# =============================================================================
# This script handles database migrations and application startup
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
MAX_RETRIES=${DB_MAX_RETRIES:-30}
RETRY_INTERVAL=${DB_RETRY_INTERVAL:-2}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# Functions
# -----------------------------------------------------------------------------

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Wait for database to be ready
wait_for_db() {
    log_info "Waiting for database to be ready..."

    retries=0
    until python -c "
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import get_settings

async def check_db():
    settings = get_settings()
    engine = create_async_engine(settings.database_url, echo=False)
    async with engine.connect() as conn:
        await conn.execute(text('SELECT 1'))
    await engine.dispose()

asyncio.run(check_db())
" 2>/dev/null; do
        retries=$((retries + 1))
        if [ $retries -ge $MAX_RETRIES ]; then
            log_error "Database is not available after $MAX_RETRIES attempts. Exiting."
            exit 1
        fi
        log_warn "Database not ready (attempt $retries/$MAX_RETRIES). Retrying in ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
    done

    log_info "Database is ready!"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    if alembic upgrade head; then
        log_info "Migrations completed successfully!"
    else
        log_error "Migration failed!"
        exit 1
    fi
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

main() {
    log_info "Starting Hakinga Backend..."
    log_info "Environment: ${APP_ENV:-production}"

    # Wait for database
    wait_for_db

    # Run migrations if enabled (default: true)
    if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
        run_migrations
    else
        log_warn "Skipping migrations (RUN_MIGRATIONS=false)"
    fi

    log_info "Starting application..."

    # Execute the main command
    exec "$@"
}

# Run main function
main "$@"
