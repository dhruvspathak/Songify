# 🎵 Songify

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](https://docker.com/)
[![Podman](https://img.shields.io/badge/Podman-Supported-purple.svg)](https://podman.io/)

A production-ready Spotify web player built with React and Express, featuring secure OAuth authentication, containerized deployment, and the Spotify Web Playback SDK.

## ✨ Features

### Core Features
- 🔐 **Secure OAuth Authentication** - Login with your Spotify account
- 🎵 **Music Playback** - Play, pause, skip tracks using Spotify Web Playback SDK
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Clean, intuitive interface with Material-UI components
- 🔄 **Real-time Sync** - Syncs with your active Spotify sessions
- 📊 **Playlists & Top Tracks** - Browse your music library
- 🎯 **Smart Fallbacks** - Graceful handling of API limitations

### Production Features
- 🐳 **Containerized Deployment** - Docker/Podman support with multi-stage builds
- 🔒 **Security Hardened** - Non-root containers, security headers, SSL/TLS
- 📈 **Horizontally Scalable** - Load balancing and session management
- 🏥 **Health Monitoring** - Built-in health checks and logging
- 🚀 **CI/CD Ready** - Jenkins pipeline and automated deployment
- 🗄️ **Redis Session Storage** - Distributed session management
- 🔧 **Environment Management** - Multiple environment configurations

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Spotify Premium** account (required for playback control)
- **Spotify Developer App** - [Create here](https://developer.spotify.com/dashboard)
- **Git** - [Download](https://git-scm.com/)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB available space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## 📦 Installation Methods

Choose your preferred installation method:

### Method 1: Manual Development Setup (Recommended for Development)

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/songify.git
cd songify
```

#### 2. Set Up Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app with these settings:
   - **App Name**: Songify (or your preferred name)
   - **App Description**: Spotify Web Player
   - **Redirect URIs**: `http://localhost:5173/callback`
   - **APIs Used**: Web Playback SDK, Web API
3. Note your `Client ID` and `Client Secret`

#### 3. Configure Environment Variables

**Backend Configuration:**
```bash
cd backend
cp env.template .env
```

Edit `backend/.env` with your credentials:
```bash
CLIENT_ID=your_spotify_client_id_here
CLIENT_SECRET=your_spotify_client_secret_here
REDIRECT_URI=http://localhost:5173/callback
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_generated_session_secret
REDIS_PASSWORD=your_generated_redis_password
```

**Frontend Configuration:**
```bash
cd frontend
cp env.template .env
```

Edit `frontend/.env`:
```bash
VITE_CLIENT_ID=your_spotify_client_id_here
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_BACKEND_URL=http://localhost:3000
```

**Generate Secure Secrets:**
```bash
# Generate session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Redis password
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access URLs:**
- 🎵 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3000
- 🏥 **Health Check**: http://localhost:3000/health

---

### Method 2: Containerized Deployment (Recommended for Production)

#### Prerequisites
- **Docker** or **Podman** 4.0+
- **Docker Compose** or **Podman Compose**
- 4GB+ RAM available

#### Quick Start with Containers

```bash
# Clone repository
git clone https://github.com/your-username/songify.git
cd songify

# Set up environment files for containers
cp backend/env.docker.template backend/.env
cp frontend/env.docker.template frontend/.env

# Edit .env files with your Spotify credentials
# (Use same credentials as manual setup)

# Deploy with containers
./scripts/deploy.sh development
# Or on Windows: scripts\deploy.bat development
```

**Container Access URLs:**
- 🎵 **Frontend**: http://localhost:8080
- 🔧 **Backend API**: http://localhost:3000
- 🗄️ **Redis**: localhost:6379

#### Container Management

```bash
# View logs
podman-compose logs -f

# Stop services
podman-compose down

# Rebuild and restart
podman-compose up -d --build

# Check service health
podman-compose ps
```

## 🏭 Production Deployment

### Environment Setup

For production deployment, create environment files from production templates:

```bash
# Backend production config
cp backend/env.production.template backend/.env.production

# Frontend production config
cp frontend/env.production.template frontend/.env.production
```

Edit the production files with HTTPS URLs and secure credentials:

**backend/.env.production:**
```bash
CLIENT_ID=your_production_spotify_client_id
CLIENT_SECRET=your_production_spotify_client_secret
REDIRECT_URI=https://yourdomain.com/callback
FRONTEND_URL=https://yourdomain.com
SESSION_SECRET=your_crypto_secure_64_byte_hex_string
REDIS_PASSWORD=your_crypto_secure_32_byte_hex_string
NODE_ENV=production
```

**frontend/.env.production:**
```bash
VITE_CLIENT_ID=your_production_spotify_client_id
VITE_REDIRECT_URI=https://yourdomain.com/callback
VITE_BACKEND_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Production Deployment Commands

```bash
# Deploy with SSL, monitoring, and scaling
podman-compose -f docker-compose.prod.yml up -d --build

# Or use the deployment script
./scripts/deploy.sh production

# Scale services for high availability
podman-compose -f docker-compose.prod.yml up -d --scale backend=3 --scale frontend=2
```

### Production Features
- 🔒 **SSL/TLS** - Automatic Let's Encrypt certificates via Traefik
- 📈 **Load Balancing** - Multiple service instances with health checks
- 🗄️ **Redis Persistence** - Session storage with data persistence
- 📊 **Monitoring** - Prometheus metrics and health endpoints
- 🚨 **Security** - Security headers, non-root containers, secrets management
- 🔄 **Auto-restart** - Automatic service recovery and health monitoring

## 🏗️ Project Structure

```
songify/
├── backend/
│   ├── server.js                    # Express server with OAuth & API routes
│   ├── healthcheck.js               # Container health check endpoint
│   ├── package.json                 # Backend dependencies
│   ├── Dockerfile                   # Backend container image
│   ├── env.template                 # Development environment template
│   ├── env.docker.template          # Container development template
│   ├── env.production.template      # Production environment template
│   └── env.staging.template         # Staging environment template
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Player.jsx           # Music player component
│   │   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   │   └── AppbarActual.jsx     # Application header
│   │   ├── pages/                   # Page components
│   │   │   ├── BeforeLogin.jsx      # Landing page
│   │   │   ├── AfterLogin.jsx       # Main application
│   │   │   ├── AlbumPage.jsx        # Album view
│   │   │   └── PlaylistOnclick.jsx  # Playlist view
│   │   ├── utils/
│   │   │   └── auth.js              # Authentication utilities
│   │   └── main.jsx                 # App entry point
│   ├── package.json                 # Frontend dependencies
│   ├── Dockerfile                   # Frontend container image
│   ├── nginx.conf                   # Nginx configuration
│   ├── env.template                 # Development environment template
│   ├── env.docker.template          # Container development template
│   ├── env.production.template      # Production environment template
│   └── env.staging.template         # Staging environment template
├── scripts/
│   ├── deploy.sh                    # Linux/macOS deployment script
│   ├── deploy.bat                   # Windows deployment script
│   └── deploy-simple.bat            # Simple Windows deployment
├── traefik/
│   └── dynamic/
│       └── services.yml             # Traefik service configuration
├── docker-compose.yml               # Development container stack
├── docker-compose.prod.yml          # Production container stack
├── Jenkinsfile                      # CI/CD pipeline configuration
├── CHANGELOG.md                     # Version history
├── ENVIRONMENT_SETUP.md             # Detailed environment guide
├── .gitignore                       # Git ignore rules
└── README.md                        # This documentation
```

## ⚙️ Configuration

### Environment Variables

#### Development Environment

**Backend (.env):**
```bash
CLIENT_ID=your_spotify_client_id_here
CLIENT_SECRET=your_spotify_client_secret_here
REDIRECT_URI=http://localhost:5173/callback  # For manual setup
FRONTEND_URL=http://localhost:5173           # For manual setup
PORT=3000
SESSION_SECRET=crypto_generated_64_byte_hex
REDIS_PASSWORD=crypto_generated_32_byte_hex
```

**Frontend (.env):**
```bash
VITE_CLIENT_ID=your_spotify_client_id_here
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_BACKEND_URL=http://localhost:3000
```

#### Container Development

For containerized development, use `env.docker.template` files which configure for `localhost:8080`.

#### Production Environment

**Backend (.env.production):**
```bash
CLIENT_ID=production_spotify_client_id
CLIENT_SECRET=production_spotify_client_secret
REDIRECT_URI=https://yourdomain.com/callback
FRONTEND_URL=https://yourdomain.com
SESSION_SECRET=production_64_byte_hex_secret
REDIS_PASSWORD=production_32_byte_hex_password
NODE_ENV=production
SECURE_COOKIES=true
TRUST_PROXY=true
```

**Frontend (.env.production):**
```bash
VITE_CLIENT_ID=production_spotify_client_id
VITE_REDIRECT_URI=https://yourdomain.com/callback
VITE_BACKEND_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Security Configuration

🔒 **Critical Security Requirements:**

1. **Generate Secure Secrets:**
   ```bash
   # Session secret (64 bytes)
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Redis password (32 bytes)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Environment Isolation:**
   - Development: `localhost` URLs
   - Staging: `staging.yourdomain.com` URLs
   - Production: `yourdomain.com` URLs with HTTPS

3. **File Permissions:**
   ```bash
   chmod 600 backend/.env*
   chmod 600 frontend/.env*
   ```

📋 **For complete configuration details, see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)**

## 🎯 Architecture & Features

### Security Architecture

#### OAuth Flow
- **Server-side token exchange** - Client secrets never exposed to browser
- **HTTP-only cookies** - Secure token storage, resistant to XSS
- **Automatic token refresh** - Seamless user experience
- **CSRF protection** - State parameter validation

#### Container Security
- **Non-root containers** - All services run as non-privileged users
- **Security headers** - HSTS, CSP, X-Frame-Options via Nginx
- **Network isolation** - Internal service communication only
- **Secret management** - Environment-based configuration

### Scalability Features

#### Horizontal Scaling
- **Stateless services** - Frontend and backend can scale independently
- **Session storage** - Redis-based distributed sessions
- **Load balancing** - Traefik automatic service discovery
- **Health checks** - Automatic failed instance recovery

#### Performance Optimization
- **Multi-stage builds** - Optimized container images
- **Asset optimization** - Gzip compression, caching headers
- **Resource limits** - Memory and CPU constraints
- **Connection pooling** - Efficient database connections

### Playback Features

#### Web Playback SDK Integration
- **Device transfer** - Seamless playback control
- **Real-time sync** - Cross-device synchronization
- **Smart fallbacks** - Graceful Premium requirement handling
- **Error recovery** - Automatic reconnection logic

#### API Integration
- **Multiple endpoint fallbacks** - Development Mode compatibility
- **Rate limiting** - Respectful API usage
- **Error handling** - User-friendly error messages
- **Offline support** - Cached data when possible

## 🛠️ Development & Debugging

### Available Scripts

#### Backend Scripts
```bash
cd backend
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run test suite
npm run lint       # Run ESLint
npm run security   # Security audit
```

#### Frontend Scripts
```bash
cd frontend
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm test           # Run test suite
```

#### Container Scripts
```bash
# Development deployment
./scripts/deploy.sh development
scripts\deploy.bat development

# Production deployment
./scripts/deploy.sh production
scripts\deploy.bat production

# Simple deployment (individual containers)
scripts\deploy-simple.bat
```

### Debugging Guide

#### Common Issues

**🎵 "No active device" errors:**
- ✅ Ensure you have **Spotify Premium**
- ✅ Open Spotify app on another device first
- ✅ Use the "Transfer Playback" button in Songify
- ✅ Check browser console for Web Playback SDK errors

**🔒 Authentication issues:**
- ✅ Verify `CLIENT_ID` and `CLIENT_SECRET` are correct
- ✅ Check redirect URI matches exactly (`http://localhost:5173/callback`)
- ✅ Clear browser cookies and localStorage
- ✅ Ensure Spotify app is in "Development Mode" or user is added

**🌐 API 404 errors:**
- ✅ Add yourself as test user in Spotify Developer Dashboard
- ✅ Request quota extension for production
- ✅ Check API scopes and permissions
- ✅ Verify endpoint availability in Development Mode

**🐳 Container issues:**
- ✅ Check container logs: `podman-compose logs -f`
- ✅ Verify environment files exist and are populated
- ✅ Ensure ports are not in use: `netstat -tulpn | grep :3000`
- ✅ Check container health: `podman-compose ps`

#### Debug Tools

**Application Debug Features:**
- 🔍 **Debug Scopes** button - Check token validity and permissions
- 📊 **Health endpoints** - `/health` for service status
- 📋 **Browser DevTools** - Network tab for API calls
- 🔗 **Console logging** - Debug authentication flow

**Container Debug Commands:**
```bash
# Check container status
podman-compose ps

# View logs
podman-compose logs -f backend
podman-compose logs -f frontend

# Shell access
podman-compose exec backend sh
podman-compose exec frontend sh

# Resource usage
podman stats

# Network inspection
podman network inspect songify-network
```

**Environment Debug:**
```bash
# Check environment variables
podman-compose exec backend env | grep SPOTIFY
podman-compose exec frontend env | grep VITE

# Test Redis connection
podman-compose exec redis redis-cli ping

# Test backend health
curl http://localhost:3000/health

# Test frontend health
curl http://localhost:8080/health
```

## 🔒 Security

### Security Features

#### Application Security
- ✅ **OAuth 2.0** - Industry standard authentication
- ✅ **HTTP-only cookies** - XSS protection
- ✅ **CSRF protection** - State parameter validation
- ✅ **Secure headers** - HSTS, CSP, X-Frame-Options
- ✅ **Environment isolation** - No secrets in client code

#### Container Security
- ✅ **Non-root users** - All containers run as unprivileged users
- ✅ **Minimal images** - Alpine Linux base images
- ✅ **No privilege escalation** - Security options enforced
- ✅ **Network segmentation** - Internal service communication
- ✅ **Resource limits** - Memory and CPU constraints

#### Infrastructure Security
- ✅ **SSL/TLS encryption** - Let's Encrypt certificates
- ✅ **Secrets management** - Environment-based configuration
- ✅ **Health monitoring** - Automatic failure detection
- ✅ **Access control** - Localhost-only database access

### Security Checklist

#### Development Security
```bash
# ✅ Generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# ✅ Set proper file permissions
chmod 600 backend/.env frontend/.env

# ✅ Never commit secrets
git status  # Ensure .env files are not staged

# ✅ Use HTTPS in production
# Update redirect URIs to https://yourdomain.com/callback
```

#### Production Security
```bash
# ✅ Use production environment templates
cp backend/env.production.template backend/.env.production
cp frontend/env.production.template frontend/.env.production

# ✅ Enable security features
export SECURE_COOKIES=true
export TRUST_PROXY=true
export NODE_ENV=production

# ✅ Regular security updates
podman-compose pull  # Update base images
npm audit            # Check dependencies
```

#### Monitoring & Auditing
```bash
# Check for vulnerabilities
npm audit --audit-level=moderate

# Monitor container security
podman-compose exec backend ps aux  # Check running processes
podman-compose exec backend id      # Verify non-root user

# Review logs for security events
podman-compose logs backend | grep -i "error\|warn\|fail"
```

### Recent Security Updates
- ✅ **Fixed**: Removed chown flags from Dockerfiles (container security)
- ✅ **Fixed**: Hardcoded Redis password vulnerability
- ✅ **Implemented**: Mandatory environment variable configuration
- ✅ **Added**: Comprehensive security documentation
- ✅ **Enhanced**: Multi-environment configuration templates

📋 **For detailed security configuration, see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)**

## 🚀 Deployment Guide

### Deployment Options

| Method | Use Case | Complexity | Features |
|--------|----------|------------|----------|
| **Manual** | Development, Learning | Low | Basic functionality |
| **Container Dev** | Local Testing | Medium | Container features |
| **Container Prod** | Production | High | Full production stack |

### Production Deployment Checklist

#### 1. Environment Configuration
```bash
# ✅ Production environment variables
cp backend/env.production.template backend/.env.production
cp frontend/env.production.template frontend/.env.production

# ✅ Generate secure secrets
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
REDIS_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# ✅ Set production values
NODE_ENV=production
SECURE_COOKIES=true
TRUST_PROXY=true
```

#### 2. Spotify App Configuration
```bash
# ✅ Update redirect URIs in Spotify Dashboard
# Development: http://localhost:5173/callback
# Production:  https://yourdomain.com/callback

# ✅ Request production access (if needed)
# - Quota extension for >25 users
# - Submit for review process
```

#### 3. Infrastructure Setup
```bash
# ✅ Domain and DNS
# Point yourdomain.com to your server IP

# ✅ Firewall configuration
ufw allow 22    # SSH
ufw allow 80    # HTTP (redirects to HTTPS)
ufw allow 443   # HTTPS
ufw enable

# ✅ SSL certificates (automatic via Let's Encrypt)
# Configured in docker-compose.prod.yml
```

#### 4. Production Deployment
```bash
# ✅ Deploy production stack
podman-compose -f docker-compose.prod.yml up -d --build

# ✅ Verify deployment
curl -I https://yourdomain.com
curl -I https://api.yourdomain.com/health

# ✅ Scale for high availability
podman-compose -f docker-compose.prod.yml up -d --scale backend=3 --scale frontend=2
```

### CI/CD Pipeline

The project includes a Jenkins pipeline (`Jenkinsfile`) with:

- 🔍 **Code quality checks** - Linting, testing
- 🔒 **Security scanning** - Dependency audit
- 🏗️ **Multi-stage builds** - Optimized images
- 🚀 **Automated deployment** - Environment-specific
- 📊 **Health monitoring** - Post-deployment verification

### Scaling Considerations

#### Horizontal Scaling
```bash
# Scale backend instances
podman-compose -f docker-compose.prod.yml up -d --scale backend=5

# Scale frontend instances
podman-compose -f docker-compose.prod.yml up -d --scale frontend=3
```

#### Load Balancing
- **Traefik** - Automatic service discovery and load balancing
- **Session sharing** - Redis-based distributed sessions
- **Health checks** - Automatic unhealthy instance removal

#### Monitoring
- **Prometheus** - Metrics collection
- **Health endpoints** - Application health monitoring
- **Log aggregation** - Centralized logging

### Backup & Recovery

#### Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
podman run --rm -v songify-redis-data:/data -v $(pwd)/backups:/backup alpine \
  tar czf /backup/redis_$DATE.tar.gz -C /data .
```

#### Recovery Process
```bash
# Stop services
podman-compose -f docker-compose.prod.yml down

# Restore data
podman run --rm -v songify-redis-data:/data -v $(pwd)/backups:/backup alpine \
  tar xzf /backup/redis_YYYYMMDD_HHMMSS.tar.gz -C /data

# Restart services
podman-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

### Development Workflow

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/songify.git
   cd songify
   git checkout -b feature/your-feature-name
   ```

2. **Set Up Development Environment**
   ```bash
   # Manual setup
   cp backend/env.template backend/.env
   cp frontend/env.template frontend/.env
   # Edit with your Spotify credentials
   
   # Or container setup
   cp backend/env.docker.template backend/.env
   cp frontend/env.docker.template frontend/.env
   ```

3. **Development Guidelines**
   - Follow existing code style and patterns
   - Add tests for new functionality
   - Update documentation as needed
   - Test both manual and container deployments

4. **Testing**
   ```bash
   # Backend tests
   cd backend && npm test && npm run lint
   
   # Frontend tests
   cd frontend && npm test && npm run lint
   
   # Security audit
   npm audit --audit-level=moderate
   
   # Container tests
   podman-compose up -d --build
   curl http://localhost:8080/health
   curl http://localhost:3000/health
   ```

5. **Submit Pull Request**
   - Provide clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues
   - Ensure all CI checks pass

### Code Standards

- **JavaScript/JSX**: ESLint configuration provided
- **Git commits**: Use conventional commit format
- **Security**: Never commit secrets or credentials
- **Documentation**: Update README for significant changes

### Issue Reporting

When reporting issues, include:
- **Environment**: Manual vs container deployment
- **Browser**: Version and type
- **Steps to reproduce**: Clear instructions
- **Logs**: Relevant error messages
- **Configuration**: Environment variables (without secrets)

## 📊 Monitoring & Maintenance

### Health Monitoring

```bash
# Check application health
curl http://localhost:3000/health  # Backend
curl http://localhost:8080/health  # Frontend (container)
curl http://localhost:5173         # Frontend (manual)

# Container health
podman-compose ps
podman stats

# Service logs
podman-compose logs -f backend
podman-compose logs -f frontend
podman-compose logs -f redis
```

### Performance Monitoring

- **Prometheus metrics** available in production
- **Health check endpoints** for automated monitoring
- **Resource usage tracking** via container stats
- **Log aggregation** for debugging and analysis

### Maintenance Tasks

#### Regular Updates
```bash
# Update dependencies
npm audit && npm update

# Update container images
podman-compose pull
podman-compose up -d --force-recreate

# Security updates
npm audit fix
```

#### Data Maintenance
```bash
# Redis cleanup
podman-compose exec redis redis-cli FLUSHDB

# Log rotation
podman-compose exec backend find /app/logs -name "*.log" -mtime +30 -delete

# Container cleanup
podman system prune -a
```

## 📈 Performance Optimization

### Frontend Optimization
- ✅ **Code splitting** - Dynamic imports for routes
- ✅ **Asset optimization** - Vite build optimization
- ✅ **Caching** - Browser caching headers
- ✅ **Compression** - Gzip compression

### Backend Optimization
- ✅ **Connection pooling** - Efficient database connections
- ✅ **Session management** - Redis-based sessions
- ✅ **API caching** - Smart caching strategies
- ✅ **Resource limits** - Memory and CPU constraints

### Infrastructure Optimization
- ✅ **Container optimization** - Multi-stage builds
- ✅ **Load balancing** - Automatic distribution
- ✅ **Health checks** - Proactive failure detection
- ✅ **Scaling** - Horizontal scaling capabilities

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

**Educational Use**: This project is designed for learning purposes. Commercial use requires compliance with Spotify's Terms of Service and API agreement.

## 🙏 Acknowledgments

### Technologies
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) - Music data and playback
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/) - Browser playback
- [React](https://reactjs.org/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Express.js](https://expressjs.com/) - Backend framework
- [Redis](https://redis.io/) - Session storage
- [Nginx](https://nginx.org/) - Web server
- [Podman](https://podman.io/) - Container runtime
- [Traefik](https://traefik.io/) - Reverse proxy

### Security
- Container security best practices
- OWASP security guidelines
- Industry-standard authentication patterns

## 📞 Support

### Getting Help

1. **Documentation**: Check this README and [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
2. **Issues**: Search existing issues or create a new one
3. **Discussions**: Use GitHub Discussions for questions
4. **Security**: Report security issues privately

### Common Resources

- [Spotify Developer Documentation](https://developer.spotify.com/documentation/)
- [React Documentation](https://reactjs.org/docs/)
- [Podman Documentation](https://docs.podman.io/)
- [Container Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)

---

**🎵 Enjoy your music with Songify!**

> **Note**: This application requires a Spotify Premium account for playback control features. Some API features may be limited in Development Mode until production approval.