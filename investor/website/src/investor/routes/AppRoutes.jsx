import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { CommonLandingPage } from '../pages/public/CommonLandingPage';
import { Home } from '../pages/public/Home';
import { Opportunities } from '../pages/public/Opportunities';
import { InvestmentDetails } from '../pages/public/InvestmentDetails';
import { HowItWorks } from '../pages/public/HowItWorks';
import { About } from '../pages/public/About';
import { FAQs } from '../pages/public/FAQs';
import { Contact } from '../pages/public/Contact';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { VerifyOTP } from '../pages/auth/VerifyOTP';
import { ForgotPassword } from '../pages/auth/ForgotPassword';

// Investor Protected Pages
import { Dashboard } from '../pages/investor/Dashboard';
import { MyInvestments } from '../pages/investor/MyInvestments';
import { ReturnsPayouts } from '../pages/investor/ReturnsPayouts';
import { Transactions } from '../pages/investor/Transactions';
import { KYCVerification } from '../pages/investor/KYCVerification';
import { Profile } from '../pages/investor/Profile';
import { BankDetails } from '../pages/investor/BankDetails';
import { Notifications } from '../pages/investor/Notifications';
import { Statements } from '../pages/investor/Statements';
import { Support } from '../pages/investor/Support';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<CommonLandingPage />} />
      <Route path="/investor" element={<Home />} />
      <Route path="/investor-home" element={<Home />} />
      <Route path="/opportunities" element={<Opportunities />} />
      <Route path="/opportunities/:id" element={<InvestmentDetails />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/about" element={<About />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Investor Protected Pages */}
      <Route
        path="/investor/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/my-investments"
        element={
          <ProtectedRoute>
            <MyInvestments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/returns-payouts"
        element={
          <ProtectedRoute>
            <ReturnsPayouts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/kyc"
        element={
          <ProtectedRoute>
            <KYCVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/bank-details"
        element={
          <ProtectedRoute>
            <BankDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/statements"
        element={
          <ProtectedRoute>
            <Statements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor"
        element={
          <ProtectedRoute>
            <Navigate to="/investor/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investor/support"
        element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
