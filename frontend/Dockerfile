# Multi-stage Containerfile for Songify Frontend (Podman compatible)
FROM amd64/node:22.15.1-alpine3.21 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install dumb-init for proper signal handling (pinned version for security)
RUN apk add --no-cache dumb-init=1.2.5-r3

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user and create required directories
RUN addgroup -g 1001 -S nodejs && \
    adduser -S songify -u 1001 && \
    mkdir -p /tmp/nginx /var/cache/nginx /var/log/nginx && \
    chmod 755 /usr/share/nginx/html && \
    chmod 755 /var/cache/nginx && \
    chmod 755 /var/log/nginx && \
    chmod 755 /tmp/nginx

# Switch to non-root user
USER songify

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
