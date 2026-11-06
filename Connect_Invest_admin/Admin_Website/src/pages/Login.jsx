import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ForgeIndiaLogoCircle } from '../assets/ForgeIndiaLogo';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const serverErr = err.response?.data?.error || err.response?.data?.message;
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError(serverErr || 'Invalid email or password. Please verify your administrator credentials.');
      } else if (err.response?.status === 500) {
        setError(serverErr || 'Unable to connect to administration service. Please check server logs or network.');
      } else {
        setError(serverErr || err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 20%, #FFF5D6 0%, #F3F6FA 75%)'
    }}>
      <div className="forge-card" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px 36px',
        borderRadius: '24px',
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12)'
      }}>
        {/* Company Official Logo Badge (Image 2) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <ForgeIndiaLogoCircle size={140} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            Admin Operations Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Single-Admin Operations Console • PRD v1.0
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--badge-rose-bg)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--badge-rose-text)',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.825rem',
            marginBottom: '18px',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px', paddingRight: '14px', height: '46px' }}
                placeholder="admin@example.com"
              />
              <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px', paddingRight: '44px', height: '46px' }}
                placeholder="Enter password"
              />
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: showPassword ? '#0047BA' : '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
                title={showPassword ? 'Hide password' : 'View password'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '6px', height: '48px', fontSize: '0.95rem' }}
          >
            <span>{loading ? 'Signing in...' : 'Sign In to Admin Console'}</span>
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
