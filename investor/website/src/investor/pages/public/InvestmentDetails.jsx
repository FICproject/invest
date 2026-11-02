import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Layers,
  TrendingUp,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Download
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { InvestmentCalculator } from '../../components/investment/InvestmentCalculator';
import { InvestmentModal } from '../../components/investment/InvestmentModal';
import { investmentService } from '../../services/investmentService';
import { formatCurrency, formatLargeCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

export const InvestmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, kycStatus } = useAuth();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOffer = async () => {
      try {
        const res = await investmentService.getOfferById(id);
        if (isMounted && res.success && res.data) {
          setOffer(res.data);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Opportunity not found.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOffer();
    return () => { isMounted = false; };
  }, [id]);

  const handleInvestClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader message="Fetching real offer prospectus from backend..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, padding: '64px 20px', textAlign: 'center' }}>
          <h2>Investment offer unavailable</h2>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>{error}</p>
          <Button variant="primary" onClick={() => navigate('/opportunities')}>
            Back to Opportunities
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const progress = offer.targetAmount > 0
    ? Math.min(100, Math.round((offer.raisedAmount / offer.targetAmount) * 100))
    : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '36px 0 64px' }}>
        <div className="container">
          {/* Back Button */}
          <button
            onClick={() => navigate('/opportunities')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: '600',
              fontSize: '13.5px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Opportunities</span>
          </button>

          {/* Main Grid: Left Details & Right Action Sidebar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)',
              gap: '32px'
            }}
            className="details-layout-grid"
          >
            {/* Left Column: Prospectus & Company Info */}
            <div>
              {/* Header Info */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: offer.type === 'Company' ? '#FEF3C7' : '#EFF6FF',
                      color: offer.type === 'Company' ? '#92400E' : '#1E40AF'
                    }}
                  >
                    {offer.type === 'Company' ? <Building2 size={13} /> : <Layers size={13} />}
                    {offer.type}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-gold)' }}>
                    {offer.category}
                  </span>
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {offer.companyName}
                </h1>
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-muted)' }}>
                  {offer.title}
                </h3>
              </div>

              {/* Cover Image */}
              <div
                style={{
                  height: '320px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  marginBottom: '28px',
                  backgroundColor: '#E5DFD7',
                  border: '1px solid var(--border-color)'
                }}
              >
                <img
                  src={offer.imageUrl || 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&q=80'}
                  alt={offer.companyName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Description Section */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '14px',
                  padding: '28px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '24px'
                }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-main)' }}>
                  About the Opportunity
                </h3>
                <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                  {offer.description}
                </p>

                {/* Highlights List */}
                {offer.financialHighlights && offer.financialHighlights.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>
                      Key Financial & Due Diligence Highlights
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                      {offer.financialHighlights.map((hl, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13.5px', color: 'var(--text-main)' }}>
                          <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '3px' }} />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Security Structure & Risk Gating */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '24px'
                }}
              >
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="var(--color-gold)" />
                  <span>Security & Investor Protection</span>
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                  Instruments are backed by <strong>{offer.securityType || 'Senior Secured Corporate Assets'}</strong>. All investor funds are handled through a dedicated SEBI-registered trustee escrow account.
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                  <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    Risk Rating: <strong style={{ color: 'var(--color-primary)' }}>{offer.riskLevel}</strong>
                  </div>
                  <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    Payout Frequency: <strong>{offer.payoutFrequency}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Funding Progress, Live Calculator & Invest Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Financial Term Card */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '16px',
                  padding: '28px',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 8px 30px rgba(59, 10, 17, 0.06)'
                }}
              >
                {/* Return Rate & Tenure Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '20px',
                    marginBottom: '20px',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configured Yield</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-gold)' }}>
                      {offer.returnRate || 3}% <span style={{ fontSize: '14px', fontWeight: '600' }}>/ month</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Offer Duration</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>
                      {offer.tenureMonths} <span style={{ fontSize: '14px', fontWeight: '600' }}>Months</span>
                    </div>
                  </div>
                </div>

                {/* Funding Progress Bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{progress}% Funded</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px', color: 'var(--text-muted)' }}>
                    <span>Target: {formatCurrency(offer.targetAmount)}</span>
                    <span>Raised: {formatCurrency(offer.raisedAmount)}</span>
                  </div>
                </div>

                {/* Investment Limits */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-subtle)',
                    padding: '14px',
                    borderRadius: '10px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px'
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Min. Investment</div>
                    <strong style={{ fontSize: '15px' }}>{formatCurrency(offer.minInvestment)}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Max. Investment</div>
                    <strong style={{ fontSize: '15px' }}>{formatCurrency(offer.maxInvestment)}</strong>
                  </div>
                </div>

                {/* Primary Invest Now CTA */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleInvestClick}
                >
                  Invest Now
                </Button>

                {!isAuthenticated && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                    You will be prompted to login or register first.
                  </p>
                )}
              </div>

              {/* Dynamic Investment Calculator Component */}
              <InvestmentCalculator offer={offer} />
            </div>
          </div>
        </div>
      </main>

      {/* Investment Checkout Modal */}
      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        offer={offer}
        onInvestmentSuccess={(data) => {
          // Refresh offer data to show updated raised amount
          setOffer((prev) => ({
            ...prev,
            raisedAmount: prev.raisedAmount + data.amountInvested
          }));
        }}
      />

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .details-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
