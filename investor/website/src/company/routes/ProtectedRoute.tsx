import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8FA]">
        <Loader text="Authenticating corporate session..." />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/company/login" replace />;
  }

  return <>{children}</>;
};

