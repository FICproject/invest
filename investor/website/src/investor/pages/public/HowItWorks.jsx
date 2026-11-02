import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ShieldCheck, Search, Coins, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';

export const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      num: '01',
      title: 'Create Your Investor Account',
      desc: 'Sign up with your legal name, email address, and verified mobile number. Our encrypted system ensures your data remains secure at all times.',
      icon: UserCheck
    },
    {
      num: '02',
      title: 'Complete 2-Step KYC Verification',
      desc: 'Submit your PAN card, address proof (Aadhaar or Passport), and linked bank details. SEBI guidelines require identity verification before participating in offers.',
      icon: ShieldCheck
    },
    {
      num: '03',
      title: 'Discover & Commit Capital',
      desc: 'Explore vetted corporate and project opportunities across sectors like Renewable Energy, Real Estate, and Food Logistics. Review complete offer memorandums and return calculators.',
      icon: Search
    },
    {
      num: '04',
      title: 'Receive Scheduled Yield & Track Portfolio',
      desc: 'Returns are automatically credited to your linked bank account on scheduled dates. Track active balances, maturity certificates, and payout statements from your live dashboard.',
      icon: Coins
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '56px 0 80px' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Simplified Investing
            </span>
            <h1 style={{ fontSize: '38px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px', marginBottom: '14px' }}>
              How Connect Invest Works
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              A transparent, asset-backed investment journey engineered for retail and institutional investors.
            </p>
          </div>

          {/* Vertical Step Walkthrough */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '56px' }}>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    padding: '32px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '24px',
                    boxShadow: '0 4px 16px rgba(59, 10, 17, 0.04)'
                  }}
                  className="step-card"
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-gold-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '800',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={26} />
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Step {step.num}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Box */}
          <div
            style={{
              backgroundColor: '#3B0A11',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              color: '#FFFFFF'
            }}
          >
            <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '10px' }}>
              Ready to begin your investment journey?
            </h2>
            <p style={{ fontSize: '15px', color: '#E8DEDF', maxWidth: '500px', margin: '0 auto 24px' }}>
              Create your account today and explore approved opportunities yielding between 10% and 13% annually.
            </p>
            <Button variant="gold" size="lg" onClick={() => navigate('/register')}>
              Start Investing Now
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
