import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#F2EBD9] py-12 text-[13px] text-[#6B7280]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#DE8E0A] to-[#F4B41A] text-white font-extrabold flex items-center justify-center text-sm">
                C
              </div>
              <span className="font-extrabold text-[16px] text-[#1F2421] font-display">Connect Invest</span>
            </div>
            <p className="text-[12px] text-[#78716C] leading-relaxed">
              Empowering scalable Indian enterprises and innovators with structured investment connections.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bold text-[#1F2421] text-xs uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-[12.5px]">
              <li><Link to="/" className="hover:text-[#DE8E0A] transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-[#DE8E0A] transition-colors">About Us</Link></li>
              <li><Link to="/opportunities" className="hover:text-[#DE8E0A] transition-colors">Funding Opportunities</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#DE8E0A] transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-[#1F2421] text-xs uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-[12.5px]">
              <li><Link to="/benefits" className="hover:text-[#DE8E0A] transition-colors">Benefits & Eligibility</Link></li>
              <li><Link to="/faq" className="hover:text-[#DE8E0A] transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/company/register" className="hover:text-[#DE8E0A] transition-colors">Register Company</Link></li>
              <li><Link to="/company/login" className="hover:text-[#DE8E0A] transition-colors">Portal Login</Link></li>
            </ul>
          </div>

          {/* Support / Disclaimer */}
          <div>
            <h4 className="font-bold text-[#1F2421] text-xs uppercase tracking-wider mb-3">Compliance</h4>
            <p className="text-[11.5px] text-[#8C8474] leading-relaxed">
              Connect Invest facilitates investor-company interaction following MCA regulatory compliances. Investments are subject to due diligence.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#F2EBD9] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#9CA3AF]">
          <p>© 2026 Connect Invest Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#1F2421] cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-[#1F2421] cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-[#1F2421] cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

