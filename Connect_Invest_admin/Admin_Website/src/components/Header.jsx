import React from 'react';
import { Bell, User, ChevronRight, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({
  currentMeta,
  activeTab,
  onRefresh,
  refreshing,
  sidebarCollapsed,
  onToggleSidebar
}) {
  const { user } = useAuth();

  return (
    <header style={{
      padding: '12px clamp(16px, 2vw, 32px)',
      borderBottom: '1px solid var(--border-light)',
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      gap: '12px'
    }}>
      {/* Left: Sidebar Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#F1F5F9',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle navigation sidebar"
          >
            <Menu size={18} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', whiteSpace: 'nowrap' }}>
            Portal
          </span>
          <ChevronRight size={14} color="#CBD5E1" style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#0F172A',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentMeta?.title || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 1.5vw, 20px)', flexShrink: 0 }}>
        {/* Bell Notification Button with Red Badge (3) */}
        <div style={{ position: 'relative', cursor: 'pointer' }} title="Notifications">
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1D4ED8'
          }}>
            <Bell size={18} />
          </div>
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#EF4444',
            color: '#FFFFFF',
            fontSize: '0.68rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #FFFFFF'
          }}>
            3
          </span>
        </div>

        {/* Admin Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#0047BA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <User size={19} />
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <div style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#0F172A',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
              System Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
