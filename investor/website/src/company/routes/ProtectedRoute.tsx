import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading, company, user } = useAuth();

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

  // Intercept company users whose account is suspended or revoked
  const isSuspended =
    company?.accountStatus === 'Suspended' ||
    company?.accountStatus === 'Revoked' ||
    user?.accountStatus === 'Suspended' ||
    user?.accountStatus === 'Revoked';
  if (isSuspended) {
    return <Navigate to="/company/account-suspended" replace />;
  }

  // Intercept company users whose registration is not approved yet
  const status = company?.registrationStatus || user?.registrationStatus || 'Pending Approval';
  if (status !== 'Approved') {
    return <Navigate to="/company/approval-status" replace />;
  }

  return <>{children}</>;
};

