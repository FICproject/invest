import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const email = location.state?.email || '';
  const mobile = location.state?.mobile || '';
  const prefillOtp = location.state?.otpCode || '';

  const [otp, setOtp] = useState(prefillOtp);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyOTP({ email, mobile, otp });
      if (res.success && res.data) {
        localStorage.setItem('ci_investor_token', res.data.token);
        await refreshMe();
        setSuccess('Account verified successfully! Redirecting to KYC onboarding...');
        setTimeout(() => {
          navigate('/investor/kyc');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '36px 32px',
          boxShadow: '0 8px 30px rgba(59, 10, 17, 0.06)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px'
          }}
        >
          <ShieldCheck size={28} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
          Verify Your Account
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Please enter the 6-digit OTP code sent to your registered contact ({email || mobile || 'your profile'}).
        </p>

        {prefillOtp && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#FEF3C7',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#92400E',
              marginBottom: '20px'
            }}
          >
            Development OTP: <strong>{prefillOtp}</strong>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FEE2E2',
              borderRadius: '8px',
              color: '#B91C1C',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#ECFDF5',
              borderRadius: '8px',
              color: '#065F46',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '24px' }}>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              required
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: '700' }}
            />
          </div>

          <Button
            variant="primary"
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
          >
            Verify & Proceed to KYC
          </Button>
        </form>
      </div>
    </div>
  );
};
