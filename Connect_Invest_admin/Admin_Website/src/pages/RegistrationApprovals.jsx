import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
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
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { adminApi } from '../services/api';
import { initRealTimeSync } from '../services/realTimeSync';
import { useToast } from '../context/ToastContext';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

export default function RegistrationApprovals() {
  const { addToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    pendingInvestors: 0,
    pendingCompanies: 0,
    totalApproved: 0,
    totalRejected: 0,
    resubmissionsNeeded: 0
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'investor' | 'company'
  const [statusFilter, setStatusFilter] = useState('Pending Approval'); // 'all' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Resubmission Required'
  const [searchTerm, setSearchTerm] = useState('');

  // Selected item for review modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Document preview state
  const [previewDoc, setPreviewDoc] = useState(null);

  // Fetch applications
  const fetchApplications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await adminApi.getApprovals({
        type: activeTab,
        status: statusFilter,
        search: searchTerm
      });

      if (res.data?.success) {
        setApplications(res.data.applications || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      if (!silent) {
        addToast({
          type: 'error',
          title: 'Failed to load approvals',
          message: err.response?.data?.error || err.message
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab, statusFilter, searchTerm]);

  // Connect Real-Time SSE Stream
  useEffect(() => {
    const cleanup = initRealTimeSync(event => {
      if (
        event?.type === 'DATA_SYNC' &&
        (event.entity === 'REGISTRATION' || event.entity === 'REGISTRATION_DECISION')
      ) {
        console.log('[RegistrationApprovals] Real-time event received:', event);
        fetchApplications(true);

        if (event.action === 'SUBMITTED') {
          addToast({
            type: 'info',
            title: 'New Registration Submitted',
            message: `${event.payload?.name || event.payload?.legalName || 'A new user'} has registered and requires compliance review.`
          });
        } else if (event.action === 'RESUBMITTED') {
          addToast({
            type: 'warning',
            title: 'Application Resubmitted',
            message: `${event.payload?.name || event.payload?.legalName || 'An applicant'} updated their details for re-evaluation.`
          });
        }
      }
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  // Handle Decision
  const handleDecision = async (decision, targetApp = null) => {
    const app = targetApp || selectedApp;
    if (!app) return;

    const trimmedReason = decisionReason?.trim() || (decision === 'Approved' ? 'Application verified and compliant with regulatory KYC/KYB requirements.' : '');

    if (!trimmedReason && decision !== 'Approved') {
      addToast({
        type: 'warning',
        title: 'Written Reason Required',
        message: 'Please provide a compliance reason or feedback notes before submitting.'
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminApi.decideApproval(app.id, {
        type: app.type,
        decision,
        reason: trimmedReason
      });

      if (res.data?.success) {
        addToast({
          type: decision === 'Approved' ? 'success' : decision === 'Rejected' ? 'error' : 'warning',
          title: `Application ${decision}`,
          message: res.data.message || `Application marked as ${decision}.`
        });

        setSelectedApp(null);
        setDecisionReason('');
        fetchApplications(true);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Decision submission failed',
        message: err.response?.data?.error || err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'Approved':
        return {
          bg: '#DCFCE7',
          color: '#15803D',
          border: '#86EFAC',
          icon: CheckCircle2,
          label: 'Approved'
        };
      case 'Rejected':
        return {
          bg: '#FEE2E2',
          color: '#B91C1C',
          border: '#FCA5A5',
          icon: XCircle,
          label: 'Rejected'
        };
      case 'Resubmission Required':
        return {
          bg: '#FEF3C7',
          color: '#B45309',
          border: '#FCD34D',
          icon: AlertTriangle,
          label: 'Action Required'
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
    <div className="page-container">
      {/* Top Banner & Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>Registration Approvals</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#10B981',
                backgroundColor: '#ECFDF5',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid #A7F3D0'
              }}
            >
              <Radio size={12} className="animate-pulse" />
              Live Real-Time Sync
            </span>
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B' }}>
            Unified compliance review and approval portal for newly registered Investors and Corporate entities.
          </p>
        </div>

        <button
          onClick={() => fetchApplications()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            color: '#334155',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div
          onClick={() => setStatusFilter('Pending Approval')}
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            backgroundColor: '#FFFFFF',
            border: statusFilter === 'Pending Approval' ? '2px solid #0047BA' : '1px solid #E2E8F0',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Pending Review</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#0047BA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0047BA' }}>{stats.totalPending}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
            {stats.pendingInvestors} Investors • {stats.pendingCompanies} Companies
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('Approved')}
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            backgroundColor: '#FFFFFF',
            border: statusFilter === 'Approved' ? '2px solid #16A34A' : '1px solid #E2E8F0',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Approved Accounts</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A34A' }}>{stats.totalApproved}</div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '4px' }}>Verified & Active</div>
        </div>

        <div
          onClick={() => setStatusFilter('Resubmission Required')}
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            backgroundColor: '#FFFFFF',
            border: statusFilter === 'Resubmission Required' ? '2px solid #D97706' : '1px solid #E2E8F0',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Action Required</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706' }}>{stats.resubmissionsNeeded}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Awaiting User Correction</div>
        </div>

        <div
          onClick={() => setStatusFilter('Rejected')}
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            backgroundColor: '#FFFFFF',
            border: statusFilter === 'Rejected' ? '2px solid #DC2626' : '1px solid #E2E8F0',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Rejected</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#DC2626' }}>{stats.totalRejected}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Ineligible Applications</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        {/* Role Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#E2E8F0', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'all' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'all' ? '#0F172A' : '#64748B',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            All Registrations
          </button>
          <button
            onClick={() => setActiveTab('investor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'investor' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'investor' ? '#0F172A' : '#64748B',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'investor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Users size={16} />
            <span>Investors</span>
            {stats.pendingInvestors > 0 && (
              <span style={{ backgroundColor: '#0047BA', color: '#FFFFFF', padding: '1px 6px', borderRadius: '9999px', fontSize: '0.7rem' }}>
                {stats.pendingInvestors}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('company')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'company' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'company' ? '#0F172A' : '#64748B',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'company' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Building2 size={16} />
            <span>Companies</span>
            {stats.pendingCompanies > 0 && (
              <span style={{ backgroundColor: '#0047BA', color: '#FFFFFF', padding: '1px 6px', borderRadius: '9999px', fontSize: '0.7rem' }}>
                {stats.pendingCompanies}
              </span>
            )}
          </button>
        </div>

        {/* Search & Status Pill Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap', minWidth: 0 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by name, email, PAN, CIN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                outline: 'none',
                backgroundColor: '#FFFFFF'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Resubmission Required">Action Required</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div
        className="table-responsive"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          overflowX: 'auto'
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: '#0047BA' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading registration queue...</p>
          </div>
        ) : applications.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <ShieldCheck size={48} style={{ margin: '0 auto 16px', color: '#94A3B8' }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#1E293B' }}>No registrations match filter</h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>All submitted applications have been processed or no matching records were found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 20px' }}>Applicant / Entity</th>
                <th style={{ padding: '14px 16px' }}>Type</th>
                <th style={{ padding: '14px 16px' }}>Contact Details</th>
                <th style={{ padding: '14px 16px' }}>Identity / Reg No</th>
                <th style={{ padding: '14px 16px' }}>Documents</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => {
                const badge = getStatusBadge(app.registrationStatus);
                const BadgeIcon = badge.icon;
                const submittedDate = app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

                return (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.94rem' }}>{app.name}</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Calendar size={12} />
                        <span>Submitted on {submittedDate}</span>
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: app.type === 'company' ? '#F3E8FF' : '#EFF6FF',
                          color: app.type === 'company' ? '#6B21A8' : '#1D4ED8'
                        }}
                      >
                        {app.type === 'company' ? <Building2 size={13} /> : <Users size={13} />}
                        <span>{app.type === 'company' ? 'Company' : 'Investor'}</span>
                      </span>
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontSize: '0.82rem' }}>
                        <Mail size={13} color="#64748B" />
                        <span>{app.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.78rem', marginTop: '3px' }}>
                        <Phone size={13} />
                        <span>{app.mobile || 'N/A'}</span>
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1E293B', fontSize: '0.86rem' }}>
                        PAN: {app.details?.pan || 'N/A'}
                      </div>
                      {app.type === 'company' && app.details?.cin && (
                        <div style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                          CIN: {app.details.cin}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}
                      >
                        <FileText size={13} />
                        <span>{app.documents?.length || 0} files</span>
                      </span>
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}
                      >
                        <BadgeIcon size={12} />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {app.registrationStatus === 'Pending Approval' && (
                          <button
                            disabled={submitting}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecision('Approved', app);
                            }}
                            title="Quick Approve Application"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '7px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: '#16A34A',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = '#15803D';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = '#16A34A';
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setDecisionReason(app.adminRemarks || app.rejectionReason || '');
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: '#0047BA',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#0047BA';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.color = '#0047BA';
                          }}
                        >
                          <Eye size={14} />
                          <span>Review & Verify</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Review & Document Inspection Modal */}
      {selectedApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 'min(92vw, 850px)',
              maxHeight: '92vh',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 28px',
                borderBottom: '1px solid #E2E8F0',
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
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: selectedApp.type === 'company' ? '#F3E8FF' : '#EFF6FF',
                      color: selectedApp.type === 'company' ? '#6B21A8' : '#1D4ED8'
                    }}
                  >
                    {selectedApp.type === 'company' ? 'CORPORATE ENTITY' : 'INDIVIDUAL INVESTOR'}
                  </span>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {selectedApp.name}
                  </h2>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  ID: {selectedApp.id} • Registered Contact: {selectedApp.email} ({selectedApp.mobile})
                </p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              {/* Status Alert if not pending */}
              {selectedApp.registrationStatus !== 'Pending Approval' && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: selectedApp.registrationStatus === 'Approved' ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${selectedApp.registrationStatus === 'Approved' ? '#BBF7D0' : '#FECACA'}`,
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <AlertTriangle size={18} color={selectedApp.registrationStatus === 'Approved' ? '#16A34A' : '#DC2626'} style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: selectedApp.registrationStatus === 'Approved' ? '#16A34A' : '#DC2626' }}>
                      Current Status: {selectedApp.registrationStatus}
                    </div>
                    {selectedApp.rejectionReason && (
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                        Remark: {selectedApp.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 1: Business / Personal Details */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  1. Identification & Personal Details
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                    backgroundColor: '#F8FAFC',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.84rem'
                  }}
                >
                  <div><strong>Legal PAN:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedApp.details?.pan}</span></div>
                  {selectedApp.type === 'company' ? (
                    <>
                      <div><strong>CIN / Reg No:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedApp.details?.cin}</span></div>
                      <div><strong>GSTIN:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedApp.details?.gstin || 'N/A'}</span></div>
                      <div><strong>Entity Type:</strong> {selectedApp.details?.companyType}</div>
                      <div><strong>Industry / Sector:</strong> {selectedApp.details?.industry} • {selectedApp.details?.sector}</div>
                      <div><strong>Official Website:</strong> <a href={selectedApp.details?.website} target="_blank" rel="noreferrer" style={{ color: '#0047BA' }}>{selectedApp.details?.website || 'N/A'}</a></div>
                    </>
                  ) : (
                    <>
                      <div><strong>Aadhaar No:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedApp.details?.aadhaar}</span></div>
                      <div><strong>Date of Birth:</strong> {selectedApp.details?.dob ? new Date(selectedApp.details.dob).toLocaleDateString() : 'N/A'}</div>
                      <div><strong>Nationality:</strong> {selectedApp.details?.nationality}</div>
                      <div><strong>Occupation:</strong> {selectedApp.details?.occupation || 'N/A'}</div>
                      <div><strong>Annual Income:</strong> {selectedApp.details?.annualIncomeRange || 'N/A'}</div>
                      <div><strong>Source of Funds:</strong> {selectedApp.details?.sourceOfFunds || 'N/A'}</div>
                    </>
                  )}
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong>Address:</strong>{' '}
                    {selectedApp.details?.address
                      ? typeof selectedApp.details.address === 'string'
                        ? selectedApp.details.address
                        : `${selectedApp.details.address.street || ''}, ${selectedApp.details.address.city || ''}, ${selectedApp.details.address.state || ''} - ${selectedApp.details.address.pincode || ''}`
                      : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Section 2: Bank & Financial Details */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2. Registered Bank Account Details
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                    backgroundColor: '#F8FAFC',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.84rem'
                  }}
                >
                  <div><strong>Account Holder:</strong> {selectedApp.details?.bankDetails?.accountHolderName || selectedApp.details?.bankDetails?.holderName || selectedApp.name}</div>
                  <div><strong>Bank Name:</strong> {selectedApp.details?.bankDetails?.bankName || 'N/A'}</div>
                  <div><strong>Account Number:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedApp.details?.bankDetails?.accountNumber || selectedApp.details?.bankDetails?.accountNo || 'N/A'}</span></div>
                  <div><strong>IFSC Code:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedApp.details?.bankDetails?.ifscCode || selectedApp.details?.bankDetails?.ifsc || 'N/A'}</span></div>
                </div>
              </div>

              {/* Section 3: Uploaded Compliance Documents Grid */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    3. Uploaded Compliance Documents ({selectedApp.documents?.length || 0})
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Click Preview to inspect or Download to save</span>
                </div>

                {(!selectedApp.documents || selectedApp.documents.length === 0) ? (
                  <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', color: '#64748B', fontSize: '0.85rem' }}>
                    No documents uploaded during registration.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {selectedApp.documents.map((doc, idx) => {
                      const isDocPdf = (doc.url || '').toLowerCase().endsWith('.pdf');
                      const docFilename = (doc.url || '').split('/').pop();
                      const directDownloadUrl = `/api/v1/admin/documents/${docFilename}/download`;

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#FFFFFF',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: isDocPdf ? '#FEE2E2' : '#EFF6FF',
                                color: isDocPdf ? '#DC2626' : '#2563EB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <FileText size={18} />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {doc.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {docFilename}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                            <button
                              onClick={() =>
                                setPreviewDoc({
                                  url: doc.url,
                                  title: doc.name,
                                  type: selectedApp.type
                                })
                              }
                              style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#F8FAFC',
                                color: '#1E293B',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={13} />
                              <span>Preview</span>
                            </button>

                            <a
                              href={directDownloadUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #0047BA',
                                backgroundColor: '#EFF6FF',
                                color: '#0047BA',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 4: Mandatory Written Reason & Decision */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '20px',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                  Compliance Remarks / Decision Reason: <span style={{ fontWeight: 400, color: '#64748B' }}>(Optional for Approval, Mandatory for Rejection or Resubmission)</span>
                </label>
                <textarea
                  value={decisionReason}
                  onChange={e => setDecisionReason(e.target.value)}
                  placeholder="Enter optional compliance remarks or specific feedback for applicant (defaults to verified and approved if left blank)..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'inherit',
                    marginBottom: '16px'
                  }}
                />

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    disabled={submitting}
                    onClick={() => setSelectedApp(null)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    disabled={submitting}
                    onClick={() => handleDecision('Resubmission Required')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: '1px solid #F59E0B',
                      backgroundColor: '#FEF3C7',
                      color: '#B45309',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <AlertTriangle size={15} />
                    <span>Request Resubmission</span>
                  </button>

                  <button
                    disabled={submitting}
                    onClick={() => handleDecision('Rejected')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <XCircle size={15} />
                    <span>Reject Application</span>
                  </button>

                  <button
                    disabled={submitting}
                    onClick={() => handleDecision('Approved')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Approve & Activate</span>
                  </button>
                </div>
              </div>
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
          title={previewDoc.title}
          documentType={previewDoc.type}
        />
      )}
    </div>
  );
}

