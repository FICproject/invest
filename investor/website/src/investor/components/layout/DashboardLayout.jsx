import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, User, ShieldCheck } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { SystemAdaptabilityBar } from '../common/SystemAdaptabilityBar';

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, kycStatus } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/opportunities?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Wrapper */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.3s ease'
        }}
        className="dashboard-main-content"
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
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 900
          }}
        >
          {/* Left: Mobile Toggle & Global Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '480px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'none',
                padding: '6px'
              }}
              className="topbar-hamburger"
              aria-label="Open sidebar menu"
            >
              <Menu size={24} />
            </button>

            <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
              <Search
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search investments, companies, projects..."
                style={{
                  width: '100%',
                  height: '40px',
                  paddingLeft: '38px',
                  paddingRight: '14px',
                  fontSize: '13.5px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </form>
          </div>

          {/* Right: Notifications & Investor Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
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
        <main style={{ flex: 1, padding: '24px 28px' }} className="dashboard-content-container">
          {children}
        </main>
      </div>

      {/* System Adaptability Floating Controls */}
      <SystemAdaptabilityBar />

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-main-content {
            margin-left: var(--sidebar-width);
          }
        }
        @media (max-width: 1023px) {
          .topbar-hamburger {
            display: flex !important;
          }
          .dashboard-content-container {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
