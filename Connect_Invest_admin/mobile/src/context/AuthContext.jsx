import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('ci_admin_token');
      const storedUser = await AsyncStorage.getItem('ci_admin_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.warn('Failed to restore session:', err);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const { token: authToken, user: authUser } = res.data;
      if (authUser.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      setToken(authToken);
      setUser(authUser);
      await AsyncStorage.setItem('ci_admin_token', authToken);
      await AsyncStorage.setItem('ci_admin_user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.data.error || 'Authentication failed');
  }

  async function logout() {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('ci_admin_token');
    await AsyncStorage.removeItem('ci_admin_user');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

