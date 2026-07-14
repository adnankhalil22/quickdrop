import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import client, { setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

function loadStoredUser() {
  const raw = localStorage.getItem('quickdrop_user');
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  const persistSession = useCallback((nextUser, token) => {
    localStorage.setItem('quickdrop_token', token);
    localStorage.setItem('quickdrop_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('quickdrop_token');
    localStorage.removeItem('quickdrop_user');
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  const login = useCallback(
    async (email, password) => {
      const { data } = await client.post('/login', { email, password });
      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await client.post('/register', payload);
      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      await client.post('/logout');
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const updateUser = useCallback((nextUser) => {
    localStorage.setItem('quickdrop_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
