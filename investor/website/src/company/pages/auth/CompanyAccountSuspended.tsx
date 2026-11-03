import React from 'react';
import { ShieldAlert, AlertTriangle, Mail, Phone, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const CompanyAccountSuspended: React.FC = () => {
  const { company, user, logout } = useAuth();
  const navigate = useNavigate();

  const isRevoked = company?.accountStatus === 'Revoked' || user?.accountStatus === 'Revoked';
  const reason = company?.accountSuspendedReason || user?.accountSuspendedReason || 'Company account suspended pending compliance verification.';
  const suspendedDate = company?.accountSuspendedAt ? new Date(company.accountSuspendedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : null;

  return (
    <div className="min-h-screen bg-[#0E131F] text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-[#182032] border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
          {isRevoked ? (
            <ShieldAlert className="w-9 h-9 text-red-500" />
          ) : (
            <AlertTriangle className="w-9 h-9 text-amber-500" />
          )}
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isRevoked ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
            Company Account {isRevoked ? 'Revoked' : 'Suspended'}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {company?.legalName || company?.name || 'Company Account Suspended'}
        </h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Access to your corporate dashboard and fundraising capabilities has been {isRevoked ? 'revoked' : 'temporarily suspended'} by Platform Administration.
        </p>

        {/* Reason Box */}
        <div className="bg-[#0E131F] border border-slate-800 rounded-xl p-5 text-left mb-6">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Reason for Administrative Action
          </div>
          <div className="text-sm text-slate-200 leading-relaxed font-medium">
            "{reason}"
          </div>
          {suspendedDate && (
            <div className="text-xs text-slate-500 mt-3">
              Action timestamp: {suspendedDate}
            </div>
          )}
        </div>

        {/* Support & Escalation */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left mb-6">
          <div className="text-xs font-semibold text-blue-400 mb-1">
            Need to appeal or clarify compliance details?
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Contact your assigned compliance manager or the institutional support desk.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <a href="mailto:corporate-compliance@connectinvest.in" className="text-blue-400 hover:underline flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> corporate-compliance@connectinvest.in
            </a>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Phone className="w-3.5 h-3.5" /> +91 1800 572 8899
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/company')}
            className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
          >
            Company Home
          </button>
          <button
            onClick={logout}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyAccountSuspended;

