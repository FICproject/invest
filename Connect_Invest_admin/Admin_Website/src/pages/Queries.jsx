import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  PlusCircle,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Building2,
  Users,
  CreditCard,
  X,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Queries() {
  const toast = useToast();
  const [queries, setQueries] = useState([]);
  const [summary, setSummary] = useState({
    totalOpen: 0,
    totalUrgent: 0,
    paymentQueriesCount: 0,
    totalResolved: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [senderFilter, setSenderFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Selected Query Ticket for Detail Drawer / Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyNextStatus, setReplyNextStatus] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // New Ticket Modal (for testing or logging a received query by phone/email)
  const [showNewModal, setShowNewModal] = useState(false);
  const [submittingNew, setSubmittingNew] = useState(false);
  const [newForm, setNewForm] = useState({
    senderType: 'investor',
    userName: '',
    userEmail: '',
    userPhone: '',
    category: 'Payment & Payouts',
    priority: 'Medium',
    subject: '',
    description: '',
    relatedTransactionRef: ''
  });

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        status: statusFilter,
        senderType: senderFilter,
        category: categoryFilter
      };
      const res = await adminApi.getQueries(params);
      if (res.data.success) {
        setQueries(res.data.queries || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        // If an active ticket is open, refresh its data
        if (selectedTicket) {
          const updated = (res.data.queries || []).find(q => q._id === selectedTicket._id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load queries:', err);
      toast.error('Failed to load query tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [statusFilter, senderFilter, categoryFilter]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    fetchQueries();
  };

  const handleSendReply = async e => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.warning('Please enter a response message');
      return;
    }
    try {
      setSubmittingReply(true);
      const res = await adminApi.replyQuery(selectedTicket._id, {
        message: replyMessage.trim(),
        nextStatus: replyNextStatus || undefined
      });
      if (res.data.success) {
        toast.success('Reply dispatched to ticket thread');
        setReplyMessage('');
        setReplyNextStatus('');
        fetchQueries();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to dispatch reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const res = await adminApi.updateQueryStatus(selectedTicket._id, { status: newStatus });
      if (res.data.success) {
        toast.success(`Ticket status updated to ${newStatus}`);
        fetchQueries();
      }
    } catch (err) {
      toast.error('Failed to update ticket status');
    }
  };

  const handleCreateNewQuery = async e => {
    e.preventDefault();
    if (!newForm.subject.trim() || !newForm.description.trim() || !newForm.userName.trim() || !newForm.userEmail.trim()) {
      toast.warning('Please fill in contact name, email, subject, and issue description');
      return;
    }
    try {
      setSubmittingNew(true);
      const res = await adminApi.createQuery(newForm);
      if (res.data.success) {
        toast.success(`Query ticket ${res.data.query.ticketId} logged successfully!`);
        setShowNewModal(false);
        setNewForm({
          senderType: 'investor',
          userName: '',
          userEmail: '',
          userPhone: '',
          category: 'Payment & Payouts',
          priority: 'Medium',
          subject: '',
          description: '',
          relatedTransactionRef: ''
        });
        fetchQueries();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create query ticket');
    } finally {
      setSubmittingNew(false);
    }
  };

  const getPriorityBadgeClass = p => {
    switch (p) {
      case 'Urgent': return 'badge-rose';
      case 'High': return 'badge-amber';
      case 'Medium': return 'badge-blue';
      default: return 'badge-slate';
    }
  };

  const getStatusBadgeClass = s => {
    switch (s) {
      case 'Resolved': return 'badge-emerald';
      case 'In Progress': return 'badge-blue';
      case 'Waiting on User': return 'badge-amber';
      case 'Open': return 'badge-rose';
      default: return 'badge-slate';
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle color="#ef4444" size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Open Inquiries</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{summary.totalOpen}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard color="#f59e0b" size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Payment & Payout Issues</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{summary.paymentQueriesCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert color="#f87171" size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Urgent Priority</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171' }}>{summary.totalUrgent}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 color="#10b981" size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Resolved Tickets</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{summary.totalResolved}</div>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', maxWidth: '450px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Ticket ID, sender, subject, or UTR..."
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
          </div>
          <button type="submit" className="btn-secondary" style={{ padding: '10px 14px' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Sender Type Filter */}
          <select
            value={senderFilter}
            onChange={e => setSenderFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '9px 14px' }}
          >
            <option value="all">All Senders (Investor & Company)</option>
            <option value="investor">Investors</option>
            <option value="company">Companies</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '9px 14px' }}
          >
            <option value="all">All Issue Categories</option>
            <option value="Payment & Payouts">Payment & Payouts</option>
            <option value="Repayment & Dues">Repayment & Dues</option>
            <option value="KYC Verification">KYC Verification</option>
            <option value="KYB Verification">KYB Verification</option>
            <option value="Project & Offer Details">Project & Offer Details</option>
            <option value="Account & Access">Account & Access</option>
            <option value="Other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '9px 14px' }}
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting on User">Waiting on User</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <button onClick={() => setShowNewModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={16} />
            Log Support Query
          </button>
        </div>
      </div>

      {/* Queries Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading support query tickets...
          </div>
        ) : queries.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No query tickets found matching the selected filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Sender</th>
                  <th>Category</th>
                  <th>Subject & Details</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {queries.map(q => {
                  const isInvestor = q.senderType === 'investor';
                  return (
                    <tr
                      key={q._id}
                      style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                      onClick={() => setSelectedTicket(q)}
                    >
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>
                          {q.ticketId}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '4px',
                            borderRadius: '6px',
                            background: isInvestor ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: isInvestor ? '#3b82f6' : '#10b981',
                            display: 'flex'
                          }}>
                            {isInvestor ? <Users size={14} /> : <Building2 size={14} />}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{q.userName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{q.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {q.category}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.subject}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.description}
                        </div>
                        {q.relatedTransactionRef && (
                          <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                            Ref: {q.relatedTransactionRef}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(q.priority)}`}>
                          {q.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(q.status)}`}>
                          {q.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(q.updatedAt || q.createdAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(q);
                          }}
                          className="btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          View & Reply
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details & Reply Modal / Drawer */}
      {selectedTicket && (
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
          zIndex: 60,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '0', background: 'var(--bg-modal)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                    {selectedTicket.ticketId}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                    {selectedTicket.priority} Priority
                  </span>
                  <span className={`badge ${getStatusBadgeClass(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedTicket.subject}
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Thread */}
            <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Meta information bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>From / Sender</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {selectedTicket.userName} ({selectedTicket.senderType})
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedTicket.userEmail} {selectedTicket.userPhone && `• ${selectedTicket.userPhone}`}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Category</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedTicket.category}</div>
                </div>

                {selectedTicket.relatedTransactionRef && (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Related Reference / UTR</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{selectedTicket.relatedTransactionRef}</div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Quick Status Change</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {['In Progress', 'Resolved', 'Closed'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className="btn-secondary"
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.7rem',
                          background: selectedTicket.status === st ? 'var(--brand-primary)' : undefined,
                          color: selectedTicket.status === st ? '#fff' : undefined
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Thread */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  Conversation Thread
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {(selectedTicket.messages || []).map((m, idx) => {
                    const isAdmin = m.senderType === 'admin';
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                          maxWidth: '82%',
                          background: isAdmin ? 'rgba(0, 71, 186, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${isAdmin ? 'rgba(0, 71, 186, 0.28)' : 'var(--border-light)'}`,
                          borderRadius: '12px',
                          padding: '14px 16px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isAdmin ? '#60a5fa' : '#34d399' }}>
                            {m.senderName || (isAdmin ? 'Admin' : selectedTicket.userName)}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {new Date(m.sentAt).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resolution Note if present */}
              {selectedTicket.resolutionNote && (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>Resolution Note</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{selectedTicket.resolutionNote}</div>
                </div>
              )}
            </div>

            {/* Modal Footer / Reply Input */}
            <form onSubmit={handleSendReply} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <textarea
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Type an official admin response or instructions for the user..."
                  className="input-field"
                  rows="2"
                  style={{ flex: 1, resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Update status to:</span>
                  <select
                    value={replyNextStatus}
                    onChange={e => setReplyNextStatus(e.target.value)}
                    className="input-field"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
                  >
                    <option value="">Keep current ({selectedTicket.status})</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting on User">Waiting on User</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setSelectedTicket(null)} className="btn-secondary">
                    Close
                  </button>
                  <button type="submit" disabled={submittingReply} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={15} />
                    {submittingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Support Query Modal */}
      {showNewModal && (
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
          zIndex: 60,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '28px', background: 'var(--bg-modal)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
              Log Inbound Query Ticket
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Record a support query received from an investor or company regarding payments, payouts, or technical issues.
            </p>

            <form onSubmit={handleCreateNewQuery} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>Sender Type *</label>
                  <select
                    value={newForm.senderType}
                    onChange={e => setNewForm({ ...newForm, senderType: e.target.value })}
                    className="input-field"
                  >
                    <option value="investor">Investor</option>
                    <option value="company">Company</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>Category *</label>
                  <select
                    value={newForm.category}
                    onChange={e => setNewForm({ ...newForm, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="Payment & Payouts">Payment & Payouts</option>
                    <option value="Repayment & Dues">Repayment & Dues</option>
                    <option value="KYC Verification">KYC Verification</option>
                    <option value="KYB Verification">KYB Verification</option>
                    <option value="Project & Offer Details">Project & Offer Details</option>
                    <option value="Account & Access">Account & Access</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>Contact Name *</label>
                  <input
                    type="text"
                    value={newForm.userName}
                    onChange={e => setNewForm({ ...newForm, userName: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Ramesh Kumar"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>Contact Email *</label>
                  <input
                    type="email"
                    value={newForm.userEmail}
                    onChange={e => setNewForm({ ...newForm, userEmail: e.target.value })}
                    className="input-field"
                    placeholder="e.g. user@example.com"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>Contact Mobile (10 Digits)</label>
                  <input
                    type="text"
                    maxLength="10"
                    value={newForm.userPhone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewForm({ ...newForm, userPhone: val });
                    }}
                    className="input-field"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>Priority</label>
                  <select
                    value={newForm.priority}
                    onChange={e => setNewForm({ ...newForm, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>Related Transaction Ref / UTR (Optional)</label>
                <input
                  type="text"
                  value={newForm.relatedTransactionRef}
                  onChange={e => setNewForm({ ...newForm, relatedTransactionRef: e.target.value })}
                  className="input-field"
                  placeholder="e.g. UTR-IN-987654321 or PAYOUT-REF-889"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>Subject *</label>
                <input
                  type="text"
                  value={newForm.subject}
                  onChange={e => setNewForm({ ...newForm, subject: e.target.value })}
                  className="input-field"
                  placeholder="Brief summary of inquiry"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>Issue Description *</label>
                <textarea
                  value={newForm.description}
                  onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Detailed notes regarding payment, bank credit, document, etc."
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingNew} className="btn-primary">
                  {submittingNew ? 'Logging...' : 'Create Query Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
