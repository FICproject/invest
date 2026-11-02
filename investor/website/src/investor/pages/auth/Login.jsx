import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, TrendingUp, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, Building2, User } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth as useInvestorAuth } from '../../context/AuthContext';
import { useAuth as useCompanyAuth } from '../../../company/context/AuthContext';
import { authService as companyAuthService } from '../../../company/services';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const investorAuth = useInvestorAuth();
  const companyAuth = useCompanyAuth();

  // Parse initial role from query params e.g. /login?role=company
  const searchParams = new URLSearchParams(location.search);
  const initialRole = searchParams.get('role') === 'company' ? 'company' : 'investor';

  const [activeRole, setActiveRole] = useState(initialRole);
  const [identifier, setIdentifier] = useState(() => {
    return initialRole === 'company'
      ? 'contact@nexustech.in'
      : (localStorage.getItem('ci_remember_identifier') || 'rahul.sharma@investor.com');
  });
  const [password, setPassword] = useState(() => (initialRole === 'company' ? 'Password123!' : 'Password@123'));
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync role if query parameter changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'company' && activeRole !== 'company') {
      setActiveRole('company');
      setIdentifier('contact@nexustech.in');
      setPassword('Password123!');
      setError('');
    } else if (roleParam === 'investor' && activeRole !== 'investor') {
      setActiveRole('investor');
      setIdentifier(localStorage.getItem('ci_remember_identifier') || 'rahul.sharma@investor.com');
      setPassword('Password@123');
      setError('');
    }
  }, [location.search]);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setError('');
    if (role === 'company') {
      setIdentifier('contact@nexustech.in');
      setPassword('Password123!');
    } else {
      setIdentifier(localStorage.getItem('ci_remember_identifier') || 'rahul.sharma@investor.com');
      setPassword('Password@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError(activeRole === 'company' ? 'Please enter your corporate work email.' : 'Please enter your email or mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. If user explicitly selected Company Portal tab
      if (activeRole === 'company') {
        try {
          const compRes = await companyAuthService.login({
            email: identifier.trim().toLowerCase(),
            password
          });
          if (compRes && compRes.token) {
            companyAuth.login(compRes.token, compRes.user, compRes.company);
            navigate('/dashboard');
            return;
          }
        } catch (compErr) {
          // If company login returned invalid, attempt unified investor check in case it's an investor
          try {
            const invRes = await investorAuth.login(identifier.trim(), password, rememberMe);
            if (invRes.data?.user?.role === 'company_admin' || invRes.data?.user?.role === 'company_member') {
              companyAuth.login(invRes.data.token, invRes.data.user, invRes.data.company);
              navigate('/dashboard');
              return;
            } else {
              navigate('/investor/dashboard');
              return;
            }
          } catch {
            throw compErr;
          }
        }
      }

      // 2. Default: Unified Login with Smart Role-Based Access
      const res = await investorAuth.login(identifier.trim(), password, rememberMe);
      const userRole = res.data?.user?.role;

      if (userRole === 'company_admin' || userRole === 'company_member') {
        // Log into company portal session & route to corporate dashboard
        companyAuth.login(res.data.token, res.data.user, res.data.company);
        navigate('/dashboard');
      } else {
        // Investor portal session
        navigate('/investor/dashboard');
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: activeRole === 'company' ? '#FFFDF7' : 'var(--bg-app)',
        color: 'var(--text-main)',
        transition: 'background-color 0.3s ease'
      }}
      className="auth-split-wrapper"
    >
      {/* Left Panel: Theme switches dynamically based on activeRole */}
      <div
        style={{
          flex: 1,
          backgroundColor: activeRole === 'company' ? '#874A00' : '#3B0A11',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 48px',
          color: '#FFFFFF',
          transition: 'background-color 0.4s ease'
        }}
        className="auth-banner-panel"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: activeRole === 'company'
              ? 'url(/hero-coins-growth.jpg)'
              : 'url(/images/auth-banner.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: activeRole === 'company' ? 0.35 : 0.92,
            zIndex: 1
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: activeRole === 'company'
              ? 'linear-gradient(180deg, rgba(135, 74, 0, 0.95) 0%, rgba(168, 94, 0, 0.8) 40%, rgba(105, 56, 0, 0.98) 100%)'
              : 'linear-gradient(180deg, rgba(43, 6, 12, 0.95) 0%, rgba(59, 10, 17, 0.7) 40%, rgba(35, 4, 9, 0.95) 100%)',
            zIndex: 2,
            transition: 'background 0.4s ease'
          }}
        />

        {/* Brand Header */}
        <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: activeRole === 'company' ? '1px solid rgba(255, 216, 133, 0.5)' : '1px solid rgba(200, 150, 62, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: activeRole === 'company' ? '#FFD885' : 'var(--color-gold-light)'
            }}
          >
            {activeRole === 'company' ? <Building2 size={24} /> : <TrendingUp size={24} />}
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: '800', lineHeight: 1 }}>
              Connect <span style={{ color: activeRole === 'company' ? '#FFD885' : 'var(--color-gold)' }}>Invest</span>
            </div>
            <div style={{ fontSize: '11px', color: activeRole === 'company' ? '#FFE8B5' : 'var(--color-gold-light)', letterSpacing: '1px', marginTop: '3px' }}>
              {activeRole === 'company' ? 'CORPORATE PORTAL ACCESS' : 'INVESTOR PORTAL ACCESS'}
            </div>
          </div>
        </div>

        {/* Hero Narrative on Banner */}
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '440px', margin: 'auto 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: activeRole === 'company' ? 'rgba(255, 216, 133, 0.2)' : 'rgba(200, 150, 62, 0.2)',
              border: activeRole === 'company' ? '1px solid rgba(255, 216, 133, 0.4)' : '1px solid rgba(200, 150, 62, 0.4)',
              color: activeRole === 'company' ? '#FFD885' : 'var(--color-gold-light)',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '16px'
            }}
          >
            {activeRole === 'company' ? 'Corporate Fundraising & Issuances' : 'Vetted Asset & Wealth Opportunities'}
          </div>

          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '36px',
              fontWeight: '800',
              lineHeight: 1.15,
              color: '#FFFFFF',
              marginBottom: '14px',
              letterSpacing: '-0.02em'
            }}
          >
            {activeRole === 'company' ? (
              <>
                Empowering Businesses. <br />
                <span style={{ color: '#FFD885' }}>Accelerating Growth.</span>
              </>
            ) : (
              <>
                Grow Your Wealth with <br />
                <span style={{ color: 'var(--color-gold)' }}>Institutional Diligence.</span>
              </>
            )}
          </h2>

          <p style={{ fontSize: '15px', color: '#E8DEDF', lineHeight: 1.6, fontWeight: '400' }}>
            {activeRole === 'company'
              ? 'Raise capital, manage debentures, and engage accredited investors with real-time portfolio governance.'
              : 'Direct debenture issuances, predictable monthly payouts, and institutional intelligence across asset classes.'}
          </p>
        </div>

        {/* Bottom Trust Badge */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.7)'
          }}
        >
          <ShieldCheck size={18} color="var(--color-gold)" />
          <span>Regulated Intermediary Platform & 256-Bit Financial Encryption</span>
        </div>
      </div>

      {/* Right Panel: Clean Warm Form Panel */}
      <div
        style={{
          flex: 1.1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '36px 32px',
          backgroundColor: 'var(--bg-app)'
        }}
        className="auth-form-panel"
      >
        {/* Header: Back to Home Link & Security Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 10, 17, 0.05)',
              border: '1px solid rgba(59, 10, 17, 0.12)',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: '600',
              color: 'var(--text-muted)'
            }}
          >
            <Lock size={14} color="var(--color-gold)" />
            <span>{activeRole === 'company' ? 'Secure Corporate Portal' : 'Secure Investor Portal'}</span>
          </div>
        </div>

        {/* Centered Sign In Card */}
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            margin: '0 auto',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '32px 30px',
            boxShadow: '0 8px 30px rgba(59, 10, 17, 0.06)'
          }}
          className="auth-card"
        >
          {/* ROLE SELECTOR TOGGLE (Role-based access) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: activeRole === 'company' ? 'rgba(222, 142, 10, 0.08)' : 'rgba(59, 10, 17, 0.06)',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '24px',
              border: activeRole === 'company' ? '1px solid #F4E9CD' : '1px solid var(--border-color)',
              transition: 'all 0.3s ease'
            }}
          >
            <button
              type="button"
              onClick={() => handleRoleChange('investor')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: activeRole === 'investor' ? '#FFFFFF' : 'transparent',
                color: activeRole === 'investor' ? '#3B0A11' : '#6B7280',
                boxShadow: activeRole === 'investor' ? '0 2px 8px rgba(59, 10, 17, 0.1)' : 'none'
              }}
            >
              <User size={16} color={activeRole === 'investor' ? '#C8963E' : 'currentColor'} />
              <span>Investor Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('company')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: activeRole === 'company' ? '#FFFFFF' : 'transparent',
                color: activeRole === 'company' ? '#874A00' : '#6B7280',
                boxShadow: activeRole === 'company' ? '0 2px 8px rgba(222, 142, 10, 0.18)' : 'none'
              }}
            >
              <Building2 size={16} color={activeRole === 'company' ? '#DE8E0A' : 'currentColor'} />
              <span>Company Portal</span>
            </button>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '24px',
                fontWeight: '800',
                color: activeRole === 'company' ? '#1F2421' : 'var(--text-main)',
                marginBottom: '4px'
              }}
            >
              {activeRole === 'company' ? 'Company Account Sign In' : 'Sign In to Your Portfolio'}
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>
              {activeRole === 'company'
                ? 'Enter your company credentials to access your corporate dashboard.'
                : 'Enter your credentials to access your active investments and payouts.'}
            </p>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                color: '#B91C1C',
                fontSize: '13px',
                marginBottom: '18px'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label={activeRole === 'company' ? 'Company Work Email' : 'Email Address or Mobile Number'}
              type={activeRole === 'company' ? 'email' : 'text'}
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={activeRole === 'company' ? 'contact@company.com' : 'e.g., mail@domain.com or 9876543210'}
              required
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#6B7280' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: activeRole === 'company' ? '#B37400' : '#3B0A11', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Remember me</span>
              </label>

              <Link
                to={activeRole === 'company' ? '/company/forgot-password' : '/forgot-password'}
                style={{ color: activeRole === 'company' ? '#B37400' : 'var(--color-primary)', fontWeight: '600', transition: 'color 0.2s' }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Access Dashboard CTA Button styled conditionally */}
            <div style={{ marginTop: '4px' }}>
              {activeRole === 'company' ? (
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#B37400',
                    color: '#FFFFFF',
                    fontSize: '14.5px',
                    fontWeight: '800',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(179, 116, 0, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#996300')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#B37400')}
                >
                  <span>{isLoading ? 'Signing In...' : 'Access Company Dashboard'}</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <Button
                  variant="primary"
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                >
                  <span>Access Investor Dashboard</span>
                  <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </Button>
              )}
            </div>
          </form>

          {/* Quick Demo Credentials Autofill Helper */}
          <div
            style={{
              marginTop: '18px',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: '8px',
              border: '1px dashed var(--border-color)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Demo Account: </span>
              <strong>{activeRole === 'company' ? 'Nexus Technologies (Company)' : 'Rahul Sharma (Investor)'}</strong>
            </div>
            <button
              type="button"
              onClick={() => {
                if (activeRole === 'company') {
                  setIdentifier('contact@nexustech.in');
                  setPassword('Password123!');
                } else {
                  setIdentifier('rahul.sharma@investor.com');
                  setPassword('Password@123');
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-gold)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Autofill
            </button>
          </div>

          {/* Sign Up Link with role preservation */}
          <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to={activeRole === 'company' ? '/register?role=company' : '/register?role=investor'}
              style={{
                color: 'var(--color-primary)',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Register</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-light)', marginTop: '20px' }}>
          © {new Date().getFullYear()} Connect Invest. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
