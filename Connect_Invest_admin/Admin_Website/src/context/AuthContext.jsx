import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ci_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch {
          localStorage.removeItem('ci_admin_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success && res.data.token) {
      localStorage.setItem('ci_admin_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.error || 'Authentication failed');
  };

  const logout = () => {
    localStorage.removeItem('ci_admin_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser, newToken) => {
    if (updatedUser) setUser(updatedUser);
    if (newToken) {
      localStorage.setItem('ci_admin_token', newToken);
      setToken(newToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
