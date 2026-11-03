import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Account verification OTP has been decommissioned.
 * Direct immediate transition to compliance Approval Status.
 */
export const VerifyOTP = () => {
  return <Navigate to="/approval-status" replace />;
};

export default VerifyOTP;
