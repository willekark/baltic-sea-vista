import { useState, useEffect } from 'react';

const MAPBOX_TOKEN_KEY = 'mapbox_token';

export const useMapboxToken = () => {
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const loadToken = () => {
      try {
        const savedToken = localStorage.getItem(MAPBOX_TOKEN_KEY);
        if (savedToken && savedToken.startsWith('pk.')) {
          console.log('useMapboxToken - Token loaded from localStorage');
          setToken(savedToken);
        }
      } catch (error) {
        console.error('useMapboxToken - Error loading token:', error);
      }
      setIsLoading(false);
    };

    // Small delay to ensure localStorage is ready
    const timer = setTimeout(loadToken, 50);
    return () => clearTimeout(timer);
  }, []);

  const saveToken = (newToken: string) => {
    try {
      if (newToken && newToken.startsWith('pk.')) {
        localStorage.setItem(MAPBOX_TOKEN_KEY, newToken);
        setToken(newToken);
        console.log('useMapboxToken - Token saved successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('useMapboxToken - Error saving token:', error);
      return false;
    }
  };

  const clearToken = () => {
    try {
      localStorage.removeItem(MAPBOX_TOKEN_KEY);
      setToken('');
      console.log('useMapboxToken - Token cleared');
    } catch (error) {
      console.error('useMapboxToken - Error clearing token:', error);
    }
  };

  const isValidToken = (tokenToCheck?: string) => {
    const checkToken = tokenToCheck || token;
    return checkToken && checkToken.startsWith('pk.') && checkToken.length > 10;
  };

  return {
    token,
    setToken,
    saveToken,
    clearToken,
    isValidToken,
    isLoading
  };
};