import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * AuthContext — global authentication state (Context API).
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Start in "loading" only if there is a token to verify.
  // If there is no token, there is nothing to load.
  const [loading, setLoading] = useState(
    () => !!localStorage.getItem('token')
  );

  // On startup: if a token exists, verify it with the backend.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // nothing to do — loading already false

    let isMounted = true;
    api
      .get('/auth/me')
      .then((res) => {
        if (isMounted) setUser(res.data.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}