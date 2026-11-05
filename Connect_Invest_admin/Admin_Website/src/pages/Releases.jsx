import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Search,
  CreditCard,
  Send
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';
import { RazorpayAdminDisburseModal } from '../components/RazorpayAdminDisburseModal';

export default function Releases() {
  const toast = useToast();
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRazorpayDisburse, setActiveRazorpayDisburse] = useState(null);
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

  const handleOpenDisburseModal = (r) => {
    const amt = r.amount || (r.amountPaise ? r.amountPaise / 100 : 0);
    const companyTitle = r.companyName || r.companyId?.name || r.companyId?.legalName || 'Borrower Company';
    const offerTitle = r.offerTitle || r.offerId?.title || r.investmentOfferId?.title || 'Investment Project';
    const acc = r.companyId?.bankAccount?.accountNo || r.bankAccountSnapshot?.accountNo || 'N/A';
    const ifsc = r.companyId?.bankAccount?.ifsc || r.bankAccountSnapshot?.ifsc || 'N/A';

    setActiveRazorpayDisburse({
      id: r._id,
      amount: amt,
      title: `Forward Capital to ${companyTitle}`,
      recipientName: `${companyTitle} (A/C: ${acc} • ${ifsc})`,
      companyName: companyTitle,
      offerTitle,
      accountNumber: acc
    });
  };

  const handleDisburseSuccess = async (result) => {
    if (!activeRazorpayDisburse) return;
    try {
      setSubmitting(true);
      const res = await adminApi.approveRelease(activeRazorpayDisburse.id, {
        reference: result.utrNumber,
        paymentMethod: result.method || 'Razorpay Direct Disbursement'
      });
      if (res.data.success) {
        toast.success(res.data.message || `Funds (${formatINR(activeRazorpayDisburse.amount * 100)}) successfully disbursed to ${activeRazorpayDisburse.companyName}!`);
        setActiveRazorpayDisburse(null);
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
                            onClick={() => handleOpenDisburseModal(r)}
                            disabled={submitting}
                            className="btn-primary"
                            style={{
                              padding: '6px 14px',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#16A34A',
                              borderColor: '#16A34A',
                              color: '#FFFFFF',
                              borderRadius: '6px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Send size={12} />
                            Pay Company via Razorpay
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            Disbursed Ref: {r.reference}
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

      {/* Razorpay Disbursal Gateway Modal */}
      <RazorpayAdminDisburseModal
        isOpen={!!activeRazorpayDisburse}
        onClose={() => setActiveRazorpayDisburse(null)}
        disburseData={activeRazorpayDisburse}
        onSuccess={handleDisburseSuccess}
      />
    </div>
  );
}
