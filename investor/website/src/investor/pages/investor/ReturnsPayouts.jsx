import React, { useState, useEffect } from 'react';
import { Coins, Calendar, CheckCircle2, Clock, AlertCircle, ArrowUpRight, Search } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { payoutService } from '../../services/payoutService';

export const ReturnsPayouts = () => {
  const [payoutData, setPayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed'
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchPayouts = async () => {
      try {
        const res = await payoutService.getPayouts();
        if (isMounted && res.success && res.data) {
          setPayoutData(res.data);
        }
      } catch (err) {
        console.error('[ReturnsPayouts] Error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPayouts();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading your returns and payout schedule..." />
      </DashboardLayout>
    );
  }

  const metrics = payoutData?.metrics || {
    totalReceived: 0,
    totalScheduled: 0,
    totalExpectedReturns: 0,
    upcomingCount: 0,
    completedCount: 0
  };

  const baseList = activeTab === 'upcoming'
    ? payoutData?.upcomingPayouts || []
    : payoutData?.completedPayouts || [];

  const currentList = baseList.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const title = (p.offerTitle || '').toLowerCase();
    const type = (p.payoutType || '').toLowerCase();
    const utr = (p.utrNumber || '').toLowerCase();
    const bank = (p.bankAccountEnding || '').toLowerCase();
    return title.includes(q) || type.includes(q) || utr.includes(q) || bank.includes(q);
  });

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            Returns and Payouts
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Track your received monthly interest distributions, upcoming payout dates, and settlement UTR receipts.
          </p>
        </div>

        {/* Top Summary Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Returns Received</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#10B981' }}>
              {formatCurrency(metrics.totalReceived)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Directly credited to linked bank</div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Upcoming Scheduled Payouts</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-gold)' }}>
              {formatCurrency(metrics.totalScheduled)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{metrics.upcomingCount} distributions queued</div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Lifetime Expected Returns</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>
              {formatCurrency(metrics.totalExpectedReturns)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Principal + interest yield</div>
          </div>
        </div>

        {/* Tab Selector & In-Page Search */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('upcoming')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13.5px',
                backgroundColor: activeTab === 'upcoming' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'upcoming' ? '#FFFFFF' : 'var(--text-muted)',
                transition: 'all 0.15s'
              }}
            >
              Upcoming Payout Schedule ({metrics.upcomingCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13.5px',
                backgroundColor: activeTab === 'completed' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'completed' ? '#FFFFFF' : 'var(--text-muted)',
                transition: 'all 0.15s'
              }}
            >
              Completed Distributions ({metrics.completedCount})
            </button>
          </div>

          {/* In-page search bar */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by opportunity, type, UTR..."
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

        {/* Payout List */}
        {currentList.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} payouts found`}
            description={search.trim() ? `No payout records match "${search}". Try adjusting your search query.` : `There are currently no records under ${activeTab} payouts.`}
          />
        ) : (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Opportunity / Project</th>
                    <th style={{ padding: '12px 16px' }}>Invested Amount</th>
                    <th style={{ padding: '12px 16px' }}>Rate of Return</th>
                    <th style={{ padding: '12px 16px' }}>Tenure & Remaining</th>
                    <th style={{ padding: '12px 16px' }}>Return Amount</th>
                    <th style={{ padding: '12px 16px' }}>Account</th>
                    {activeTab === 'completed' && <th style={{ padding: '12px 16px' }}>UTR / Reference</th>}
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((payout) => {
                    const investedCapital = payout.investedAmount || (payout.investmentId?.amount || payout.investmentId?.amountInvested || (payout.investmentId?.amountPaise ? payout.investmentId.amountPaise / 100 : 0));
                    const project = payout.projectTitle || payout.offerTitle || payout.offerId?.title || payout.investmentId?.offerId?.title || 'Investment Project';
                    const rate = payout.returnRate || payout.ratePercent || (payout.offerId?.rateBps ? payout.offerId.rateBps / 100 : 12);
                    const totalTenure = payout.tenureMonths || payout.investmentId?.tenureMonths || payout.offerId?.tenures?.[0] || 12;
                    const remaining = payout.remainingTenureMonths != null ? payout.remainingTenureMonths : totalTenure;
                    const returnAmount = payout.amount || (payout.amountPaise ? payout.amountPaise / 100 : 0);

                    return (
                      <tr key={payout._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                          {formatDate(payout.scheduledDate || payout.paidDate)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{project}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{payout.payoutType || 'Monthly Return'}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--text-main)' }}>
                          {investedCapital > 0 ? formatCurrency(investedCapital) : '—'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10B981',
                            fontWeight: '700',
                            fontSize: '12px'
                          }}>
                            {rate}% p.a.
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                            {totalTenure} Months
                          </div>
                          <div style={{ fontSize: '11.5px', color: remaining > 0 ? '#3B82F6' : '#10B981', fontWeight: '600' }}>
                            {remaining > 0 ? `${remaining} mo remaining` : 'Matured'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '800', color: activeTab === 'completed' ? '#10B981' : 'var(--color-primary)' }}>
                          {formatCurrency(returnAmount)}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          A/c ending •••• {payout.bankAccountEnding || '—'}
                        </td>
                        {activeTab === 'completed' && (
                          <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>
                            {payout.utrNumber || payout.bankRef || 'Pending Settlement'}
                          </td>
                        )}
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              backgroundColor:
                                payout.status === 'Completed' || payout.status === 'Disbursed to Investor'
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : payout.status === 'Paid by Company' || payout.distributionStatus === 'Received by Platform'
                                  ? 'rgba(59, 130, 246, 0.12)'
                                  : payout.status === 'Delayed'
                                  ? 'rgba(239, 68, 68, 0.12)'
                                  : 'rgba(245, 158, 11, 0.12)',
                              color:
                                payout.status === 'Completed' || payout.status === 'Disbursed to Investor'
                                  ? '#059669'
                                  : payout.status === 'Paid by Company' || payout.distributionStatus === 'Received by Platform'
                                  ? '#2563EB'
                                  : payout.status === 'Delayed'
                                  ? '#DC2626'
                                  : '#D97706',
                              border:
                                payout.status === 'Paid by Company' || payout.distributionStatus === 'Received by Platform'
                                  ? '1px solid rgba(59, 130, 246, 0.25)'
                                  : 'none'
                            }}
                          >
                            {payout.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
