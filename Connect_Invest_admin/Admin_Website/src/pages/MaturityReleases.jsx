import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  Send,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function MaturityReleases() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [counts, setCounts] = useState({ total: 0, ready: 0, released: 0, pending: 0, onHold: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'READY' | 'RELEASED' | 'PENDING' | 'ON_HOLD'

  // Modal for manual release confirmation
  const [selectedForRelease, setSelectedForRelease] = useState(null);
  const [releaseUtr, setReleaseUtr] = useState('');
  const [releaseRemarks, setReleaseRemarks] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getMaturityReleases({ status: statusFilter, search });
      if (res.data?.success) {
        setData(res.data.data || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      }
    } catch (err) {
      console.error('Failed to load maturity releases:', err);
      toast.error('Failed to fetch maturity release records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Execute Release Action
  const handleConfirmRelease = async () => {
    if (!selectedForRelease) return;
    try {
      setSubmitting(true);
      const res = await adminApi.releaseMaturityPrincipal(selectedForRelease.id, {
        utrNumber: releaseUtr.trim() || undefined,
        remarks: releaseRemarks.trim() || undefined
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Maturity principal successfully released to investor!');
        setSelectedForRelease(null);
        setReleaseUtr('');
        setReleaseRemarks('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to release principal funds');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Hold / Resume
  const handleToggleHold = async item => {
    const isCurrentlyHold = item.releaseStatus === 'On Hold';
    const actionLabel = isCurrentlyHold ? 'release from hold' : 'place on hold';
    const reason = !isCurrentlyHold
      ? window.prompt('Reason for placing this maturity release on hold (optional):', 'Reviewing bank details / compliance clearance')
      : null;

    if (!isCurrentlyHold && reason === null) return; // User cancelled prompt

    try {
      setSubmitting(true);
      const res = await adminApi.toggleMaturityReleaseHold(item.id, { reason });
      if (res.data?.success) {
        toast.success(res.data.message || `Maturity release ${actionLabel} successfully.`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${actionLabel}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = data.filter(item => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      item.investor.name.toLowerCase().includes(q) ||
      item.investor.email.toLowerCase().includes(q) ||
      item.offer.title.toLowerCase().includes(q) ||
      item.offer.companyName.toLowerCase().includes(q) ||
      (item.principalReleaseUtr && item.principalReleaseUtr.toLowerCase().includes(q))
    );
  });

  const totalPrincipalPaise = data.reduce((acc, curr) => acc + (curr.principalPaise || 0), 0);
  const releasedPrincipalPaise = data
    .filter(d => d.releaseStatus === 'Released')
    .reduce((acc, curr) => acc + (curr.principalPaise || 0), 0);

  return (
    <div className="page-container" style={{ padding: '24px clamp(16px, 2.5vw, 36px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            Investor Maturity Releases
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Authorize and disburse invested principal capital back to investors upon completion of their investment tenure (≥12 Months).
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '16px 18px', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
            Ready for Release
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {counts.ready}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Tenure completed (12+ Months)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 18px', borderRadius: '12px', borderLeft: '4px solid #0047BA' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0047BA', textTransform: 'uppercase' }}>
            Total Released
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0047BA', marginTop: '4px' }}>
            {counts.released}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {formatINR(releasedPrincipalPaise)} returned to backers
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 18px', borderRadius: '12px', borderLeft: '4px solid #64748B' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Running Tenures (Pending)
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#334155', marginTop: '4px' }}>
            {counts.pending}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Maturing in upcoming cycles
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 18px', borderRadius: '12px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>
            On Hold
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
            {counts.onHold}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Paused by administrator
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
        {/* Filter Tabs & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All Investments (${counts.total})` },
              { id: 'READY', label: `Ready to Release (${counts.ready})` },
              { id: 'RELEASED', label: `Released (${counts.released})` },
              { id: 'PENDING', label: `Pending Tenure (${counts.pending})` },
              { id: 'ON_HOLD', label: `On Hold (${counts.onHold})` }
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

          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search investor, offer, company, UTR..."
              className="input-field"
              style={{ width: '100%', height: '38px', paddingLeft: '36px', fontSize: '0.825rem' }}
            />
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading investor maturity schedules & release records...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={36} color="#CBD5E1" style={{ margin: '0 auto 10px', display: 'block' }} />
            <div style={{ fontWeight: 700, color: '#334155' }}>No Records Found</div>
            <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              {search.trim() ? `No investments match "${search}". Try adjusting your query.` : 'There are no investments matching the selected filter.'}
            </div>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>S.No</th>
                  <th>Investor & Beneficiary Bank</th>
                  <th>Opportunity & Company</th>
                  <th style={{ textAlign: 'right' }}>Principal Amount</th>
                  <th>Tenure & Completion Date</th>
                  <th style={{ textAlign: 'center' }}>Maturity Status</th>
                  <th>Disbursement Ref / Notes</th>
                  <th style={{ textAlign: 'center' }}>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => {
                  const isReady = item.releaseStatus === 'Ready';
                  const isReleased = item.releaseStatus === 'Released';
                  const isOnHold = item.releaseStatus === 'On Hold';
                  const isPending = item.releaseStatus === 'Pending';

                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.investor.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {item.investor.email} • {item.investor.mobile}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#0047BA', fontWeight: 600, marginTop: '2px' }}>
                          Bank: {item.investor.bankAccount}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.offer.title}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {item.offer.companyName}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#0F172A', fontSize: '0.96rem' }}>
                        ₹{Number(item.principalRupees).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0047BA', fontSize: '0.82rem' }}>
                          {item.tenureMonths} Months Tenure
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                          Matures: {item.maturityDate ? new Date(item.maturityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </div>
                        {isPending && item.daysRemaining > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 600, marginTop: '2px' }}>
                            {item.daysRemaining} days remaining
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`badge ${
                            isReleased
                              ? 'badge-emerald'
                              : isReady
                              ? 'badge-blue'
                              : isOnHold
                              ? 'badge-amber'
                              : 'badge-slate'
                          }`}
                          style={
                            isOnHold
                              ? { backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D', fontWeight: 800 }
                              : isReady
                              ? { backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontWeight: 800 }
                              : {}
                          }
                        >
                          {isOnHold ? 'ON HOLD' : isReady ? 'MATURED - READY' : isReleased ? 'RELEASED' : 'PENDING TENURE'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: isReleased ? '#059669' : 'var(--text-muted)' }}>
                          {item.principalReleaseUtr || 'Awaiting Authorization'}
                        </div>
                        {item.principalReleaseRemarks && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {item.principalReleaseRemarks}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Release Principal Button */}
                          {!isReleased && !isOnHold && (
                            <button
                              onClick={() => {
                                setSelectedForRelease(item);
                                setReleaseUtr(`REL-${Date.now().toString().slice(-8)}`);
                                setReleaseRemarks(`Tenure completed (${item.tenureMonths} Months). Principal returned.`);
                              }}
                              disabled={submitting}
                              className="btn-primary"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: isReady ? '#16A34A' : '#0047BA',
                                fontWeight: 700
                              }}
                              title={isReady ? 'Authorize and release completed principal to investor' : 'Early release authorization'}
                            >
                              <Send size={13} />
                              <span>Release Principal</span>
                            </button>
                          )}

                          {/* Hold / Resume Button */}
                          {!isReleased && (
                            <button
                              onClick={() => handleToggleHold(item)}
                              disabled={submitting}
                              className="btn-secondary"
                              style={{
                                padding: '6px 10px',
                                fontSize: '0.76rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                borderColor: isOnHold ? '#86EFAC' : '#FDE68A',
                                backgroundColor: isOnHold ? '#F0FDF4' : '#FFFBEB',
                                color: isOnHold ? '#15803D' : '#B45309',
                                fontWeight: 700
                              }}
                              title={isOnHold ? 'Resume and release from hold' : 'Place maturity release on hold'}
                            >
                              {isOnHold ? <Play size={12} /> : <Pause size={12} />}
                              <span>{isOnHold ? 'Resume' : 'Hold'}</span>
                            </button>
                          )}

                          {isReleased && (
                            <span style={{ fontSize: '0.78rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                              <CheckCircle2 size={14} color="#10B981" />
                              <span>Paid & Disbursed</span>
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

      {/* Release Confirmation Modal */}
      {selectedForRelease && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '20px'
          }}
          onClick={() => setSelectedForRelease(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  Release Matured Principal
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                  Authorize principal disbursement back to investor account
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Beneficiary Investor:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{selectedForRelease.investor.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Beneficiary Account:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0047BA' }}>{selectedForRelease.investor.bankAccount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Completed Tenure:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>{selectedForRelease.tenureMonths} Months</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed #CBD5E1' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>Principal To Release:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                  ₹{Number(selectedForRelease.principalRupees).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Bank Settlement UTR / Reference *
                </label>
                <input
                  type="text"
                  value={releaseUtr}
                  onChange={e => setReleaseUtr(e.target.value)}
                  placeholder="e.g. UTR-HDFC-9918237"
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Admin Release Remarks
                </label>
                <textarea
                  value={releaseRemarks}
                  onChange={e => setReleaseRemarks(e.target.value)}
                  rows={2}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedForRelease(null)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmRelease}
                className="btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.84rem',
                  backgroundColor: '#16A34A',
                  fontWeight: 700
                }}
              >
                {submitting ? 'Releasing...' : 'Authorize & Disburse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

