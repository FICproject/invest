import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  RefreshCw,
  Sliders,
  DollarSign,
  Briefcase,
  User,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Send,
  X,
  Check,
  ChevronRight,
  Info,
  Building2,
  FileText,
  History
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { initRealTimeSync } from '../services/realTimeSync';
import { useToast } from '../context/ToastContext';

export default function InvestmentApprovals() {
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalPending: 0,
    changesRequested: 0,
    totalApproved: 0,
    totalRejected: 0,
    pendingCapitalPaise: 0
  });

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'changes_requested' | 'approved' | 'rejected' | 'all'
  const [kindFilter, setKindFilter] = useState('all'); // 'all' | 'company' | 'project'
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Investor Application for Review & Decision Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionTab, setDecisionTab] = useState('changes_requested'); // 'changes_requested' | 'approve' | 'reject'

  // Counter-Proposal / Revision Form State
  const [proposedAmount, setProposedAmount] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch investor requests from API
  const fetchRequests = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await adminApi.getInvestorRequests({
        status: statusFilter,
        search: searchTerm,
        kind: kindFilter
      });

      if (res.data?.success) {
        setRequests(res.data.requests || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load investor investment requests:', err);
      if (!silent) {
        toast.error(err.response?.data?.error || 'Failed to load investment requests');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, kindFilter]);

  // Real-time synchronization
  useEffect(() => {
    const unsub = initRealTimeSync((eventType, payload) => {
      if (
        eventType === 'INVESTMENT_DECISION' ||
        eventType === 'INVESTMENT_UPDATED' ||
        eventType === 'INVESTOR_REQUEST_DECIDED'
      ) {
        fetchRequests(true);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Handle open review modal
  const handleOpenReview = (reqItem, defaultTab = 'changes_requested') => {
    setSelectedRequest(reqItem);
    setDecisionTab(defaultTab);
    const existingProposed = reqItem.proposedAmount || reqItem.amountInvested || reqItem.amount || '';
    setProposedAmount(existingProposed ? String(existingProposed) : '');
    setFeedback(reqItem.adminSuggestions || reqItem.adminFeedback || '');
    setRejectionReason(reqItem.rejectionReason || '');
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setProposedAmount('');
    setFeedback('');
    setRejectionReason('');
  };

  // Submit Admin Decision (Approve / Reject / Changes Requested)
  const handleSubmitDecision = async () => {
    if (!selectedRequest) return;

    if (decisionTab === 'changes_requested') {
      const numProposed = Number(proposedAmount);
      if (!numProposed || numProposed <= 0) {
        toast.warning('Please enter a valid counter-proposed investment amount.');
        return;
      }
      if (!feedback.trim()) {
        toast.warning('Please provide instructions/feedback for the investor explaining the revised amount.');
        return;
      }
    }

    if (decisionTab === 'reject') {
      if (!rejectionReason.trim()) {
        toast.warning('Please provide a reason for rejecting this investment request.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const decisionType =
        decisionTab === 'approve'
          ? 'Approved'
          : decisionTab === 'reject'
          ? 'Rejected'
          : 'Changes Requested';

      const payload = {
        decision: decisionType,
        feedback: feedback.trim(),
        proposedAmount: decisionTab === 'changes_requested' ? Number(proposedAmount) : undefined,
        rejectionReason: decisionTab === 'reject' ? rejectionReason.trim() : undefined
      };

      const res = await adminApi.decideInvestorRequest(selectedRequest._id, payload);

      if (res.data?.success) {
        toast.success(res.data.message || `Investment request has been marked as ${decisionType}.`);
        handleCloseModal();
        fetchRequests();
      } else {
        toast.error(res.data?.error || 'Failed to process decision.');
      }
    } catch (err) {
      console.error('Decision submission error:', err);
      toast.error(err.response?.data?.error || 'An error occurred while submitting decision.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper formatting
  const getDisplayAmount = (reqItem) => {
    const val = reqItem.amountInvested || reqItem.amount || 0;
    return Number(val);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('approved') || s.includes('confirmed') || s.includes('active')) {
      return {
        bg: '#ECFDF5',
        color: '#065F46',
        border: '#A7F3D0',
        label: 'Approved / Active',
        icon: <CheckCircle2 size={13} color="#059669" />
      };
    }
    if (s.includes('changes') || s.includes('resubmission')) {
      return {
        bg: '#FFFBEB',
        color: '#92400E',
        border: '#FDE68A',
        label: 'Changes Requested',
        icon: <AlertTriangle size={13} color="#D97706" />
      };
    }
    if (s.includes('reject')) {
      return {
        bg: '#FEF2F2',
        color: '#991B1B',
        border: '#FECACA',
        label: 'Rejected',
        icon: <XCircle size={13} color="#DC2626" />
      };
    }
    return {
      bg: '#EFF6FF',
      color: '#1E40AF',
      border: '#BFDBFE',
      label: 'Pending Review',
      icon: <Clock size={13} color="#2563EB" />
    };
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0047BA'
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                fontFamily: 'var(--font-heading)'
              }}
            >
              Investment Approvals
            </h1>
            <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '2px 0 0 0' }}>
              Review, approve, reject, or request resubmission on investor investment applications across corporate and project offerings.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fetchRequests()}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        {/* 1. Pending Review */}
        <div
          onClick={() => setStatusFilter('pending')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '18px 20px',
            border: statusFilter === 'pending' ? '2px solid #0047BA' : '1px solid var(--border-light)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0047BA', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Pending Review
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={15} color="#0047BA" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            {stats.totalPending}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>awaiting decision</span>
        </div>

        {/* 2. Changes Requested */}
        <div
          onClick={() => setStatusFilter('changes_requested')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '18px 20px',
            border: statusFilter === 'changes_requested' ? '2px solid #D97706' : '1px solid var(--border-light)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D97706', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Changes Requested
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={15} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', lineHeight: 1.2 }}>
            {stats.changesRequested}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>with investors</span>
        </div>

        {/* 3. Approved / Active */}
        <div
          onClick={() => setStatusFilter('approved')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '18px 20px',
            border: statusFilter === 'approved' ? '2px solid #059669' : '1px solid var(--border-light)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Approved / Active
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={15} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
            {stats.totalApproved}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>allocated & live</span>
        </div>

        {/* 4. Rejected */}
        <div
          onClick={() => setStatusFilter('rejected')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '18px 20px',
            border: statusFilter === 'rejected' ? '2px solid #DC2626' : '1px solid var(--border-light)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#DC2626', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Rejected
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={15} color="#DC2626" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#DC2626', lineHeight: 1.2 }}>
            {stats.totalRejected}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>ineligible</span>
        </div>

        {/* 5. Pending Capital Demand */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '18px 20px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Pending Capital
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={15} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            {formatINR(stats.pendingCapitalPaise)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>across pending requests</span>
        </div>
      </div>

      {/* Filter Tabs & In-Page Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-light)',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          {[
            { id: 'pending', label: 'Pending Review', count: stats.totalPending },
            { id: 'changes_requested', label: 'Changes Requested', count: stats.changesRequested },
            { id: 'approved', label: 'Approved & Live', count: stats.totalApproved },
            { id: 'rejected', label: 'Rejected', count: stats.totalRejected },
            { id: 'all', label: 'All Requests', count: stats.total }
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? '#0047BA' : '#F1F5F9',
                  color: isActive ? '#FFFFFF' : '#475569',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controls: Search and Kind Select */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* In-page Search Bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '520px' }}>
            <Search
              size={16}
              color="#94A3B8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by investor name, email, PAN, opportunity, or company..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') fetchRequests();
              }}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                backgroundColor: '#F8FAFC',
                fontSize: '0.84rem',
                color: '#1E293B',
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
            />
          </div>

          {/* Kind Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Target Type:</span>
            <select
              value={kindFilter}
              onChange={e => setKindFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.84rem',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Opportunities</option>
              <option value="company">Company Debt Investment</option>
              <option value="project">Project Investment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investor Requests Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-light)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: '#0047BA' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading investor investment requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#94A3B8'
              }}
            >
              <TrendingUp size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
              No investment applications found
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', maxWidth: '440px', margin: '0 auto' }}>
              No investor requests match your current filters. As investors apply to participate in live company or project opportunities, their requests will appear here for underwriting approval.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Investor
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Opportunity / Target
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Requested Amount
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Terms
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map(reqItem => {
                  const investor = reqItem.investorId;
                  const offer = reqItem.offerId;
                  const badge = getStatusBadge(reqItem.status);
                  const amount = getDisplayAmount(reqItem);
                  const hasProposed = reqItem.proposedAmount && reqItem.proposedAmount !== amount;

                  return (
                    <tr
                      key={reqItem._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* 1. Investor Info */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              color: '#0047BA',
                              fontSize: '0.9rem'
                            }}
                          >
                            {(investor?.name || 'I')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{investor?.name || 'Verified Investor'}</span>
                              {reqItem.investorKycStatus === 'Approved' && (
                                <span title="KYC Compliant" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                  <ShieldCheck size={14} color="#059669" />
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              {investor?.email || '—'}
                            </div>
                            {reqItem.investorPan && (
                              <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                                PAN: {reqItem.investorPan}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Opportunity Details */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                            {offer ? offer.title || offer.companyName : 'Direct Corporate Opportunity'}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#0047BA', fontWeight: 600 }}>
                            {offer ? offer.companyName : 'Registered Entity'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: offer?.kind === 'project' ? '#EFF6FF' : '#F5F3FF',
                                color: offer?.kind === 'project' ? '#1D4ED8' : '#6D28D9'
                              }}
                            >
                              {offer?.kind === 'project' ? 'Project' : 'Company'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Requested Amount */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>
                            ₹{amount.toLocaleString('en-IN')}
                          </span>
                          {hasProposed && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: '#D97706',
                                marginTop: '2px'
                              }}
                            >
                              Counter: ₹{Number(reqItem.proposedAmount).toLocaleString('en-IN')}
                            </span>
                          )}
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                            {new Date(reqItem.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>

                      {/* 4. Terms */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                          <span style={{ color: '#059669', fontWeight: 700 }}>
                            {reqItem.returnRate || offer?.returnRate || 12}% p.a.
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                          Tenure: {reqItem.tenureMonths || offer?.tenureMonths || 12} Mos
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td style={{ padding: '16px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`
                          }}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>

                      {/* 6. Review Action */}
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenReview(reqItem, 'changes_requested')}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '10px',
                            backgroundColor: '#0047BA',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Sliders size={13} />
                          Review Application
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

      {/* Review & Decision Modal */}
      {selectedRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={e => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                backgroundColor: '#FFFFFF',
                zIndex: 10
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0047BA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Underwriting & Capital Allocation
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 0 0' }}>
                  Review Investor Application
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Applicant & Opportunity Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Investor Box */}
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Investor Profile
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>
                    {selectedRequest.investorId?.name || 'Verified Investor'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    {selectedRequest.investorId?.email || '—'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Mobile: {selectedRequest.investorId?.mobile || '—'}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: selectedRequest.investorKycStatus === 'Approved' ? '#ECFDF5' : '#FFFBEB',
                        color: selectedRequest.investorKycStatus === 'Approved' ? '#065F46' : '#92400E'
                      }}
                    >
                      KYC: {selectedRequest.investorKycStatus || 'Pending'}
                    </span>
                    {selectedRequest.investorPan && (
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                        PAN: {selectedRequest.investorPan}
                      </span>
                    )}
                  </div>
                </div>

                {/* Target Opportunity Box */}
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Target Opportunity
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>
                    {selectedRequest.offerId?.title || 'Corporate Opportunity'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#0047BA', fontWeight: 600, marginTop: '2px' }}>
                    {selectedRequest.offerId?.companyName || 'Enterprise Partner'}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Return Rate</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>
                        {selectedRequest.returnRate || selectedRequest.offerId?.returnRate || 12}% p.a.
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Tenure</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                        {selectedRequest.tenureMonths || selectedRequest.offerId?.tenureMonths || 12} Months
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                      Requested Investment Amount
                    </span>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0047BA' }}>
                      ₹{getDisplayAmount(selectedRequest).toLocaleString('en-IN')}
                    </div>
                  </div>
                  {selectedRequest.proposedAmount && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>
                        Admin Counter Offer
                      </span>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#D97706' }}>
                        ₹{Number(selectedRequest.proposedAmount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>
                {selectedRequest.investorNote && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #DBEAFE', fontSize: '0.82rem', color: '#1E293B' }}>
                    <strong>Investor's Note:</strong> {selectedRequest.investorNote}
                  </div>
                )}
              </div>

              {/* Revision History (if previously negotiated) */}
              {selectedRequest.revisionHistory && selectedRequest.revisionHistory.length > 0 && (
                <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#92400E', marginBottom: '8px' }}>
                    <History size={14} />
                    <span>Previous Revision Rounds</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedRequest.revisionHistory.map((rev, idx) => (
                      <div key={idx} style={{ fontSize: '0.78rem', color: '#78350F' }}>
                        Round {idx + 1}: Proposed ₹{Number(rev.proposedAmount || 0).toLocaleString('en-IN')} — <em>"{rev.feedback || 'Revision requested'}"</em>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Tabs */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                  Select Underwriting Decision:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setDecisionTab('changes_requested')}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: decisionTab === 'changes_requested' ? '2px solid #D97706' : '1px solid var(--border-light)',
                      backgroundColor: decisionTab === 'changes_requested' ? '#FFFBEB' : '#FFFFFF',
                      color: decisionTab === 'changes_requested' ? '#92400E' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Sliders size={15} color={decisionTab === 'changes_requested' ? '#D97706' : '#64748B'} />
                    Request Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionTab('approve')}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: decisionTab === 'approve' ? '2px solid #059669' : '1px solid var(--border-light)',
                      backgroundColor: decisionTab === 'approve' ? '#ECFDF5' : '#FFFFFF',
                      color: decisionTab === 'approve' ? '#065F46' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCircle2 size={15} color={decisionTab === 'approve' ? '#059669' : '#64748B'} />
                    Approve / Accept
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionTab('reject')}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: decisionTab === 'reject' ? '2px solid #DC2626' : '1px solid var(--border-light)',
                      backgroundColor: decisionTab === 'reject' ? '#FEF2F2' : '#FFFFFF',
                      color: decisionTab === 'reject' ? '#991B1B' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <XCircle size={15} color={decisionTab === 'reject' ? '#DC2626' : '#64748B'} />
                    Reject Application
                  </button>
                </div>
              </div>

              {/* Form Content Based on Selected Decision */}
              {decisionTab === 'changes_requested' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px', borderRadius: '12px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E', display: 'block', marginBottom: '6px' }}>
                      Counter-Proposed Investment Amount (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={proposedAmount}
                      onChange={e => setProposedAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #FCD34D',
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '4px', display: 'block' }}>
                      Original requested amount: ₹{getDisplayAmount(selectedRequest).toLocaleString('en-IN')}. Set a revised maximum or suitable participation sum.
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E', display: 'block', marginBottom: '6px' }}>
                      Instructions / Notes for Investor *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain to the investor why the amount is being revised (e.g. round cap limits, allocation tiers, or diversification guidelines)..."
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #FCD34D',
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.84rem',
                        color: '#0F172A',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              )}

              {decisionTab === 'approve' && (
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#065F46' }}>
                        Ready to Allocate Investment
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#047857', margin: '2px 0 0 0' }}>
                        Approving will confirm the investment of <strong>₹{getDisplayAmount(selectedRequest).toLocaleString('en-IN')}</strong>, update total funds raised for <strong>{selectedRequest.offerId?.title || 'the opportunity'}</strong>, create the ledger transaction record, and initiate scheduled return payouts.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#065F46', display: 'block', marginBottom: '4px' }}>
                      Approval Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Verified compliance, allocated full requested ticket size."
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #A7F3D0',
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.84rem',
                        color: '#0F172A',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {decisionTab === 'reject' && (
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#991B1B', display: 'block', marginBottom: '6px' }}>
                      Reason for Rejection *
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #FCA5A5',
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.84rem',
                        color: '#0F172A',
                        outline: 'none',
                        marginBottom: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Select a common reason...</option>
                      <option value="Maximum capital limit reached for this offering">Maximum capital limit reached for this offering</option>
                      <option value="Risk suitability threshold not satisfied">Risk suitability threshold not satisfied</option>
                      <option value="Investor KYC / documentation pending verification">Investor KYC / documentation pending verification</option>
                      <option value="Opportunity round closed to further commitments">Opportunity round closed to further commitments</option>
                      <option value="Custom underwriting determination">Other / Custom determination</option>
                    </select>

                    <textarea
                      rows={2}
                      placeholder="Provide specific details or custom rejection notes sent to the investor..."
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #FCA5A5',
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.84rem',
                        color: '#0F172A',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                backgroundColor: '#F8FAFC',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px'
              }}
            >
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitDecision}
                disabled={submitting}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor:
                    decisionTab === 'approve'
                      ? '#059669'
                      : decisionTab === 'reject'
                      ? '#DC2626'
                      : '#D97706',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="spin" />
                    <span>Processing...</span>
                  </>
                ) : decisionTab === 'approve' ? (
                  <>
                    <Check size={16} />
                    <span>Confirm & Approve Investment</span>
                  </>
                ) : decisionTab === 'reject' ? (
                  <>
                    <X size={16} />
                    <span>Reject Application</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Resubmission with Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
