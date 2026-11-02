import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  X,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Subscriptions() {
  const toast = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCollected: 0,
    mrr: 0,
    activeSubscribers: 0,
    pendingPayments: 0,
    overduePayments: 0
  });

  // Filters
  const [search, setSearch] = useState('');
  const [subscriberTypeFilter, setSubscriberTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSub, setNewSub] = useState({
    subscriberType: 'investor',
    subscriberName: '',
    subscriberEmail: '',
    subscriberMobile: '',
    billingMonth: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    amount: 500,
    status: 'Paid',
    paymentMethod: 'UPI',
    transactionRef: '',
    notes: ''
  });

  const [selectedSub, setSelectedSub] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (subscriberTypeFilter) params.subscriberType = subscriberTypeFilter;
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminApi.getSubscriptions(params);
      if (res.data.success) {
        const list = res.data.subscriptions || res.data.data || [];
        setSubscriptions(list);
        if (res.data.stats) {
          setStats(res.data.stats);
        } else if (res.data.summary) {
          setStats({
            totalCollected: res.data.summary.totalCollected || 0,
            mrr: res.data.summary.monthlyRecurring || 0,
            activeSubscribers: res.data.summary.totalSubscribers || list.length,
            pendingPayments: res.data.summary.pendingCount || 0,
            overduePayments: res.data.summary.overdueCount || 0
          });
        }
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      toast.error('Failed to load subscriptions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [subscriberTypeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSubscriptions();
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await adminApi.updateSubscriptionStatus(id, { status: newStatus });
      if (res.data.success) {
        toast.success(`Subscription marked as ${newStatus}`);
        fetchSubscriptions();
        if (selectedSub && selectedSub._id === id) {
          setSelectedSub({ ...selectedSub, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Status update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update subscription status');
    }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!newSub.subscriberName.trim() || !newSub.subscriberEmail.trim()) {
      toast.warning('Please enter subscriber name and email');
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminApi.recordSubscription(newSub);
      if (res.data.success) {
        toast.success('Subscription fee payment recorded successfully');
        setIsRecordModalOpen(false);
        setNewSub({
          subscriberType: 'investor',
          subscriberName: '',
          subscriberEmail: '',
          subscriberMobile: '',
          billingMonth: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
          amount: 500,
          status: 'Paid',
          paymentMethod: 'UPI',
          transactionRef: '',
          notes: ''
        });
        fetchSubscriptions();
      }
    } catch (err) {
      console.error('Record subscription error:', err);
      toast.error(err.response?.data?.message || 'Failed to record subscription payment');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="badge badge-emerald">PAID</span>;
      case 'Pending':
        return <span className="badge badge-amber">PENDING</span>;
      case 'Overdue':
        return <span className="badge badge-rose">OVERDUE</span>;
      case 'Waived':
        return <span className="badge badge-slate">WAIVED</span>;
      default:
        return <span className="badge badge-slate">{status?.toUpperCase() || 'UNKNOWN'}</span>;
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
            Subscriptions & Platform Fees
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Monitor and record the ₹500 monthly SaaS service fee charged to active investors and listed companies.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="btn-primary"
          style={{ gap: '6px' }}
        >
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Row 1: KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '18px'
      }}>
        {/* Card 1: Total Revenue Collected */}
        <div className="forge-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#0047BA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <DollarSign size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Total Collected</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                ₹{Number(stats.totalCollected || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>Lifetime SaaS software revenue</div>
          </div>
        </div>

        {/* Card 2: Active Monthly Recurring Revenue */}
        <div className="forge-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <TrendingUp size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Monthly Recurring (MRR)</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                ₹{Number(stats.mrr || (stats.activeSubscribers * 500) || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>₹500 / mo per active account</div>
          </div>
        </div>

        {/* Card 3: Active Subscribers */}
        <div className="forge-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#8B5CF6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <Users size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Active Subscribers</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {stats.activeSubscribers || subscriptions.length || 0}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>Investors & Companies</div>
          </div>
        </div>

        {/* Card 4: Overdue & Pending Invoices */}
        <div className="forge-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: stats.overduePayments > 0 ? '#EF4444' : '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <Clock size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Pending / Overdue</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {stats.overduePayments + stats.pendingPayments}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>
              {stats.overduePayments} overdue • {stats.pendingPayments} pending
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '600px' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <input
              type="text"
              placeholder="Search subscriber, invoice, UTR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </form>

          <select
            value={subscriberTypeFilter}
            onChange={(e) => setSubscriberTypeFilter(e.target.value)}
            className="input-field"
            style={{ width: '160px' }}
          >
            <option value="">All Accounts</option>
            <option value="investor">Investors</option>
            <option value="company">Companies</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: '160px' }}
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading subscription database...
          </div>
        ) : subscriptions.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CreditCard size={36} color="var(--text-subtle)" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)' }}>
              No subscription records found
            </div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Use the "Record Payment" button to log manual payments or adjust your search filter.
            </p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Subscriber</th>
                  <th>Type</th>
                  <th>Monthly Fee</th>
                  <th>Billing Month</th>
                  <th>Payment Date</th>
                  <th>Next Due</th>
                  <th>Method & Reference</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const isInvestor = sub.subscriberType === 'investor';
                  return (
                    <tr key={sub._id}>
                      {/* Invoice */}
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {sub.invoiceNumber}
                      </td>

                      {/* Subscriber */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                          {sub.subscriberName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {sub.subscriberEmail}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td>
                        <span className={`badge ${isInvestor ? 'badge-blue' : 'badge-purple'}`}>
                          {isInvestor ? 'INVESTOR' : 'COMPANY'}
                        </span>
                      </td>

                      {/* Fee */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                          ₹{sub.amount || 500}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Monthly Fee
                        </div>
                      </td>

                      {/* Billing Month */}
                      <td style={{ fontWeight: 600, color: 'var(--text-body)' }}>
                        {sub.billingMonth || 'October 2026'}
                      </td>

                      {/* Payment Date */}
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {sub.paymentDate
                          ? new Date(sub.paymentDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '—'}
                      </td>

                      {/* Next Due */}
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {sub.nextDueDate
                          ? new Date(sub.nextDueDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '—'}
                      </td>

                      {/* Method & Ref */}
                      <td>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                          {sub.paymentMethod || 'UPI'}
                        </div>
                        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {sub.transactionRef || 'N/A'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        {renderStatusBadge(sub.status)}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {sub.status !== 'Paid' && (
                            <button
                              onClick={() => handleStatusUpdate(sub._id, 'Paid')}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#15803D' }}
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedSub(sub)}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            Details
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

      {/* MODAL: Record Subscription Payment */}
      {isRecordModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-modal, #FFFFFF)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: 'var(--shadow-modal)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Record Subscription Payment
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Record ₹500 software fee collected from an investor or company
                </p>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRecordSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                  Subscriber Account Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setNewSub({ ...newSub, subscriberType: 'investor' })}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      border: newSub.subscriberType === 'investor' ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                      background: newSub.subscriberType === 'investor' ? 'var(--badge-blue-bg)' : '#FFFFFF',
                      color: newSub.subscriberType === 'investor' ? 'var(--primary-blue)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Users size={16} /> Investor
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewSub({ ...newSub, subscriberType: 'company' })}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      border: newSub.subscriberType === 'company' ? '2px solid #7E22CE' : '1px solid var(--border-light)',
                      background: newSub.subscriberType === 'company' ? 'var(--badge-purple-bg)' : '#FFFFFF',
                      color: newSub.subscriberType === 'company' ? '#7E22CE' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Building2 size={16} /> Company
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                  {newSub.subscriberType === 'company' ? 'Company Name *' : 'Investor Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={newSub.subscriberType === 'company' ? 'e.g. Apex Logistics India Ltd' : 'e.g. Rahul Sharma'}
                  value={newSub.subscriberName}
                  onChange={(e) => setNewSub({ ...newSub, subscriberName: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="billing@domain.com"
                  value={newSub.subscriberEmail}
                  onChange={(e) => setNewSub({ ...newSub, subscriberEmail: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Fee Amount
                  </label>
                  <input
                    type="text"
                    value="₹500 / month"
                    disabled
                    className="input-field"
                    style={{ background: '#F8FAFC', fontWeight: 700, color: '#15803D' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Billing Month
                  </label>
                  <input
                    type="text"
                    value={newSub.billingMonth}
                    onChange={(e) => setNewSub({ ...newSub, billingMonth: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={newSub.paymentMethod}
                    onChange={(e) => setNewSub({ ...newSub, paymentMethod: e.target.value })}
                    className="input-field"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Credit/Debit Card">Credit/Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Transaction UTR / Ref
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-RR-991203"
                    value={newSub.transactionRef}
                    onChange={(e) => setNewSub({ ...newSub, transactionRef: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Details Modal */}
      {selectedSub && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-modal, #FFFFFF)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: 'var(--shadow-modal)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  Invoice: {selectedSub.invoiceNumber}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Platform Software Service Subscription
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subscriber:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{selectedSub.subscriberName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Type:</span>
                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{selectedSub.subscriberType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>
                <span style={{ color: 'var(--text-body)' }}>{selectedSub.subscriberEmail}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subscription Fee:</span>
                <span style={{ fontWeight: 800, color: '#15803D' }}>₹{selectedSub.amount} / month</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <div>{renderStatusBadge(selectedSub.status)}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction Ref:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{selectedSub.transactionRef || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Next Due Date:</span>
                <span style={{ color: 'var(--text-body)' }}>
                  {selectedSub.nextDueDate ? new Date(selectedSub.nextDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                {selectedSub.status !== 'Paid' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedSub._id, 'Paid')}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                  >
                    Mark Paid
                  </button>
                )}
                <button
                  onClick={() => setSelectedSub(null)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
