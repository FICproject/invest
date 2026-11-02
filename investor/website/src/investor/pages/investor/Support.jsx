import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  FileQuestion,
  ShieldAlert,
  Headphones
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const Support = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Payouts & Returns');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      q: 'When are monthly returns and principal payouts credited?',
      a: 'Returns are automatically credited to your verified bank account by the 15th of every calendar month. If the 15th falls on a banking holiday, the payout is processed on the immediate next business day.'
    },
    {
      q: 'How do I update my registered bank account for payouts?',
      a: 'Navigate to "Profile & Settings" > "Bank Details" in the sidebar. Enter your new IFSC code and account number, and upload a cancelled cheque or recent bank statement for instant verification.'
    },
    {
      q: 'What is the processing time for KYC verification?',
      a: 'Our automated verification engine verifies Aadhaar and PAN details within 24 to 48 business hours. You will receive an instant email and SMS alert once approved.'
    },
    {
      q: 'Where can I download my annual TDS certificates and statements?',
      a: 'You can generate and download comprehensive tax summaries, monthly payout receipts, and consolidated investment statements under the "Statements & Report" menu item in your sidebar.'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setIsSubmitted(false), 6000);
    }, 800);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 10, 17, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}
            >
              <Headphones size={20} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Investor Help & Support
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Have questions regarding your investment portfolio, monthly return schedules, or account verification? Our team is available to assist you.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Phone */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(200, 150, 62, 0.12)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Phone size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                Priority Investor Desk
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                +91 800-CONNECT
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> Mon - Sat, 9:00 AM - 7:00 PM IST
              </div>
            </div>
          </div>

          {/* Email */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(59, 10, 17, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                Official Email Desk
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                support@connectinvest.com
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                Average response time: &lt; 2 business hours
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                Trust & Compliance
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                grievance@connectinvest.com
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                Regulated escrow & dispute resolution
              </div>
            </div>
          </div>
        </div>

        {/* FAQs & Ticket Section Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}
        >
          {/* FAQs */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileQuestion size={18} color="var(--color-gold)" />
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)' }}>
                Frequently Asked Questions
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 16px',
                        backgroundColor: isOpen ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        color: 'var(--text-main)'
                      }}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp size={16} color="var(--color-gold)" />
                      ) : (
                        <ChevronDown size={16} color="var(--text-muted)" />
                      )}
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: '12px 16px 16px',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          fontSize: '13px',
                          color: 'var(--text-muted)',
                          lineHeight: '1.6',
                          borderTop: '1px solid var(--border-color)'
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Ticket Form */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Send size={18} color="var(--color-primary)" />
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)' }}>
                Submit a Support Request
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Need personal assistance? Send a message directly to your account relationship manager.
            </p>

            {isSubmitted && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}
              >
                <CheckCircle2 size={18} color="#10B981" />
                <span>Ticket submitted successfully! A support agent will reply to your registered email shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                >
                  <option value="Payouts & Returns">Payouts & Returns</option>
                  <option value="KYC Verification">KYC Verification</option>
                  <option value="Bank Details Update">Bank Details Update</option>
                  <option value="Opportunity Inquiries">Opportunity Inquiries</option>
                  <option value="Tax & TDS Statements">Tax & TDS Statements</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>
                  Subject
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Query regarding April 2026 interest credit"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>
                  Message Details
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or query with relevant transaction or company names..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    padding: '10px 12px',
                    fontSize: '13.5px',
                    color: 'var(--text-main)',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <Button
                type="submit"
                variant="burgundy"
                isLoading={isSubmitting}
                style={{ marginTop: '6px' }}
              >
                Submit Request
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
