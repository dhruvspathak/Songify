# 🎵 Songify

A modern Spotify web player built with React and Express, featuring OAuth authentication and the Spotify Web Playback SDK.

## ✨ Features

- 🔐 **Secure OAuth Authentication** - Login with your Spotify account
- 🎵 **Music Playback** - Play, pause, skip tracks using Spotify Web Playback SDK
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Clean, intuitive interface with Material-UI components
- 🔄 **Real-time Sync** - Syncs with your active Spotify sessions
- 📊 **Playlists & Top Tracks** - Browse your music library
- 🎯 **Smart Fallbacks** - Graceful handling of API limitations

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Spotify Premium account (required for playback control)
- Spotify Developer App (for OAuth credentials)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd songify
```

### 2. Set Up Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:5173/callback`
4. Note your `Client ID` and `Client Secret`

### 3. Configure Environment Variables

**Frontend:**
```bash
cd frontend
cp env.template .env
# Edit .env with your Spotify Client ID
```

**Backend:**
```bash
cd backend
cp env.template .env
# Edit .env with your Spotify credentials
```

### 4. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 5. Start the Application

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

Visit `http://localhost:5173` to use the app!

## 🦭 Podman Deployment (Alternative)

For a containerized deployment with production-ready features using Podman:

### Quick Podman Setup
```bash
# Clone and navigate to project
git clone <your-repo-url>
cd songify

# Set up environment files
cp backend/env.template backend/.env
cp frontend/env.template frontend/.env
# Edit .env files with your Spotify credentials

# Deploy with Podman
./scripts/deploy.sh development
# Or on Windows: scripts\deploy.bat development
```

### Podman Features
- 🦭 **Rootless containers** - Better security, no daemon
- 🔒 **Production-ready** with SSL, security headers, and monitoring
- 📊 **Health checks** and automatic restarts
- 🚀 **Horizontal scaling** support
- 🗄️ **Redis session storage** for production
- 📈 **Traefik reverse proxy** with automatic SSL
- ⚡ **Drop-in Docker replacement** with better performance

**Access URLs:**
- Frontend: http://localhost
- Backend API: http://localhost:3000

For detailed Podman documentation, see [docker/README.md](docker/README.md).

## 🏗️ Project Structure

```
songify/
├── backend/
│   ├── server.js          # Express server with OAuth & API routes
│   ├── package.json       # Backend dependencies
│   └── env.template       # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── main.jsx       # App entry point
│   ├── package.json       # Frontend dependencies
│   └── env.template       # Frontend environment template
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
- `VITE_CLIENT_ID` - Your Spotify Client ID
- `VITE_REDIRECT_URI` - OAuth redirect URI (default: http://localhost:5173/callback)
- `VITE_BACKEND_URL` - Backend URL (default: http://localhost:3000)

**Backend (.env):**
- `CLIENT_ID` - Your Spotify Client ID
- `CLIENT_SECRET` - Your Spotify Client Secret
- `REDIRECT_URI` - OAuth redirect URI
- `PORT` - Server port (default: 3000)
- `SESSION_SECRET` - Random string for session security

## 🎯 Key Features Explained

### OAuth Flow
- Secure server-side token exchange
- HTTP-only cookies for token storage
- Automatic token refresh handling

### Playback Control
- Web Playback SDK integration
- Device transfer capabilities
- Smart error handling for Premium requirements

### API Integration
- Multiple endpoint fallbacks for Development Mode
- Graceful degradation when APIs are unavailable
- User-friendly error messages

## 🐛 Troubleshooting

### Common Issues

**"No active device" errors:**
- Ensure you have Spotify Premium
- Open Spotify on another device first
- Use the "Transfer Playback" button

**404 errors on Spotify API:**
- Add yourself as a test user in Spotify Developer Dashboard
- Request production access for public release
- Some endpoints require specific scopes

**Authentication issues:**
- Check your Client ID and Secret
- Verify redirect URI matches exactly
- Clear browser cookies and try again

### Debug Tools

Use the "Debug Scopes" button in the player to check:
- Token validity
- Available API endpoints
- Account type (Free vs Premium)
- Current scopes and permissions

## 🚀 Deployment

### Production Checklist

1. **Environment Variables:**
   - Set `NODE_ENV=production`
   - Use HTTPS URLs for redirect URIs
   - Generate secure session secrets

2. **Spotify App Settings:**
   - Update redirect URIs for production domain
   - Request production access if needed
   - Add all users or request quota extension

3. **Security:**
   - Enable HTTPS
   - Set secure cookie options
   - Configure CORS properly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes. Spotify API usage subject to Spotify's Terms of Service.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/)
- [React](https://reactjs.org/) & [Vite](https://vitejs.dev/)
- [Material-UI](https://mui.com/)

---

**Note:** This app requires Spotify Premium for playback control features. Some features may be limited in Development Mode.