import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-primary-dark)',
        color: '#E8E2D9',
        paddingTop: '64px',
        paddingBottom: '32px',
        borderTop: '1px solid rgba(200, 150, 62, 0.2)'
      }}
    >
      <div className="container">
        {/* Main Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px'
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'contain',
                  display: 'block',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                }}
              />
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#FFFFFF'
                }}
              >
                Connect <span style={{ color: 'var(--color-gold)' }}>Invest</span>
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#B3A6A9', lineHeight: 1.6, marginBottom: '20px' }}>
              Empowering investors with direct access to vetted high-growth corporate and project opportunities. Institutional due diligence for retail and HNI investors.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-gold-light)' }}>
              <ShieldCheck size={18} />
              <span>256-Bit SSL Bank Grade Security</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '16px' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li>
                <Link to="/" style={{ color: '#C9BEC1', transition: 'color 0.2s' }}>Home</Link>
              </li>
              <li>
                <Link to="/opportunities" style={{ color: '#C9BEC1', transition: 'color 0.2s' }}>Investment Opportunities</Link>
              </li>
              <li>
                <Link to="/how-it-works" style={{ color: '#C9BEC1', transition: 'color 0.2s' }}>How It Works</Link>
              </li>
              <li>
                <Link to="/about" style={{ color: '#C9BEC1', transition: 'color 0.2s' }}>About Us</Link>
              </li>
              <li>
                <Link to="/faqs" style={{ color: '#C9BEC1', transition: 'color 0.2s' }}>FAQs</Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: '#C9BEC1', transition: 'color 0.2s' }}>Contact Us</Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#C9BEC1', transition: 'color 0.2s' }}>Investor Login</Link>
              </li>
            </ul>
          </div>

          {/* Explore Investments */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '16px' }}>
              Sectors
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li>
                <Link to="/opportunities?category=Renewable+Energy" style={{ color: '#C9BEC1' }}>Renewable Energy</Link>
              </li>
              <li>
                <Link to="/opportunities?category=Real+Estate" style={{ color: '#C9BEC1' }}>Prime Real Estate</Link>
              </li>
              <li>
                <Link to="/opportunities?category=Food+%26+Agriculture" style={{ color: '#C9BEC1' }}>Agriculture & Cold Chain</Link>
              </li>
              <li>
                <Link to="/opportunities?category=Technology" style={{ color: '#C9BEC1' }}>Tech Infrastructure</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '16px' }}>
              Contact & Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#C9BEC1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="var(--color-gold)" />
                <span>support@connectinvest.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} color="var(--color-gold)" />
                <span>+91 (080) 4192-3000</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={16} color="var(--color-gold)" style={{ marginTop: '3px' }} />
                <span>Level 7, Prestige Tech Cloud, Bengaluru, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '13px',
            color: '#8C7E82'
          }}
        >
          <div>
            © {new Date().getFullYear()} Connect Invest. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Risk Disclosures</span>
            <span style={{ cursor: 'pointer' }}>Security Audit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
