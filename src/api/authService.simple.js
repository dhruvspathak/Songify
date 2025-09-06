/**
 * Simplified Authentication Service for debugging
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Simple function-based approach instead of class
export const exchangeCodeForToken = async (code, state) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
};

export const getAuthorizationUrl = () => {
  const client_id = import.meta.env.VITE_CLIENT_ID;
  const redirect_uri = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/callback';
  const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';
  
  // Generate a random state for CSRF protection
  const state = generateRandomString(16);
  sessionStorage.setItem('spotify_auth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
};

