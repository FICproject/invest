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
  Info,
  Search,
  Pause,
  Play
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';
import { RazorpayAdminDisburseModal } from '../components/RazorpayAdminDisburseModal';

export default function Payouts() {
  const toast = useToast();
  const [payouts, setPayouts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [companyAgreements, setCompanyAgreements] = useState([]);
  const [companyPayments, setCompanyPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [activeRazorpayPayout, setActiveRazorpayPayout] = useState(null);

  // Tab switch: 'verification' (investor returns) or 'company_returns' (company obligations) or 'batches'
  const [viewTab, setViewTab] = useState('company_returns');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, bRes, cRes] = await Promise.all([
        adminApi.getPayouts(),
        adminApi.getBatches(),
        adminApi.getCompanyReturns().catch(() => ({ data: { agreements: [], payments: [] } }))
      ]);
      if (pRes.data.success) setPayouts(pRes.data.payouts || []);
      if (bRes.data.success) setBatches(bRes.data.batches || []);
      if (cRes.data.success) {
        setCompanyAgreements(cRes.data.agreements || []);
        setCompanyPayments(cRes.data.payments || []);
      }
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
    if (statusFilter === 'PENDING' && !(p.status === 'Calculated' || p.status === 'Failed')) return false;
    if (statusFilter === 'READY' && p.status !== 'Ready') return false;
    if (statusFilter === 'IN_BATCH' && !(p.status === 'In batch' || p.status === 'Approved')) return false;
    if (statusFilter === 'PAID' && p.status !== 'Paid') return false;
    if (statusFilter === 'HOLD' && !(p.isHold || p.status === 'On Hold')) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const investorName = (p.investorId?.name || '').toLowerCase();
    const investorEmail = (p.investorId?.email || '').toLowerCase();
    const offerTitle = (p.offerId?.title || '').toLowerCase();
    const utr = (p.utrNumber || p.disbursementReference || '').toLowerCase();
    const acct = (p.bankAccountEnding || '').toLowerCase();
    return investorName.includes(q) || investorEmail.includes(q) || offerTitle.includes(q) || utr.includes(q) || acct.includes(q);
  });

  const filteredBatches = batches.filter(b => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const batchId = (b.batchId || b._id || '').toLowerCase();
    const ref = (b.reference || '').toLowerCase();
    const admin = (b.adminId?.name || '').toLowerCase();
    return batchId.includes(q) || ref.includes(q) || admin.includes(q);
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

  // Admin Hold / Unhold Return
  const handleToggleHold = async (payout) => {
    const isCurrentlyHold = payout.isHold || payout.status === 'On Hold';
    const actionLabel = isCurrentlyHold ? 'release from hold' : 'place on hold';
    const reason = !isCurrentlyHold
      ? window.prompt('Reason for holding this investor return (optional):', 'Reviewing investor details / compliance hold')
      : null;
    
    if (!isCurrentlyHold && reason === null) return; // cancelled prompt

    try {
      setSubmitting(true);
      const res = await adminApi.togglePayoutHold(payout._id, { reason });
      if (res.data.success) {
        toast.success(res.data.message || `Return ${actionLabel} successfully.`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${actionLabel}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger auto returns calculation
  const handlePaySingleReturn = (payout) => {
    const amt = payout.amountPaise ? payout.amountPaise / 100 : (payout.amount || 0);
    setActiveRazorpayPayout({
      id: payout._id,
      amount: amt,
      title: `${payout.payoutType || 'Monthly Interest'} Return Disbursal`,
      recipientName: payout.investorId?.name || 'Investor Beneficiary',
      accountNumber: payout.investorId?.bankAccount || 'Bank / Linked UPI'
    });
  };

  const handleExecutePayoutSuccess = async (result) => {
    if (!activeRazorpayPayout) return;
    try {
      setSubmitting(true);
      const res = await adminApi.paySingleReturn(activeRazorpayPayout.id, {
        reference: result.utrNumber,
        paymentMethod: result.method || 'Razorpay Payouts (Direct Bank Settlement)',
        remarks: 'Disbursed via Razorpay Payouts by Administrator'
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Return successfully disbursed via Razorpay!');
        setActiveRazorpayPayout(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete Razorpay payout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCalculateReturns = async () => {
    try {
      setSubmitting(true);
      const res = await adminApi.triggerAutoMonthlyReturns();
      if (res.data.success) {
        toast.success(res.data.message || 'Monthly return cycles synchronized for admin review!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to calculate returns');
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
    <div className="page-container">
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Quick Actions */}
          {pendingVerification.length > 0 && (
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
              <span>Verify All Due Returns ({pendingVerification.length})</span>
            </button>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
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
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Verified & Ready for Disbursal</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {readyPayouts.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {formatINR(readyTotalPaise)} approved funds
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

      {/* Module Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
        <button
          onClick={() => setViewTab('company_returns')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: viewTab === 'company_returns' ? '#0047BA' : 'transparent',
            color: viewTab === 'company_returns' ? '#FFFFFF' : '#64748B'
          }}
        >
          Company Return Obligations ({companyAgreements.length})
        </button>
        <button
          onClick={() => setViewTab('verification')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            backgroundColor: viewTab === 'verification' ? '#0047BA' : 'transparent',
            color: viewTab === 'verification' ? '#FFFFFF' : '#64748B'
          }}
        >
          Investor Payout Verification ({payouts.length})
        </button>
      </div>

      {viewTab === 'company_returns' ? (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Company Monthly Return Obligations (Section 2, 3 & 7)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Monitor active return agreements generated upon capital disbursement. Track monthly return payments collected from companies via Razorpay.
            </p>
          </div>

          {companyAgreements.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No company return obligations active. When admin approves a fund release for a fixed-term agreement, return obligations activate automatically.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table" style={{ width: '100%', fontSize: '0.825rem' }}>
                <thead>
                  <tr>
                    <th>Agreement #</th>
                    <th>Borrower Company</th>
                    <th>Investor</th>
                    <th>Principal Disbursed</th>
                    <th>Agreed Rate</th>
                    <th>Monthly Return</th>
                    <th>Next Due Date</th>
                    <th>Total Returns Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {companyAgreements.map((agr) => (
                    <tr key={agr._id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0047BA' }}>
                        {agr.agreementNumber}
                      </td>
                      <td style={{ fontWeight: 600 }}>{agr.companyId?.name || agr.companyId?.legalName || 'Company'}</td>
                      <td>{agr.investorId?.fullName || agr.investorId?.name || 'Investor'}</td>
                      <td style={{ fontWeight: 700 }}>{formatINR(agr.principalAmountPaise || agr.principalAmount * 100)}</td>
                      <td>
                        <span className="badge badge-info">{agr.agreedMonthlyRate}% / mo</span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>
                        {formatINR(agr.monthlyReturnAmountPaise || agr.monthlyReturnAmount * 100)}
                      </td>
                      <td style={{ color: '#D97706', fontWeight: 600 }}>
                        {agr.nextDueDate ? new Date(agr.nextDueDate).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>
                        {formatINR(agr.totalReturnsPaidPaise || (agr.totalReturnsPaid || 0) * 100)}
                      </td>
                      <td>
                        <span className={`badge badge-${agr.agreementStatus === 'Active' ? 'success' : 'neutral'}`}>
                          {agr.agreementStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Main Content Area */
        <div className="glass-panel" style={{ padding: '24px' }}>
        {/* Verification Filters Row & In-Page Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All Returns (${payouts.length})` },
              { id: 'PENDING', label: `Pending Verification (${pendingVerification.length})` },
              { id: 'READY', label: `Verified Ready (${readyPayouts.length})` },
              { id: 'PAID', label: 'Disbursed Paid' },
              { id: 'HOLD', label: `On Hold (${payouts.filter(p => p.isHold || p.status === 'On Hold').length})` }
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

          {/* In-page Search Input */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search investor, offer, UTR..."
              className="input-field"
              style={{ width: '100%', height: '38px', paddingLeft: '36px', fontSize: '0.825rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading investor returns & disbursement data...
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {search.trim() ? `No returns match "${search}". Try adjusting your query.` : 'No returns found matching the selected filter.'}
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>S.No</th>
                    <th>Investor Name & Contact</th>
                    <th>Opportunity / Project</th>
                    <th>Invested Capital</th>
                    <th>Rate of Return</th>
                    <th>Tenure & Remaining</th>
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

                    const investedCapitalPaise =
                      p.investedAmountPaise ||
                      p.investmentId?.amountPaise ||
                      (p.investmentId?.amount ? Math.round(p.investmentId.amount * 100) : 0) ||
                      (p.investedAmount ? Math.round(p.investedAmount * 100) : 0);

                    const rate = p.returnRate || p.ratePercent || (p.offerId?.rateBps ? p.offerId.rateBps / 100 : 12);
                    const totalTenure = p.tenureMonths || p.investmentId?.tenureMonths || p.offerId?.tenures?.[0] || 12;
                    const remaining = p.remainingTenureMonths != null ? p.remainingTenureMonths : totalTenure;

                    return (
                      <tr key={p._id}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.investorId?.name || 'Investor'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.investorId?.email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.projectTitle || p.offerId?.title || 'Offer'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : (p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString() : 'Monthly Return')}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
                          {investedCapitalPaise > 0 ? formatINR(investedCapitalPaise) : '—'}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#ECFDF5',
                            color: '#059669',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}>
                            {rate}% p.a.
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>{totalTenure} Months</div>
                          <div style={{ fontSize: '0.72rem', color: remaining > 0 ? '#2563EB' : '#059669', fontWeight: 600 }}>
                            {remaining > 0 ? `${remaining} mo remaining` : 'Matured'}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#0047BA', fontSize: '0.95rem' }}>
                          {formatINR(p.amountPaise || (p.amount ? Math.round(p.amount * 100) : 0))}
                        </td>
                        <td>
                          <span className={`badge ${
                            isPaid ? 'badge-emerald' : isReady ? 'badge-indigo' : isInBatch ? 'badge-blue' : 'badge-amber'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                            {p.utrNumber || p.disbursementReference || 'Pending Batch'}
                          </div>
                          {p.remarks && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.remarks}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {isPending && (
                              <button
                                onClick={() => handleVerifySingle(p._id, p.amountPaise)}
                                disabled={submitting}
                                className="btn-primary"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.75rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backgroundColor: '#10B981'
                                }}
                                title="Verify return calculations and approve for payout"
                              >
                                <ShieldCheck size={13} />
                                <span>Verify</span>
                              </button>
                            )}

                            {!isPaid && (
                              <button
                                onClick={() => handlePaySingleReturn(p)}
                                disabled={submitting || p.isHold || p.status === 'On Hold'}
                                className="btn-primary"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.75rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backgroundColor: '#0047BA'
                                }}
                                title="Disburse return payout directly to investor linked bank account via Razorpay"
                              >
                                <Send size={13} />
                                <span>Pay via Razorpay</span>
                              </button>
                            )}

                            {!isPaid && (
                              <button
                                onClick={() => handleToggleHold(p)}
                                disabled={submitting}
                                className="btn-secondary"
                                style={{
                                  padding: '5px 8px',
                                  fontSize: '0.75rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  borderColor: p.isHold || p.status === 'On Hold' ? '#10B981' : '#F59E0B',
                                  color: p.isHold || p.status === 'On Hold' ? '#059669' : '#D97706',
                                  backgroundColor: p.isHold || p.status === 'On Hold' ? '#ECFDF5' : '#FFFBEB'
                                }}
                                title={p.isHold || p.status === 'On Hold' ? 'Release return from Hold' : 'Place return On Hold'}
                              >
                                {p.isHold || p.status === 'On Hold' ? <Play size={12} /> : <Pause size={12} />}
                                <span>{p.isHold || p.status === 'On Hold' ? 'Resume' : 'Hold'}</span>
                              </button>
                            )}

                            {p.status === 'Failed' && (
                              <button
                                onClick={() => handleRetryPayout(p._id)}
                                className="btn-secondary"
                                style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                              >
                                Retry
                              </button>
                            )}

                            {isPaid && (
                              <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={13} /> Settled
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Razorpay Disbursal Modal */}
      <RazorpayAdminDisburseModal
        isOpen={!!activeRazorpayPayout}
        onClose={() => setActiveRazorpayPayout(null)}
        disburseData={activeRazorpayPayout}
        onSuccess={handleExecutePayoutSuccess}
      />
    </div>
  );
}
