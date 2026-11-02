import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/company' },
    { name: 'About Us', path: '/company/about' },
    { name: 'Funding Opportunities', path: '/company/opportunities' },
    { name: 'How It Works', path: '/company/how-it-works' },
    { name: 'Benefits', path: '/company/benefits' },
    { name: 'FAQ', path: '/company/faq' },
  ];

  const isActive = (path: string) => {
    if (path === '/company') return location.pathname === '/company';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F2EBD9]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[76px] flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/company" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#DE8E0A] via-[#E8A51D] to-[#F5C452] flex items-center justify-center shadow-sm text-white font-black text-xl">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[19px] tracking-tight text-[#1F2421] leading-none font-display">
              Connect <span className="text-[#DE8E0A]">Invest</span> <span className="text-[#78716C] font-semibold text-[17px]">- Company</span>
            </span>
            <span className="text-[9.5px] text-[#9E988A] font-medium tracking-wider mt-0.5">
              Funding Today. Growth Tomorrow.
            </span>
          </div>
        </Link>

        {/* Desktop Nav links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-colors relative py-1 ${
                  active
                    ? 'text-[#DE8E0A] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#DE8E0A] after:rounded-full'
                    : 'text-[#4A5568] hover:text-[#DE8E0A]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Header Action Button - Login */}
        <div className="hidden sm:flex items-center">
          <Link
            to="/company/login"
            className="px-6 py-2 text-[13.5px] font-bold text-[#1F2421] bg-[#F4B41A] hover:bg-[#E8A51D] rounded-full shadow-sm hover:shadow transition-all"
          >
            Login
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#374151]"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#F2EBD9] px-6 py-5 flex flex-col gap-3 shadow-lg">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-[14px] font-medium py-1.5 transition-colors ${
                  active ? 'text-[#DE8E0A] font-bold' : 'text-[#4A5568] hover:text-[#DE8E0A]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#F2EBD9]">
            <Link
              to="/company/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full block text-center py-2.5 rounded-full bg-[#F4B41A] text-[#1F2421] font-bold text-[13.5px]"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

