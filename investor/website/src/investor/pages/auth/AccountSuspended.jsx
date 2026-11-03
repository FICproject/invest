import React from 'react';
import { ShieldAlert, AlertTriangle, Mail, Phone, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AccountSuspended = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isRevoked = user?.accountStatus === 'Revoked';
  const reason = user?.accountSuspendedReason || user?.rejectionReason || 'Account suspended pending administrative compliance review.';
  const suspendedDate = user?.accountSuspendedAt ? new Date(user.accountSuspendedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : null;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0B0F19',
      color: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: '#151C2C',
        border: `1px solid ${isRevoked ? '#EF4444' : '#F59E0B'}`,
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        textAlign: 'center'
      }}>
        {/* Header Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: isRevoked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          {isRevoked ? (
            <ShieldAlert size={38} color="#EF4444" />
          ) : (
            <AlertTriangle size={38} color="#F59E0B" />
          )}
        </div>

        {/* Status Badge */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: isRevoked ? '#EF4444' : '#F59E0B',
            color: '#FFFFFF'
          }}>
            Account {user?.accountStatus || 'Suspended'}
          </span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#FFFFFF' }}>
          {isRevoked ? 'Account Access Revoked' : 'Account Temporarily Suspended'}
        </h1>
        <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px', lineHeight: 1.5 }}>
          Your investor account on Connect Invest has been {user?.accountStatus ? user.accountStatus.toLowerCase() : 'suspended'} by Platform Administration.
        </p>

        {/* Reason Box */}
        <div style={{
          backgroundColor: '#0B0F19',
          border: '1px solid #1E293B',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'left',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Administrative Reason
          </div>
          <div style={{ fontSize: '14px', color: '#E2E8F0', lineHeight: 1.5 }}>
            "{reason}"
          </div>
          {suspendedDate && (
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '10px' }}>
              Action recorded on: {suspendedDate}
            </div>
          )}
        </div>

        {/* Grievance & Support Info */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '28px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#93C5FD', marginBottom: '4px' }}>
            Have questions or believe this is an error?
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
            You can reach our compliance team to appeal this decision or provide required clarifications.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '12px' }}>
            <a href="mailto:compliance@connectinvest.in" style={{ color: '#60A5FA', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> compliance@connectinvest.in
            </a>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} /> +91 1800 572 8899
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/investor-home')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              border: '1px solid #334155',
              color: '#94A3B8',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Home
          </button>
          <button
            onClick={logout}
            style={{
              padding: '10px 24px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSuspended;

