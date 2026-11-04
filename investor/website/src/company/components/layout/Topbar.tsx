import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';

const getTabMeta = (pathname: string) => {
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return { title: 'Dashboard', subtitle: 'Overview & Real-Time Metrics' };
  }
  if (pathname.startsWith('/dashboard/requests/create')) {
    return { title: 'Create Funding Request', subtitle: 'Submit capital requirement proposal' };
  }
  if (pathname.startsWith('/dashboard/requests/') && pathname !== '/dashboard/requests') {
    return { title: 'Funding Request Details', subtitle: 'Underwriting status & review feedback' };
  }
  if (pathname.startsWith('/dashboard/requests')) {
    return { title: 'Funding Requests', subtitle: 'Manage and track capital raise proposals' };
  }
  if (pathname.startsWith('/dashboard/investments')) {
    return { title: 'Investments', subtitle: 'Capital pipeline & investor commitments' };
  }
  if (pathname.startsWith('/dashboard/returns')) {
    return { title: 'Returns and Dividends', subtitle: 'Repayment schedules and payout tracking' };
  }
  if (pathname.startsWith('/dashboard/transactions')) {
    return { title: 'Transactions', subtitle: 'Disbursements, repayments & verified ledger' };
  }
  if (pathname.startsWith('/dashboard/documents')) {
    return { title: 'Documents', subtitle: 'Compliance deliverables & verification repository' };
  }
  if (pathname.startsWith('/dashboard/subscription')) {
    return { title: 'Subscription', subtitle: 'Platform access fee and billing history' };
  }
  if (pathname.startsWith('/dashboard/notifications')) {
    return { title: 'Notifications', subtitle: 'Alerts, compliance notices & dispatches' };
  }
  if (pathname.startsWith('/dashboard/settings')) {
    return { title: 'Settings', subtitle: 'Company profile & security settings' };
  }
  if (pathname.startsWith('/dashboard/profile')) {
    return { title: 'Company Profile', subtitle: 'Corporate identity and verification' };
  }
  if (pathname.startsWith('/dashboard/financials')) {
    return { title: 'Financial Reports', subtitle: 'Audited statements & compliance filings' };
  }
  if (pathname.startsWith('/dashboard/shareholders')) {
    return { title: 'Shareholders', subtitle: 'Cap table & stakeholder allocations' };
  }
  return { title: 'Company Portal', subtitle: 'Corporate Dashboard' };
};

export const Topbar: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const tabMeta = getTabMeta(location.pathname);

  return (
    <header className="h-20 bg-white border-b border-[#EFE8D8] sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Current Tab Name in Header */}
      <div className="flex items-center space-x-3.5 min-w-0">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-500 hover:bg-[#FFF9ED] lg:hidden flex-shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[#1F2421] font-display tracking-tight leading-tight truncate">
            {tabMeta.title}
          </h1>
          {tabMeta.subtitle && (
            <p className="hidden sm:block text-[11px] text-[#556171] leading-none mt-0.5 truncate">
              {tabMeta.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls: Notifications & User Avatar */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        {/* Notifications Icon Link */}
        <NavLink
          to="/dashboard/notifications"
          className="relative p-2.5 rounded-xl text-slate-500 hover:bg-[#FFF9ED] hover:text-[#DE8E0A] transition"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#DE8E0A] rounded-full animate-pulse"></span>
        </NavLink>

        {/* User Avatar & Info */}
        <div className="flex items-center space-x-3 pl-3 border-l border-[#EFE8D8]">
          <div className="w-9 h-9 rounded-xl bg-[#F4B41A] text-[#1F2421] font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[#1F2421] leading-none truncate max-w-[150px]">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[11px] text-[#556171] capitalize mt-1">Authorized Rep</p>
          </div>
        </div>
      </div>
    </header>
  );
};

