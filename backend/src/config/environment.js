/**
 * Environment Configuration
 * Centralizes all environment variable handling
 */

require('dotenv').config();

const config = {
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Frontend Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Spotify OAuth Configuration
  SPOTIFY: {
    CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SCOPES: 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative user-library-read user-top-read playlist-modify-public playlist-modify-private',
    AUTH_URL: 'https://accounts.spotify.com/authorize',
    TOKEN_URL: 'https://accounts.spotify.com/api/token',
    API_BASE_URL: 'https://api.spotify.com/v1'
  },
  
  // Security Configuration
  SECURITY: {
    COOKIE_SECRET: process.env.COOKIE_SECRET || 'default-secret-change-in-production',
    SESSION_TIMEOUT: 5 * 60 * 1000, // 5 minutes
    TOKEN_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
    REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  
  // API Configuration
  API: {
    TIMEOUT: 10000, // 10 seconds
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100 // requests per window
    }
  }
};

// Validation
const validateConfig = () => {
  const required = [
    'SPOTIFY.CLIENT_ID',
    'SPOTIFY.CLIENT_SECRET'
  ];
  
  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    return !value;
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Only validate in production
if (config.NODE_ENV === 'production') {
  validateConfig();
}

module.exports = config;
