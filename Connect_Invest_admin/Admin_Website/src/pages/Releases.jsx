import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Search
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Releases() {
  const toast = useToast();
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [disbursementRef, setDisbursementRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReleases();
      if (res.data.success) {
        setReleases(res.data.releases || []);
      }
    } catch (err) {
      console.error('Failed to load fund releases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleApproveRelease = async () => {
    if (!disbursementRef.trim()) {
      toast.warning('A bank disbursement transaction reference / UTR is required');
      return;
    }
    try {
      setSubmitting(true);
      const res = await adminApi.approveRelease(selectedRelease._id, {
        reference: disbursementRef.trim()
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Fund release approved successfully');
        setSelectedRelease(null);
        setDisbursementRef('');
        fetchReleases();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Disbursement approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReleases = releases.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const title = (r.offerId?.title || '').toLowerCase();
    const company = (r.companyId?.name || '').toLowerCase();
    const acct = (r.companyId?.bankAccount?.accountNo || '').toLowerCase();
    const ifsc = (r.companyId?.bankAccount?.ifsc || '').toLowerCase();
    const ref = (r.reference || '').toLowerCase();
    return title.includes(q) || company.includes(q) || acct.includes(q) || ifsc.includes(q) || ref.includes(q);
  });

  return (
    <div className="page-container">
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '8px', background: '#EFF6FF', color: '#0047BA', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
          <ShieldAlert size={14} />
          PLATFORM CAPITAL ROUTING • DIRECT DISBURSEMENT CONSOLE
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A' }}>Company Fund Releases</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Admin fund forwarding to borrowing companies. When investors pay for projects, administrators verify and disburse the collected capital directly to the verified company bank accounts.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {/* In-Page Filter Tabs and Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All Releases (${releases.length})` },
              { id: 'Pending', label: `Pending (${releases.filter(r => r.status === 'Pending').length})` },
              { id: 'Released', label: `Completed (${releases.filter(r => r.status === 'Released').length})` }
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search offer, company, bank account, ref..."
              className="input-field"
              style={{ width: '100%', height: '38px', paddingLeft: '36px', fontSize: '0.825rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading releases from MongoDB...
          </div>
        ) : filteredReleases.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {search.trim() ? `No releases match "${search}". Try adjusting your keywords.` : 'No fund release requests found.'}
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th>Offer / Project</th>
                  <th>Beneficiary Company</th>
                  <th>Amount (INR)</th>
                  <th>Company Settlement Account</th>
                  <th>Cooling-Off Status</th>
                  <th>Status</th>
                  <th>Disbursement Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReleases.map((r, idx) => {
                  const cooling = r.bankCoolingOff || {};
                  const isReleased = r.status === 'Released';

                  return (
                    <tr key={r._id}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <div>{r.offerTitle || r.offerId?.title || r.investmentOfferId?.title || 'Project Opportunity'}</div>
                        {r.investorName && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Funded by: {r.investorName}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.companyName || r.companyId?.name || r.companyId?.legalName || 'Beneficiary Company'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                          Transfer Pending
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>
                        {formatINR(r.amountPaise)}
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {r.companyId?.bankAccount?.accountNo || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {r.companyId?.bankAccount?.ifsc} ({r.companyId?.bankAccount?.bankName || 'Verified Account'})
                        </div>
                      </td>
                      <td>
                        {cooling.inCoolingOff ? (
                          <span className="badge badge-amber">
                            <Clock size={12} /> {cooling.hoursRemaining}h remaining
                          </span>
                        ) : (
                          <span className="badge badge-emerald">
                            <CheckCircle2 size={12} /> Cleared
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${isReleased ? 'badge-emerald' : 'badge-amber'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {!isReleased ? (
                          <button
                            onClick={() => {
                              setSelectedRelease(r);
                              setDisbursementRef(`RZP-UTR-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`);
                            }}
                            className="btn-primary"
                            style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                          >
                            Disburse Funds
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            Ref: {r.reference}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation & Disbursement Modal */}
      {selectedRelease && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: 'min(92vw, 540px)', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: 'var(--bg-modal)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Disburse Funds via Razorpay
              </h3>
              <span style={{ fontSize: '0.72rem', background: '#EFF6FF', color: '#0047BA', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                Razorpay Payouts
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Forward collected investor capital directly to the company verified bank account using Razorpay gateway.
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Project:</strong> {selectedRelease.offerTitle || selectedRelease.offerId?.title || selectedRelease.investmentOfferId?.title || 'Project Opportunity'}</div>
              <div><strong>Beneficiary Company:</strong> {selectedRelease.companyName || selectedRelease.companyId?.name || 'Company'}</div>
              <div><strong>Disbursement Amount:</strong> <span style={{ color: '#059669', fontWeight: 700, fontSize: '1.05rem' }}>{formatINR(selectedRelease.amountPaise)}</span></div>
              <div><strong>Destination Bank A/C:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedRelease.companyId?.bankAccount?.accountNo || selectedRelease.bankAccountSnapshot?.accountNo || '778899001122'}</span></div>
              <div><strong>IFSC Code:</strong> {selectedRelease.companyId?.bankAccount?.ifsc || selectedRelease.bankAccountSnapshot?.ifsc || 'KKBK0008055'}</div>
              <div><strong>Payment Route:</strong> <span style={{ color: '#2563EB', fontWeight: 600 }}>Razorpay Payout Gateway (NEFT/RTGS/IMPS)</span></div>
            </div>

            {selectedRelease.bankCoolingOff?.inCoolingOff && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} color="#fbbf24" />
                <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                  Warning: Bank account is currently in cooling-off period. Release will be refused by server (PRD Section 5.4 F-3).
                </span>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Razorpay Settlement Reference / UTR:
              </label>
              <input
                type="text"
                value={disbursementRef}
                onChange={e => setDisbursementRef(e.target.value)}
                className="input-field"
                placeholder="e.g. UTR-DISB-987654"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button disabled={submitting} onClick={() => setSelectedRelease(null)} className="btn-secondary">
                Cancel
              </button>
              <button disabled={submitting} onClick={handleApproveRelease} className="btn-primary">
                Confirm & Release Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
