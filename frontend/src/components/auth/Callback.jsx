import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../constants';
import { LoadingSpinner, ErrorMessage } from '../ui';
import { secureLog, secureError } from '../../utils/secureLogger';

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessedRef.current || isProcessing) {
      return;
    }

    const handleCallback = async () => {
      // Mark as processing to prevent duplicate calls
      hasProcessedRef.current = true;
      setIsProcessing(true);

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        setError(error);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code || !state) {
        setError('Missing authentication parameters');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        secureLog('Sending auth callback request...');
        const response = await fetch(API_ENDPOINTS.AUTH.CALLBACK, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state
          }),
        });

        const data = await response.json();
        secureLog('Auth callback response received:', { success: data.success, hasError: !!data.error });

        if (!response.ok || !data.success) {
          throw new Error(data.error || data.details || `Authentication failed: ${response.status}`);
        }

        // Clear state from storage and redirect with success
        localStorage.removeItem('spotify_auth_state');
        
        // Trigger a page reload to refresh authentication state
        window.location.href = '/?login=success';
      } catch (error) {
        secureError('Authentication error:', error);
        setError(error.message);
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, isProcessing]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {error ? (
        <ErrorMessage 
          message={error}
          title="Authentication Error"
          type="error"
        />
      ) : (
        <LoadingSpinner 
          message={isProcessing ? 'Processing authentication...' : 'Initializing...'}
          size="large"
        />
      )}
    </div>
  );
};

export default Callback;