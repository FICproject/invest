import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { ShieldCheck, Target, Award, Users } from 'lucide-react';

export const About = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '56px 0 80px' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Institutional Integrity
            </span>
            <h1 style={{ fontSize: '38px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px', marginBottom: '14px' }}>
              About Connect Invest
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
              Democratizing high-yield corporate and infrastructure debt investments for discerning individual and family office investors.
            </p>
          </div>

          {/* Pillars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              marginBottom: '56px'
            }}
          >
            {[
              {
                icon: ShieldCheck,
                title: 'Rigorous Diligence',
                desc: 'Only 3% of applications pass our 6-layer forensic, credit, and collateral audit.'
              },
              {
                icon: Target,
                title: 'Collateral Backing',
                desc: 'Every investment opportunity is secured with 1.25x to 1.5x tangible asset coverage.'
              },
              {
                icon: Award,
                title: 'Escrow Governance',
                desc: 'Distributions are controlled via SEBI-registered trustees with zero commingling of funds.'
              },
              {
                icon: Users,
                title: 'Investor First',
                desc: 'Complete fee transparency, direct payout credits, and dedicated portfolio managers.'
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    padding: '28px 20px',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-subtle)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                    {pillar.title}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
