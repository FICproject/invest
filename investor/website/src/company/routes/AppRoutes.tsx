import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layout
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Landing & Auth Pages
import { CompanyLandingPage } from '../pages/landing/CompanyLandingPage';
import { AboutUsPage } from '../pages/public/AboutUsPage';
import { FundingOpportunitiesPage } from '../pages/public/FundingOpportunitiesPage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { BenefitsPage } from '../pages/public/BenefitsPage';
import { FaqPage } from '../pages/public/FaqPage';
import { CompanyLogin } from '../pages/auth/CompanyLogin';
import { CompanyRegister } from '../pages/auth/CompanyRegister';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

// Dashboard Pages
import { DashboardHome } from '../pages/Dashboard/DashboardHome';
import { CompanyDetails } from '../pages/CompanyProfile/CompanyDetails';
import { RequestList } from '../pages/InvestmentRequests/RequestList';
import { CreateRequest } from '../pages/InvestmentRequests/CreateRequest';
import { RequestDetails } from '../pages/InvestmentRequests/RequestDetails';
import { Opportunities } from '../pages/InvestmentManagement/Opportunities';
import { ShareholderList } from '../pages/ShareholderManagement/ShareholderList';
import { FinancialReports } from '../pages/FinancialReports/FinancialReports';
import { FixedTermReturns } from '../pages/ReturnsAndDividends/FixedTermReturns';
import { TransactionList } from '../pages/Transactions/TransactionList';
import { DocumentManagement } from '../pages/Documents/DocumentManagement';
import { Notifications } from '../pages/Notifications/Notifications';
import { Settings } from '../pages/Settings/Settings';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<CompanyLandingPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/opportunities" element={<FundingOpportunitiesPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/benefits" element={<BenefitsPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/login" element={<CompanyLogin />} />
      <Route path="/register" element={<CompanyRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Company Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<CompanyDetails />} />
        <Route path="requests" element={<RequestList />} />
        <Route path="requests/create" element={<CreateRequest />} />
        <Route path="requests/:id" element={<RequestDetails />} />
        <Route path="investments" element={<Opportunities />} />
        <Route path="shareholders" element={<ShareholderList />} />
        <Route path="financials" element={<FinancialReports />} />
        <Route path="returns" element={<FixedTermReturns />} />
        <Route path="transactions" element={<TransactionList />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

