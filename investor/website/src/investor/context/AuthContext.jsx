import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ci_investor_token') || null);
  const [kycStatus, setKycStatus] = useState('NOT_STARTED');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ci_investor_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data.user);
            setKycStatus(res.data.kycStatus || 'NOT_STARTED');
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[Auth] Session check failed, clearing token:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password, remember = false) => {
    const res = await authService.login(identifier, password);
    if (res.success && res.data) {
      const { token, user, kycStatus } = res.data;
      localStorage.setItem('ci_investor_token', token);
      if (remember) {
        localStorage.setItem('ci_remember_identifier', identifier);
      } else {
        localStorage.removeItem('ci_remember_identifier');
      }
      setToken(token);
      setUser(user);
      setKycStatus(kycStatus || 'NOT_STARTED');
      return res;
    }
    throw new Error(res.message || 'Login failed.');
  };

  const register = async (registrationData) => {
    const res = await authService.register(registrationData);
    if (res.success && res.data) {
      const { token, user, kycStatus } = res.data;
      localStorage.setItem('ci_investor_token', token);
      setToken(token);
      setUser(user);
      setKycStatus(kycStatus || 'NOT_STARTED');
      return res;
    }
    throw new Error(res.message || 'Registration failed.');
  };

  const logout = () => {
    localStorage.removeItem('ci_investor_token');
    setToken(null);
    setUser(null);
    setKycStatus('NOT_STARTED');
  };

  const refreshMe = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setKycStatus(res.data.kycStatus || 'NOT_STARTED');
      }
    } catch (err) {
      console.warn('[Auth] Refresh profile error:', err.message);
    }
  };

  const updateKYCStatus = (newStatus) => {
    setKycStatus(newStatus);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        kycStatus,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshMe,
        updateKYCStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
