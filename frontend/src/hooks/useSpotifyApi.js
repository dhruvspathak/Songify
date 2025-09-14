/**
 * Custom hook for Spotify API calls
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, REQUEST_CONFIG } from '../constants';

export const useSpotifyApi = (accessToken) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create axios instance with default config
  const createApiInstance = useCallback(() => {
    if (!accessToken) return null;

    return axios.create({
      timeout: REQUEST_CONFIG.TIMEOUT,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }, [accessToken]);

  // Generic API call handler
  const makeApiCall = useCallback(async (apiCall) => {
    if (!accessToken) {
      setError('No access token available');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      setError(error.response?.data?.error?.message || error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Fetch user playlists
  const fetchPlaylists = useCallback(async (limit = REQUEST_CONFIG.DEFAULT_LIMIT) => {
    return makeApiCall(async () => {
      const api = createApiInstance();
      const response = await api.get(API_ENDPOINTS.SPOTIFY.PLAYLISTS, {
        params: { limit },
      });
      return response.data.items || [];
    });
  }, [makeApiCall, createApiInstance]);

  // Fetch user's top tracks
  const fetchTopTracks = useCallback(async (timeRange = 'short_term', limit = 10) => {
    return makeApiCall(async () => {
      const api = createApiInstance();
      const response = await api.get(API_ENDPOINTS.SPOTIFY.TOP_TRACKS, {
        params: { time_range: timeRange, limit },
      });
      return response.data.items || [];
    });
  }, [makeApiCall, createApiInstance]);

  // Fetch featured playlists
  const fetchFeaturedPlaylists = useCallback(async (limit = REQUEST_CONFIG.DEFAULT_LIMIT) => {
    return makeApiCall(async () => {
      const api = createApiInstance();
      const response = await api.get(API_ENDPOINTS.SPOTIFY.FEATURED_PLAYLISTS, {
        params: { limit },
      });
      return response.data.playlists?.items || [];
    });
  }, [makeApiCall, createApiInstance]);

  // Fetch new releases
  const fetchNewReleases = useCallback(async (limit = REQUEST_CONFIG.DEFAULT_LIMIT) => {
    return makeApiCall(async () => {
      const api = createApiInstance();
      const response = await api.get(API_ENDPOINTS.SPOTIFY.NEW_RELEASES, {
        params: { limit },
      });
      return response.data.albums?.items || [];
    });
  }, [makeApiCall, createApiInstance]);

  // Fetch playlist tracks
  const fetchPlaylistTracks = useCallback(async (playlistId, limit = REQUEST_CONFIG.DEFAULT_LIMIT) => {
    return makeApiCall(async () => {
      const api = createApiInstance();
      const response = await api.get(API_ENDPOINTS.SPOTIFY.PLAYLIST_TRACKS(playlistId), {
        params: { limit },
      });
      return response.data.items || [];
    });
  }, [makeApiCall, createApiInstance]);

  // Fetch album tracks
  const fetchAlbumTracks = useCallback(async (albumId, limit = REQUEST_CONFIG.DEFAULT_LIMIT) => {
    return makeApiCall(async () => {
      const api = createApiInstance();
      const response = await api.get(API_ENDPOINTS.SPOTIFY.ALBUM_TRACKS(albumId), {
        params: { limit },
      });
      return response.data.items || [];
    });
  }, [makeApiCall, createApiInstance]);

  // Search for music
  const search = useCallback(async (query, types = ['track', 'album', 'artist'], limit = REQUEST_CONFIG.SEARCH_LIMIT) => {
    return makeApiCall(async () => {
      const api = createApiInstance();
      const response = await api.get(API_ENDPOINTS.SPOTIFY.SEARCH, {
        params: {
          q: query,
          type: types.join(','),
          limit,
        },
      });
      return response.data;
    });
  }, [makeApiCall, createApiInstance]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    return makeApiCall(async () => {
      const api = createApiInstance();
      const response = await api.get(API_ENDPOINTS.SPOTIFY.ME);
      return response.data;
    });
  }, [makeApiCall, createApiInstance]);

  return {
    loading,
    error,
    fetchPlaylists,
    fetchTopTracks,
    fetchFeaturedPlaylists,
    fetchNewReleases,
    fetchPlaylistTracks,
    fetchAlbumTracks,
    search,
    fetchUserProfile,
  };
};
