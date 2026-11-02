import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider as CompanyAuthProvider } from './company/context/AuthContext';
import { AuthProvider as InvestorAuthProvider } from './investor/context/AuthContext';
import { ThemeProvider as InvestorThemeProvider } from './investor/context/ThemeContext';

// Protected Route wrappers
import { ProtectedRoute as CompanyProtectedRoute } from './company/routes/ProtectedRoute';
import { ProtectedRoute as InvestorProtectedRoute } from './investor/routes/ProtectedRoute';

// Common Landing Page
import { CommonLandingPage } from './investor/pages/public/CommonLandingPage';

// Investor Pages
import { Home as InvestorHome } from './investor/pages/public/Home';
import { Opportunities as InvestorOpportunities } from './investor/pages/public/Opportunities';
import { InvestmentDetails } from './investor/pages/public/InvestmentDetails';
import { HowItWorks as InvestorHowItWorks } from './investor/pages/public/HowItWorks';
import { About as InvestorAbout } from './investor/pages/public/About';
import { FAQs as InvestorFAQs } from './investor/pages/public/FAQs';
import { Contact as InvestorContact } from './investor/pages/public/Contact';

import { Login as InvestorLogin } from './investor/pages/auth/Login';
import { Register as InvestorRegister } from './investor/pages/auth/Register';
import { VerifyOTP as InvestorVerifyOTP } from './investor/pages/auth/VerifyOTP';
import { ForgotPassword as InvestorForgotPassword } from './investor/pages/auth/ForgotPassword';

import { Dashboard as InvestorDashboard } from './investor/pages/investor/Dashboard';
import { MyInvestments } from './investor/pages/investor/MyInvestments';
import { ReturnsPayouts } from './investor/pages/investor/ReturnsPayouts';
import { Transactions as InvestorTransactions } from './investor/pages/investor/Transactions';
import { KYCVerification } from './investor/pages/investor/KYCVerification';
import { Profile as InvestorProfile } from './investor/pages/investor/Profile';
import { BankDetails } from './investor/pages/investor/BankDetails';
import { Notifications as InvestorNotifications } from './investor/pages/investor/Notifications';
import { Statements } from './investor/pages/investor/Statements';
import { Support } from './investor/pages/investor/Support';

// Company Pages & Layout
import { DashboardLayout as CompanyDashboardLayout } from './company/components/layout/DashboardLayout';
import { CompanyLandingPage } from './company/pages/landing/CompanyLandingPage';
import { AboutUsPage as CompanyAboutUsPage } from './company/pages/public/AboutUsPage';
import { FundingOpportunitiesPage as CompanyFundingOpportunitiesPage } from './company/pages/public/FundingOpportunitiesPage';
import { HowItWorksPage as CompanyHowItWorksPage } from './company/pages/public/HowItWorksPage';
import { BenefitsPage as CompanyBenefitsPage } from './company/pages/public/BenefitsPage';
import { FaqPage as CompanyFaqPage } from './company/pages/public/FaqPage';

import { CompanyLogin } from './company/pages/auth/CompanyLogin';
import { CompanyRegister } from './company/pages/auth/CompanyRegister';
import { ForgotPassword as CompanyForgotPassword } from './company/pages/auth/ForgotPassword';
import { ResetPassword as CompanyResetPassword } from './company/pages/auth/ResetPassword';

import { DashboardHome as CompanyDashboardHome } from './company/pages/Dashboard/DashboardHome';
import { CompanyDetails } from './company/pages/CompanyProfile/CompanyDetails';
import { RequestList } from './company/pages/InvestmentRequests/RequestList';
import { CreateRequest } from './company/pages/InvestmentRequests/CreateRequest';
import { RequestDetails } from './company/pages/InvestmentRequests/RequestDetails';
import { Opportunities as CompanyOpportunities } from './company/pages/InvestmentManagement/Opportunities';
import { ShareholderList } from './company/pages/ShareholderManagement/ShareholderList';
import { FinancialReports } from './company/pages/FinancialReports/FinancialReports';
import { FixedTermReturns } from './company/pages/ReturnsAndDividends/FixedTermReturns';
import { TransactionList as CompanyTransactionList } from './company/pages/Transactions/TransactionList';
import { DocumentManagement } from './company/pages/Documents/DocumentManagement';
import { Notifications as CompanyNotifications } from './company/pages/Notifications/Notifications';
import { Settings as CompanySettings } from './company/pages/Settings/Settings';

export default function App() {
  return (
    <CompanyAuthProvider>
      <InvestorAuthProvider>
        <InvestorThemeProvider>
          <Routes>
            {/* Common Unified Landing Page */}
            <Route path="/" element={<CommonLandingPage />} />

            {/* ======================================================== */}
            {/* INVESTOR ROUTES                                           */}
            {/* ======================================================== */}
            <Route path="/investor" element={<InvestorHome />} />
            <Route path="/investor-home" element={<InvestorHome />} />
            <Route path="/opportunities" element={<InvestorOpportunities />} />
            <Route path="/opportunities/:id" element={<InvestmentDetails />} />
            <Route path="/how-it-works" element={<InvestorHowItWorks />} />
            <Route path="/about" element={<InvestorAbout />} />
            <Route path="/faqs" element={<InvestorFAQs />} />
            <Route path="/contact" element={<InvestorContact />} />

            <Route path="/login" element={<InvestorLogin />} />
            <Route path="/register" element={<InvestorRegister />} />
            <Route path="/verify-otp" element={<InvestorVerifyOTP />} />
            <Route path="/forgot-password" element={<InvestorForgotPassword />} />

            {/* Investor Protected Pages */}
            <Route
              path="/investor/dashboard"
              element={
                <InvestorProtectedRoute>
                  <InvestorDashboard />
                </InvestorProtectedRoute>
              }
            />
            <Route
              path="/investor/my-investments"
              element={
                <InvestorProtectedRoute>
                  <MyInvestments />
                </InvestorProtectedRoute>
              }
            />
            <Route
              path="/investor/returns-payouts"
              element={
                <InvestorProtectedRoute>
                  <ReturnsPayouts />
                </InvestorProtectedRoute>
              }
            />
            <Route
              path="/investor/transactions"
              element={
                <InvestorProtectedRoute>
                  <InvestorTransactions />
                </InvestorProtectedRoute>
              }
            />
            <Route
              path="/investor/kyc"
              element={
                <InvestorProtectedRoute>
                  <KYCVerification />
                </InvestorProtectedRoute>
              }
            />
            <Route
              path="/investor/profile"
              element={
                <InvestorProtectedRoute>
                  <InvestorProfile />
                </InvestorProtectedRoute>
              }
            />
            <Route
              path="/investor/bank-details"
              element={
                <InvestorProtectedRoute>
                  <BankDetails />
                </InvestorProtectedRoute>
              }
            />
            <Route
              path="/investor/notifications"
              element={
                <InvestorProtectedRoute>
                  <InvestorNotifications />
                </InvestorProtectedRoute>
              }
            />
            <Route
              path="/investor/statements"
              element={
                <InvestorProtectedRoute>
                  <Statements />
                </InvestorProtectedRoute>
              }
            />
            <Route
              path="/investor/support"
              element={
                <InvestorProtectedRoute>
                  <Support />
                </InvestorProtectedRoute>
              }
            />

            {/* ======================================================== */}
            {/* COMPANY ROUTES                                            */}
            {/* ======================================================== */}
            <Route path="/company" element={<CompanyLandingPage />} />
            <Route path="/company/about" element={<CompanyAboutUsPage />} />
            <Route path="/company/opportunities" element={<CompanyFundingOpportunitiesPage />} />
            <Route path="/company/how-it-works" element={<CompanyHowItWorksPage />} />
            <Route path="/company/benefits" element={<CompanyBenefitsPage />} />
            <Route path="/company/faq" element={<CompanyFaqPage />} />
            <Route path="/company/login" element={<Navigate to="/login?role=company" replace />} />
            <Route path="/company/register" element={<Navigate to="/register?role=company" replace />} />
            <Route path="/company/forgot-password" element={<CompanyForgotPassword />} />
            <Route path="/company/reset-password" element={<CompanyResetPassword />} />

            {/* Company Protected Dashboard */}
            <Route
              path="/dashboard"
              element={
                <CompanyProtectedRoute>
                  <CompanyDashboardLayout />
                </CompanyProtectedRoute>
              }
            >
              <Route index element={<CompanyDashboardHome />} />
              <Route path="profile" element={<CompanyDetails />} />
              <Route path="requests" element={<RequestList />} />
              <Route path="requests/create" element={<CreateRequest />} />
              <Route path="requests/:id" element={<RequestDetails />} />
              <Route path="investments" element={<CompanyOpportunities />} />
              <Route path="shareholders" element={<ShareholderList />} />
              <Route path="financials" element={<FinancialReports />} />
              <Route path="returns" element={<FixedTermReturns />} />
              <Route path="transactions" element={<CompanyTransactionList />} />
              <Route path="documents" element={<DocumentManagement />} />
              <Route path="notifications" element={<CompanyNotifications />} />
              <Route path="settings" element={<CompanySettings />} />
            </Route>

            {/* Also alias /company/dashboard to /dashboard */}
            <Route path="/company/dashboard/*" element={<Navigate to="/dashboard" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </InvestorThemeProvider>
      </InvestorAuthProvider>
    </CompanyAuthProvider>
  );
}
