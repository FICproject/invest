import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  FileText,
  TrendingUp,
  Building2,
  Briefcase,
  Calendar,
  Percent,
  X,
  Eye,
  Download
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

export default function Investors() {
  const toast = useToast();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [reviewInvestor, setReviewInvestor] = useState(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [blockUser, setBlockUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Suspension & Revocation Modal
  const [suspendModalUser, setSuspendModalUser] = useState(null);
  const [suspendType, setSuspendType] = useState('funding'); // 'funding' | 'account'
  const [suspendTargetStatus, setSuspendTargetStatus] = useState('Suspended');
  const [suspendReason, setSuspendReason] = useState('');

  // Portfolio modal
  const [portfolioInvestor, setPortfolioInvestor] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getInvestors({ status: statusFilter, search });
      if (res.data.success) {
        setInvestors(res.data.investors);
      }
    } catch (err) {
      console.error('Failed to fetch investors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, [statusFilter]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    fetchInvestors();
  };

  const handleKycDecision = async decision => {
    const finalReason = decisionReason.trim() || (decision === 'Approved' ? 'KYC documents verified and approved.' : '');
    if (!finalReason && decision !== 'Approved') {
      toast.warning('A written reason is required for KYC decisions (PRD Section 5.1 A-5)');
      return;
    }
    try {
      setSubmitting(true);
      await adminApi.decideKyc(reviewInvestor._id, {
        decision,
        reason: finalReason
      });
      toast.success(`KYC status updated: ${decision}`);
      setReviewInvestor(null);
      setDecisionReason('');
      fetchInvestors();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!blockReason.trim()) {
      toast.warning('A written reason is required when blocking or unblocking an account (PRD Section 5.1 A-7)');
      return;
    }
    const nextStatus = blockUser.userId?.status === 'blocked' ? 'active' : 'blocked';
    try {
      setSubmitting(true);
      await adminApi.setUserBlockStatus(blockUser.userId?._id, {
        status: nextStatus,
        reason: blockReason
      });
      toast.success(`User status updated to ${nextStatus}`);
      setBlockUser(null);
      setBlockReason('');
      fetchInvestors();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspendSubmit = async () => {
    if (!suspendReason.trim()) {
      toast.warning('A written reason is required when suspending or revoking privileges');
      return;
    }
    try {
      setSubmitting(true);
      const targetUserId = suspendModalUser.userId?._id || suspendModalUser._id;
      if (suspendType === 'funding') {
        await adminApi.suspendInvestorFunding(targetUserId, {
          status: suspendTargetStatus,
          reason: suspendReason.trim()
        });
        toast.success(`Investor funding privileges updated to ${suspendTargetStatus}`);
      } else {
        await adminApi.suspendInvestorAccount(targetUserId, {
          status: suspendTargetStatus,
          reason: suspendReason.trim()
        });
        toast.success(`Investor account status updated to ${suspendTargetStatus}`);
      }
      setSuspendModalUser(null);
      setSuspendReason('');
      fetchInvestors();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPortfolio = async inv => {
    try {
      setPortfolioInvestor(inv);
      setPortfolioLoading(true);
      const res = await adminApi.getInvestorInvestments(inv._id);
      if (res.data.success) {
        setPortfolioData(res.data);
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
      toast.error(err.response?.data?.error || 'Failed to load investments');
    } finally {
      setPortfolioLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Top Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Investors & KYC Management</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Review identity submissions, manage verified bank details, and monitor investor portfolios.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              placeholder="Search name, email, PAN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '34px' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
          </form>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: '180px' }}
          >
            <option value="">All KYC Statuses</option>
            <option value="Submitted">Submitted (Pending)</option>
            <option value="Approved">Approved</option>
            <option value="More info needed">More info needed</option>
            <option value="Rejected">Rejected</option>
            <option value="Not started">Not started</option>
          </select>
        </div>
      </div>

      {/* Investors Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading investor records from local database...
          </div>
        ) : investors.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No investors found matching the criteria.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th>Investor</th>
                  <th>PAN & Contact</th>
                  <th style={{ textAlign: 'center' }}>KYC Status</th>
                  <th>Bank Account</th>
                  <th>Total Invested</th>
                  <th style={{ textAlign: 'center' }}>Account Status</th>
                  <th style={{ textAlign: 'center' }}>Funding Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv, idx) => {
                  const isBlocked = inv.userId?.status === 'blocked';
                  return (
                    <tr key={inv._id}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{inv.userId?.name || 'Investor'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.userId?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{inv.pan || 'NO PAN'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.userId?.mobile || 'N/A'}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${
                          inv.kycStatus === 'Approved' ? 'badge-emerald' :
                          inv.kycStatus === 'Submitted' ? 'badge-amber' :
                          inv.kycStatus === 'Rejected' ? 'badge-rose' : 'badge-slate'
                        }`}>
                          {inv.kycStatus}
                        </span>
                      </td>
                      <td>
                        {inv.bankAccount?.accountNo ? (
                          <div>
                            <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{inv.bankAccount.accountNo}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {inv.bankAccount.ifsc} {inv.bankAccount.verified ? '• Verified' : '• Unverified'}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not submitted</span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{formatINR(inv.investmentsTotalPaise || 0)}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inv.investmentsCount || 0} investments</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {(() => {
                          const accStatus = inv.userId?.accountStatus || (isBlocked ? 'Suspended' : 'Active');
                          if (accStatus === 'Revoked') {
                            return <span className="badge badge-rose">REVOKED</span>;
                          }
                          if (accStatus === 'Suspended') {
                            return <span className="badge badge-amber">SUSPENDED</span>;
                          }
                          return <span className="badge badge-emerald">ACTIVE</span>;
                        })()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {(() => {
                          const fundStatus = inv.userId?.fundingStatus || 'Allowed';
                          if (fundStatus === 'Revoked') {
                            return <span className="badge badge-rose">REVOKED</span>;
                          }
                          if (fundStatus === 'Suspended') {
                            return <span className="badge badge-amber">SUSPENDED</span>;
                          }
                          return <span className="badge badge-emerald">ALLOWED</span>;
                        })()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleOpenPortfolio(inv)}
                            className="btn-primary"
                            style={{
                              padding: '5px 8px',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="View companies & projects this investor invested in"
                          >
                            <TrendingUp size={13} />
                            Investments
                          </button>
                          <button
                            onClick={() => {
                              setReviewInvestor(inv);
                              setDecisionReason(inv.kycReason || '');
                            }}
                            className="btn-secondary"
                            style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                          >
                            KYC
                          </button>
                          <button
                            onClick={() => {
                              setSuspendModalUser(inv);
                              setSuspendType('funding');
                              setSuspendTargetStatus(inv.userId?.fundingStatus === 'Suspended' ? 'Allowed' : 'Suspended');
                              setSuspendReason(inv.userId?.fundingSuspendedReason || '');
                            }}
                            className="btn-secondary"
                            style={{
                              padding: '5px 8px',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              borderColor: '#f59e0b',
                              color: '#d97706'
                            }}
                            title="Suspend or Revoke funding or account"
                          >
                            <ShieldAlert size={13} />
                            Suspend/Revoke
                          </button>
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

      {/* Review Modal */}
      {reviewInvestor && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: 'min(92vw, 620px)', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: 'var(--bg-modal)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
              KYC Inspection: {reviewInvestor.userId?.name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Current Status: <strong>{reviewInvestor.kycStatus}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', marginBottom: '18px' }}>
              <div><strong>Email:</strong> {reviewInvestor.userId?.email}</div>
              <div><strong>Mobile:</strong> {reviewInvestor.userId?.mobile || 'N/A'}</div>
              <div><strong>PAN Card:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{reviewInvestor.pan || 'N/A'}</span></div>
              <div><strong>Date of Birth:</strong> {reviewInvestor.dob ? new Date(reviewInvestor.dob).toLocaleDateString() : 'N/A'}</div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Address:</strong> {reviewInvestor.address ? `${reviewInvestor.address.line1}, ${reviewInvestor.address.city}, ${reviewInvestor.address.state} - ${reviewInvestor.address.pincode}` : 'N/A'}
              </div>
            </div>

            {/* Uploaded Compliance Documents */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  COMPLIANCE DOCUMENTS ({reviewInvestor.documents?.length || 0})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to preview or download</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                {(reviewInvestor.documents || []).map((doc, idx) => (
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
                Mandatory Written Reason:
              </label>
              <textarea
                value={decisionReason}
                onChange={e => setDecisionReason(e.target.value)}
                placeholder="Reason for approval, rejection, or extra information requested..."
                className="input-field"
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button disabled={submitting} onClick={() => setReviewInvestor(null)} className="btn-secondary">
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
                Reject
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

      {/* Suspend or Revoke Privileges Modal */}
      {suspendModalUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 'min(92vw, 520px)', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: 'var(--bg-modal)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={22} color="#f59e0b" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  Manage Privileges & Access
                </h3>
              </div>
              <button
                onClick={() => setSuspendModalUser(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Investor: <strong>{suspendModalUser.userId?.name}</strong> ({suspendModalUser.userId?.email})
            </p>

            {/* Current Status Overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              marginBottom: '18px'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Account</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: suspendModalUser.userId?.accountStatus === 'Suspended' ? '#f59e0b' : suspendModalUser.userId?.accountStatus === 'Revoked' ? '#ef4444' : '#10b981' }}>
                  {suspendModalUser.userId?.accountStatus || 'Active'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Funding</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: suspendModalUser.userId?.fundingStatus === 'Suspended' ? '#f59e0b' : suspendModalUser.userId?.fundingStatus === 'Revoked' ? '#ef4444' : '#10b981' }}>
                  {suspendModalUser.userId?.fundingStatus || 'Allowed'}
                </div>
              </div>
            </div>

            {/* Tab: Action Target */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Select Action Scope:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSuspendType('funding');
                    setSuspendTargetStatus('Suspended');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: suspendType === 'funding' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                    background: suspendType === 'funding' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    color: suspendType === 'funding' ? '#f59e0b' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Funding Privileges
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuspendType('account');
                    setSuspendTargetStatus('Suspended');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: suspendType === 'account' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                    background: suspendType === 'account' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    color: suspendType === 'account' ? '#ef4444' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Account Access (Login & Dashboard)
                </button>
              </div>
            </div>

            {/* Target Status Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Set New Status:
              </label>
              {suspendType === 'funding' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Allowed', 'Suspended', 'Revoked'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSuspendTargetStatus(st)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: suspendTargetStatus === st ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: suspendTargetStatus === st ? 'rgba(0, 71, 186, 0.15)' : 'transparent',
                        fontWeight: suspendTargetStatus === st ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Active', 'Suspended', 'Revoked'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSuspendTargetStatus(st)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: suspendTargetStatus === st ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: suspendTargetStatus === st ? 'rgba(0, 71, 186, 0.15)' : 'transparent',
                        fontWeight: suspendTargetStatus === st ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mandatory Reason */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Administrative Reason (Mandatory):
              </label>
              <textarea
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                placeholder="Specify the regulatory, KYC, or risk reason for this action..."
                className="input-field"
                rows={3}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                disabled={submitting}
                onClick={() => setSuspendModalUser(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleSuspendSubmit}
                className={suspendTargetStatus === 'Revoked' ? 'btn-danger' : 'btn-primary'}
                style={{
                  background: suspendTargetStatus === 'Revoked' ? '#ef4444' : suspendTargetStatus === 'Suspended' ? '#f59e0b' : '#10b981',
                  borderColor: suspendTargetStatus === 'Revoked' ? '#ef4444' : suspendTargetStatus === 'Suspended' ? '#f59e0b' : '#10b981'
                }}
              >
                {submitting ? 'Applying...' : `Confirm Set to ${suspendTargetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {blockUser && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: 'min(92vw, 480px)', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: 'var(--bg-modal)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              {blockUser.userId?.status === 'blocked' ? 'Unblock Investor' : 'Block Investor Account'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Investor: <strong>{blockUser.userId?.name}</strong> ({blockUser.userId?.email})
            </p>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Written Reason (Required per PRD Section 5.1 A-7):
              </label>
              <textarea
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="Reason for changing block status..."
                className="input-field"
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button disabled={submitting} onClick={() => setBlockUser(null)} className="btn-secondary">
                Cancel
              </button>
              <button disabled={submitting} onClick={handleBlockToggle} className="btn-danger">
                Confirm {blockUser.userId?.status === 'blocked' ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio / Invested Companies & Projects Modal */}
      {portfolioInvestor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: 'min(92vw, 920px)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-modal)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(to right, rgba(0,71,186,0.08), transparent)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} color="var(--primary-color)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    Investor Portfolio: {portfolioInvestor.userId?.name || 'Investor'}
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {portfolioInvestor.userId?.email} • PAN: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{portfolioInvestor.pan || 'N/A'}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setPortfolioInvestor(null);
                  setPortfolioData(null);
                }}
                className="btn-secondary"
                style={{ padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {portfolioLoading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading invested companies and projects...
                </div>
              ) : !portfolioData || portfolioData.investments.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <Briefcase size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontWeight: 600, marginBottom: '6px' }}>No Active or Past Investments</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    This investor has not participated in any company or project offers yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary KPI Strip */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '14px'
                  }}>
                    <div style={{
                      background: 'rgba(0, 71, 186, 0.08)',
                      border: '1px solid rgba(0, 71, 186, 0.2)',
                      padding: '16px',
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Capital Invested
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '4px' }}>
                        {formatINR(portfolioData.totalInvestedPaise || 0)}
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(250, 184, 0, 0.08)',
                      border: '1px solid rgba(250, 184, 0, 0.25)',
                      padding: '16px',
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Engagements
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                        {portfolioData.count} {portfolioData.count === 1 ? 'Project' : 'Projects'}
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '16px',
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Active Deployments
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                        {portfolioData.investments.filter(i => i.status === 'Active' || i.status === 'Confirmed').length}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Table */}
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.9rem' }}>
                      Breakdown of Companies & Projects Invested In
                    </div>
                    <div className="data-table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Company & Sector</th>
                            <th>Opportunity / Project</th>
                            <th>Investment Amount</th>
                            <th>Monthly Return</th>
                            <th>Tenure</th>
                            <th>Status</th>
                            <th>Timeline</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portfolioData.investments.map(inv => (
                            <tr key={inv.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Building2 size={16} color="var(--primary-color)" />
                                  <span style={{ fontWeight: 600 }}>{inv.companyName}</span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  CIN: {inv.companyRegNo} • {inv.companySector}
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{inv.offerTitle}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span className="badge badge-slate" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                                    {inv.offerKind}
                                  </span>
                                  {inv.rateBps && (
                                    <span>{(inv.rateBps / 100).toFixed(1)}% p.a.</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {formatINR(inv.amountPaise)}
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: '#10b981' }}>
                                  {formatINR(inv.monthlyReturnPaise)}/mo
                                </div>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.85rem' }}>{inv.tenureMonths} Months</div>
                              </td>
                              <td>
                                <span className={`badge ${
                                  inv.status === 'Active' ? 'badge-emerald' :
                                  inv.status === 'Confirmed' ? 'badge-sky' :
                                  inv.status === 'Matured' ? 'badge-indigo' :
                                  inv.status === 'Defaulted' ? 'badge-rose' : 'badge-amber'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  <div>Active: {inv.activationDate ? new Date(inv.activationDate).toLocaleDateString('en-IN') : 'Pending'}</div>
                                  <div>Matures: {inv.maturityDate ? new Date(inv.maturityDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              background: 'rgba(255, 255, 255, 0.01)'
            }}>
              <button
                onClick={() => {
                  setPortfolioInvestor(null);
                  setPortfolioData(null);
                }}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                Close Portfolio
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

