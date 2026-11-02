import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import storage from '../utils/storage';
import authService from '../services/authService';
import { kycService } from '../services/notificationService';
import { User, KycStatus } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  kycStatus: KycStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string; otpCode?: string }>;
  register: (data: { name: string; email: string; mobile: string; password: string }) => Promise<{ success: boolean; message: string; otpCode?: string }>;
  registerCompany: (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    companyLegalName: string;
    companyType?: string;
    industry: string;
    pan: string;
    cin?: string;
    city?: string;
    state?: string;
    pincode?: string;
    description?: string;
  }) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (payload: { email?: string; mobile?: string; otp: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshKycStatus: () => Promise<void>;
  setKycStatusDirectly: (status: KycStatus) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatus>('NOT_STARTED');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on app start
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedToken = await storage.getToken();
        const savedUser = await storage.getUser<User>();

        if (savedToken) {
          setToken(savedToken);
          if (savedUser) setUser(savedUser);

          // Validate token with /api/auth/me
          try {
            const res = await authService.getMe();
            if (res.success && res.data) {
              setUser(res.data.user);
              setKycStatus(res.data.kycStatus || 'NOT_STARTED');
              await storage.setUser(res.data.user);
            }
          } catch (e) {
            // Token might be expired
            console.log('Session validation failed, logging out');
            await storage.clearAll();
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error during auth bootstrap', err);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await authService.login(identifier, password);
    if (res.success && res.data) {
      await storage.setToken(res.data.token);
      await storage.setUser(res.data.user);
      setToken(res.data.token);
      setUser(res.data.user);
      setKycStatus(res.data.kycStatus || 'NOT_STARTED');
      return { success: true, message: res.message, otpCode: res.data.otpCode };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (data: { name: string; email: string; mobile: string; password: string }) => {
    const res = await authService.register(data);
    if (res.success && res.data) {
      await storage.setToken(res.data.token);
      await storage.setUser(res.data.user);
      setToken(res.data.token);
      setUser(res.data.user);
      setKycStatus(res.data.kycStatus || 'NOT_STARTED');
      return { success: true, message: res.message, otpCode: res.data.otpCode };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const registerCompany = async (data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    companyLegalName: string;
    companyType?: string;
    industry: string;
    pan: string;
    cin?: string;
    city?: string;
    state?: string;
    pincode?: string;
    description?: string;
  }) => {
    const res = await authService.registerCompany(data);
    if (res.success && res.token) {
      await storage.setToken(res.token);
      if (res.user) {
        await storage.setUser(res.user);
        setUser(res.user);
      }
      setToken(res.token);
      return { success: true, message: res.message || 'Company registered successfully' };
    }
    return { success: false, message: res.message || 'Company registration failed' };
  };

  const verifyOtp = async (payload: { email?: string; mobile?: string; otp: string }) => {
    const res = await authService.verifyOTP(payload);
    if (res.success && res.data) {
      await storage.setToken(res.data.token);
      await storage.setUser(res.data.user);
      setToken(res.data.token);
      setUser(res.data.user);
      setKycStatus(res.data.kycStatus || 'NOT_STARTED');
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Verification failed' };
  };

  const logout = async () => {
    await storage.clearAll();
    setToken(null);
    setUser(null);
    setKycStatus('NOT_STARTED');
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setKycStatus(res.data.kycStatus || 'NOT_STARTED');
        await storage.setUser(res.data.user);
      }
    } catch (e) {
      console.error('Failed to refresh user data', e);
    }
  };

  const refreshKycStatus = async () => {
    try {
      const res = await kycService.getKycStatus();
      if (res.success && res.data) {
        setKycStatus(res.data.status);
      }
    } catch (e) {
      console.error('Failed to refresh KYC', e);
    }
  };

  const setKycStatusDirectly = (status: KycStatus) => {
    setKycStatus(status);
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
        registerCompany,
        verifyOtp,
        logout,
        refreshUser,
        refreshKycStatus,
        setKycStatusDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
