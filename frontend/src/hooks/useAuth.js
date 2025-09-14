/**
 * Custom hook for authentication management
 */

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../constants';

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get access token from backend
  const getAccessToken = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.TOKEN, {
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

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        credentials: 'include',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated
        const isAuth = await checkAuthStatus();
        setIsAuthenticated(isAuth);
        
        // Get access token if authenticated
        if (isAuth) {
          const token = await getAccessToken();
          setAccessToken(token);
        }
        
        // Clean up URL if login was successful
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'success') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setError(error.message);
        setIsAuthenticated(false);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Refresh access token
  const refreshToken = async () => {
    try {
      const token = await getAccessToken();
      setAccessToken(token);
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      setError(error.message);
      return null;
    }
  };

  // Login handler
  const login = () => {
    window.location.href = API_ENDPOINTS.AUTH.LOGIN;
  };

  // Logout handler
  const logout = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setAccessToken(null);
        return true;
      } else {
        console.error('Logout failed: Server returned an error');
        return false;
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error.message);
      return false;
    }
  };

  return {
    accessToken,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    refreshToken,
    checkAuthStatus,
  };
};
