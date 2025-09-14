/**
 * Spotify API Utilities
 * Helper functions for Spotify API interactions
 */

const axios = require('axios');
const config = require('../config/environment');
const { SPOTIFY_ENDPOINTS } = require('../constants');

/**
 * Create Spotify API client with authentication
 * @param {string} accessToken - Spotify access token
 * @returns {object} Axios instance configured for Spotify API
 */
const createSpotifyClient = (accessToken) => {
  return axios.create({
    baseURL: config.SPOTIFY.API_BASE_URL,
    timeout: config.API.TIMEOUT,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Build Spotify authorization URL
 * @param {string} state - Random state string for security
 * @param {string} redirectUri - Callback URI
 * @returns {string} Complete authorization URL
 */
const buildAuthorizationUrl = (state, redirectUri) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.SPOTIFY.CLIENT_ID,
    scope: config.SPOTIFY.SCOPES,
    redirect_uri: redirectUri,
    state: state,
    show_dialog: true
  });

  return `${config.SPOTIFY.AUTH_URL}?${params.toString()}`;
};

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from Spotify
 * @param {string} redirectUri - Callback URI
 * @returns {Promise<object>} Token response from Spotify
 */
const exchangeCodeForTokens = async (code, redirectUri) => {
  const { createBasicAuthHeader } = require('./crypto');
  
  const response = await axios({
    method: 'POST',
    url: config.SPOTIFY.TOKEN_URL,
    timeout: config.API.TIMEOUT,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': createBasicAuthHeader(config.SPOTIFY.CLIENT_ID, config.SPOTIFY.CLIENT_SECRET)
    },
    data: new URLSearchParams({
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }).toString()
  });

  return response.data;
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Spotify refresh token
 * @returns {Promise<object>} New token response from Spotify
 */
const refreshAccessToken = async (refreshToken) => {
  const { createBasicAuthHeader } = require('./crypto');
  
  const response = await axios({
    method: 'POST',
    url: config.SPOTIFY.TOKEN_URL,
    timeout: config.API.TIMEOUT,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': createBasicAuthHeader(config.SPOTIFY.CLIENT_ID, config.SPOTIFY.CLIENT_SECRET)
    },
    data: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }).toString()
  });

  return response.data;
};

/**
 * Get user profile from Spotify
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<object>} User profile data
 */
const getUserProfile = async (accessToken) => {
  const client = createSpotifyClient(accessToken);
  const response = await client.get(SPOTIFY_ENDPOINTS.USER_PROFILE);
  return response.data;
};

/**
 * Test multiple Spotify endpoints to check token permissions
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Array>} Array of endpoint test results
 */
const testEndpointAccess = async (accessToken) => {
  const client = createSpotifyClient(accessToken);
  const endpointTests = [];

  const endpoints = [
    { name: 'User Playlists', path: SPOTIFY_ENDPOINTS.USER_PLAYLISTS, params: { limit: 1 } },
    { name: 'User Top Tracks', path: SPOTIFY_ENDPOINTS.USER_TOP_TRACKS, params: { limit: 1 } },
    { name: 'Featured Playlists', path: SPOTIFY_ENDPOINTS.FEATURED_PLAYLISTS },
    { name: 'Player Devices', path: SPOTIFY_ENDPOINTS.PLAYER_DEVICES }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await client.get(endpoint.path, { params: endpoint.params });
      endpointTests.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        success: true,
        status: response.status,
        ...(endpoint.name === 'Player Devices' && { data: response.data })
      });
    } catch (error) {
      endpointTests.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        success: false,
        status: error.response?.status,
        error: error.response?.data?.error
      });
    }
  }

  return endpointTests;
};

module.exports = {
  createSpotifyClient,
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getUserProfile,
  testEndpointAccess
};
