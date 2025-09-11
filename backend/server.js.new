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
  const scope = 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state';

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

    console.log('Token exchange response received:', {
      status: response.status,
      hasAccessToken: !!response.data.access_token,
      hasRefreshToken: !!response.data.refresh_token,
      expiresIn: response.data.expires_in
    });

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
    console.error("OAuth callback error details:", {
      error: error.message,
      response: error.response?.data,
      requestBody: req.body
    });
    res.status(500).json({
      success: false,
      error: "Authentication failed",
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
      }
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
