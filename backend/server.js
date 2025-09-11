const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Helper function to generate random string
const generateRandomString = length => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Login endpoint
app.get("/auth/login", (req, res) => {
  const state = generateRandomString(16);
  const redirectUri = `${process.env.FRONTEND_URL}/callback`;
  const scope = 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative user-library-read user-top-read playlist-modify-public playlist-modify-private';

  // Store state in cookie
  res.cookie('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000
  });

  // Redirect to Spotify auth
  const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
      show_dialog: true
    }).toString();

  res.redirect(spotifyAuthUrl);
});

// Store used authorization codes to prevent reuse
const usedCodes = new Set();

// Callback endpoint
app.post("/auth/callback", async (req, res) => {
  try {
    const { code, state } = req.body;
    const storedState = req.cookies['spotify_auth_state'];

    // Validate state
    if (state !== storedState) {
      return res.status(400).json({
        success: false,
        error: "State mismatch"
      });
    }

    res.clearCookie('spotify_auth_state');

    if (!code || !state) {
      console.log('Missing parameters:', { code, state });
      return res.status(400).json({
        success: false,
        error: "Missing required parameters"
      });
    }

    // Check if authorization code has already been used
    if (usedCodes.has(code)) {
      console.log('Authorization code already used:', code.substring(0, 20) + '...');
      return res.status(400).json({
        success: false,
        error: "Authorization code already used"
      });
    }

    // Mark code as used immediately to prevent race conditions
    usedCodes.add(code);
    
    // Clean up used codes after 5 minutes to prevent memory leaks
    setTimeout(() => {
      usedCodes.delete(code);
    }, 5 * 60 * 1000);

    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!client_id || !client_secret) {
      console.error("Missing Spotify client credentials");
      return res.status(500).json({
        success: false,
        error: "Server configuration error"
      });
    }

    const redirectUri = `${process.env.FRONTEND_URL}/callback`;

    console.log("Attempting token exchange with params:", {
      clientIdLength: client_id.length,
      redirectUri: redirectUri,
      codeLength: code.length
    });

    const response = await axios({
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      timeout: 10000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64")
      },
      data: new URLSearchParams({
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      }).toString()
    });

    console.log('✅ Token exchange successful');

    const { access_token, refresh_token, expires_in } = response.data;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax"
    };

    res.cookie("spotify_access_token", access_token, {
      ...cookieOptions,
      maxAge: expires_in * 1000
    });

    if (refresh_token) {
      res.cookie("spotify_refresh_token", refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    res.json({
      success: true,
      message: "Authentication successful",
      expires_in: expires_in
    });
  } catch (error) {
    // Remove the code from used codes if the exchange fails
    const { code } = req.body;
    if (code && usedCodes.has(code)) {
      usedCodes.delete(code);
      console.log('Removed failed authorization code from used codes');
    }

    console.error("OAuth callback error details:", {
      error: error.message,
      response: error.response?.data,
      requestBody: req.body
    });
    
    // Provide more specific error messages
    let errorMessage = "Authentication failed";
    let statusCode = 500;
    
    if (error.response?.data?.error === 'invalid_grant') {
      errorMessage = "Authorization code is invalid or expired. Please try logging in again.";
      statusCode = 400;
    } else if (error.response?.data?.error === 'invalid_client') {
      errorMessage = "Invalid client credentials. Please check your Spotify app configuration.";
      statusCode = 500;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.response?.data?.error_description || error.message
    });
  }
});

// Get current user endpoint
app.get("/auth/me", async (req, res) => {
  try {
    const accessToken = req.cookies.spotify_access_token;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated"
      });
    }

    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      timeout: 10000
    });

    res.json({
      success: true,
      user: userResponse.data
    });
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: "Token expired",
        refresh_needed: true
      });
    }

    console.error("Get user error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user data"
    });
  }
});

// Get access token endpoint for frontend use
app.get("/auth/token", async (req, res) => {
  try {
    const accessToken = req.cookies.spotify_access_token;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated"
      });
    }

    res.json({
      success: true,
      access_token: accessToken
    });
  } catch (error) {
    console.error("Get token error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve access token"
    });
  }
});

// Debug endpoint to check token and scopes
app.get("/auth/debug", async (req, res) => {
  try {
    const accessToken = req.cookies.spotify_access_token;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated"
      });
    }

    // Test the token by calling Spotify's /me endpoint
    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      timeout: 10000
    });

    // Test various endpoints to see what scopes we have
    const endpointTests = [];

    // Test user playlists
    try {
      const playlistResponse = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit: 1 },
        timeout: 10000
      });
      endpointTests.push({ endpoint: '/me/playlists', success: true, status: playlistResponse.status });
    } catch (playlistError) {
      endpointTests.push({ 
        endpoint: '/me/playlists', 
        success: false, 
        status: playlistError.response?.status,
        error: playlistError.response?.data?.error
      });
    }

    // Test user top tracks
    try {
      const topTracksResponse = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit: 1 },
        timeout: 10000
      });
      endpointTests.push({ endpoint: '/me/top/tracks', success: true, status: topTracksResponse.status });
    } catch (topTracksError) {
      endpointTests.push({ 
        endpoint: '/me/top/tracks', 
        success: false, 
        status: topTracksError.response?.status,
        error: topTracksError.response?.data?.error
      });
    }

    // Test browse/featured-playlists endpoint
    try {
      const browseResponse = await axios.get("https://api.spotify.com/v1/browse/featured-playlists", {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000
      });
      endpointTests.push({ endpoint: '/browse/featured-playlists', success: true, status: browseResponse.status });
    } catch (browseError) {
      endpointTests.push({ 
        endpoint: '/browse/featured-playlists', 
        success: false, 
        status: browseError.response?.status,
        error: browseError.response?.data?.error
      });
    }

    // Test playback devices
    try {
      const devicesResponse = await axios.get("https://api.spotify.com/v1/me/player/devices", {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000
      });
      endpointTests.push({ endpoint: '/me/player/devices', success: true, status: devicesResponse.status, data: devicesResponse.data });
    } catch (devicesError) {
      endpointTests.push({ 
        endpoint: '/me/player/devices', 
        success: false, 
        status: devicesError.response?.status,
        error: devicesError.response?.data?.error
      });
    }

    // Decode token to check scopes (basic info only)
    const tokenParts = accessToken.split('.');
    let tokenInfo = null;
    try {
      // Note: We can't decode Spotify tokens as they're opaque, but we can check what endpoints work
      tokenInfo = "Spotify uses opaque tokens - scope info determined by endpoint access";
    } catch (e) {
      tokenInfo = "Cannot decode token";
    }

    res.json({
      success: true,
      user: {
        id: userResponse.data.id,
        display_name: userResponse.data.display_name,
        email: userResponse.data.email,
        country: userResponse.data.country,
        product: userResponse.data.product // Free vs Premium
      },
      tokenValid: true,
      tokenInfo: tokenInfo,
      requestedScopes: "user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative user-library-read user-top-read playlist-modify-public playlist-modify-private",
      endpointTests: endpointTests
    });
  } catch (error) {
    console.error("Debug endpoint error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Debug check failed",
      details: error.response?.data || error.message
    });
  }
});

// Refresh token endpoint
app.post("/auth/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.spotify_refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: "No refresh token available"
      });
    }

    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    const response = await axios({
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64")
      },
      data: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
      }).toString()
    });

    const { access_token, expires_in, refresh_token: new_refresh_token } = response.data;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax"
    };

    res.cookie("spotify_access_token", access_token, {
      ...cookieOptions,
      maxAge: expires_in * 1000
    });

    if (new_refresh_token) {
      res.cookie("spotify_refresh_token", new_refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    res.json({
      success: true,
      message: "Token refreshed successfully"
    });
  } catch (error) {
    console.error("Token refresh error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Failed to refresh token"
    });
  }
});

// Logout endpoint
app.post("/auth/logout", (req, res) => {
  res.clearCookie("spotify_access_token");
  res.clearCookie("spotify_refresh_token");
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Secure authentication server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
