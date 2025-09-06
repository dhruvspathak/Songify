/**
 * Secure Authentication Service
 * Handles OAuth flow through backend to protect client_secret
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class AuthService {
  /**
   * Exchange authorization code for access token via secure backend
   * @param {string} code - Authorization code from Spotify
   * @param {string} state - State parameter for CSRF protection
   * @returns {Promise<Object>} Token data
   */
  async exchangeCodeForToken(code, state) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include httpOnly cookies
        body: JSON.stringify({
          code,
          state,
          redirect_uri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/callback'
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Token exchange error:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  /**
   * Get current user's access token (from httpOnly cookie)
   * @returns {Promise<Object>} User data with token status
   */
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Refresh access token
   * @returns {Promise<Object>} Refreshed token data
   */
  async refreshToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear tokens
   */
  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Generate secure Spotify authorization URL
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl() {
    const client_id = import.meta.env.VITE_CLIENT_ID;
    const redirect_uri = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/callback';
    const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';
    
    // Generate a random state for CSRF protection
    const state = this.generateRandomString(16);
    sessionStorage.setItem('spotify_auth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Generate random string for state parameter
   * @param {number} length - Length of random string
   * @returns {string} Random string
   */
  generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return text;
  }
}

export default new AuthService();
