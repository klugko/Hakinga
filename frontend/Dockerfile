# =============================================================================
# Hakinga Frontend - Production Dockerfile
# =============================================================================
# Multi-stage build for optimized image size
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies - Install node modules
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 2: Builder - Build the application
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Runner - Production image with Nginx
# -----------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Labels
LABEL maintainer="Hakinga Team" \
      description="Hakinga Frontend - Intelligent Typing Training Platform" \
      version="1.0.0"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1000 hakinga \
    && adduser -u 1000 -G hakinga -s /bin/sh -D hakinga \
    && chown -R hakinga:hakinga /usr/share/nginx/html \
    && chown -R hakinga:hakinga /var/cache/nginx \
    && chown -R hakinga:hakinga /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R hakinga:hakinga /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
