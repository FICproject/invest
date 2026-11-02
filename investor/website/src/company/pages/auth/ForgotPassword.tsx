import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common';
import { authService } from '../../services';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
      if (res.mockOtp) setMockOtp(res.mockOtp);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-pink-100 shadow-xl shadow-brand-500/5">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Forgot Password?</h2>
          <p className="text-xs text-slate-500">
            Enter your company email and we'll dispatch a verification reset token.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{message}</span>
            </div>
            {mockOtp && (
              <p className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-200">
                Mock Verification Code: <strong>{mockOtp}</strong>
              </p>
            )}
            <Link
              to="/company/reset-password"
              className="inline-block mt-2 font-bold text-brand-600 hover:underline"
            >
              Proceed to Reset Password →
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Send Reset Instructions
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/company/login"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

