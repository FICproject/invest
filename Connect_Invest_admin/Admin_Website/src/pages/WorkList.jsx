import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  Building2,
  Users,
  Layers,
  Coins
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';
import { initRealTimeSync } from '../services/realTimeSync';

export default function WorkList({ setActiveTab }) {
  const toast = useToast();
  const [workList, setWorkList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkList = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getWorkList();
      if (res.data.success) {
        setWorkList(res.data.workList);
      }
    } catch (err) {
      console.error('Failed to load work list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkList();

    const unsubscribe = initRealTimeSync((event) => {
      console.log('[WorkList Live Sync Event]:', event);
      fetchWorkList();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleKycDecision = async decision => {
    if (!decisionReason.trim()) {
      toast.warning('A written reason is required for KYC decisions (PRD Section 5.1 A-5)');
      return;
    }
    try {
      setSubmitting(true);
      await adminApi.decideKyc(selectedKyc._id, {
        decision,
        reason: decisionReason
      });
      toast.success(`KYC status updated: ${decision}`);
      setSelectedKyc(null);
      setDecisionReason('');
      fetchWorkList();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading actionable worklist items from MongoDB...
      </div>
    );
  }

  const wl = workList || {};
  const totalItems =
    (wl.pendingKyc?.length || 0) +
    (wl.pendingKyb?.length || 0) +
    (wl.pendingOffers?.length || 0) +
    (wl.pendingReleases?.length || 0) +
    (wl.failedPayouts?.length || 0);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Action Items Work List</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Consolidated inbox of all submissions, verifications, and approvals requiring administrative action.
          </p>
        </div>
        <span className="badge badge-amber" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
          {totalItems} Actionable Items
        </span>
      </div>

      {totalItems === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>All Clear! No Pending Actions</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            All investor KYCs, company profiles, and project submissions have been processed.
          </p>
        </div>
      ) : null}

      {/* 1. Pending Investor KYC Submissions */}
      {wl.pendingKyc?.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} color="var(--cyan-main)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Pending Investor KYC Reviews ({wl.pendingKyc.length})</h3>
            </div>
            <button onClick={() => setActiveTab('investors')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              View All Investors
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th>Investor</th>
                  <th>Contact</th>
                  <th>PAN</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {wl.pendingKyc.map((p, idx) => (
                  <tr key={p._id}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.userId?.name || 'Investor'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.userId?.email}</div>
                    </td>
                    <td>{p.userId?.mobile || 'N/A'}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.pan || 'SUBMITTED'}</span>
                    </td>
                    <td>
                      <span className="badge badge-amber">{p.kycStatus}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedKyc(p)}
                        className="btn-primary"
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                      >
                        Review Documents
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Pending Company KYB Submissions */}
      {wl.pendingKyb?.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={18} color="var(--indigo-main)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Pending Company KYB Verifications ({wl.pendingKyb.length})</h3>
            </div>
            <button onClick={() => setActiveTab('companies')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Open Companies Console
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th>Company</th>
                  <th>Registration No</th>
                  <th>Owner</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {wl.pendingKyb.map((c, idx) => (
                  <tr key={c._id}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{c.regNo}</td>
                    <td>
                      <div>{c.ownerUserId?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.ownerUserId?.email}</div>
                    </td>
                    <td>
                      <button
                        onClick={() => setActiveTab('companies')}
                        className="btn-primary"
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                      >
                        Inspect KYB Docs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Submitted Project Proposals */}
      {wl.pendingOffers?.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={18} color="var(--emerald-main)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Project Drafts Awaiting Terms Configuration ({wl.pendingOffers.length})</h3>
            </div>
            <button onClick={() => setActiveTab('offers')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              View Listings
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th>Project Title</th>
                  <th>Company</th>
                  <th>Target (INR)</th>
                  <th>Proposed Rate</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {wl.pendingOffers.map((o, idx) => (
                  <tr key={o._id}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.title}</td>
                    <td>{o.companyId?.name}</td>
                    <td style={{ fontWeight: 700 }}>{formatINR(o.targetPaise)}</td>
                    <td>{o.rateBps ? `${o.rateBps / 100}% / month` : 'Pending'}</td>
                    <td>
                      <button
                        onClick={() => setActiveTab('offers')}
                        className="btn-primary"
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                      >
                        Configure Term Sheet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Failed Payouts Retry Queue */}
      {wl.failedPayouts?.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} color="var(--rose-main)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f87171' }}>Failed Payouts Retry Queue ({wl.failedPayouts.length})</h3>
            </div>
            <button onClick={() => setActiveTab('payouts')} className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Resolve in Payouts
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Offer</th>
                  <th>Amount</th>
                  <th>Failure Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {wl.failedPayouts.map(fp => (
                  <tr key={fp._id}>
                    <td>{fp.investorId?.name}</td>
                    <td>{fp.offerId?.title}</td>
                    <td style={{ fontWeight: 700 }}>{formatINR(fp.amountPaise)}</td>
                    <td style={{ color: '#f87171' }}>{fp.failureReason || 'Bank account invalid'}</td>
                    <td>
                      <button
                        onClick={async () => {
                          await adminApi.retryPayout(fp._id);
                          fetchWorkList();
                        }}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Retry Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC Review Modal */}
      {selectedKyc && (
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
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '560px',
            padding: '28px',
            background: 'var(--bg-modal)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
              Review Investor KYC: {selectedKyc.userId?.name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Inspect identity details and record your decision with a mandatory written reason.
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Email:</strong> {selectedKyc.userId?.email}</div>
              <div><strong>PAN:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedKyc.pan || 'N/A'}</span></div>
              <div><strong>Address:</strong> {selectedKyc.address ? `${selectedKyc.address.line1}, ${selectedKyc.address.city}, ${selectedKyc.address.state}` : 'N/A'}</div>
              <div><strong>Bank Account:</strong> {selectedKyc.bankAccount?.accountNo ? `${selectedKyc.bankAccount.accountNo} (${selectedKyc.bankAccount.ifsc})` : 'N/A'}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Decision Reason (Mandatory per PRD Section 5.1 A-5):
              </label>
              <textarea
                value={decisionReason}
                onChange={e => setDecisionReason(e.target.value)}
                placeholder="e.g. Identity documents verified with NSDL PAN record, selfie matches government ID."
                className="input-field"
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                disabled={submitting}
                onClick={() => setSelectedKyc(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={() => handleKycDecision('More info needed')}
                className="btn-secondary"
                style={{ color: '#fbbf24' }}
              >
                Request More Info
              </button>
              <button
                disabled={submitting}
                onClick={() => handleKycDecision('Rejected')}
                className="btn-danger"
              >
                Reject KYC
              </button>
              <button
                disabled={submitting}
                onClick={() => handleKycDecision('Approved')}
                className="btn-primary"
              >
                Approve KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
