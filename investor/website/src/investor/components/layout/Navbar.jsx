import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/investor' },
    { name: 'Explore Investments', path: '/opportunities' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About Us', path: '/about' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Contact Us', path: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/investor') return location.pathname === '/investor';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #ECE6E0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
      }}
    >
      <div
        className="container"
        style={{
          height: '74px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand Logo */}
        <Link to="/investor" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo.png"
            alt="Forge India Connect Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              objectFit: 'contain',
              display: 'block',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              border: '1px solid #ECE6E0'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '20px',
                fontWeight: '800',
                color: '#3B0A11',
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}
            >
              Connect
            </span>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '20px',
                fontWeight: '800',
                color: '#C8963E',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginLeft: '4px'
              }}
            >
              Invest
            </span>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '18px',
                fontWeight: '700',
                color: '#64748B',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginLeft: '6px'
              }}
            >
              - Investor
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '26px'
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              style={{
                fontSize: '13.5px',
                fontWeight: isActive(link.path) ? '700' : '500',
                color: isActive(link.path) ? '#3B0A11' : '#64748B',
                transition: 'color 0.2s ease',
                position: 'relative',
                padding: '6px 0'
              }}
            >
              {link.name}
              {isActive(link.path) && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#4A0E17',
                    borderRadius: '2px'
                  }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Auth CTA Buttons matching Image 1 */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-auth">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/investor/dashboard')}
              style={{
                backgroundColor: '#4A0E17',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '24px',
                padding: '9px 22px',
                fontSize: '13.5px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Dashboard</span>
              <ArrowUpRight size={15} />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#3B0A11',
                border: '1px solid #C4B9AD',
                borderRadius: '24px',
                padding: '8px 22px',
                fontSize: '13.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#3B0A11',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex'
          }}
          className="mobile-hamburger"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #ECE6E0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.06)'
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '15px',
                fontWeight: isActive(link.path) ? '700' : '500',
                color: isActive(link.path) ? '#4A0E17' : '#1F2421',
                padding: '6px 0'
              }}
            >
              {link.name}
            </Link>
          ))}

          <div style={{ paddingTop: '12px', borderTop: '1px solid #ECE6E0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/investor/dashboard');
                }}
                style={{
                  backgroundColor: '#4A0E17',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '10px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#3B0A11',
                  border: '1px solid #C4B9AD',
                  borderRadius: '24px',
                  padding: '9px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}

      {/* Responsive Breakpoint */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .desktop-auth { display: flex !important; }
          .mobile-hamburger { display: none !important; }
        }
      `}</style>
    </header>
  );
};
