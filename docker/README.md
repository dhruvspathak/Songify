# 🦭 Songify Podman Deployment Guide

This guide covers deploying Songify using Podman containers in both development and production environments.

## 📋 Prerequisites

- Podman 4.0+ (rootless containers!)
- Podman Compose (or podman-compose)
- 4GB+ RAM available
- Spotify Developer App configured

## 🦭 Why Podman?

- **🔒 Rootless**: No daemon, better security
- **🔄 Drop-in replacement**: Compatible with Docker commands
- **🏗️ OCI Compliant**: Industry standard containers
- **🚀 Better performance**: Lower resource overhead

## 🚀 Quick Start (Development)

### 1. Environment Setup

**Backend environment:**
```bash
cp backend/env.template backend/.env
# Edit backend/.env with your Spotify credentials
```

**Frontend environment:**
```bash
cp frontend/env.template frontend/.env
# Edit frontend/.env with your client configuration
```

### 2. Install Podman

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install podman podman-compose

# CentOS/RHEL/Fedora
sudo dnf install podman podman-compose
```

**macOS:**
```bash
brew install podman podman-compose
podman machine init
podman machine start
```

**Windows:**
- Download [Podman Desktop](https://podman-desktop.io/)
- Install podman-compose: `pip install podman-compose`

### 3. Build and Run

```bash
# Build and start all services
podman-compose up --build

# Run in background
podman-compose up -d --build

# View logs
podman-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Health Checks**: 
  - Frontend: http://localhost/health
  - Backend: http://localhost:3000/health

## 🏭 Production Deployment

### 1. Production Environment Setup

Create production environment files:

**Backend (.env.production):**
```bash
CLIENT_ID=your_spotify_client_id
CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=https://yourdomain.com/callback
FRONTEND_URL=https://yourdomain.com
PORT=3000
SESSION_SECRET=your_super_secure_session_secret
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your_redis_password
NODE_ENV=production
```

**Frontend (.env.production):**
```bash
VITE_CLIENT_ID=your_spotify_client_id
VITE_REDIRECT_URI=https://yourdomain.com/callback
VITE_BACKEND_URL=https://api.yourdomain.com
NODE_ENV=production
```

**Global environment (.env):**
```bash
DOMAIN=yourdomain.com
ACME_EMAIL=your-email@example.com
REDIS_PASSWORD=your_secure_redis_password
```

### 2. Production Deployment

```bash
# Deploy with SSL and advanced features
podman-compose -f docker-compose.prod.yml up -d --build

# Check service status
podman-compose -f docker-compose.prod.yml ps

# View logs
podman-compose -f docker-compose.prod.yml logs -f
```

### 3. SSL Certificates

The production setup uses Traefik with Let's Encrypt for automatic SSL certificates. Ensure:

- Your domain points to your server
- Ports 80 and 443 are open
- ACME_EMAIL is set correctly

## 🔧 Service Details

### Backend Service
- **Image**: Custom Node.js Alpine
- **Port**: 3000
- **Health Check**: `/health` endpoint
- **Features**:
  - Security-hardened (non-root user)
  - Resource limits
  - Automatic restarts
  - Log aggregation

### Frontend Service  
- **Image**: Custom Nginx Alpine
- **Port**: 80
- **Health Check**: `/health` endpoint
- **Features**:
  - Multi-stage build optimization
  - Gzip compression
  - Security headers
  - SPA routing support
  - Asset caching

### Redis Service (Optional)
- **Image**: Redis 7 Alpine
- **Port**: 6379
- **Features**:
  - Persistent storage
  - Password protection
  - Memory optimization
  - Health monitoring

## 🛠️ Management Commands

### Development Commands
```bash
# Start services
podman-compose up -d

# Stop services
podman-compose down

# Rebuild specific service
podman-compose build backend
podman-compose up -d backend

# View logs
podman-compose logs -f backend
podman-compose logs -f frontend

# Shell access
podman-compose exec backend sh
podman-compose exec frontend sh

# Clean up
podman-compose down -v --remove-orphans
podman system prune -a
```

### Production Commands
```bash
# Deploy
podman-compose -f docker-compose.prod.yml up -d --build

# Scale services
podman-compose -f docker-compose.prod.yml up -d --scale backend=3 --scale frontend=2

# Update services
podman-compose -f docker-compose.prod.yml pull
podman-compose -f docker-compose.prod.yml up -d --force-recreate

# Backup volumes
podman run --rm -v songify-redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz -C /data .

# Restore volumes
podman run --rm -v songify-redis-data:/data -v $(pwd):/backup alpine tar xzf /backup/redis-backup.tar.gz -C /data
```

## 📊 Monitoring

### Health Checks
```bash
# Check all service health
podman-compose ps

# Manual health check
curl http://localhost/health
curl http://localhost:3000/health

# Redis health
podman-compose exec redis redis-cli ping
```

### Logs
```bash
# All services
podman-compose logs -f

# Specific service
podman-compose logs -f backend

# Follow with timestamps
podman-compose logs -f -t

# Last N lines
podman-compose logs --tail=100 backend
```

### Resource Usage
```bash
# Container stats
podman stats

# Detailed container info
podman-compose exec backend ps aux
podman-compose exec backend df -h
```

## 🐛 Troubleshooting

### Common Issues

**Build failures:**
```bash
# Clean build cache
podman builder prune -a

# Rebuild without cache
podman-compose build --no-cache
```

**Permission issues:**
```bash
# Check container user
podman-compose exec backend id
podman-compose exec frontend id

# Podman runs rootless by default - better security!
# No sudo needed for file permissions
```

**Network issues:**
```bash
# Check network
podman network ls
podman network inspect songify-network

# Recreate network
podman-compose down
podman network rm songify-network
podman-compose up -d
```

**Volume issues:**
```bash
# List volumes
podman volume ls

# Inspect volume
podman volume inspect songify-redis-data

# Remove volumes (⚠️ data loss)
podman-compose down -v
```

### Performance Optimization

**Resource limits:**
- Adjust memory/CPU limits in docker-compose files
- Monitor with `podman stats`
- Use `podman system df` to check disk usage

**Build optimization:**
- Use `.dockerignore` files
- Multi-stage builds (already implemented)
- Cache dependencies separately from code

## 🔐 Security Considerations

### Production Security Checklist

- ✅ Non-root container users
- ✅ Security headers in Nginx
- ✅ Environment variable isolation
- ✅ Network segmentation
- ✅ Health checks enabled
- ✅ Resource limits set
- ✅ SSL/TLS termination
- ✅ Secrets management

### Additional Security Steps

1. **Firewall Configuration**:
   ```bash
   # Only allow necessary ports
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```

2. **Regular Updates**:
   ```bash
   # Update base images
   docker-compose pull
   docker-compose up -d --force-recreate
   ```

3. **Secret Rotation**:
   - Rotate SESSION_SECRET regularly
   - Update Redis password
   - Refresh Spotify credentials if needed

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend instances
podman-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale frontend instances  
podman-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

### Load Balancing
- Traefik automatically load balances multiple instances
- Redis handles session sharing across backend instances
- Frontend instances are stateless

## 🚨 Backup & Recovery

### Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
podman run --rm -v songify-redis-data:/data -v $(pwd)/backups:/backup alpine \
  tar czf /backup/redis_$DATE.tar.gz -C /data .
```

### Recovery Process
```bash
# Stop services
podman-compose down

# Restore data
podman run --rm -v songify-redis-data:/data -v $(pwd)/backups:/backup alpine \
  tar xzf /backup/redis_YYYYMMDD_HHMMSS.tar.gz -C /data

# Restart services
podman-compose up -d
```

---

**Need help?** Check the main README.md or create an issue in the repository.
