import { useState, useEffect } from 'react';

const useAuth = () => {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    setAccessToken(token);
  }, []);

  return accessToken;
};

export default useAuth;
