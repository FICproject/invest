import React from 'react';
import {
  LayoutGrid,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Wallet,
  MessageSquare,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  PieChart
} from 'lucide-react';
import { ForgeIndiaBrandHeader } from '../assets/ForgeIndiaLogo';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, pendingCounts = {} }) {
  const { logout, user } = useAuth();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'approvals', label: 'Registration Approvals', icon: ShieldCheck, badgeCount: pendingCounts?.total || 0 },
    { id: 'investors', label: 'Investor Management', icon: Users },
    { id: 'companies', label: 'Company Management', icon: Building2 },
    { id: 'offers', label: 'Investment Management', icon: Briefcase },
    { id: 'kyc', label: 'KYC Management', icon: ShieldCheck },
    { id: 'investments_portfolio', label: 'Investments', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'releases', label: 'Payments & Transactions', icon: CreditCard },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'payouts', label: 'Returns & Payouts', icon: Wallet },
    { id: 'queries', label: 'Queries & Support', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <aside style={{
      width: '270px',
      minWidth: '270px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <ForgeIndiaBrandHeader size={42} />
      </div>

      {/* Navigation List */}
      <nav style={{
        flex: 1,
        padding: '16px 14px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'kyc' && activeTab === 'worklist');

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id === 'kyc' ? 'worklist' : item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                borderRadius: '12px',
                background: isActive ? '#0047BA' : 'transparent',
                color: isActive ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon
                  size={19}
                  color={isActive ? '#FFFFFF' : '#64748B'}
                  strokeWidth={isActive ? 2.3 : 1.9}
                />
                <span>{item.label}</span>
              </div>

              {item.badgeCount > 0 && (
                <span style={{
                  background: isActive ? '#FFFFFF' : '#0047BA',
                  color: isActive ? '#0047BA' : '#FFFFFF',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  lineHeight: 1.2
                }}>
                  {item.badgeCount}
                </span>
              )}

              {item.id === 'notifications' && (
                <span style={{
                  background: '#FAB800',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  lineHeight: 1.2
                }}>
                  3
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Sign Out Option */}
      <div style={{
        padding: '16px 14px',
        borderTop: '1px solid var(--border-light)',
        marginTop: 'auto'
      }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid #FEE2E2',
            background: '#FEF2F2',
            color: '#DC2626',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#FEE2E2';
            e.currentTarget.style.borderColor = '#FCA5A5';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#FEF2F2';
            e.currentTarget.style.borderColor = '#FEE2E2';
          }}
          title="Sign out of Admin Portal"
        >
          <LogOut size={18} color="#DC2626" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
