import React from 'react';
import logoImg from './forge-india-logo.jpg';

/**
 * Forge India Connect Logo Image Component
 * Uses the exact official image uploaded by the user.
 */
export function ForgeIndiaLogoCircle({ size = 120, className = '' }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)'
    }} className={className}>
      <img
        src={logoImg}
        alt="Forge India Connect"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}

/**
 * Sidebar Brand Header with the exact user uploaded logo
 */
export function ForgeIndiaBrandHeader({ size = 42, collapsed = false }) {
  if (collapsed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} title="Forge India Connect Admin">
        <img
          src={logoImg}
          alt="Forge India Connect"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '10px',
            objectFit: 'cover',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            flexShrink: 0
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img
        src={logoImg}
        alt="Forge India Connect"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '10px',
          objectFit: 'cover',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          flexShrink: 0
        }}
      />

      <div style={{ lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0047BA', letterSpacing: '0.02em' }}>
            FORGE
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FAB800', letterSpacing: '0.02em' }}>
            INDIA
          </span>
        </div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0047BA', letterSpacing: '0.2em', marginTop: '2px' }}>
          CONNECT
        </div>
      </div>
    </div>
  );
}

export default ForgeIndiaBrandHeader;
