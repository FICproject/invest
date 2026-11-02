import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  Building2,
  BarChart3,
  Coins,
  Receipt,
  FileCheck2,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/requests', label: 'Request', icon: FilePlus2 },
  { path: '/dashboard/financials', label: 'Financial Reports', icon: BarChart3 },
  { path: '/dashboard/returns', label: 'Returns and Dividends', icon: Coins },
  { path: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { path: '/dashboard/documents', label: 'Documents & Compliance', icon: FileCheck2 },
  { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { company, logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-[#EFE8D8] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo and Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-[#F2EBD9] bg-gradient-to-r from-[#FFF9ED]/60 to-transparent">
          <NavLink to="/" className="flex items-center space-x-3">
            <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-[#1F2421] font-display tracking-tight">
                  Connect<span className="text-[#DE8E0A]">Invest</span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#B37400] block">
                Company Portal
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#F4B41A] text-[#1F2421] shadow-sm font-bold'
                      : 'text-[#556171] hover:text-[#1F2421] hover:bg-[#FFF9ED]'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Logout bottom action */}
        <div className="p-4 border-t border-[#F2EBD9]">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#556171] hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

