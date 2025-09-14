/**
 * Application Constants
 * Centralized constants for the application
 */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const COOKIE_NAMES = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  AUTH_STATE: 'spotify_auth_state'
};

const ERROR_MESSAGES = {
  // Authentication Errors
  NOT_AUTHENTICATED: 'Not authenticated',
  TOKEN_EXPIRED: 'Token expired',
  INVALID_CREDENTIALS: 'Invalid credentials',
  STATE_MISMATCH: 'State mismatch',
  MISSING_PARAMETERS: 'Missing required parameters',
  CODE_ALREADY_USED: 'Authorization code already used',
  NO_REFRESH_TOKEN: 'No refresh token available',
  
  // Server Errors
  SERVER_CONFIG_ERROR: 'Server configuration error',
  AUTH_FAILED: 'Authentication failed',
  TOKEN_REFRESH_FAILED: 'Failed to refresh token',
  USER_DATA_FETCH_FAILED: 'Failed to fetch user data',
  TOKEN_RETRIEVAL_FAILED: 'Failed to retrieve access token',
  DEBUG_CHECK_FAILED: 'Debug check failed',
  
  // Generic
  INTERNAL_ERROR: 'Internal server error'
};

const SUCCESS_MESSAGES = {
  AUTH_SUCCESS: 'Authentication successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  LOGOUT_SUCCESS: 'Logged out successfully'
};

const SPOTIFY_ENDPOINTS = {
  USER_PROFILE: '/me',
  USER_PLAYLISTS: '/me/playlists',
  USER_TOP_TRACKS: '/me/top/tracks',
  FEATURED_PLAYLISTS: '/browse/featured-playlists',
  PLAYER_DEVICES: '/me/player/devices',
  NEW_RELEASES: '/browse/new-releases',
  PLAYLIST_TRACKS: (playlistId) => `/playlists/${playlistId}/tracks`,
  ALBUM_TRACKS: (albumId) => `/albums/${albumId}/tracks`
};

const GRANT_TYPES = {
  AUTHORIZATION_CODE: 'authorization_code',
  REFRESH_TOKEN: 'refresh_token'
};

module.exports = {
  HTTP_STATUS,
  COOKIE_NAMES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SPOTIFY_ENDPOINTS,
  GRANT_TYPES
};
