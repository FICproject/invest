import React, { useState } from 'react';
import { Card, Button, Badge } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { Settings as SettingsIcon, Lock, Bell, Shield, KeyRound, CheckCircle, Building2 } from 'lucide-react';
import { CompanyDetails } from '../CompanyProfile/CompanyDetails';

export const Settings: React.FC = () => {
  const { user, company } = useAuth();
  const [activeSettingsTab, setActiveSettingsTab] = useState<'security' | 'company'>('company');
  const [success, setSuccess] = useState('');
  const [prefs, setPrefs] = useState({
    emailNotifOnPledges: true,
    emailNotifOnCompliance: true,
    twoFactorAuth: false,
    publicListingSearchable: true,
  });

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
    setSuccess('Preferences updated successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2421] font-display">
            Settings & Company Details
          </h1>
          <p className="text-xs text-[#556171]">
            Manage corporate master data, directors, security controls, and compliance preferences
          </p>
        </div>

        {/* Tab switch between Company Profile and Workspace Settings */}
        <div className="inline-flex rounded-xl p-1 bg-white border border-[#EFE8D8] shadow-sm">
          <button
            onClick={() => setActiveSettingsTab('company')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSettingsTab === 'company'
                ? 'bg-[#F4B41A] text-[#1F2421] shadow-sm'
                : 'text-[#556171] hover:text-[#1F2421]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Details</span>
          </button>
          <button
            onClick={() => setActiveSettingsTab('security')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSettingsTab === 'security'
                ? 'bg-[#F4B41A] text-[#1F2421] shadow-sm'
                : 'text-[#556171] hover:text-[#1F2421]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security & Preferences</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* When Company Details Tab is active */}
      {activeSettingsTab === 'company' ? (
        <CompanyDetails />
      ) : (
        <div className="space-y-6">
          {/* Account Info */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-[#1F2421] border-b border-[#F2EBD9] pb-2 font-display">
              Primary Authorized Representative
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#556171] block font-semibold">User Name</span>
                <p className="text-sm font-bold text-[#1F2421] mt-0.5">{user?.name}</p>
              </div>
              <div>
                <span className="text-[#556171] block font-semibold">Work Email</span>
                <p className="text-sm font-bold text-[#1F2421] mt-0.5">{user?.email}</p>
              </div>
              <div>
                <span className="text-[#556171] block font-semibold">System Role</span>
                <Badge variant="purple">{user?.role}</Badge>
              </div>
              <div>
                <span className="text-[#556171] block font-semibold">Company Entity</span>
                <p className="text-sm font-bold text-[#1F2421] mt-0.5">{company?.legalName}</p>
              </div>
            </div>
          </Card>

          {/* Security & Access */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-[#1F2421] border-b border-[#F2EBD9] pb-2 font-display">
              Security Controls
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#EFE8D8] bg-[#FFFDF7]">
                <div>
                  <p className="text-xs font-bold text-[#1F2421]">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-[#556171]">
                    Require OTP code confirmation for high-value share allocations and withdrawals
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('twoFactorAuth')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    prefs.twoFactorAuth ? 'bg-[#F4B41A] justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-[#EFE8D8] bg-[#FFFDF7]">
                <div>
                  <p className="text-xs font-bold text-[#1F2421]">Email Alerts on New Investor Pledges</p>
                  <p className="text-[11px] text-[#556171]">
                    Dispatches an instant email receipt when an investor commits capital
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifOnPledges')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    prefs.emailNotifOnPledges ? 'bg-[#F4B41A] justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-[#EFE8D8] bg-[#FFFDF7]">
                <div>
                  <p className="text-xs font-bold text-[#1F2421]">Compliance & Regulatory Deadlines Alerts</p>
                  <p className="text-[11px] text-[#556171]">
                    Automatic reminders 14 days prior to maturity coupons and AGM filings
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifOnCompliance')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    prefs.emailNotifOnCompliance ? 'bg-[#F4B41A] justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

