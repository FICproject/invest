import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, User, ShieldCheck } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { SystemAdaptabilityBar } from '../common/SystemAdaptabilityBar';

const getTabMeta = (pathname) => {
  if (pathname === '/investor/dashboard' || pathname === '/investor/dashboard/') {
    return { title: 'Dashboard', subtitle: 'Overview, Portfolio Metrics & Highlights' };
  }
  if (pathname.startsWith('/investor/my-investments')) {
    return { title: 'My Investments', subtitle: 'Active commitments, performance & contracts' };
  }
  if (pathname.startsWith('/investor/returns-payouts')) {
    return { title: 'Portfolio & Returns', subtitle: 'Payout schedules, ROI & earnings summary' };
  }
  if (pathname.startsWith('/investor/transactions')) {
    return { title: 'Transactions & Payments', subtitle: 'Payment logs, disbursements & verified ledger' };
  }
  if (pathname.startsWith('/investor/statements')) {
    return { title: 'Statements & Reports', subtitle: 'Financial disclosures, tax notes & certificates' };
  }
  if (pathname.startsWith('/investor/notifications')) {
    return { title: 'Notifications', subtitle: 'System alerts, payout updates & notices' };
  }
  if (pathname.startsWith('/investor/support')) {
    return { title: 'Help & Support', subtitle: 'Investor assistance & ticket resolution' };
  }
  if (pathname.startsWith('/investor/profile')) {
    return { title: 'Profile & Settings', subtitle: 'Account preferences, security & personal details' };
  }
  if (pathname.startsWith('/investor/kyc')) {
    return { title: 'KYC Verification', subtitle: 'Identity credentials & regulatory compliance' };
  }
  if (pathname.startsWith('/investor/bank-details')) {
    return { title: 'Bank Accounts', subtitle: 'Linked settlement & payout accounts' };
  }
  if (pathname.startsWith('/opportunities') || pathname.startsWith('/investor/opportunities')) {
    return { title: 'Investment Opportunities', subtitle: 'Browse vetted high-yield corporate notes' };
  }
  return { title: 'Investor Portal', subtitle: 'Wealth Management Dashboard' };
};

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, kycStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tabMeta = getTabMeta(location.pathname);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsedDesktop={sidebarCollapsed}
      />

      {/* Main Wrapper */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.3s ease'
        }}
        className={`dashboard-main-content ${sidebarCollapsed ? 'sidebar-collapsed-content' : ''}`}
      >
        {/* Top Navbar */}
        <header
          style={{
            height: 'var(--topbar-height)',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 clamp(16px, 2vw, 24px)',
            position: 'sticky',
            top: 0,
            zIndex: 900,
            gap: '12px'
          }}
        >
          {/* Left: Mobile Toggle & Tab Title in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <button
              onClick={handleToggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '8px',
                flexShrink: 0
              }}
              className="topbar-hamburger"
              title={sidebarCollapsed ? "Expand sidebar" : "Toggle sidebar"}
              aria-label="Toggle sidebar menu"
            >
              <Menu size={22} />
            </button>

            <div style={{ minWidth: 0 }}>
              <h1 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {tabMeta.title}
              </h1>
              {tabMeta.subtitle && (
                <p style={{
                  margin: '2px 0 0',
                  fontSize: '11.5px',
                  color: 'var(--text-muted)',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {tabMeta.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Notifications & Investor Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexShrink: 0 }}>
            {/* Notification Bell */}
            <button
              onClick={() => navigate('/investor/notifications')}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex'
              }}
              title="Notifications"
            >
              <Bell size={20} />
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#EF4444',
                  borderRadius: '50%',
                  border: '1.5px solid var(--bg-surface)'
                }}
              />
            </button>

            {/* Investor Profile Pill */}
            <div
              onClick={() => navigate('/investor/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 12px 4px 6px',
                borderRadius: '30px',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '13px'
                }}
              >
                {user ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {user ? user.name : 'Investor'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Investor
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="dashboard-content-container">
          {children}
        </main>
      </div>

      {/* System Adaptability Floating Controls */}
      <SystemAdaptabilityBar />

      <style>{`
        .dashboard-content-container {
          flex: 1;
          width: 100%;
          max-width: min(100%, 1920px);
          margin: 0 auto;
          padding: clamp(16px, 2vw, 28px);
          box-sizing: border-box;
          min-width: 0;
        }

        @media (min-width: 1024px) {
          .dashboard-main-content {
            margin-left: var(--sidebar-width);
          }
          .dashboard-main-content.sidebar-collapsed-content {
            margin-left: 0 !important;
          }
        }
        @media (max-width: 1023px) {
          .dashboard-content-container {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
