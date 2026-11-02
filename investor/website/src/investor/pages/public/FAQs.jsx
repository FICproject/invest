import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  Coins,
  Lock,
  Mail,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const FAQs = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(0); // first item open by default
  const navigate = useNavigate();

  const categories = [
    'All',
    'Getting Started',
    'KYC & Verification',
    'Investments & Security',
    'Returns & Payouts'
  ];

  const allFaqs = [
    {
      category: 'Getting Started',
      q: 'How do I become an investor on Connect Invest?',
      a: 'Getting started takes under 2 minutes. Click "Get Started" to register with your full legal name, email address, and verified mobile number. Once registered, complete a quick 2-step KYC verification (PAN and bank account coordinates) to immediately begin evaluating and committing capital into approved opportunities.'
    },
    {
      category: 'Getting Started',
      q: 'Who can invest through Connect Invest?',
      a: 'Any resident Indian citizen (18+ years of age), Non-Resident Indian (NRI) with an NRE/NRO account, as well as registered HUFs, LLPs, and corporate entities complying with SEBI and RBI investor regulations.'
    },
    {
      category: 'KYC & Verification',
      q: 'Why is KYC verification mandatory before investing?',
      a: 'Statutory RBI and SEBI Anti-Money Laundering (AML) and Prevention of Money Laundering Act (PMLA) regulations mandate that all investors be fully verified. Furthermore, KYC verification guarantees that your monthly interest and maturity return payouts are transferred directly and safely to your own verified bank account.'
    },
    {
      category: 'KYC & Verification',
      q: 'What documents are required to complete KYC?',
      a: 'You will need your Permanent Account Number (PAN) card, a valid identity/address proof (such as Aadhaar or Passport), and your bank account details (account number and IFSC code) accompanied by a cancelled cheque or recent bank statement for payout linking.'
    },
    {
      category: 'KYC & Verification',
      q: 'How long does the KYC verification process take?',
      a: 'Automated verification is instantaneous for PAN and bank validation. Manual document verification (if required) is audited and approved by our compliance desk within 2 to 4 business hours.'
    },
    {
      category: 'Investments & Security',
      q: 'What is the minimum amount required to invest?',
      a: 'Minimum investment thresholds vary by opportunity and are clearly stated on each offer card. Many deals begin at just ₹2,000 to ₹5,000 to make institutional opportunities accessible to retail investors, while project debentures may range from ₹10,000 to ₹50,000.'
    },
    {
      category: 'Investments & Security',
      q: 'How are listed opportunities secured and vetted?',
      a: 'Every listing undergoes a 6-layer forensic diligence audit covering historical financial audits, promoter background checks, and legal title verification. Listed assets are secured by first-charge mortgages, corporate hypothecation, or collateral coverage typically spanning 1.25x to 1.5x of the issue size.'
    },
    {
      category: 'Investments & Security',
      q: 'What is the role of the SEBI-registered Trustee?',
      a: 'An independent, SEBI-registered Debenture Trustee holds all mortgage charges and collateral covenants on behalf of the investors. All investor subscription funds and repayment flows move through dedicated escrow accounts overseen by the Trustee, eliminating commingling risks.'
    },
    {
      category: 'Returns & Payouts',
      q: 'When and how are returns paid?',
      a: 'Returns and interest distributions are paid according to the schedule specified in the offer memorandum (monthly or quarterly). Payouts are directly credited via automated bank transfer (NEFT/RTGS/IMPS) into your verified bank account, and instant credit alerts reflect on your dashboard.'
    },
    {
      category: 'Returns & Payouts',
      q: 'Is tax deducted at source (TDS) on my returns?',
      a: 'Interest distributions on corporate debt securities are subject to statutory TDS as per prevailing Income Tax laws. You will receive computerized TDS certificates (Form 16A) in your "Statements" tab every fiscal quarter for your tax filing.'
    },
    {
      category: 'Returns & Payouts',
      q: 'Can I exit an investment before tenure maturity?',
      a: 'Investments have a predefined tenure (e.g. 18 to 36 months). While investments are intended to be held until maturity, Connect Invest provides periodic secondary liquidity windows where investors can transfer their holdings to willing institutional or retail buyers on the platform.'
    },
    {
      category: 'Returns & Payouts',
      q: 'Where can I download my investment certificates and transaction receipts?',
      a: 'Immediately upon successful payment, an allotment confirmation certificate is generated and stored in your "Statements & Reports" dashboard. You can download official PDF receipts, payment acknowledgments, and annual holding statements at any time.'
    }
  ];

  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      const matchesCategory =
        activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch =
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', color: '#1F2421', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '48px 0 80px' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#C8963E',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Knowledge Base & Support
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
              Frequently Asked Questions
            </h1>
            <p
              style={{
                fontSize: '15.5px',
                color: '#64748B',
                maxWidth: '620px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Authoritative answers to common questions regarding account setup, KYC verification, investment diligence, and payout distributions.
            </p>

            {/* Search Bar */}
            <div
              style={{
                maxWidth: '560px',
                margin: '28px auto 0',
                position: 'relative'
              }}
            >
              <Search
                size={18}
                color="#8C7E82"
                style={{
                  position: 'absolute',
                  left: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <input
                type="text"
                placeholder="Search question, keyword, or topic (e.g. KYC, payouts, returns)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 20px 13px 48px',
                  borderRadius: '30px',
                  border: '1px solid #ECE5DE',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  color: '#1F2421',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#C8963E')}
                onBlur={(e) => (e.target.style.borderColor = '#ECE5DE')}
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '36px'
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setExpandedFaq(null);
                }}
                style={{
                  backgroundColor: activeCategory === cat ? '#4A0E17' : '#FFFFFF',
                  color: activeCategory === cat ? '#FFFFFF' : '#64748B',
                  border: `1px solid ${activeCategory === cat ? '#4A0E17' : '#ECE5DE'}`,
                  borderRadius: '20px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: activeCategory === cat ? '0 2px 8px rgba(74, 14, 23, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '56px' }}>
            {filteredFaqs.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  border: '1px solid #ECE5DE'
                }}
              >
                <HelpCircle size={40} color="#C8963E" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No matching questions found</h3>
                <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '20px' }}>
                  Try adjusting your search query or select another category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  style={{
                    backgroundColor: '#4A0E17',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 22px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: `1px solid ${expandedFaq === idx ? '#C8963E' : '#ECE5DE'}`,
                    boxShadow: expandedFaq === idx ? '0 4px 16px rgba(200, 150, 62, 0.12)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '18px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: '#F9EFEB',
                          color: '#4A0E17'
                        }}
                      >
                        {faq.category}
                      </span>
                      <span
                        style={{
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '15px',
                          fontWeight: '700',
                          color: '#1F2421'
                        }}
                      >
                        {faq.q}
                      </span>
                    </div>

                    <ChevronDown
                      size={18}
                      color="#4A0E17"
                      style={{
                        transform: expandedFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0
                      }}
                    />
                  </button>

                  {expandedFaq === idx && (
                    <div
                      style={{
                        padding: '0 22px 20px',
                        fontSize: '14px',
                        color: '#64748B',
                        lineHeight: 1.6,
                        borderTop: '1px solid #FAF7F2'
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Still Have Questions Banner */}
          <div
            style={{
              backgroundColor: '#4A0E17',
              borderRadius: '14px',
              padding: '32px',
              color: '#FFFFFF',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px'
            }}
          >
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>
                Still have questions?
              </h3>
              <p style={{ fontSize: '13.5px', color: '#E8DEDF', margin: 0 }}>
                Our dedicated investor relationship managers are here to guide you.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                style={{
                  backgroundColor: '#C8963E',
                  color: '#27040A',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 22px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Contact Support
              </button>

              <button
                type="button"
                onClick={() => navigate('/opportunities')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Explore Opportunities
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
