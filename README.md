# 🎵 Songify

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](https://docker.com/)

A modern Spotify web player built with React and Express, featuring secure OAuth authentication and containerized deployment.

## ✨ Features

- 🔐 **Secure OAuth** - Login with your Spotify account
- 🎵 **Music Playback** - Play, pause, skip tracks using Spotify Web Playback SDK
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Clean interface with Material-UI
- 🐳 **Containerized** - Docker/Podman support
- 🔒 **Security Hardened** - Production-ready security
- 📈 **Scalable** - Load balancing and health monitoring

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16+ - [Download](https://nodejs.org/)
- **Spotify Premium** account (required for playback)
- **Spotify Developer App** - [Create here](https://developer.spotify.com/dashboard)

## 📦 Installation

### Option 1: Development Setup

1. **Clone and Setup**
   ```bash
   git clone https://github.com/your-username/songify.git
   cd songify
   ```

2. **Configure Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create new app with redirect URI: `http://localhost:5173/callback`
   - Note your `Client ID` and `Client Secret`

3. **Setup Environment**
   ```bash
   # Backend
   cd backend && cp env.template .env
   # Edit .env with your Spotify credentials
   
   # Frontend  
   cd ../frontend && cp env.template .env
   # Edit .env with your Spotify Client ID
   ```

4. **Install and Run**
   ```bash
   # Install dependencies
   cd backend && npm install
   cd ../frontend && npm install
   
   # Start services (separate terminals)
   cd backend && npm start
   cd frontend && npm run dev
   ```

5. **Access**: http://localhost:5173

### Option 2: Docker/Podman (Production)

```bash
# Setup
git clone https://github.com/your-username/songify.git
cd songify
cp backend/env.docker.template backend/.env
cp frontend/env.docker.template frontend/.env
# Edit .env files with your Spotify credentials

# Deploy
podman-compose up -d --build
# Access: http://localhost:8080
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
FRONTEND_URL=http://localhost:5173  # or http://localhost:8080 for containers
```

**Frontend (.env):**
```bash
VITE_CLIENT_ID=your_spotify_client_id
VITE_BACKEND_URL=http://localhost:3000
```

## 🏗️ Project Structure

```
songify/
├── backend/          # Express server with OAuth & API
├── frontend/         # React app with Vite
├── scripts/          # Deployment scripts
├── docker-compose.yml
└── docker-compose.prod.yml
```

## 🛠️ Troubleshooting

### Common Issues

**🎵 "No active device" errors:**
- Ensure you have **Spotify Premium**
- Open Spotify app on another device first
- Use the "Transfer Playback" button

**🔒 Authentication issues:**
- Verify Spotify credentials are correct
- Check redirect URI matches exactly
- Clear browser cookies and localStorage

**🐳 Container issues:**
- Check logs: `podman-compose logs -f`
- Verify environment files exist
- Ensure ports aren't in use

## 🏭 Production

For production deployment:

```bash
# Use production templates
cp backend/env.production.template backend/.env.production
cp frontend/env.production.template frontend/.env.production
# Edit with HTTPS URLs and secure secrets

# Deploy
podman-compose -f docker-compose.prod.yml up -d --build
```

**Production features:**
- SSL/TLS with Let's Encrypt
- Load balancing and scaling
- Redis session storage
- Monitoring and health checks

## 💻 Development

### Available Scripts

**Backend:**
```bash
cd backend
npm start    # Start server
npm run dev  # Development with nodemon
```

**Frontend:**
```bash
cd frontend
npm run dev   # Start Vite dev server
npm run build # Build for production
```

**Containers:**
```bash
podman-compose logs -f        # View logs
podman-compose ps            # Check status
podman-compose down          # Stop services
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎵 Support

- [Spotify Developer Documentation](https://developer.spotify.com/documentation/)
- [Issues](https://github.com/your-username/songify/issues)

---

**Note**: Requires Spotify Premium for playback features. Some API features may be limited in Development Mode.