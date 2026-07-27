import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * AuthContext — global authentication state (Context API).
 *
 * Chosen over Redux for this because auth is simple, read-mostly state
 * (current user + loading flag) that nearly every component needs —
 * a Context avoids prop-drilling without the boilerplate of a slice.
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

    // isMounted guards against setting state after this effect's cleanup
    // has run (e.g. component unmounted mid-request during fast navigation).
    let isMounted = true;
    api
      .get('/auth/me')
      .then((res) => {
        if (isMounted) setUser(res.data.user);
      })
      .catch(() => {
        // Token was rejected (expired/invalid) — drop it so the user is
        // treated as logged out instead of stuck in a broken state.
        localStorage.removeItem('token');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Called by Login/Register pages after a successful API response.
  const login = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // Used when the user object changes without a fresh login (e.g. after
  // selecting a membership plan) so the UI can reflect it immediately.
  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook so components don't import useContext + AuthContext
// separately. Disabled lint rule: this file exports both a component
// (AuthProvider) and a hook, which the fast-refresh rule normally flags.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}