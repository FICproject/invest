import React from 'react';
import { Wifi, WifiOff, Sun, Moon, Laptop, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const SystemAdaptabilityBar = () => {
  const {
    isOnline,
    showNetworkNotice,
    dismissNetworkNotice
  } = useTheme();

  if (!showNetworkNotice) return null;

  return (
    /* Network Offline / Online Alert Toast */
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '10px',
        backgroundColor: isOnline ? '#065F46' : '#991B1B',
        color: '#FFFFFF',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        fontSize: '13px',
        fontWeight: '600',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
      <span>
        {isOnline
          ? 'Internet connection restored. Live synced with Connect Invest backend.'
          : 'Network offline. You are currently viewing cached data.'}
      </span>
      <button
        onClick={dismissNetworkNotice}
        style={{
          background: 'none',
          border: 'none',
          color: '#FFFFFF',
          cursor: 'pointer',
          marginLeft: '8px',
          display: 'flex'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
