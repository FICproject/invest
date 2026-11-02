import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Save,
  Server,
  Database,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';

export default function Settings() {
  const { user, updateUser } = useAuth();

  // Profile / Login ID form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status feedback
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password to authorize changes.');
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setErrorMsg('New password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        currentPassword
      };
      if (newPassword) {
        payload.newPassword = newPassword;
      }

      const res = await adminApi.updateCredentials(payload);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Credentials updated successfully!');
        if (updateUser) {
          updateUser(res.data.user, res.data.token);
        }
        // Clear sensitive password inputs
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to update credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
          Admin Account & Security Settings
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.92rem' }}>
          Manage your administrator profile, change your login email ID, and update your security password.
        </p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '14px',
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#15803D',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <CheckCircle2 size={20} color="#16A34A" />
          <span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '14px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#B91C1C',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <AlertCircle size={20} color="#DC2626" />
          <span style={{ fontWeight: 600 }}>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '28px', alignItems: 'start' }}>
        {/* Main Settings Form */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '32px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Section 1: Administrator Identity */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={18} color="#2563EB" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Administrator Identity & Login ID
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    This email is used to sign into the Forge India Connect console.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Admin Display Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Master Administrator"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        borderRadius: '12px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.92rem',
                        outline: 'none',
                        color: '#0F172A',
                        background: '#FAFAFA'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                    />
                    <UserIcon size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Login Email ID (Username)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@connectinvest.com"
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        borderRadius: '12px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.92rem',
                        outline: 'none',
                        color: '#0F172A',
                        background: '#FAFAFA'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                    />
                    <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            {/* Section 2: Password Management */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#FDF2F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <KeyRound size={18} color="#DB2777" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Change Password
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Leave new password blank if you only want to change your name or login ID.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter at least 8 characters"
                      style={{
                        width: '100%',
                        padding: '11px 44px 11px 40px',
                        borderRadius: '12px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.92rem',
                        outline: 'none',
                        color: '#0F172A',
                        background: '#FAFAFA'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                    />
                    <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '10px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#64748B'
                      }}
                      title={showNewPass ? 'Hide password' : 'View password'}
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      style={{
                        width: '100%',
                        padding: '11px 44px 11px 40px',
                        borderRadius: '12px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.92rem',
                        outline: 'none',
                        color: '#0F172A',
                        background: '#FAFAFA'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                      onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                    />
                    <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '10px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#64748B'
                      }}
                      title={showConfirmPass ? 'Hide password' : 'View password'}
                    >
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F1F5F9' }} />

            {/* Section 3: Verification with Current Password */}
            <div style={{ background: '#F8FAFC', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Shield size={18} color="#D97706" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                  Authorize Modifications
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 0, marginBottom: '12px' }}>
                To save ID or password modifications, enter your current administrator password.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Current Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password to verify"
                    style={{
                      width: '100%',
                      padding: '11px 44px 11px 40px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      color: '#0F172A',
                      background: '#FFFFFF'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                    onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                  />
                  <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '10px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#64748B'
                    }}
                    title={showCurrentPass ? 'Hide password' : 'View password'}
                  >
                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '13px 28px',
                  borderRadius: '12px',
                  background: submitting ? '#94A3B8' : '#1D4ED8',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(29, 78, 216, 0.25)',
                  transition: 'background 0.2s ease'
                }}
              >
                <Save size={18} />
                <span>{submitting ? 'Saving Changes...' : 'Save Credentials'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security & System Info Sidecard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Account Profile Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#2563EB" />
              Active Authority
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem' }}>
                <span style={{ color: '#64748B' }}>Role</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: '#EEF2FF',
                  color: '#4338CA',
                  fontWeight: 700,
                  fontSize: '0.78rem'
                }}>
                  {user?.role?.toUpperCase() || 'ADMIN'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem' }}>
                <span style={{ color: '#64748B' }}>Authority Scope</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>Single-Admin Full CRUD</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem' }}>
                <span style={{ color: '#64748B' }}>Current Login ID</span>
                <span style={{ fontWeight: 600, color: '#0F172A', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user?.email}>
                  {user?.email || 'admin@connectinvest.com'}
                </span>
              </div>
            </div>
          </div>

          {/* Database & Compliance Architecture */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#16A34A" />
              Environment Specs
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Server size={16} color="#64748B" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Local MongoDB</span>
                  <p style={{ margin: '2px 0 0 0', color: '#64748B', fontSize: '0.76rem' }}>
                    100% persistent local database with atomic ACID transactions.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Layers size={16} color="#64748B" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Audit Logging</span>
                  <p style={{ margin: '2px 0 0 0', color: '#64748B', fontSize: '0.76rem' }}>
                    Every credential update is recorded to the immutable AuditLog collection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
