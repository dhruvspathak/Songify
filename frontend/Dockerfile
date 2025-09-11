# Multi-stage Containerfile for Songify Frontend (Podman compatible)
FROM node:18-alpine AS builder

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

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S songify -u 1001

# Set proper permissions
RUN chown -R songify:nodejs /usr/share/nginx/html
RUN chown -R songify:nodejs /var/cache/nginx
RUN chown -R songify:nodejs /etc/nginx
RUN chown -R songify:nodejs /var/log/nginx

# Create nginx runtime directories
RUN mkdir -p /tmp/nginx
RUN chown -R songify:nodejs /tmp/nginx

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
