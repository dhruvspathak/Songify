import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
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
        const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
        console.log('Sending auth callback request...');
        const response = await fetch('http://localhost:3000/auth/callback', {
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
        console.log('Auth callback response:', data);

        if (!response.ok || !data.success) {
          throw new Error(data.error || data.details || `Authentication failed: ${response.status}`);
        }

        // Clear state from storage and redirect with success
        localStorage.removeItem('spotify_auth_state');
        navigate('/?login=success');
      } catch (error) {
        console.error('Authentication error:', error.message);
        setError(error.message);
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="callback-container">
      {error ? (
        <div className="error-message">
          {error}
          <div>Redirecting to home page...</div>
        </div>
      ) : (
        <div className="loading-message">
          Processing authentication...
        </div>
      )}
    </div>
  );
};

export default Callback;