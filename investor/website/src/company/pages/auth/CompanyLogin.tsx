import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const CompanyLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('contact@nexustech.in');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await authService.login({ email, password });
      login(data.token, data.user, data.company);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] via-[#FFF9ED] to-[#FFFDF7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#F4E9CD] shadow-xl shadow-[#F4B41A]/5 relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F4B41A] via-[#E8A51D] to-[#DE8E0A]" />

        <div className="text-center space-y-2 mb-8">
          <Link to="/" className="inline-flex items-center space-x-2.5">
            <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-2xl font-display text-[#1F2421]">
              Connect<span className="text-[#DE8E0A]">Invest</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#1F2421] pt-2 font-display">Company Portal Login</h2>
          <p className="text-xs text-[#556171]">
            Access your corporate fundraising and shareholder dashboard
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Demo credentials hint */}
        <div className="p-3 mb-6 rounded-xl bg-[#FFF9ED] border border-[#F4E9CD] flex items-center justify-between text-xs text-[#1F2421]">
          <div>
            <span className="font-bold text-[#B37400]">Demo Login:</span>
            <p className="text-[11px] text-[#556171]">contact@nexustech.in / Password123!</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('contact@nexustech.in');
              setPassword('Password123!');
            }}
            className="text-[11px] font-bold text-[#DE8E0A] hover:text-[#B37400] underline"
          >
            Auto-fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1F2421] mb-1">Company Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE8D8] text-sm focus:outline-none focus:border-[#F4B41A] focus:ring-1 focus:ring-[#F4B41A] bg-[#FFFDF7]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#1F2421]">Password</label>
              <Link to="/company/forgot-password" className="text-xs text-[#DE8E0A] hover:text-[#B37400] font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE8D8] text-sm focus:outline-none focus:border-[#F4B41A] focus:ring-1 focus:ring-[#F4B41A] bg-[#FFFDF7]"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full mt-2">
            <span>Sign In to Company Portal</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#F2EBD9] text-center">
          <p className="text-xs text-[#556171]">
            Don't have a registered company account yet?{' '}
            <Link to="/company/register" className="font-bold text-[#DE8E0A] hover:text-[#B37400] hover:underline">
              Register Company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

