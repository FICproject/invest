import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';

export const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSuccess('Reset code dispatched. Please check your email.');
      if (res.data?.otpCode) {
        setOtp(res.data.otpCode);
      }
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
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
          boxShadow: '0 8px 30px rgba(59, 10, 17, 0.06)'
        }}
      >
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <KeyRound size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>
            {step === 'email' ? 'Reset Password' : 'Set New Password'}
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            {step === 'email'
              ? 'Enter your registered email address to receive password recovery instructions.'
              : 'Enter the verification code and your new password.'}
          </p>
        </div>

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

        {step === 'email' ? (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Input
              label="Registered Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., mail@domain.com"
              required
            />

            <Button variant="primary" type="submit" fullWidth size="lg" isLoading={isLoading}>
              Send Recovery Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Verification Code (OTP)"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />

            <Button variant="primary" type="submit" fullWidth size="lg" isLoading={isLoading}>
              Update Password & Login
            </Button>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              fontSize: '13.5px',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
