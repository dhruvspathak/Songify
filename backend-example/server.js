/**
 * Secure Spotify OAuth Backend Implementation
 * This example shows how to handle OAuth flow securely on the backend
 * 
 * IMPORTANT: This is an example. You'll need to set up your own backend server.
 * 
 * Install dependencies:
 * npm init -y
 * npm install express cors dotenv axios cookie-parser helmet
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cookieParser());

// CORS configuration - restrict to your frontend domain in production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Spotify OAuth callback endpoint
app.post('/auth/callback', async (req, res) => {
  try {
    const { code, state, redirect_uri } = req.body;

    // Validate required parameters
    if (!code || !state) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters' 
      });
    }

    // Validate client credentials are available
    const client_id = process.env.VITE_CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET; // Note: NO VITE_ prefix

    if (!client_id || !client_secret) {
      console.error('Missing Spotify client credentials');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      });
    }

    // Exchange authorization code for access token
    const authOptions = {
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      data: new URLSearchParams({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      }).toString()
    };

    const response = await axios(authOptions);
    const { access_token, refresh_token, expires_in } = response.data;

    // Store tokens securely in httpOnly cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'lax',
      maxAge: expires_in * 1000 // Convert to milliseconds
    };

    res.cookie('spotify_access_token', access_token, cookieOptions);
    
    if (refresh_token) {
      res.cookie('spotify_refresh_token', refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }

    res.json({
      success: true,
      message: 'Authentication successful',
      expires_in: expires_in
    });

  } catch (error) {
    console.error('OAuth callback error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

// Get current user endpoint
app.get('/auth/me', async (req, res) => {
  try {
    const accessToken = req.cookies.spotify_access_token;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    // Fetch user data from Spotify
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json({
      success: true,
      user: userResponse.data
    });

  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        refresh_needed: true
      });
    }

    console.error('Get user error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
});

// Refresh token endpoint
app.post('/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.spotify_refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token available'
      });
    }

    const client_id = process.env.VITE_CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;

    const authOptions = {
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      data: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }).toString()
    };

    const response = await axios(authOptions);
    const { access_token, expires_in, refresh_token: new_refresh_token } = response.data;

    // Update cookies with new tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in * 1000
    };

    res.cookie('spotify_access_token', access_token, cookieOptions);
    
    if (new_refresh_token) {
      res.cookie('spotify_refresh_token', new_refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }
});

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  // Clear authentication cookies
  res.clearCookie('spotify_access_token');
  res.clearCookie('spotify_refresh_token');
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Secure authentication server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
