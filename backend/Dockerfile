# Production Containerfile for Songify Backend (Podman compatible)
FROM amd64/node:22.15.1-alpine3.21 AS base

# Set working directory
WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S songify -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies with clean install for production
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R songify:nodejs /app
USER songify

# Expose port
EXPOSE 3000

# Health check (Podman compatible)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["node", "server.js"]
