import React, { useState, useEffect } from 'react';
import {
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  DollarSign
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Repayments() {
  const toast = useToast();
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Confirm Receipt Modal
  const [confirmReceiptTarget, setConfirmReceiptTarget] = useState(null);
  const [bankRef, setBankRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mark Default Modal
  const [defaultTarget, setDefaultTarget] = useState(null);
  const [defaultReason, setDefaultReason] = useState('');

  const fetchRepayments = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getRepayments({ status: statusFilter });
      if (res.data.success) {
        setRepayments(res.data.repayments || []);
      }
    } catch (err) {
      console.error('Failed to load repayments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepayments();
  }, [statusFilter]);

  const handleConfirmReceipt = async () => {
    if (!bankRef.trim()) {
      toast.warning('Bank reference / UTR is required');
      return;
    }
    try {
      setSubmitting(true);
      const res = await adminApi.confirmRepaymentReceipt(confirmReceiptTarget._id, {
        reference: bankRef.trim()
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Repayment receipt confirmed');
        setConfirmReceiptTarget(null);
        setBankRef('');
        fetchRepayments();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to confirm receipt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDefault = async () => {
    if (!defaultReason.trim()) {
      toast.warning('A reason / recovery notes are required to mark default');
      return;
    }
    try {
      setSubmitting(true);
      const res = await adminApi.markRepaymentDefault(defaultTarget._id, {
        reason: defaultReason.trim()
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Repayment marked as Defaulted');
        setDefaultTarget(null);
        setDefaultReason('');
        fetchRepayments();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to mark default');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRepayments = repayments.filter(rep => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const offerTitle = (rep.offerId?.title || '').toLowerCase();
    const company = (rep.offerId?.companyId?.name || '').toLowerCase();
    const kind = (rep.kind || '').toLowerCase();
    const status = (rep.status || '').toLowerCase();
    const ref = (rep.receivedReference || '').toLowerCase();
    return offerTitle.includes(q) || company.includes(q) || kind.includes(q) || status.includes(q) || ref.includes(q);
  });

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Company Repayments & Dues</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Track collections from companies. Confirming receipts automatically unlocks investor payout lines into the Ready queue.
          </p>
        </div>

        {/* In-page Search and Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search offer, company, ref..."
              className="input-field"
              style={{ width: '100%', height: '38px', paddingLeft: '36px', fontSize: '0.825rem' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: '160px', height: '38px', fontSize: '0.825rem' }}
          >
            <option value="">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Due">Due</option>
            <option value="Received">Received</option>
            <option value="Overdue">Overdue</option>
            <option value="Defaulted">Defaulted</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading repayments from MongoDB...
          </div>
        ) : filteredRepayments.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {search.trim() ? `No repayments match "${search}".` : 'No repayment schedules found.'}
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Offer / Project</th>
                  <th>Company</th>
                  <th>Due Date</th>
                  <th>Kind</th>
                  <th>Expected Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepayments.map(rep => {
                  const isReceived = rep.status === 'Received';
                  const isOverdue = rep.status === 'Overdue';
                  const isDefaulted = rep.status === 'Defaulted';

                  return (
                    <tr key={rep._id}>
                      <td style={{ fontWeight: 600 }}>{rep.offerId?.title || 'Offer'}</td>
                      <td>{rep.offerId?.companyId?.name || 'Company'}</td>
                      <td>
                        <div style={{ fontSize: '0.825rem' }}>{new Date(rep.dueDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Payout on {new Date(rep.payoutDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${rep.kind === 'principal' ? 'badge-indigo' : 'badge-slate'}`} style={{ textTransform: 'capitalize' }}>
                          {rep.kind}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatINR(rep.expectedPaise)}
                      </td>
                      <td>
                        <span className={`badge ${
                          isReceived ? 'badge-emerald' : isOverdue ? 'badge-amber' : isDefaulted ? 'badge-rose' : 'badge-slate'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {!isReceived && !isDefaulted && (
                            <button
                              onClick={() => {
                                setConfirmReceiptTarget(rep);
                                setBankRef(`UTR-REC-${Date.now().toString().slice(-6)}`);
                              }}
                              className="btn-primary"
                              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            >
                              Confirm Receipt
                            </button>
                          )}
                          {isReceived && (
                            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              Ref: {rep.receivedReference}
                            </span>
                          )}
                          {isOverdue && !isDefaulted && (
                            <button
                              onClick={() => setDefaultTarget(rep)}
                              className="btn-danger"
                              style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                            >
                              30d Default
                            </button>
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

      {/* Confirm Receipt Modal */}
      {confirmReceiptTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 'min(92vw, 500px)', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: 'var(--bg-modal)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
              Confirm Company Repayment Receipt
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Confirm that the company funds have arrived in the platform account.
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div><strong>Project:</strong> {confirmReceiptTarget.offerId?.title}</div>
              <div><strong>Company:</strong> {confirmReceiptTarget.offerId?.companyId?.name}</div>
              <div><strong>Amount Due:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>{formatINR(confirmReceiptTarget.expectedPaise)}</span></div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Bank Inward Reference (UTR):
              </label>
              <input
                type="text"
                value={bankRef}
                onChange={e => setBankRef(e.target.value)}
                className="input-field"
                placeholder="e.g. UTR-IN-987654321"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button disabled={submitting} onClick={() => setConfirmReceiptTarget(null)} className="btn-secondary">
                Cancel
              </button>
              <button disabled={submitting} onClick={handleConfirmReceipt} className="btn-primary">
                Confirm Receipt & Unlock Payouts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Default Modal */}
      {defaultTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 'min(92vw, 500px)', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: 'var(--bg-modal)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px', color: '#f87171' }}>
              Mark Repayment as Defaulted
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Record recovery steps and notes for 30-day overdue default.
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div><strong>Project:</strong> {defaultTarget.offerId?.title}</div>
              <div><strong>Company:</strong> {defaultTarget.offerId?.companyId?.name}</div>
              <div><strong>Amount Due:</strong> <span style={{ color: '#f87171', fontWeight: 700 }}>{formatINR(defaultTarget.expectedPaise)}</span></div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Recovery Steps & Notes:
              </label>
              <textarea
                value={defaultReason}
                onChange={e => setDefaultReason(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Enter recovery steps, legal notice references, or actions taken..."
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button disabled={submitting} onClick={() => setDefaultTarget(null)} className="btn-secondary">
                Cancel
              </button>
              <button disabled={submitting} onClick={handleMarkDefault} className="btn-danger">
                Confirm Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
