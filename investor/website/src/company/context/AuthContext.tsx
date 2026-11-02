import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Company } from '../types';
import { authService } from '../services';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User, company: Company) => void;
  logout: () => void;
  refreshCompany: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('company_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [company, setCompany] = useState<Company | null>(() => {
    const saved = localStorage.getItem('company_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('company_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshCompany = async () => {
    try {
      if (token) {
        const data = await authService.getMe();
        if (data.user) setUser(data.user);
        if (data.company) {
          setCompany(data.company);
          localStorage.setItem('company_profile', JSON.stringify(data.company));
        }
      }
    } catch (e) {
      console.error('Failed to refresh company session', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (token) {
        await refreshCompany();
      }
      setIsLoading(false);
    };
    init();
  }, [token]);

  const login = (newToken: string, newUser: User, newCompany: Company) => {
    setToken(newToken);
    setUser(newUser);
    setCompany(newCompany);
    localStorage.setItem('company_token', newToken);
    localStorage.setItem('company_user', JSON.stringify(newUser));
    localStorage.setItem('company_profile', JSON.stringify(newCompany));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCompany(null);
    localStorage.removeItem('company_token');
    localStorage.removeItem('company_user');
    localStorage.removeItem('company_profile');
    window.location.href = '/company/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        token,
        isLoading,
        login,
        logout,
        refreshCompany,
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

