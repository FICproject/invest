import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Building2,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Download,
  FileText,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  Percent,
  Coins,
  History,
  ShieldAlert,
  Send,
  X,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { adminApi, formatINR, rupeesToPaise } from '../services/api';
import { initRealTimeSync } from '../services/realTimeSync';
import { useToast } from '../context/ToastContext';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

export default function InvestmentApprovals() {
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalPending: 0,
    totalApproved: 0,
    resubmissionsNeeded: 0,
    totalRejected: 0,
    pendingCapitalPaise: 0
  });

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'all' | 'resubmission' | 'approved' | 'rejected'
  const [modelFilter, setModelFilter] = useState('all'); // 'all' | 'Fixed-Term' | 'Equity'
  const [purposeFilter, setPurposeFilter] = useState('all'); // 'all' | 'Company Investment' | 'Project Investment'
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Proposal for Review & Decision Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decisionTab, setDecisionTab] = useState('resubmission'); // 'resubmission' | 'approve' | 'reject'

  // Counter-Proposal / Revision Form State
  const [proposedFundingTarget, setProposedFundingTarget] = useState('');
  const [proposedReturnRate, setProposedReturnRate] = useState('');
  const [proposedDurationMonths, setProposedDurationMonths] = useState('');
  const [proposedMinInvestment, setProposedMinInvestment] = useState('');
  const [feedback, setFeedback] = useState('');
  const [publishToMarketplace, setPublishToMarketplace] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState(null);

  // Fetch proposals from API
  const fetchProposals = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await adminApi.getFundingRequests({
        status: statusFilter,
        search: searchTerm,
        investmentModel: modelFilter,
        investmentPurpose: purposeFilter
      });

      if (res.data?.success) {
        setRequests(res.data.requests || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load investment approvals:', err);
      if (!silent) {
        toast.error(err.response?.data?.error || 'Failed to load investment requests');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [statusFilter, modelFilter, purposeFilter, searchTerm]);

  // Connect Real-Time SSE Stream for Instant Updates
  useEffect(() => {
    const cleanup = initRealTimeSync(event => {
      if (
        event?.type === 'DATA_SYNC' &&
        (event.entity === 'INVESTMENT_APPROVAL' ||
          event.entity === 'FUNDING_REQUEST_DECISION' ||
          event.entity === 'INVESTMENT_REQUEST')
      ) {
        fetchProposals(true);
      }
    });
    return cleanup;
  }, [statusFilter, modelFilter, purposeFilter, searchTerm]);

  // Open modal with pre-populated values
  const handleOpenReview = (request, defaultTab = 'resubmission') => {
    setSelectedRequest(request);
    setDecisionTab(defaultTab);

    // Pre-populate fields with existing or proposed values
    setProposedFundingTarget(
      request.proposedFundingTarget !== null && request.proposedFundingTarget !== undefined
        ? String(request.proposedFundingTarget)
        : String(request.fundingTarget || '')
    );
    setProposedReturnRate(
      request.proposedReturnRate !== null && request.proposedReturnRate !== undefined
        ? String(request.proposedReturnRate)
        : String(request.expectedReturnRate || request.agreedReturnRate || '')
    );
    setProposedDurationMonths(
      request.proposedDurationMonths !== null && request.proposedDurationMonths !== undefined
        ? String(request.proposedDurationMonths)
        : String(request.durationMonths || (request.investmentPeriodYears ? request.investmentPeriodYears * 12 : 24))
    );
    setProposedMinInvestment(
      request.proposedMinInvestment !== null && request.proposedMinInvestment !== undefined
        ? String(request.proposedMinInvestment)
        : String(request.minInvestment || '')
    );
    setFeedback(request.reviewerFeedback || '');
    setPublishToMarketplace(true);
  };

  // Submit decision
  const handleSubmitDecision = async (decisionOverride = null) => {
    if (!selectedRequest) return;
    const targetDecision = decisionOverride || (
      decisionTab === 'approve'
        ? 'Approved'
        : decisionTab === 'reject'
        ? 'Rejected'
        : 'Resubmission Required'
    );

    const trimmedFeedback = feedback.trim();

    if (targetDecision === 'Rejected' && !trimmedFeedback) {
      toast.warning('Please provide an underwriting rejection reason for the borrowing company.');
      return;
    }

    if (targetDecision === 'Resubmission Required') {
      if (!trimmedFeedback) {
        toast.warning('Please provide detailed review comments explaining the requested changes.');
        return;
      }
      if (!proposedFundingTarget || Number(proposedFundingTarget) <= 0) {
        toast.warning('Please specify a valid proposed funding amount in Rupees.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        decision: targetDecision,
        feedback: trimmedFeedback,
        publishToMarketplace,
        proposedFundingTarget: proposedFundingTarget ? Number(proposedFundingTarget) : undefined,
        proposedReturnRate: proposedReturnRate ? Number(proposedReturnRate) : undefined,
        proposedDurationMonths: proposedDurationMonths ? Number(proposedDurationMonths) : undefined,
        proposedMinInvestment: proposedMinInvestment ? Number(proposedMinInvestment) : undefined
      };

      const res = await adminApi.decideFundingRequest(selectedRequest._id, payload);
      if (res.data?.success) {
        toast.success(
          targetDecision === 'Approved'
            ? 'Investment request approved successfully!'
            : targetDecision === 'Rejected'
            ? 'Investment request rejected.'
            : 'Resubmission request sent to company with proposed changes!'
        );
        setSelectedRequest(null);
        fetchProposals(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for status badge presentation
  const getStatusBadge = status => {
    switch (status) {
      case 'Approved':
      case 'Open for Investment':
      case 'Funded':
      case 'Funding Completed':
        return {
          bg: '#DCFCE7',
          color: '#15803D',
          border: '#86EFAC',
          icon: CheckCircle2,
          label: status === 'Open for Investment' ? 'Live in Marketplace' : status
        };
      case 'Rejected':
      case 'Cancelled':
        return {
          bg: '#FEE2E2',
          color: '#B91C1C',
          border: '#FCA5A5',
          icon: XCircle,
          label: status
        };
      case 'Resubmission Required':
      case 'Changes Requested':
      case 'Additional Information Required':
        return {
          bg: '#FEF3C7',
          color: '#B45309',
          border: '#FCD34D',
          icon: AlertTriangle,
          label: 'Changes Requested / Resubmission'
        };
      default:
        return {
          bg: '#DBEAFE',
          color: '#1D4ED8',
          border: '#93C5FD',
          icon: Clock,
          label: 'Pending Review'
        };
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px 28px' }}>
      {/* Top Banner & Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#0047BA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <CheckSquare size={22} />
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
                Underwriting evaluation, compliance checks, and approval workflow for company capital raising proposals
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Live Sync Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#059669',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 0 2px #6EE7B7'
              }}
            />
            Live Sync Connected
          </div>

          <button
            onClick={() => fetchProposals(false)}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Card 1: Pending Review */}
        <div
          className="forge-card"
          onClick={() => setStatusFilter('pending')}
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            border: statusFilter === 'pending' ? '2px solid #0047BA' : '1px solid var(--border-light)',
            backgroundColor: statusFilter === 'pending' ? '#F0F7FF' : '#FFFFFF',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Pending Review
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#DBEAFE',
                color: '#1D4ED8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={16} />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {stats.totalPending || 0}
            </span>
            <span style={{ fontSize: '0.76rem', color: '#64748B', marginLeft: '6px' }}>awaiting decision</span>
          </div>
        </div>

        {/* Card 2: Changes / Resubmission Required */}
        <div
          className="forge-card"
          onClick={() => setStatusFilter('resubmission')}
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            border: statusFilter === 'resubmission' ? '2px solid #F59E0B' : '1px solid var(--border-light)',
            backgroundColor: statusFilter === 'resubmission' ? '#FEFCE8' : '#FFFFFF',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Changes Requested
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B45309', lineHeight: 1 }}>
              {stats.resubmissionsNeeded || 0}
            </span>
            <span style={{ fontSize: '0.76rem', color: '#64748B', marginLeft: '6px' }}>with companies</span>
          </div>
        </div>

        {/* Card 3: Approved / Live */}
        <div
          className="forge-card"
          onClick={() => setStatusFilter('approved')}
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            border: statusFilter === 'approved' ? '2px solid #10B981' : '1px solid var(--border-light)',
            backgroundColor: statusFilter === 'approved' ? '#F0FDF4' : '#FFFFFF',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Approved / Live
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803D', lineHeight: 1 }}>
              {stats.totalApproved || 0}
            </span>
            <span style={{ fontSize: '0.76rem', color: '#64748B', marginLeft: '6px' }}>funded / active</span>
          </div>
        </div>

        {/* Card 4: Rejected */}
        <div
          className="forge-card"
          onClick={() => setStatusFilter('rejected')}
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            border: statusFilter === 'rejected' ? '2px solid #EF4444' : '1px solid var(--border-light)',
            backgroundColor: statusFilter === 'rejected' ? '#FEF2F2' : '#FFFFFF',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Rejected
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <XCircle size={16} />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B91C1C', lineHeight: 1 }}>
              {stats.totalRejected || 0}
            </span>
            <span style={{ fontSize: '0.76rem', color: '#64748B', marginLeft: '6px' }}>ineligible</span>
          </div>
        </div>

        {/* Card 5: Pending Capital Demand */}
        <div
          className="forge-card"
          style={{
            padding: '18px 20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Pending Capital
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#FEF9C3',
                color: '#854D0E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Coins size={16} />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
              {stats.pendingCapitalPaise ? formatINR(stats.pendingCapitalPaise) : '₹0'}
            </span>
            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>across pending requests</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="forge-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {/* Status Tab Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          {[
            { id: 'pending', label: 'Pending Review', count: stats.totalPending },
            { id: 'resubmission', label: 'Changes Requested', count: stats.resubmissionsNeeded },
            { id: 'approved', label: 'Approved & Live', count: stats.totalApproved },
            { id: 'rejected', label: 'Rejected', count: stats.totalRejected },
            { id: 'all', label: 'All Proposals', count: stats.total }
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
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid #0047BA' : '1px solid var(--border-light)',
                  backgroundColor: isActive ? '#0047BA' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Dropdown Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={16}
              color="#94A3B8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by proposal title, company name, legal CIN, or category..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                fontSize: '0.86rem',
                outline: 'none',
                backgroundColor: '#F8FAFC',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Model Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Model:</span>
            <select
              value={modelFilter}
              onChange={e => setModelFilter(e.target.value)}
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
              <option value="all">All Models</option>
              <option value="Fixed-Term">Fixed-Term (Debt)</option>
              <option value="Equity">Equity (Shares)</option>
            </select>
          </div>

          {/* Purpose Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Purpose:</span>
            <select
              value={purposeFilter}
              onChange={e => setPurposeFilter(e.target.value)}
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
              <option value="all">All Purposes</option>
              <option value="Company Investment">Company Investment</option>
              <option value="Project Investment">Project Investment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="forge-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#0047BA' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading investment requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <CheckSquare size={36} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
              No investment proposals found
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8' }}>
              {searchTerm || statusFilter !== 'all' || modelFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'There are currently no proposals in this queue.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-light)', color: '#475569' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Company & Proposal Title</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Model & Category</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Requested Capital</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Interest / Return Rate</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tenure / Duration</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  const badge = getStatusBadge(req.status);
                  const BadgeIcon = badge.icon;
                  const companyName = req.companyId?.name || req.companyId?.legalName || 'Registered Enterprise';
                  const hasProposedChanges =
                    req.proposedFundingTarget !== null &&
                    req.proposedFundingTarget !== undefined &&
                    (req.status === 'Resubmission Required' || req.status === 'Changes Requested');

                  return (
                    <tr
                      key={req._id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Company & Title */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#0047BA',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              flexShrink: 0
                            }}
                          >
                            {companyName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                              {req.title || req.entityOrProjectName || 'Capital Raise'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                                {companyName}
                              </span>
                              {req.companyId?.cin && (
                                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                  ({req.companyId.cin})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Model & Category */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              backgroundColor: req.investmentModel === 'Equity' ? '#F5F3FF' : '#EFF6FF',
                              color: req.investmentModel === 'Equity' ? '#7C3AED' : '#1D4ED8',
                              border: req.investmentModel === 'Equity' ? '1px solid #DDD6FE' : '1px solid #BFDBFE',
                              width: 'fit-content'
                            }}
                          >
                            {req.investmentModel || 'Fixed-Term'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {req.investmentPurpose || req.category || 'Company Investment'}
                          </span>
                        </div>
                      </td>

                      {/* Requested Capital */}
                      <td style={{ padding: '14px 18px' }}>
                        <div>
                          <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                            {formatINR(req.fundingTarget * 100)}
                          </span>
                          {hasProposedChanges && (
                            <div
                              style={{
                                marginTop: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                color: '#B45309',
                                backgroundColor: '#FEF3C7',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}
                              title="Counter amount proposed by admin"
                            >
                              Proposed: {formatINR(req.proposedFundingTarget * 100)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Interest / Return Rate */}
                      <td style={{ padding: '14px 18px' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>
                            {req.expectedReturnRate || req.agreedReturnRate || 0}% p.a.
                          </span>
                          {req.returnStructure && (
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                              {req.returnStructure}
                            </div>
                          )}
                          {hasProposedChanges && req.proposedReturnRate && (
                            <div
                              style={{
                                marginTop: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                color: '#B45309',
                                backgroundColor: '#FEF3C7',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}
                              title="Counter interest rate proposed by admin"
                            >
                              Proposed: {req.proposedReturnRate}% p.a.
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Tenure / Duration */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ color: '#334155', fontWeight: 600 }}>
                          {req.durationMonths ? `${req.durationMonths} Months` : `${req.investmentPeriodYears || 2} Years`}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                          Min: {formatINR((req.minInvestment || 25000) * 100)}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <BadgeIcon size={13} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenReview(req, 'resubmission')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #0047BA',
                              backgroundColor: '#EFF6FF',
                              color: '#0047BA',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={13} />
                            <span>Review & Decide</span>
                          </button>

                          {['Submitted', 'Under Review'].includes(req.status) && (
                            <>
                              <button
                                onClick={() => handleOpenReview(req, 'resubmission')}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid #FCD34D',
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                title="Ask for Resubmission with Changes"
                              >
                                Changes
                              </button>

                              <button
                                onClick={() => handleOpenReview(req, 'approve')}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  backgroundColor: '#10B981',
                                  color: '#FFFFFF',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                title="Quick Approve"
                              >
                                Approve
                              </button>
                            </>
                          )}
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

      {/* Review & Decision Modal */}
      {selectedRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
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
                backgroundColor: '#F8FAFC'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#EFF6FF',
                      color: '#0047BA',
                      border: '1px solid #BFDBFE'
                    }}
                  >
                    {selectedRequest.investmentModel}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    {selectedRequest.investmentPurpose}
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: '4px 0 0 0'
                  }}
                >
                  {selectedRequest.title || selectedRequest.entityOrProjectName}
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                  Submitted by{' '}
                  <strong style={{ color: '#1E293B' }}>
                    {selectedRequest.companyId?.name || selectedRequest.companyId?.legalName}
                  </strong>
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Proposal Overview Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '14px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Requested Target
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                    {formatINR((selectedRequest.fundingTarget || 0) * 100)}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Offered Return / Interest
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                    {selectedRequest.expectedReturnRate || selectedRequest.agreedReturnRate || 0}% p.a.
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Tenure / Duration
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B' }}>
                    {selectedRequest.durationMonths
                      ? `${selectedRequest.durationMonths} Months`
                      : `${selectedRequest.investmentPeriodYears || 2} Years`}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, display: 'block' }}>
                    Ticket Limits
                  </span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
                    Min: {formatINR((selectedRequest.minInvestment || 25000) * 100)}
                  </span>
                </div>
              </div>

              {/* Company Details & Use of Funds */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px 16px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                    Enterprise Verification
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                    <div><strong>Legal Name:</strong> {selectedRequest.companyId?.legalName || selectedRequest.companyId?.name}</div>
                    <div><strong>CIN / Reg No:</strong> {selectedRequest.companyId?.cin || 'Verified in KYB'}</div>
                    <div><strong>PAN:</strong> {selectedRequest.companyId?.pan || 'Verified'}</div>
                    <div><strong>Sector / Industry:</strong> {selectedRequest.companyId?.profile?.sector || selectedRequest.category}</div>
                    <div><strong>Contact Email:</strong> {selectedRequest.companyId?.ownerUserId?.email || selectedRequest.companyId?.contactEmail || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px 16px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                    Capital Deployment Plan
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    {selectedRequest.useOfFunds || selectedRequest.shortDescription || 'Operational scaling and capital expenditures'}
                  </p>
                  {selectedRequest.detailedDescription && (
                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '8px', lineHeight: 1.4 }}>
                      {selectedRequest.detailedDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Supporting Documents */}
              {selectedRequest.supportingDocuments && selectedRequest.supportingDocuments.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                    Uploaded Documentation & Attachments ({selectedRequest.supportingDocuments.length})
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                    {selectedRequest.supportingDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <FileText size={16} color="#0047BA" />
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#334155',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {doc.name || `Document #${idx + 1}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc.fileUrl)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #0047BA',
                            backgroundColor: '#FFFFFF',
                            color: '#0047BA',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Preview
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revision History Log if previously modified */}
              {selectedRequest.revisionHistory && selectedRequest.revisionHistory.length > 0 && (
                <div style={{ backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <History size={16} color="#B45309" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E' }}>
                      Previous Underwriting Revisions ({selectedRequest.revisionHistory.length})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedRequest.revisionHistory.map((rev, i) => (
                      <div key={i} style={{ fontSize: '0.78rem', color: '#78350F', borderLeft: '2px solid #F59E0B', paddingLeft: '8px' }}>
                        <div>
                          <strong>{rev.decision}</strong> on {new Date(rev.suggestedAt).toLocaleDateString('en-IN')}:
                        </div>
                        <div style={{ marginTop: '2px' }}>{rev.feedback}</div>
                        {rev.proposedFundingTarget && (
                          <div style={{ marginTop: '2px', fontWeight: 600 }}>
                            Proposed: {formatINR(rev.proposedFundingTarget * 100)} @ {rev.proposedReturnRate}% p.a.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UNDERWRITING DECISION HUB */}
              <div
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  padding: '18px 20px',
                  marginTop: '6px'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                    Underwriting Decision & Action
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                    Approve proposal, decline with reasons, or return to company for resubmission with adjusted interest and funding amounts.
                  </p>
                </div>

                {/* Decision Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                  <button
                    type="button"
                    onClick={() => setDecisionTab('resubmission')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: decisionTab === 'resubmission' ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                      backgroundColor: decisionTab === 'resubmission' ? '#FEF3C7' : '#FFFFFF',
                      color: decisionTab === 'resubmission' ? '#B45309' : '#475569',
                      fontWeight: decisionTab === 'resubmission' ? 800 : 600,
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Sliders size={16} />
                    <span>Ask for Resubmission with Changes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionTab('approve')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: decisionTab === 'approve' ? '2px solid #10B981' : '1px solid #E2E8F0',
                      backgroundColor: decisionTab === 'approve' ? '#DCFCE7' : '#FFFFFF',
                      color: decisionTab === 'approve' ? '#15803D' : '#475569',
                      fontWeight: decisionTab === 'approve' ? 800 : 600,
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Approve Proposal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionTab('reject')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: decisionTab === 'reject' ? '2px solid #EF4444' : '1px solid #E2E8F0',
                      backgroundColor: decisionTab === 'reject' ? '#FEE2E2' : '#FFFFFF',
                      color: decisionTab === 'reject' ? '#B91C1C' : '#475569',
                      fontWeight: decisionTab === 'reject' ? 800 : 600,
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <XCircle size={16} />
                    <span>Reject Proposal</span>
                  </button>
                </div>

                {/* FORM FOR TAB 1: ASK FOR RESUBMISSION WITH CHANGES */}
                {decisionTab === 'resubmission' && (
                  <div
                    style={{
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} color="#D97706" />
                      <div>
                        <strong style={{ fontSize: '0.86rem', color: '#92400E' }}>
                          Propose Counter Parameters for Resubmission
                        </strong>
                        <p style={{ fontSize: '0.76rem', color: '#78350F', margin: '2px 0 0 0' }}>
                          The company will be notified to adjust their proposal according to your counter-parameters and resubmit for final approval.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      {/* Proposed Fund Amount */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#78350F', marginBottom: '6px' }}>
                          Proposed Fund Amount (₹):
                        </label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#92400E' }}>
                            ₹
                          </span>
                          <input
                            type="number"
                            value={proposedFundingTarget}
                            onChange={e => setProposedFundingTarget(e.target.value)}
                            placeholder="e.g. 5000000"
                            style={{
                              width: '100%',
                              padding: '9px 12px 9px 28px',
                              borderRadius: '8px',
                              border: '1px solid #FCD34D',
                              backgroundColor: '#FFFFFF',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '3px', display: 'block' }}>
                          Original requested: {formatINR((selectedRequest.fundingTarget || 0) * 100)}
                        </span>
                      </div>

                      {/* Proposed Interest Rate */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#78350F', marginBottom: '6px' }}>
                          Proposed Interest / Return Rate (% p.a.):
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="number"
                            step="0.1"
                            value={proposedReturnRate}
                            onChange={e => setProposedReturnRate(e.target.value)}
                            placeholder="e.g. 11.5"
                            style={{
                              width: '100%',
                              padding: '9px 28px 9px 12px',
                              borderRadius: '8px',
                              border: '1px solid #FCD34D',
                              backgroundColor: '#FFFFFF',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#92400E' }}>
                            %
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '3px', display: 'block' }}>
                          Original requested: {selectedRequest.expectedReturnRate || selectedRequest.agreedReturnRate || 0}%
                        </span>
                      </div>

                      {/* Proposed Tenure */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#78350F', marginBottom: '6px' }}>
                          Proposed Tenure Duration (Months):
                        </label>
                        <input
                          type="number"
                          value={proposedDurationMonths}
                          onChange={e => setProposedDurationMonths(e.target.value)}
                          placeholder="e.g. 24"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid #FCD34D',
                            backgroundColor: '#FFFFFF',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Proposed Min Investment */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#78350F', marginBottom: '6px' }}>
                          Proposed Min Investment (₹):
                        </label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#92400E' }}>
                            ₹
                          </span>
                          <input
                            type="number"
                            value={proposedMinInvestment}
                            onChange={e => setProposedMinInvestment(e.target.value)}
                            placeholder="e.g. 25000"
                            style={{
                              width: '100%',
                              padding: '9px 12px 9px 28px',
                              borderRadius: '8px',
                              border: '1px solid #FCD34D',
                              backgroundColor: '#FFFFFF',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Resubmission Instructions / Feedback */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#78350F', marginBottom: '6px' }}>
                        Specific Underwriting Instructions & Reason for Changes (Required):
                      </label>
                      <textarea
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        placeholder="Provide clear reasons for the modified terms (e.g. 'Debt service coverage ratios indicate safety at ₹50 Lakhs and 11.5% interest. Please adjust your target funding and updated pro-forma statements before resubmitting.')..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #FCD34D',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.84rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* FORM FOR TAB 2: APPROVE PROPOSAL */}
                {decisionTab === 'approve' && (
                  <div
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} color="#16A34A" />
                      <div>
                        <strong style={{ fontSize: '0.86rem', color: '#14532D' }}>
                          Approve and Authorize Opportunity
                        </strong>
                        <p style={{ fontSize: '0.76rem', color: '#166534', margin: '2px 0 0 0' }}>
                          Confirm approval terms. An active investment opportunity will be generated and made available to verified investors.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#14532D', marginBottom: '6px' }}>
                          Approved Fund Target (₹):
                        </label>
                        <input
                          type="number"
                          value={proposedFundingTarget}
                          onChange={e => setProposedFundingTarget(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid #86EFAC',
                            backgroundColor: '#FFFFFF',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#14532D', marginBottom: '6px' }}>
                          Approved Interest Rate (% p.a.):
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={proposedReturnRate}
                          onChange={e => setProposedReturnRate(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1px solid #86EFAC',
                            backgroundColor: '#FFFFFF',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    {/* Publish to Marketplace Checkbox */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#14532D'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={publishToMarketplace}
                        onChange={e => setPublishToMarketplace(e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span>Publish immediately to Investment Marketplace (Open for investor participation)</span>
                    </label>

                    {/* Approval Remarks */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#14532D', marginBottom: '6px' }}>
                        Compliance Remarks (Optional):
                      </label>
                      <textarea
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        placeholder="e.g. Underwriting and legal compliance verified. Approved for public participation."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #86EFAC',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.84rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* FORM FOR TAB 3: REJECT PROPOSAL */}
                {decisionTab === 'reject' && (
                  <div
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <XCircle size={18} color="#DC2626" />
                      <div>
                        <strong style={{ fontSize: '0.86rem', color: '#991B1B' }}>
                          Decline Investment Proposal
                        </strong>
                        <p style={{ fontSize: '0.76rem', color: '#7F1D1D', margin: '2px 0 0 0' }}>
                          This will mark the proposal as rejected. The company will be notified with your feedback remarks.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#991B1B', marginBottom: '6px' }}>
                        Reason for Rejection (Required):
                      </label>
                      <textarea
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        placeholder="Detail the underwriting deficiencies or regulatory reasons for declining this proposal..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #FCA5A5',
                          backgroundColor: '#FFFFFF',
                          fontSize: '0.84rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                backgroundColor: '#F8FAFC'
              }}
            >
              <button
                type="button"
                disabled={submitting}
                onClick={() => setSelectedRequest(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              {decisionTab === 'resubmission' && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitDecision('Resubmission Required')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px rgba(217, 119, 6, 0.25)'
                  }}
                >
                  <Send size={15} />
                  <span>{submitting ? 'Transmitting...' : 'Send Resubmission Request'}</span>
                </button>
              )}

              {decisionTab === 'approve' && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitDecision('Approved')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <Check size={16} />
                  <span>{submitting ? 'Approving...' : 'Confirm & Approve Investment'}</span>
                </button>
              )}

              {decisionTab === 'reject' && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitDecision('Rejected')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
                  }}
                >
                  <XCircle size={15} />
                  <span>{submitting ? 'Rejecting...' : 'Confirm Rejection'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Lightbox Modal */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        documentUrl={previewDoc}
        title="Supporting Attachment"
      />
    </div>
  );
}

