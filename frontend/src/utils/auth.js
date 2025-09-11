// Utility functions for authentication

export const getAccessToken = async () => {
  try {
    const response = await fetch('http://localhost:3000/auth/token', {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
};

export const checkAuthStatus = async () => {
  try {
    const response = await fetch('http://localhost:3000/auth/me', {
      credentials: 'include',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};
