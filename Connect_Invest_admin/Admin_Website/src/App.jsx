import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkList from './pages/WorkList';
import Investors from './pages/Investors';
import Companies from './pages/Companies';
import Offers from './pages/Offers';
import InvestmentsPortfolio from './pages/InvestmentsPortfolio';
import Transactions from './pages/Transactions';
import Releases from './pages/Releases';
import Repayments from './pages/Repayments';
import Payouts from './pages/Payouts';
import Queries from './pages/Queries';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Settings';
import RegistrationApprovals from './pages/RegistrationApprovals';
import FundApprovals from './pages/FundApprovals';
import InvestmentApprovals from './pages/InvestmentApprovals';
import MaturityReleases from './pages/MaturityReleases';

import { adminApi } from './services/api';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingCounts, setPendingCounts] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleAutoCollapse = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1200) {
        setSidebarCollapsed(true);
      }
    };
    if (typeof window !== 'undefined' && window.innerWidth < 1200) {
      setSidebarCollapsed(true);
    }
    window.addEventListener('resize', handleAutoCollapse);
    return () => window.removeEventListener('resize', handleAutoCollapse);
  }, []);

  const fetchGlobalStats = async () => {
    if (!isAuthenticated) return;
    try {
      setRefreshing(true);
      const res = await adminApi.getDashboard();
      if (res.data.success) {
        const s = res.data.stats;
        setPendingCounts({
          total: s.pendingApprovals?.total || 0,
          kyc: s.pendingApprovals?.kyc || 0,
          kyb: s.pendingApprovals?.kyb || 0,
          offers: s.pendingApprovals?.offers || 0,
          fundingRequests: s.pendingApprovals?.fundingRequests || 0,
          investorRequests: s.pendingApprovals?.investorRequests || 0,
          releases: s.pendingApprovals?.releases || 0,
          overdue: s.overdueRepaymentsCount || 0,
          readyPayouts: s.upcomingPayoutsCount || 0
        });
      }
    } catch (err) {
      console.warn('Dashboard stats refresh error:', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, [isAuthenticated, activeTab]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        color: 'var(--text-muted)'
      }}>
        Initializing Forge India Connect Admin Console...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const titles = {
    dashboard: { title: 'Dashboard', subtitle: "Welcome back! Here's your platform overview." },
    approvals: { title: 'Registration Approvals', subtitle: 'Compliance review, document inspection, and activation for newly registered users' },
    fund_approvals: { title: 'Fund Approvals', subtitle: 'Underwriting evaluation, compliance review, and decision workflow for company capital raising proposals' },
    investment_approvals: { title: 'Investment Approvals', subtitle: 'Review, approve, reject, or request resubmission on investor investment applications' },
    worklist: { title: 'KYC Management', subtitle: 'Centralized queue of all pending investor verifications and approvals' },
    investors: { title: 'Investor Management', subtitle: 'Identity checks, NSDL PAN verification, and investor profiles' },
    companies: { title: 'Company Management', subtitle: 'Corporate onboarding, 7-day invite links, and cooling-off timers' },
    offers: { title: 'Investment Management', subtitle: 'Investment proposals, term sheets, tenure enforcement, and activation' },
    investments_portfolio: { title: 'Investments Portfolio', subtitle: 'Capital deployed, company breakdown, returns, and maturities' },
    transactions: { title: 'Transactions Ledger', subtitle: 'Comprehensive audit log of all platform financial movements' },
    releases: { title: 'Company Fund Releases', subtitle: 'Disburse and route capital collected from investors directly to borrower company verified bank accounts' },
    repayments: { title: 'Repayments & Dues', subtitle: 'Track collections, confirm receipts, and manage defaults' },
    payouts: { title: 'Returns & Payouts', subtitle: 'Compile, preview, and dispatch return distributions' },
    maturity_releases: { title: 'Maturity Releases', subtitle: 'Disburse and return principal capital to investors upon completion of investment tenure (12+ Months)' },
    subscriptions: { title: 'Subscriptions & Billing', subtitle: 'Manage ₹500 monthly platform access fees for investors and companies' },
    queries: { title: 'Queries & Support', subtitle: 'Manage inbound payment issues, support requests, and resolutions from investors and companies' },
    settings: { title: 'Settings', subtitle: 'Manage administrator login ID, email address, and security password' }
  };

  const currentMeta = titles[activeTab] || { title: 'Forge India Admin', subtitle: '' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCounts={pendingCounts}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          currentMeta={currentMeta}
          activeTab={activeTab}
          onRefresh={fetchGlobalStats}
          refreshing={refreshing}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'approvals' && <RegistrationApprovals />}
          {activeTab === 'fund_approvals' && <FundApprovals />}
          {activeTab === 'investment_approvals' && <InvestmentApprovals />}
          {activeTab === 'worklist' && <WorkList setActiveTab={setActiveTab} />}
          {activeTab === 'investors' && <Investors />}
          {activeTab === 'companies' && <Companies />}
          {activeTab === 'offers' && <Offers />}
          {activeTab === 'investments_portfolio' && <InvestmentsPortfolio />}
          {activeTab === 'transactions' && <Transactions />}
          {activeTab === 'releases' && <Releases />}
          {activeTab === 'subscriptions' && <Subscriptions />}
          {activeTab === 'repayments' && <Repayments />}
          {activeTab === 'payouts' && <Payouts />}
          {activeTab === 'maturity_releases' && <MaturityReleases />}
          {activeTab === 'queries' && <Queries />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
