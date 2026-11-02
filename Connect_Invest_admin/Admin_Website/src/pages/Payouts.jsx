import React, { useState, useEffect } from 'react';
import {
  Coins,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  CheckCheck,
  Filter,
  Info
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Payouts() {
  const toast = useToast();
  const [payouts, setPayouts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Tab switch within Returns & Payouts
  const [viewTab, setViewTab] = useState('verification'); // 'verification' (all returns) or 'batches'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, bRes] = await Promise.all([
        adminApi.getPayouts(),
        adminApi.getBatches()
      ]);
      if (pRes.data.success) setPayouts(pRes.data.payouts || []);
      if (bRes.data.success) setBatches(bRes.data.batches || []);
    } catch (err) {
      console.error('Failed to load payouts & batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered return lines
  const filteredPayouts = payouts.filter(p => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return p.status === 'Calculated' || p.status === 'Failed';
    if (statusFilter === 'READY') return p.status === 'Ready';
    if (statusFilter === 'IN_BATCH') return p.status === 'In batch' || p.status === 'Approved';
    if (statusFilter === 'PAID') return p.status === 'Paid';
    return true;
  });

  const pendingVerification = payouts.filter(p => p.status === 'Calculated' || p.status === 'Failed');
  const readyPayouts = payouts.filter(p => p.status === 'Ready');
  const readyTotalPaise = readyPayouts.reduce((acc, p) => acc + p.amountPaise, 0);
  const pendingTotalPaise = pendingVerification.reduce((acc, p) => acc + p.amountPaise, 0);

  // Admin Single Return Verification
  const handleVerifySingle = async (payoutId, amount) => {
    try {
      setSubmitting(true);
      const res = await adminApi.verifyPayout(payoutId, { remarks: 'Verified by Administrator' });
      if (res.data.success) {
        toast.success(`Verified return: ${formatINR(amount)}. Ready for batch disbursement.`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Admin Verify All Returns
  const handleVerifyAll = async () => {
    if (pendingVerification.length === 0) {
      toast.info('No returns currently pending verification.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await adminApi.verifyAllPayouts();
      if (res.data.success) {
        toast.success(res.data.message || `Verified ${pendingVerification.length} investor returns!`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to verify all returns');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBatch = async () => {
    if (readyPayouts.length === 0) {
      toast.warning('No return payouts are in READY status. Please verify investor returns first.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminApi.createPayoutBatch();
      if (res.data.success) {
        toast.success(res.data.message || 'Payout batch created successfully');
        fetchData();
        setViewTab('batches');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveAndSendBatch = async batchId => {
    try {
      setSubmitting(true);
      const res = await adminApi.approveAndSendBatch(batchId);
      if (res.data.success) {
        toast.success(res.data.message || 'Batch dispatched successfully');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to dispatch batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryPayout = async payoutId => {
    try {
      const res = await adminApi.retryPayout(payoutId);
      if (res.data.success) {
        toast.success('Payout status reset to READY for the next batch!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to retry payout');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Returns & Investor Payouts
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Review and verify investor return calculations from company repayments before compiling payment batches.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Subtabs Switcher */}
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '4px' }}>
            <button
              onClick={() => setViewTab('verification')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: viewTab === 'verification' ? '#0047BA' : 'transparent',
                color: viewTab === 'verification' ? '#FFFFFF' : '#64748B',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Verify Returns ({payouts.length})
            </button>
            <button
              onClick={() => setViewTab('batches')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: viewTab === 'batches' ? '#0047BA' : 'transparent',
                color: viewTab === 'batches' ? '#FFFFFF' : '#64748B',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Disbursement Batches ({batches.length})
            </button>
          </div>

          {/* Quick Actions */}
          {viewTab === 'verification' && pendingVerification.length > 0 && (
            <button
              onClick={handleVerifyAll}
              disabled={submitting}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: '#10B981',
                color: '#059669',
                fontWeight: 700
              }}
            >
              <CheckCheck size={16} />
              <span>Verify All ({pendingVerification.length})</span>
            </button>
          )}

          <button
            onClick={handleCreateBatch}
            disabled={submitting || readyPayouts.length === 0}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Send size={15} />
            <span>Create Batch ({readyPayouts.length} Ready • {formatINR(readyTotalPaise)})</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Awaiting Verification</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
            {pendingVerification.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {formatINR(pendingTotalPaise)} calculated returns
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Verified & Ready for Batch</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {readyPayouts.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {formatINR(readyTotalPaise)} approved funds
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #6366F1' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>In Active Batches</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4F46E5', marginTop: '4px' }}>
            {payouts.filter(p => p.status === 'In batch' || p.status === 'Approved').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Escrow release in progress
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #0047BA' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Paid Disbursed</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0047BA', marginTop: '4px' }}>
            {payouts.filter(p => p.status === 'Paid').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Direct investor bank settlements
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {/* Verification Filters Row */}
        {viewTab === 'verification' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Returns' },
                { id: 'PENDING', label: `Pending Verification (${pendingVerification.length})` },
                { id: 'READY', label: `Verified Ready (${readyPayouts.length})` },
                { id: 'IN_BATCH', label: 'In Batch' },
                { id: 'PAID', label: 'Disbursed Paid' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: statusFilter === f.id ? '#0047BA' : '#E2E8F0',
                    backgroundColor: statusFilter === f.id ? '#EFF6FF' : '#FFFFFF',
                    color: statusFilter === f.id ? '#0047BA' : '#64748B',
                    transition: 'all 0.15s'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748B' }}>
              <Info size={14} />
              <span>Admin verification validates return calculation before bank release</span>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading investor returns & disbursement data...
          </div>
        ) : viewTab === 'verification' ? (
          filteredPayouts.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No returns found matching the selected filter.
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                    <th>Investor Name & Contact</th>
                    <th>Opportunity / Project</th>
                    <th>Return Cycle / Due</th>
                    <th>Calculated Return</th>
                    <th>Verification Status</th>
                    <th>Bank Reference / Notes</th>
                    <th>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((p, idx) => {
                    const isPending = p.status === 'Calculated' || p.status === 'Failed';
                    const isReady = p.status === 'Ready';
                    const isPaid = p.status === 'Paid';
                    const isInBatch = p.status === 'In batch' || p.status === 'Approved';

                    return (
                      <tr key={p._id}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {p.investorId?.name || 'Verified Investor'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {p.investorId?.email || 'N/A'} • {p.investorId?.mobile || ''}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>
                            {p.offerId?.title || 'Investment Offer'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Type: {p.payoutType === 'dividend' ? 'Equity Dividend' : 'Monthly Project Return'}
                          </div>
                        </td>
                        <td>
                          <div>
                            {p.repaymentId?.dueDate
                              ? new Date(p.repaymentId.dueDate).toLocaleDateString()
                              : 'Active Cycle'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                            Company Repayment Confirmed
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0047BA' }}>
                            {formatINR(p.amountPaise)}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isPaid ? 'badge-emerald' :
                              isReady ? 'badge-cyan' :
                              isInBatch ? 'badge-indigo' :
                              p.status === 'Failed' ? 'badge-rose' : 'badge-amber'
                            }`}
                          >
                            {isPending ? 'Pending Verification' : isReady ? 'Verified (Ready)' : p.status}
                          </span>
                        </td>
                        <td>
                          {isPaid && (
                            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#059669' }}>
                              {p.bankRef}
                            </span>
                          )}
                          {isPending && (
                            <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>
                              Awaiting admin confirmation
                            </span>
                          )}
                          {isReady && (
                            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                              ✓ Approved for batch
                            </span>
                          )}
                          {isInBatch && (
                            <span style={{ fontSize: '0.75rem', color: '#4F46E5' }}>
                              Queued in active batch
                            </span>
                          )}
                        </td>
                        <td>
                          {isPending && (
                            <button
                              onClick={() => handleVerifySingle(p._id, p.amountPaise)}
                              disabled={submitting}
                              className="btn-primary"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: '#10B981'
                              }}
                            >
                              <ShieldCheck size={14} />
                              <span>Verify Return</span>
                            </button>
                          )}
                          {p.status === 'Failed' && (
                            <button
                              onClick={() => handleRetryPayout(p._id)}
                              className="btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '0.75rem', marginLeft: '6px' }}
                            >
                              Retry
                            </button>
                          )}
                          {isReady && (
                            <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                              Ready for Batch
                            </span>
                          )}
                          {isPaid && (
                            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Settled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Batches History Tab */
          batches.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No payout batches compiled yet. Verify returns to build the first batch.
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                    <th>Batch ID</th>
                    <th>Created By</th>
                    <th>Verified Payouts</th>
                    <th>Total Batch Value</th>
                    <th>Disbursement Status</th>
                    <th>UTR / Gateway Reference</th>
                    <th>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b, idx) => (
                    <tr key={b._id}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {b._id}
                      </td>
                      <td>{b.adminId?.name || 'Administrator'}</td>
                      <td style={{ fontWeight: 600 }}>{b.payoutCount} returns</td>
                      <td style={{ fontWeight: 800, color: '#0047BA' }}>{formatINR(b.totalPaise)}</td>
                      <td>
                        <span className={`badge ${b.status === 'Paid' ? 'badge-emerald' : 'badge-amber'}`}>
                          {b.status === 'Paid' ? 'Dispatched & Settled' : b.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {b.reference || 'Awaiting Authorization'}
                      </td>
                      <td>
                        {b.status !== 'Paid' && (
                          <button
                            onClick={() => handleApproveAndSendBatch(b._id)}
                            disabled={submitting}
                            className="btn-primary"
                            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                          >
                            Authorize & Release
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
