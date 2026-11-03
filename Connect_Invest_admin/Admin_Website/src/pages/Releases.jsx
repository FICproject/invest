import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2
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

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReleases();
      if (res.data.success) {
        setReleases(res.data.releases);
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

  return (
    <div className="page-container">
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '8px', background: '#EFF6FF', color: '#0047BA', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
          <ShieldAlert size={14} />
          CONFIDENTIAL ADMIN ESCROW GATEWAY • INVESTOR IDENTITY PROTECTED
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A' }}>Company Fund Releases</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Admin pool disbursements to borrowing companies. Investors fund the platform escrow, and administrators disburse aggregate project tranches directly to verified company bank accounts.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading releases from MongoDB...
          </div>
        ) : releases.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No fund release requests pending.
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
                {releases.map((r, idx) => {
                  const cooling = r.bankCoolingOff || {};
                  const isReleased = r.status === 'Released';

                  return (
                    <tr key={r._id}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.offerId?.title || 'Offer'}</td>
                      <td>{r.companyId?.name || 'Company'}</td>
                      <td style={{ fontWeight: 700, color: '#34d399', fontSize: '1rem' }}>
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
                              setDisbursementRef(`UTR-DISB-${Date.now().toString().slice(-6)}`);
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
              Confirm Fund Disbursement
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Two-step confirmation: Verify destination bank details before releasing funds to company.
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Project:</strong> {selectedRelease.offerId?.title}</div>
              <div><strong>Company:</strong> {selectedRelease.companyId?.name}</div>
              <div><strong>Disbursement Amount:</strong> <span style={{ color: '#34d399', fontWeight: 700 }}>{formatINR(selectedRelease.amountPaise)}</span></div>
              <div><strong>Account Number:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedRelease.companyId?.bankAccount?.accountNo}</span></div>
              <div><strong>IFSC:</strong> {selectedRelease.companyId?.bankAccount?.ifsc}</div>
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
                Bank Payout Reference (UTR):
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
