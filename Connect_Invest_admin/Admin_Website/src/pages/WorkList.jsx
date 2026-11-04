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
  Coins,
  Eye,
  Download,
  FileText,
  Search
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';
import { initRealTimeSync } from '../services/realTimeSync';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

export default function WorkList({ setActiveTab }) {
  const toast = useToast();
  const [workList, setWorkList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [search, setSearch] = useState('');

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
    const finalReason = decisionReason.trim() || (decision === 'Approved' ? 'KYC identity and financial documentation verified and approved.' : '');
    if (!finalReason && decision !== 'Approved') {
      toast.warning('A written reason is required for KYC decisions (PRD Section 5.1 A-5)');
      return;
    }
    try {
      setSubmitting(true);
      await adminApi.decideKyc(selectedKyc._id, {
        decision,
        reason: finalReason
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
    (wl.pendingFundingRequests?.length || 0) +
    (wl.pendingReleases?.length || 0) +
    (wl.failedPayouts?.length || 0);

  const q = search.toLowerCase().trim();
  const filteredKyc = (wl.pendingKyc || []).filter(p => {
    if (!q) return true;
    return (p.userId?.name || '').toLowerCase().includes(q) ||
           (p.userId?.email || '').toLowerCase().includes(q) ||
           (p.userId?.mobile || '').toLowerCase().includes(q) ||
           (p.pan || '').toLowerCase().includes(q);
  });
  const filteredKyb = (wl.pendingKyb || []).filter(c => {
    if (!q) return true;
    return (c.name || '').toLowerCase().includes(q) ||
           (c.regNo || '').toLowerCase().includes(q) ||
           (c.ownerUserId?.name || '').toLowerCase().includes(q) ||
           (c.ownerUserId?.email || '').toLowerCase().includes(q);
  });
  const filteredOffers = (wl.pendingOffers || []).filter(o => {
    if (!q) return true;
    return (o.title || '').toLowerCase().includes(q) ||
           (o.companyId?.name || '').toLowerCase().includes(q);
  });
  const filteredFundingRequests = (wl.pendingFundingRequests || []).filter(r => {
    if (!q) return true;
    return (r.title || r.entityOrProjectName || '').toLowerCase().includes(q) ||
           (r.companyId?.legalName || r.companyId?.name || '').toLowerCase().includes(q);
  });
  const filteredFailedPayouts = (wl.failedPayouts || []).filter(fp => {
    if (!q) return true;
    return (fp.investorId?.name || '').toLowerCase().includes(q) ||
           (fp.offerId?.title || '').toLowerCase().includes(q) ||
           (fp.failureReason || '').toLowerCase().includes(q);
  });

  return (
    <div className="page-container">
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Action Items Work List</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Consolidated inbox of all submissions, verifications, and approvals requiring administrative action.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search investor, company, PAN..."
              className="input-field"
              style={{ width: '100%', height: '38px', paddingLeft: '36px', fontSize: '0.825rem' }}
            />
          </div>
          <span className="badge badge-amber" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            {totalItems} Actionable Items
          </span>
        </div>
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
      {filteredKyc.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} color="var(--cyan-main)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Pending Investor KYC Reviews ({filteredKyc.length})</h3>
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
                {filteredKyc.map((p, idx) => (
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
      {filteredKyb.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={18} color="var(--indigo-main)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Pending Company KYB Verifications ({filteredKyb.length})</h3>
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
                {filteredKyb.map((c, idx) => (
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
      {filteredOffers.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={18} color="var(--emerald-main)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Project Drafts Awaiting Terms Configuration ({filteredOffers.length})</h3>
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
                {filteredOffers.map((o, idx) => (
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

      {/* 3b. Pending Company Funding Requests */}
      {filteredFundingRequests.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={18} color="#0047BA" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Company Funding Requests Awaiting Review ({filteredFundingRequests.length})</h3>
            </div>
            <button onClick={() => setActiveTab('offers')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Review in Investment Management
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th>Request Title</th>
                  <th>Company</th>
                  <th>Target (INR)</th>
                  <th>Return Rate</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFundingRequests.map((r, idx) => (
                  <tr key={r._id}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.title || r.entityOrProjectName}</td>
                    <td>{r.companyId?.legalName || r.companyId?.name || 'Company'}</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(r.fundingTarget || 0).toLocaleString('en-IN')}</td>
                    <td>{r.expectedReturnRate ? `${r.expectedReturnRate}%` : 'N/A'}</td>
                    <td>
                      <span className="badge badge-amber">{r.status}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => setActiveTab('offers')}
                        className="btn-primary"
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                      >
                        Review & Approve
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
      {filteredFailedPayouts.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} color="var(--rose-main)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f87171' }}>Failed Payouts Retry Queue ({filteredFailedPayouts.length})</h3>
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
                {filteredFailedPayouts.map(fp => (
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
            maxWidth: 'min(92vw, 560px)',
            maxHeight: '90vh',
            overflowY: 'auto',
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

            {/* Compliance Documents */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  COMPLIANCE DOCUMENTS ({selectedKyc.documents?.length || 0})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to preview or download</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '8px' }}>
                {(selectedKyc.documents || []).map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {doc.url?.split('/').pop()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: 'rgba(0, 71, 186, 0.15)',
                          color: '#3B82F6',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={12} />
                        Preview
                      </button>
                      <a
                        href={`/api/v1/admin/documents/${doc.url?.split('/').pop()}/download`}
                        download
                        style={{
                          padding: '5px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          textDecoration: 'none'
                        }}
                        title="Download Document"
                      >
                        <Download size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
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
      {/* Embedded Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          documentUrl={previewDoc.url}
          title={previewDoc.name}
          documentType={previewDoc.type}
        />
      )}
    </div>
  );
}
