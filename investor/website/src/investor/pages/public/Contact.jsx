import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    category: 'General Investment Inquiry',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate instant secure submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        fullName: '',
        email: '',
        mobile: '',
        category: 'General Investment Inquiry',
        subject: '',
        message: ''
      });
    }, 700);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', color: '#1F2421', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '48px 0 80px' }}>
        <div className="container" style={{ maxWidth: '1040px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#C8963E',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Direct Investor Assistance
            </span>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '38px',
                fontWeight: '800',
                color: '#1F2421',
                marginTop: '8px',
                marginBottom: '12px',
                letterSpacing: '-0.02em'
              }}
            >
              Contact Connect Invest
            </h1>
            <p
              style={{
                fontSize: '15.5px',
                color: '#64748B',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Have questions regarding investment offerings, KYC verification, or institutional onboarding? Our dedicated investor desk is ready to help.
            </p>
          </div>

          {/* 2-Column Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: '36px',
              alignItems: 'start'
            }}
            className="contact-grid"
          >
            {/* Left: Contact Form Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '36px',
                border: '1px solid #ECE5DE',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)'
              }}
            >
              <h3
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1F2421',
                  marginBottom: '6px'
                }}
              >
                Send Us a Message
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '24px' }}>
                Fill out the form below and an investor relationship manager will get back to you within 2 business hours.
              </p>

              {submitted && (
                <div
                  style={{
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <CheckCircle2 size={20} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#065F46', marginBottom: '2px' }}>
                      Message Received!
                    </h4>
                    <p style={{ fontSize: '13px', color: '#047857', margin: 0 }}>
                      Thank you for contacting Connect Invest. Ticket #CI-{Math.floor(100000 + Math.random() * 900000)} has been generated. Our desk will contact you promptly.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Name & Email Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1F2421', marginBottom: '6px' }}>
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '6px',
                        border: '1px solid #ECE5DE',
                        fontSize: '13.5px',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#C8963E')}
                      onBlur={(e) => (e.target.style.borderColor = '#ECE5DE')}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1F2421', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '6px',
                        border: '1px solid #ECE5DE',
                        fontSize: '13.5px',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#C8963E')}
                      onBlur={(e) => (e.target.style.borderColor = '#ECE5DE')}
                    />
                  </div>
                </div>

                {/* Mobile & Category Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1F2421', marginBottom: '6px' }}>
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.mobile}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '6px',
                        border: '1px solid #ECE5DE',
                        fontSize: '13.5px',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#C8963E')}
                      onBlur={(e) => (e.target.style.borderColor = '#ECE5DE')}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1F2421', marginBottom: '6px' }}>
                      Inquiry Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '6px',
                        border: '1px solid #ECE5DE',
                        fontSize: '13.5px',
                        backgroundColor: '#FFFFFF',
                        outline: 'none'
                      }}
                    >
                      <option value="General Investment Inquiry">General Investment Inquiry</option>
                      <option value="KYC Verification & Documents">KYC Verification & Documents</option>
                      <option value="Payouts, Returns & TDS">Payouts, Returns & TDS</option>
                      <option value="Technical or Payment Issue">Technical or Payment Issue</option>
                      <option value="Institutional & Family Office">Institutional & Family Office</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1F2421', marginBottom: '6px' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="Brief summary of your inquiry..."
                    value={formData.subject}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '6px',
                      border: '1px solid #ECE5DE',
                      fontSize: '13.5px',
                      outline: 'none'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#C8963E')}
                    onBlur={(e) => (e.target.style.borderColor = '#ECE5DE')}
                  />
                </div>

                {/* Message */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1F2421', marginBottom: '6px' }}>
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Please describe how we can assist you..."
                    value={formData.message}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid #ECE5DE',
                      fontSize: '13.5px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#C8963E')}
                    onBlur={(e) => (e.target.style.borderColor = '#ECE5DE')}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#4A0E17',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '13px 28px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    boxShadow: '0 4px 12px rgba(74, 14, 23, 0.25)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#621320')}
                  onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4A0E17')}
                >
                  <Send size={16} />
                  <span>{loading ? 'Submitting Inquiry...' : 'Send Message'}</span>
                </button>
              </form>
            </div>

            {/* Right: Contact Information Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Phone Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #ECE5DE',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#F9EFEB',
                    color: '#4A0E17',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2421', marginBottom: '4px' }}>
                    Telephone Support
                  </h4>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#4A0E17', marginBottom: '4px' }}>
                    +91 (080) 4192-3000
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    Mon - Sat: 9:00 AM - 7:00 PM IST
                  </p>
                </div>
              </div>

              {/* Email Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #ECE5DE',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#F9EFEB',
                    color: '#4A0E17',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Mail size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2421', marginBottom: '4px' }}>
                    Email Investor Desk
                  </h4>
                  <p style={{ fontSize: '13.5px', fontWeight: '600', color: '#4A0E17', marginBottom: '4px' }}>
                    support@connectinvest.com
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    Official correspondence: desk@connectinvest.com
                  </p>
                </div>
              </div>

              {/* Office Headquarters Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #ECE5DE',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#F9EFEB',
                    color: '#4A0E17',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2421', marginBottom: '4px' }}>
                    Corporate Headquarters
                  </h4>
                  <p style={{ fontSize: '13px', color: '#1F2421', lineHeight: 1.5, margin: 0 }}>
                    Level 7, Prestige Tech Cloud,<br />
                    Outer Ring Road, Bengaluru 560103,<br />
                    Karnataka, India
                  </p>
                </div>
              </div>

              {/* Escrow & Trustee Governance Badge */}
              <div
                style={{
                  backgroundColor: '#F6ECE6',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #ECE0D6',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <ShieldCheck size={20} color="#4A0E17" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                  <strong style={{ color: '#4A0E17', display: 'block', marginBottom: '2px' }}>
                    Regulatory Investor Grievance
                  </strong>
                  Connect Invest operates under formal SEBI Debenture Trustee covenants. For formal investor grievances, contact: <span style={{ color: '#4A0E17', fontWeight: '600' }}>grievance@connectinvest.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .form-row-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
