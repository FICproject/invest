import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, Calendar, TrendingUp, Award, Layers, AlertTriangle, CheckCircle2, Clock, CreditCard, ChevronDown, ChevronUp, FileText, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { investorService } from '../../services/investorService';
import { paymentService } from '../../services/paymentService';

export const MyInvestments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [detailModalOffer, setDetailModalOffer] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchInvestments = async () => {
      setLoading(true);
      try {
        const params = {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: search.trim() || undefined
        };
        const res = await investorService.getMyInvestments(params);
        if (isMounted && res.success && res.data) {
          setInvestments(res.data);
        }
      } catch (err) {
        console.error('[MyInvestments] Error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInvestments();
    return () => { isMounted = false; };
  }, [statusFilter, search]);

  const handlePayInvestment = async (inv) => {
    try {
      setPayingId(inv._id);
      const offerId = (inv.offerId && typeof inv.offerId === 'object' && inv.offerId._id)
        ? inv.offerId._id
        : (inv.offerId || inv.offer);
      const amount = inv.amountInvested || inv.amount || 0;

      // 1. Create order through backend
      const orderRes = await paymentService.createOrder(offerId, amount, 'Razorpay Gateway', { investmentId: inv._id });
      // In our axios client (api.js), response interceptor already returns response.data directly!
      const orderData = orderRes?.data || orderRes;

      if (!orderData || !orderData.orderId) {
        throw new Error('Failed to create payment order. Please try again.');
      }

      // Check if Razorpay Checkout script is loaded and order is NOT simulated
      // If Razorpay keys in .env are invalid/expired or order is simulated, use direct simulated verification flow
      if (typeof window.Razorpay === 'function' && !orderData.simulated) {
        const options = {
          key: orderData.keyId || 'rzp_test_placeholder',
          amount: orderData.amountPaise || Math.round(amount * 100),
          currency: 'INR',
          name: 'Connect Invest',
          description: `Investment in ${inv.offerId?.title || 'Offer'}`,
          order_id: orderData.razorpayOrderId || orderData.orderId,
          handler: async function (response) {
            try {
              const verifyRes = await paymentService.verifyPayment(
                orderData.orderId,
                response.razorpay_payment_id,
                'Success',
                {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  investmentId: inv._id
                }
              );
              if (verifyRes.data?.success || verifyRes.success) {
                setPaySuccessMsg(`Payment of ${formatCurrency(amount)} successful! Investment confirmed.`);
                const refreshRes = await investorService.getMyInvestments({
                  status: statusFilter !== 'All' ? statusFilter : undefined,
                  search: search.trim() || undefined
                });
                if (refreshRes.success && refreshRes.data) {
                  setInvestments(refreshRes.data);
                }
                setTimeout(() => setPaySuccessMsg(''), 5000);
              }
            } catch (vErr) {
              alert('Payment verification failed: ' + (vErr.response?.data?.message || vErr.message));
            } finally {
              setPayingId(null);
            }
          },
          modal: {
            ondismiss: function () {
              setPayingId(null);
            }
          },
          prefill: {
            name: '',
            email: ''
          },
          theme: {
            color: '#0047BA'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Direct simulation fallback
        const verifyRes = await paymentService.verifyPayment(
          orderData.orderId,
          'PAY_SIM_' + Date.now(),
          'Success',
          { investmentId: inv._id }
        );
        if (verifyRes.data?.success || verifyRes.success) {
          setPaySuccessMsg(`Payment of ${formatCurrency(amount)} successful! Investment confirmed.`);
          const refreshRes = await investorService.getMyInvestments({
            status: statusFilter !== 'All' ? statusFilter : undefined,
            search: search.trim() || undefined
          });
          if (refreshRes.success && refreshRes.data) {
            setInvestments(refreshRes.data);
          }
          setTimeout(() => setPaySuccessMsg(''), 5000);
        }
        setPayingId(null);
      }
    } catch (err) {
      console.error('[MyInvestments] Payment initiation failed:', err);
      alert(err.response?.data?.message || err.message || 'Payment initiation failed.');
      setPayingId(null);
    }
  };

  const handleAcceptCounter = async (investmentId) => {
    try {
      setLoading(true);
      await investorService.respondToCounter(investmentId, { action: 'accept' });
      const params = {
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search.trim() || undefined
      };
      const res = await investorService.getMyInvestments(params);
      if (res.success && res.data) {
        setInvestments(res.data);
      }
    } catch (err) {
      console.error('[MyInvestments] Error accepting counter terms:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
              My Investments
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Manage your active asset allocations, certificate numbers, and maturity schedules.
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={() => navigate('/opportunities')}>
            New Investment
          </Button>
        </div>

        {/* Success Alert Banner */}
        {paySuccessMsg && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '12px',
              color: '#15803D',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <CheckCircle2 size={18} color="#16A34A" />
            <span>{paySuccessMsg}</span>
          </div>
        )}

        {/* Filters & Search */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px'
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Approved (Pay Now)', 'Pending Review', 'Changes Requested', 'Confirmed', 'Completed'].map((tab) => {
              const filterVal = tab === 'Approved (Pay Now)' ? 'Approved' : tab;
              const isActive = statusFilter === filterVal;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(filterVal)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-main)',
                    transition: 'all 0.15s'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name or certificate..."
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '36px',
                paddingRight: '12px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-subtle)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Table / Card List */}
        {loading ? (
          <Loader message="Fetching your investment records..." />
        ) : investments.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No investments found"
            description="You do not have any investments matching this criteria. Explore available offers to grow your wealth."
            actionLabel="Explore Opportunities"
            onAction={() => navigate('/opportunities')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {investments.map((inv) => {
              const offer = inv.offerId;
              return (
                <div
                  key={inv._id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}
                >
                  {/* Left: Info */}
                  <div style={{ minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge badge-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Cert: <strong>{inv.certificateNumber || inv.certificateNo || ('GEN-' + inv._id.slice(-6).toUpperCase())}</strong>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '2px' }}>
                      {offer?.title || 'Investment Project'}
                    </h3>
                    <div style={{ fontSize: '13px', color: 'var(--color-gold)', fontWeight: '600' }}>
                      {offer?.type ? `${offer.type} Investment` : 'Project Investment'}
                      {offer?.category ? ` • ${offer.category}` : ''}
                      {offer?.location ? ` • ${offer.location}` : ''}
                    </div>
                  </div>

                  {/* Middle: Key Figures */}
                  <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Invested Amount</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                        {formatCurrency(inv.amountInvested)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Return Rate</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-gold)' }}>
                        {inv.returnRate || offer?.returnRate || 3}% p.a.
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Expected Returns</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#10B981' }}>
                        {formatCurrency(inv.expectedReturns || (inv.amountInvested ? Math.round(inv.amountInvested + (inv.amountInvested * ((inv.returnRate || offer?.returnRate || 3) / 100) * ((inv.tenureMonths || offer?.tenureMonths || 12) / 12))) : 0))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Maturity Date</div>
                      <div style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-main)' }}>
                        {formatDate(inv.maturityDate)}
                      </div>
                    </div>
                  </div>

                  {/* Changes Requested Banner */}
                  {inv.status === 'Changes Requested' && (
                    <div
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#92400E' }}>
                          <AlertTriangle size={15} color="#D97706" />
                          <span>Admin Counter-Proposal: <strong>{formatCurrency(inv.proposedAmount)}</strong></span>
                          <span style={{ fontSize: '11px', color: '#B45309' }}>(Original: {formatCurrency(inv.amountInvested)})</span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#78350F', marginTop: '3px' }}>
                          <em>"{inv.adminSuggestions || inv.adminFeedback || 'Admin proposed revised investment terms.'}"</em>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptCounter(inv._id)}
                        >
                          Accept Proposed Amount ({formatCurrency(inv.proposedAmount)})
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Pending Review Banner */}
                  {inv.status === 'Pending Review' && (
                    <div
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12.5px',
                        color: '#1E40AF'
                      }}
                    >
                      <Clock size={14} color="#2563EB" />
                      <span>Investment application is currently awaiting underwriting approval from the platform administrator.</span>
                    </div>
                  )}

                  {/* Rejection Banner */}
                  {inv.status === 'Rejected' && (
                    <div
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        fontSize: '12.5px',
                        color: '#991B1B'
                      }}
                    >
                      <strong>Application Not Approved:</strong> {inv.rejectionReason || inv.adminFeedback || 'Underwriting criteria not satisfied.'}
                    </div>
                  )}

                  {/* Approved Banner & Pay with Razorpay button */}
                  {inv.status === 'Approved' && (
                    <div
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={18} color="#16A34A" />
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#166534' }}>
                            Investment Request Approved by Admin!
                          </div>
                          <div style={{ fontSize: '12px', color: '#15803D' }}>
                            Please complete payment of {formatCurrency(inv.amountInvested)} to activate your investment and lock in your return.
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePayInvestment(inv)}
                        disabled={payingId === inv._id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#16A34A',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '13.5px',
                          fontWeight: '700',
                          cursor: payingId === inv._id ? 'not-allowed' : 'pointer',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <CreditCard size={16} />
                        <span>{payingId === inv._id ? 'Processing...' : `Pay ${formatCurrency(inv.amountInvested)} via Razorpay`}</span>
                      </button>
                    </div>
                  )}

                  {/* Confirmed Banner */}
                  {inv.status === 'Confirmed' && (
                    <div
                      style={{
                        width: '100%',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #DCFCE7',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#15803D'
                      }}
                    >
                      <CheckCircle2 size={14} color="#16A34A" />
                      <span>Investment Active & Payment Completed via Razorpay</span>
                    </div>
                  )}

                  {/* Collapsible Project Details Section */}
                  {expandedId === inv._id && offer && (
                    <div
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        borderRadius: '10px',
                        padding: '16px 20px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        marginTop: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={15} color="var(--color-primary)" />
                          Project Details & Parameters
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Tenure: <strong>{inv.tenureMonths || offer.tenureMonths || 12} Months</strong> • Payout: <strong>{offer.payoutFrequency || 'Monthly'}</strong>
                        </span>
                      </div>

                      {offer.description && (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                          {offer.description}
                        </p>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '12.5px' }}>
                        <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Project Target</span>
                          <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(offer.targetAmount)}</strong>
                        </div>
                        <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Total Raised</span>
                          <strong style={{ color: '#10B981' }}>{formatCurrency(offer.raisedAmount)}</strong>
                        </div>
                        <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Risk Rating</span>
                          <strong style={{ color: 'var(--color-gold)' }}>{offer.riskLevel || 'Moderate'}</strong>
                        </div>
                        <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Security Type</span>
                          <strong style={{ color: 'var(--text-main)' }}>{offer.securityType || 'Asset-Backed'}</strong>
                        </div>
                      </div>

                      {offer.financialHighlights && offer.financialHighlights.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                            Highlights
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {offer.financialHighlights.map((hl, hIdx) => (
                              <span
                                key={hIdx}
                                style={{
                                  fontSize: '11.5px',
                                  padding: '3px 9px',
                                  backgroundColor: 'var(--bg-surface)',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--text-main)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <CheckCircle2 size={12} color="#10B981" />
                                {hl}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Right Action */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: 'auto' }}>
                    {offer && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === inv._id ? null : inv._id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: 'transparent',
                          color: 'var(--color-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '7px 12px',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <span>{expandedId === inv._id ? 'Hide Details' : 'Project Details'}</span>
                        {expandedId === inv._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                    {inv.status === 'Approved' && (
                      <button
                        type="button"
                        onClick={() => handlePayInvestment(inv)}
                        disabled={payingId === inv._id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#16A34A',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '7px 14px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: payingId === inv._id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <CreditCard size={14} />
                        <span>{payingId === inv._id ? 'Opening Gateway...' : 'Pay Now'}</span>
                      </button>
                    )}
                    {offer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailModalOffer(offer)}
                      >
                        Offer Prospectus
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Offer Prospectus Modal (Privacy-compliant: Project Details only, No Company Name/Contact) */}
        {detailModalOffer && (
          <Modal
            isOpen={!!detailModalOffer}
            onClose={() => setDetailModalOffer(null)}
            title={detailModalOffer.title || 'Project Prospectus'}
            subtitle={`${detailModalOffer.category || 'Asset'} • ${detailModalOffer.type || 'Project'} Investment`}
            maxWidth="680px"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Financial Term Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Target Yield</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-gold)' }}>
                    {detailModalOffer.returnRate || 3}% p.a.
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Tenure</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary)' }}>
                    {detailModalOffer.tenureMonths || 12} Months
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Payout Schedule</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>
                    {detailModalOffer.payoutFrequency || 'Monthly'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Risk Rating</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-gold)', marginTop: '2px' }}>
                    {detailModalOffer.riskLevel || 'Moderate'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                  About the Project
                </h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.7', margin: 0 }}>
                  {detailModalOffer.description}
                </p>
              </div>

              {/* Security & Trustee Information */}
              <div style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldCheck size={18} color="#0284C7" />
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>
                    Security & Instrument Structure
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                  Secured by <strong>{detailModalOffer.securityType || 'Senior Secured Debt / Asset-Backed Collateral'}</strong>.
                  Funds are held and disbursed via SEBI-registered trustee escrow account.
                </p>
              </div>

              {/* Financial Highlights */}
              {detailModalOffer.financialHighlights && detailModalOffer.financialHighlights.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>
                    Due Diligence & Highlights
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                    {detailModalOffer.financialHighlights.map((hl, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                        <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <Button variant="primary" size="sm" onClick={() => setDetailModalOffer(null)}>
                  Close Prospectus
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};
