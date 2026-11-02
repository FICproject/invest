import React, { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';

export const Topbar: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-20 bg-white border-b border-[#EFE8D8] sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-500 hover:bg-[#FFF9ED] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports, documents, transactions..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EFE8D8] bg-[#FFFDF7] text-xs sm:text-sm text-[#1F2421] placeholder:text-slate-400 focus:outline-none focus:border-[#F4B41A] focus:ring-1 focus:ring-[#F4B41A] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
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
          <div className="w-9 h-9 rounded-xl bg-[#F4B41A] text-[#1F2421] font-bold flex items-center justify-center text-sm shadow-sm">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[#1F2421] leading-none">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-[#556171] capitalize mt-1">Authorized Rep</p>
          </div>
        </div>
      </div>
    </header>
  );
};

