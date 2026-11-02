import React from 'react';
import { Bell, User, RefreshCw, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ currentMeta, activeTab, onRefresh, refreshing }) {
  const { user } = useAuth();

  return (
    <header style={{
      padding: '12px 32px',
      borderBottom: '1px solid var(--border-light)',
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      {/* Left: Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8' }}>
          Portal
        </span>
        <ChevronRight size={14} color="#CBD5E1" />
        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>
          {currentMeta?.title || 'Dashboard'}
        </span>
      </div>

      {/* Right Controls matching Image */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Bell Notification Button with Red Badge (3) */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            width: '40px',
            height: '40px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#0047BA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <User size={20} />
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              System Administrator
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
