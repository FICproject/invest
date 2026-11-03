import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Search,
  ExternalLink,
  Layers,
  Trash2,
  PieChart
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Companies() {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Company Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    regNo: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    sector: '',
    description: '',
    accountNo: '',
    ifsc: '',
    holderName: '',
    bankName: ''
  });

  // KYB Review Modal
  const [reviewCompany, setReviewCompany] = useState(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Company Suspension & Revocation Modal
  const [suspendCompanyModal, setSuspendCompanyModal] = useState(null);
  const [suspendCompType, setSuspendCompType] = useState('funding'); // 'funding' | 'account'
  const [suspendCompTargetStatus, setSuspendCompTargetStatus] = useState('Suspended');
  const [suspendCompReason, setSuspendCompReason] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCompanies({ search });
      if (res.data.success) {
        setCompanies(res.data.companies);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async e => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.regNo || !newCompany.ownerName || !newCompany.ownerEmail) {
      toast?.warning?.('Please fill all mandatory company and owner fields');
      return;
    }
    if (newCompany.ownerMobile && newCompany.ownerMobile.length !== 10) {
      toast?.warning?.('Mobile number must be exactly 10 digits');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: newCompany.name,
        regNo: newCompany.regNo,
        ownerName: newCompany.ownerName,
        ownerEmail: newCompany.ownerEmail,
        ownerMobile: newCompany.ownerMobile,
        profile: {
          description: newCompany.description,
          sector: newCompany.sector
        },
        bankAccount: newCompany.accountNo
          ? {
              accountNo: newCompany.accountNo,
              ifsc: newCompany.ifsc,
              holderName: newCompany.holderName || newCompany.name,
              bankName: newCompany.bankName
            }
          : undefined
      };

      const res = await adminApi.createCompany(payload);
      if (res.data.success) {
        toast?.success?.(`Company "${newCompany.name}" onboarded successfully!`);
        setShowCreateModal(false);
        setNewCompany({
          name: '',
          regNo: '',
          ownerName: '',
          ownerEmail: '',
          ownerMobile: '',
          sector: '',
          description: '',
          accountNo: '',
          ifsc: '',
          holderName: '',
          bankName: ''
        });
        fetchCompanies();
      }
    } catch (err) {
      toast?.error?.(err.response?.data?.error || 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKybDecision = async decision => {
    if (!decisionReason.trim()) {
      toast?.warning?.('A written reason is required for KYB decision (PRD Section 5.1 A-6)');
      return;
    }
    try {
      setSubmitting(true);
      await adminApi.decideKyb(reviewCompany._id, {
        decision,
        reason: decisionReason
      });
      toast?.success?.(`KYB decision recorded: ${decision}`);
      setReviewCompany(null);
      setDecisionReason('');
      fetchCompanies();
    } catch (err) {
      toast?.error?.(err.response?.data?.error || 'Failed to record decision');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async company => {
    try {
      setSubmitting(true);
      const res = await adminApi.deleteCompany(company._id);
      if (res.data.success) {
        toast?.success?.(res.data.message || `Company "${company.name}" has been deleted.`);
        fetchCompanies();
      }
    } catch (err) {
      toast?.error?.(err.response?.data?.error || 'Failed to delete company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuspendCompanySubmit = async () => {
    if (!suspendCompReason.trim()) {
      toast?.warning?.('A written reason is required when suspending or revoking corporate privileges');
      return;
    }
    try {
      setSubmitting(true);
      if (suspendCompType === 'funding') {
        await adminApi.suspendCompanyFunding(suspendCompanyModal._id, {
          status: suspendCompTargetStatus,
          reason: suspendCompReason.trim()
        });
        toast?.success?.(`Company fundraising privileges updated to ${suspendCompTargetStatus}`);
      } else {
        await adminApi.suspendCompanyAccount(suspendCompanyModal._id, {
          status: suspendCompTargetStatus,
          reason: suspendCompReason.trim()
        });
        toast?.success?.(`Company account access status updated to ${suspendCompTargetStatus}`);
      }
      setSuspendCompanyModal(null);
      setSuspendCompReason('');
      fetchCompanies();
    } catch (err) {
      toast?.error?.(err.response?.data?.error || err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Companies & KYB Verifications</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Admin onboarding, corporate identity checks, bank cooling-off monitoring, and listed projects.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <form onSubmit={e => { e.preventDefault(); fetchCompanies(); }} style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              placeholder="Search companies, CIN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          </form>

          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus size={16} />
            <span>Onboard New Company</span>
          </button>
        </div>
      </div>

      {/* Companies Roster */}
      <div className="forge-card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading companies from MongoDB...
          </div>
        ) : companies.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No companies registered yet.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th>Company</th>
                  <th>Registration No</th>
                  <th>Owner</th>
                  <th style={{ textAlign: 'center' }}>KYB Status</th>
                  <th>Bank Account & Cooling-Off</th>
                  <th style={{ textAlign: 'center' }}>Account Status</th>
                  <th style={{ textAlign: 'center' }}>Fundraising Status</th>
                  <th style={{ textAlign: 'center' }}>Projects</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c, idx) => {
                  const cooling = c.bankCoolingOff || {};
                  return (
                    <tr key={c._id}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.profile?.sector || 'General'}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.regNo}</span>
                      </td>
                      <td>
                        <div>{c.ownerUserId?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.ownerUserId?.email}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${
                          c.status === 'Approved' ? 'badge-emerald' :
                          c.status === 'KYB submitted' ? 'badge-amber' :
                          c.status === 'Blocked' ? 'badge-rose' : 'badge-slate'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.bankAccount?.accountNo ? (
                          <div>
                            <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{c.bankAccount.accountNo}</div>
                            {cooling.inCoolingOff ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <span className="badge badge-amber" style={{ padding: '2px 6px', fontSize: '0.675rem' }}>
                                  <Clock size={10} /> Cooling Off ({cooling.hoursRemaining}h left)
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: '#34d399' }}>Verified & Ready</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not configured</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {(() => {
                          const accStatus = c.accountStatus || 'Active';
                          if (accStatus === 'Revoked') return <span className="badge badge-rose">REVOKED</span>;
                          if (accStatus === 'Suspended') return <span className="badge badge-amber">SUSPENDED</span>;
                          return <span className="badge badge-emerald">ACTIVE</span>;
                        })()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {(() => {
                          const fundStatus = c.fundingStatus || 'Allowed';
                          if (fundStatus === 'Revoked') return <span className="badge badge-rose">REVOKED</span>;
                          if (fundStatus === 'Suspended') return <span className="badge badge-amber">SUSPENDED</span>;
                          return <span className="badge badge-emerald">ALLOWED</span>;
                        })()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Layers size={14} color="var(--text-muted)" />
                          <span style={{ fontWeight: 600 }}>{c.projectsCount || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => {
                              setReviewCompany(c);
                              setDecisionReason(c.statusReason || '');
                            }}
                            className="btn-secondary"
                            style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                          >
                            Review KYB
                          </button>
                          <button
                            onClick={() => {
                              setSuspendCompanyModal(c);
                              setSuspendCompType('funding');
                              setSuspendCompTargetStatus(c.fundingStatus === 'Suspended' ? 'Allowed' : 'Suspended');
                              setSuspendCompReason(c.fundingSuspendedReason || '');
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
                            title="Suspend or Revoke company fundraising or account"
                          >
                            <ShieldAlert size={12} />
                            Suspend/Revoke
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(c)}
                            className="btn-danger"
                            style={{
                              padding: '5px 8px',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Delete company"
                          >
                            <Trash2 size={12} />
                            Delete
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

      {/* Onboard Company Modal */}
      {showCreateModal && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '28px', background: 'var(--bg-modal)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>Onboard New Company</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Admin creates the company and initial company owner user (PRD Section 5.2 C-1).
            </p>

            <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Company Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Solar Pvt Ltd"
                    value={newCompany.name}
                    onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Registration / CIN Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. U40106DL2021PTC384920"
                    value={newCompany.regNo}
                    onChange={e => setNewCompany({ ...newCompany, regNo: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name of company owner"
                    value={newCompany.ownerName}
                    onChange={e => setNewCompany({ ...newCompany, ownerName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Owner Email (Login) *</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@company.com"
                    value={newCompany.ownerEmail}
                    onChange={e => setNewCompany({ ...newCompany, ownerEmail: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                    Owner Mobile (10 Digits)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={newCompany.ownerMobile}
                    onKeyDown={e => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewCompany({ ...newCompany, ownerMobile: digits });
                    }}
                    className="input-field"
                  />
                  {newCompany.ownerMobile && newCompany.ownerMobile.length !== 10 && (
                    <span style={{ fontSize: '0.7rem', color: '#DC2626' }}>
                      {10 - newCompany.ownerMobile.length} more digit{10 - newCompany.ownerMobile.length > 1 ? 's' : ''} needed
                    </span>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Sector / Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Clean Energy, AgriTech"
                    value={newCompany.sector}
                    onChange={e => setNewCompany({ ...newCompany, sector: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Company Profile & Business Summary</label>
                <textarea
                  placeholder="Summary of business operations..."
                  value={newCompany.description}
                  onChange={e => setNewCompany({ ...newCompany, description: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Creating...' : 'Create Company & Generate Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYB Review Modal */}
      {reviewCompany && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '28px', background: 'var(--bg-modal)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
              KYB Verification: {reviewCompany.name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Registration CIN: <span style={{ fontFamily: 'var(--font-mono)' }}>{reviewCompany.regNo}</span> • Status: <strong>{reviewCompany.status}</strong>
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Owner:</strong> {reviewCompany.ownerUserId?.name} ({reviewCompany.ownerUserId?.email})</div>
              <div><strong>Sector:</strong> {reviewCompany.profile?.sector || 'General'}</div>
              <div><strong>Bank Account:</strong> {reviewCompany.bankAccount?.accountNo || 'None'} ({reviewCompany.bankAccount?.ifsc || 'N/A'})</div>
              <div><strong>Cooling-Off:</strong> {reviewCompany.bankCoolingOff?.inCoolingOff ? `ACTIVE (${reviewCompany.bankCoolingOff.hoursRemaining} hours left)` : 'Completed / Ready'}</div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Written Reason (Required per PRD Section 5.1 A-6):
              </label>
              <textarea
                value={decisionReason}
                onChange={e => setDecisionReason(e.target.value)}
                placeholder="Reason for approving or rejecting corporate identity documents..."
                className="input-field"
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button disabled={submitting} onClick={() => setReviewCompany(null)} className="btn-secondary">
                Cancel
              </button>
              <button disabled={submitting} onClick={() => handleKybDecision('Rejected')} className="btn-danger">
                Reject KYB
              </button>
              <button disabled={submitting} onClick={() => handleKybDecision('Approved')} className="btn-primary">
                Approve KYB
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Company Suspend or Revoke Privileges Modal */}
      {suspendCompanyModal && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '24px', background: 'var(--bg-modal)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={22} color="#f59e0b" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  Manage Corporate Access & Fundraising
                </h3>
              </div>
              <button
                onClick={() => setSuspendCompanyModal(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Company: <strong>{suspendCompanyModal.legalName || suspendCompanyModal.name}</strong> ({suspendCompanyModal.regNo})
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
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account Access</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: suspendCompanyModal.accountStatus === 'Suspended' ? '#f59e0b' : suspendCompanyModal.accountStatus === 'Revoked' ? '#ef4444' : '#10b981' }}>
                  {suspendCompanyModal.accountStatus || 'Active'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fundraising Capability</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: suspendCompanyModal.fundingStatus === 'Suspended' ? '#f59e0b' : suspendCompanyModal.fundingStatus === 'Revoked' ? '#ef4444' : '#10b981' }}>
                  {suspendCompanyModal.fundingStatus || 'Allowed'}
                </div>
              </div>
            </div>

            {/* Action Scope Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Select Action Scope:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSuspendCompType('funding');
                    setSuspendCompTargetStatus('Suspended');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: suspendCompType === 'funding' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                    background: suspendCompType === 'funding' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    color: suspendCompType === 'funding' ? '#f59e0b' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Fundraising Privileges
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuspendCompType('account');
                    setSuspendCompTargetStatus('Suspended');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: suspendCompType === 'account' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                    background: suspendCompType === 'account' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    color: suspendCompType === 'account' ? '#ef4444' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Corporate Account Access
                </button>
              </div>
            </div>

            {/* Target Status Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Set New Status:
              </label>
              {suspendCompType === 'funding' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Allowed', 'Suspended', 'Revoked'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSuspendCompTargetStatus(st)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: suspendCompTargetStatus === st ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: suspendCompTargetStatus === st ? 'rgba(0, 71, 186, 0.15)' : 'transparent',
                        fontWeight: suspendCompTargetStatus === st ? 700 : 500,
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
                      onClick={() => setSuspendCompTargetStatus(st)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: suspendCompTargetStatus === st ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: suspendCompTargetStatus === st ? 'rgba(0, 71, 186, 0.15)' : 'transparent',
                        fontWeight: suspendCompTargetStatus === st ? 700 : 500,
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
                value={suspendCompReason}
                onChange={e => setSuspendCompReason(e.target.value)}
                placeholder="State the compliance, audit, or corporate rationale for this change..."
                className="input-field"
                rows={3}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                disabled={submitting}
                onClick={() => setSuspendCompanyModal(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleSuspendCompanySubmit}
                className={suspendCompTargetStatus === 'Revoked' ? 'btn-danger' : 'btn-primary'}
                style={{
                  background: suspendCompTargetStatus === 'Revoked' ? '#ef4444' : suspendCompTargetStatus === 'Suspended' ? '#f59e0b' : '#10b981',
                  borderColor: suspendCompTargetStatus === 'Revoked' ? '#ef4444' : suspendCompTargetStatus === 'Suspended' ? '#f59e0b' : '#10b981'
                }}
              >
                {submitting ? 'Applying...' : `Confirm Set to ${suspendCompTargetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
