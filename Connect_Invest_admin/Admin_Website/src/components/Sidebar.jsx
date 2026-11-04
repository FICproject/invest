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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ForgeIndiaBrandHeader } from '../assets/ForgeIndiaLogo';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  pendingCounts = {},
  isCollapsed = false,
  setIsCollapsed
}) {
  const { logout } = useAuth();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'approvals', label: 'Registration Approvals', icon: ShieldCheck, badgeCount: (pendingCounts?.kyc || 0) + (pendingCounts?.kyb || 0) || pendingCounts?.total || 0 },
    { id: 'investors', label: 'Investor Management', icon: Users },
    { id: 'companies', label: 'Company Management', icon: Building2 },
    { id: 'offers', label: 'Investment Management', icon: Briefcase, badgeCount: (pendingCounts?.fundingRequests || 0) + (pendingCounts?.offers || 0) },
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

  const sidebarWidth = isCollapsed ? '78px' : '260px';

  return (
    <aside
      className="admin-sidebar"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        overflow: 'hidden'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: isCollapsed ? '20px 10px' : '20px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          position: 'relative'
        }}
      >
        <ForgeIndiaBrandHeader size={isCollapsed ? 34 : 40} collapsed={isCollapsed} />

        {setIsCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              position: isCollapsed ? 'static' : 'relative',
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '8px',
              width: '28px',
              height: '28px',
              display: isCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'all 0.15s ease'
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav
        style={{
          flex: 1,
          padding: isCollapsed ? '16px 8px' : '16px 12px',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
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
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '11px 0' : '10px 14px',
                borderRadius: '12px',
                background: isActive ? '#0047BA' : 'transparent',
                color: isActive ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.86rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.15s ease',
                position: 'relative',
                width: '100%'
              }}
              title={item.label + (item.badgeCount > 0 ? ` (${item.badgeCount} pending)` : '')}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isCollapsed ? 0 : '12px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  minWidth: 0
                }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon
                    size={19}
                    color={isActive ? '#FFFFFF' : '#64748B'}
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />
                  {isCollapsed && item.badgeCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#FAB800' : '#0047BA',
                        border: '1.5px solid #FFFFFF'
                      }}
                    />
                  )}
                </div>

                {!isCollapsed && (
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </div>

              {!isCollapsed && item.badgeCount > 0 && (
                <span
                  style={{
                    background: isActive ? '#FFFFFF' : '#0047BA',
                    color: isActive ? '#0047BA' : '#FFFFFF',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    lineHeight: 1.2,
                    marginLeft: '6px'
                  }}
                >
                  {item.badgeCount}
                </span>
              )}

              {!isCollapsed && item.id === 'notifications' && (
                <span
                  style={{
                    background: '#FAB800',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    lineHeight: 1.2,
                    marginLeft: '6px'
                  }}
                >
                  3
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div
        style={{
          padding: isCollapsed ? '12px 8px' : '14px 12px',
          borderTop: '1px solid var(--border-light)',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {isCollapsed && setIsCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              background: '#F8FAFC',
              color: '#64748B',
              cursor: 'pointer'
            }}
            title="Expand Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: isCollapsed ? 0 : '12px',
            padding: isCollapsed ? '10px 0' : '11px 14px',
            borderRadius: '12px',
            border: '1px solid #FEE2E2',
            background: '#FEF2F2',
            color: '#DC2626',
            fontSize: '0.86rem',
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
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
