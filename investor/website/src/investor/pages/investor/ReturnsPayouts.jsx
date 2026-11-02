import React, { useState, useEffect } from 'react';
import { Coins, Calendar, CheckCircle2, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
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
    totalReceived: 2000,
    totalScheduled: 12000,
    totalExpectedReturns: 14000,
    upcomingCount: 2,
    completedCount: 2
  };

  const currentList = activeTab === 'upcoming'
    ? payoutData?.upcomingPayouts || []
    : payoutData?.completedPayouts || [];

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

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px'
          }}
        >
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

        {/* Payout List */}
        {currentList.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} payouts found`}
            description={`There are currently no records under ${activeTab} payouts.`}
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
                    <th style={{ padding: '12px 16px' }}>Opportunity</th>
                    <th style={{ padding: '12px 16px' }}>Payout Type</th>
                    <th style={{ padding: '12px 16px' }}>Amount</th>
                    <th style={{ padding: '12px 16px' }}>Account</th>
                    {activeTab === 'completed' && <th style={{ padding: '12px 16px' }}>UTR / Reference</th>}
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((payout) => (
                    <tr key={payout._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                        {formatDate(payout.scheduledDate || payout.paidDate)}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                        {payout.offerTitle || 'Company Investment'}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                        {payout.payoutType}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: activeTab === 'completed' ? '#10B981' : 'var(--text-main)' }}>
                        {formatCurrency(payout.amount)}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        A/c ending in •••• {payout.bankAccountEnding || '4210'}
                      </td>
                      {activeTab === 'completed' && (
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>
                          {payout.utrNumber || 'CMS90182736192'}
                        </td>
                      )}
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge badge-${payout.status.toLowerCase()}`}>
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
