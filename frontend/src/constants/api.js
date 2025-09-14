/**
 * API Configuration and Constants
 */

// Base URLs
export const API_BASE_URL = 'http://localhost:3000';
export const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    TOKEN: `${API_BASE_URL}/auth/token`,
    ME: `${API_BASE_URL}/auth/me`,
    DEBUG: `${API_BASE_URL}/auth/debug`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    CALLBACK: `${API_BASE_URL}/auth/callback`,
  },
  
  // Spotify API endpoints
  SPOTIFY: {
    ME: `${SPOTIFY_API_BASE_URL}/me`,
    PLAYLISTS: `${SPOTIFY_API_BASE_URL}/me/playlists`,
    TOP_TRACKS: `${SPOTIFY_API_BASE_URL}/me/top/tracks`,
    FEATURED_PLAYLISTS: `${SPOTIFY_API_BASE_URL}/browse/featured-playlists`,
    NEW_RELEASES: `${SPOTIFY_API_BASE_URL}/browse/new-releases`,
    SEARCH: `${SPOTIFY_API_BASE_URL}/search`,
    PLAYLIST_TRACKS: (playlistId) => `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`,
    ALBUM_TRACKS: (albumId) => `${SPOTIFY_API_BASE_URL}/albums/${albumId}/tracks`,
    PLAYER: {
      PLAY: `${SPOTIFY_API_BASE_URL}/me/player/play`,
      PAUSE: `${SPOTIFY_API_BASE_URL}/me/player/pause`,
      DEVICES: `${SPOTIFY_API_BASE_URL}/me/player/devices`,
      CURRENTLY_PLAYING: `${SPOTIFY_API_BASE_URL}/me/player/currently-playing`,
      TRANSFER: `${SPOTIFY_API_BASE_URL}/me/player`,
    },
  },
};

// Request configuration
export const REQUEST_CONFIG = {
  TIMEOUT: 10000,
  DEFAULT_LIMIT: 20,
  SEARCH_LIMIT: 5,
};

// Spotify scopes
export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-top-read',
  'playlist-modify-public',
  'playlist-modify-private',
].join(' ');
