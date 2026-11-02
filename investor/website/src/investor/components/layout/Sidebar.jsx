import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  CreditCard,
  FileText,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/investor/dashboard', icon: LayoutDashboard },
    { name: 'My Investments', path: '/investor/my-investments', icon: Briefcase },
    { name: 'Portfolio & Returns', path: '/investor/returns-payouts', icon: TrendingUp },
    { name: 'Transactions & Payments', path: '/investor/transactions', icon: CreditCard },
    { name: 'Statements & Report', path: '/investor/statements', icon: FileText },
    { name: 'Notifications', path: '/investor/notifications', icon: Bell, badgeCount: 3 },
    { name: 'Help & Support', path: '/investor/support', icon: HelpCircle },
    { name: 'Profile & Settings', path: '/investor/profile', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1100,
            backdropFilter: 'blur(3px)'
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1200,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          overflowY: 'auto'
        }}
        className={`sidebar-aside ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Sidebar Header / Logo */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'contain',
                display: 'block',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '19px',
                  fontWeight: '800',
                  color: '#FFFFFF'
                }}
              >
                Connect <span style={{ color: 'var(--color-gold)' }}>Invest</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'none'
            }}
            className="sidebar-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = item.path === '/investor/profile'
              ? (location.pathname === '/investor/profile' || location.pathname === '/investor/bank-details')
              : (location.pathname === item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024 && onClose) onClose();
                }}
                className={`sidebar-nav-item ${isSelected ? 'sidebar-nav-item-active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.72)',
                  backgroundColor: isSelected ? '#200307' : 'transparent',
                  border: isSelected ? '1.5px solid #D4AF37' : '1.5px solid transparent',
                  boxShadow: isSelected ? 'inset 0 1px 3px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)' : 'none',
                  transition: 'all 0.18s ease',
                  textDecoration: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} color={isSelected ? '#D4AF37' : 'rgba(255,255,255,0.85)'} />
                  <span style={{ color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.78)' }}>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: item.badgeColor,
                      color: '#FFFFFF'
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {item.badgeCount && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Bottom Action */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.75)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar-nav-item-active {
          background-color: #200307 !important;
          border: 1.5px solid #D4AF37 !important;
          border-radius: 8px !important;
          color: #FFFFFF !important;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25) !important;
        }
        .sidebar-nav-item-active svg {
          color: #D4AF37 !important;
        }
        .sidebar-nav-item-active span {
          color: #FFFFFF !important;
          font-weight: 700 !important;
        }
        .sidebar-nav-item:hover:not(.sidebar-nav-item-active) {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #FFFFFF !important;
        }

        @media (max-width: 1023px) {
          .sidebar-aside {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
          .sidebar-close-btn {
            display: flex !important;
          }
        }
        @media (min-width: 1024px) {
          .sidebar-backdrop {
            display: none !important;
          }
          .sidebar-aside {
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
};
