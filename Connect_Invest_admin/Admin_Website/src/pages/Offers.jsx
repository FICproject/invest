import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Calendar,
  Clock,
  Play,
  Pause,
    CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Search,
  Building2,
  Eye,
  Download,
  FileText,
  X,
  XCircle,
  AlertTriangle,
  FolderKanban,
  Users
} from 'lucide-react';
import { adminApi, formatINR, rupeesToPaise } from '../services/api';
import { useToast } from '../context/ToastContext';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

export default function Offers() {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState('offers'); // 'requests' | 'offers'
  const [offers, setOffers] = useState([]);
  const [fundingRequests, setFundingRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Request Review
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestFeedback, setRequestFeedback] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Selected Offer Investors Modal
  const [selectedOfferForInvestors, setSelectedOfferForInvestors] = useState(null);
  const [offerInvestors, setOfferInvestors] = useState([]);
  const [loadingInvestors, setLoadingInvestors] = useState(false);
  const [investorSearch, setInvestorSearch] = useState('');

  const handleViewInvestors = async (offer) => {
    setSelectedOfferForInvestors(offer);
    setOfferInvestors([]);
    setInvestorSearch('');
    setLoadingInvestors(true);
    try {
      const res = await adminApi.getOfferInvestments(offer._id || offer.id);
      if (res.data && res.data.success) {
        setOfferInvestors(res.data.investors || []);
      }
    } catch (err) {
      console.warn('Failed to load offer investors:', err.message);
      toast.error('Failed to load participating investors for this offer.');
    } finally {
      setLoadingInvestors(false);
    }
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOffer, setNewOffer] = useState({
    kind: 'project',
    companyId: '',
    title: '',
    description: '',
    useOfFunds: '',
    targetRupees: '',
    minTargetRupees: '',
    rateBps: 300,
    tenuresString: '12, 18, 24',
    fundingWindowDays: 30,
    sharePriceRupees: '',
    preMoneyValuationRupees: '',
    equityInstrument: 'equity_shares',
    minShares: 1,
    hasVotingRights: false
  });

  const [selectedOfferTerms, setSelectedOfferTerms] = useState(null);
  const [termsForm, setTermsForm] = useState({
    targetRupees: '',
    minTargetRupees: '',
    rateBps: 300,
    tenuresString: '12, 18, 24',
    windowDays: 30,
    termsBody: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersRes, compRes, requestsRes] = await Promise.all([
        adminApi.getOffers(),
        adminApi.getCompanies(),
        adminApi.getFundingRequests({ status: 'approved' })
      ]);
      if (offersRes.data?.success) {
        // Exclude equity from investment list per specification
        const nonEquityOffers = (offersRes.data.offers || []).filter(o => o.kind !== 'equity');
        setOffers(nonEquityOffers);
      }
      if (compRes.data?.success) setCompanies(compRes.data.companies);
      if (requestsRes.data?.success) {
        // Only approved proposals appear in Investment Management
        const approvedOnly = (requestsRes.data.requests || []).filter(r =>
          ['Approved', 'Open for Investment', 'Funded', 'Funding Completed'].includes(r.status)
        );
        setFundingRequests(approvedOnly);
      }
    } catch (err) {
      console.error('Failed to load investment management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = fetchData;

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecideRequest = async (requestId, decision, publishToMarketplace = true) => {
    try {
      setSubmitting(true);
      const res = await adminApi.decideFundingRequest(requestId, {
        decision,
        feedback: requestFeedback,
        publishToMarketplace
      });
      if (res.data?.success) {
        toast.success(res.data.message || `Funding request marked as ${decision}`);
        setSelectedRequest(null);
        setRequestFeedback('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to record ${decision} decision`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOffer = async e => {
    e.preventDefault();
    if (!newOffer.companyId) {
      toast.warning('Please select a company for this opportunity.');
      return;
    }

    const tenures = newOffer.tenuresString
      .split(',')
      .map(t => parseInt(t.trim(), 10))
      .filter(t => !isNaN(t));

    const minAllowed = newOffer.kind === 'company' ? 60 : 12;
    for (const t of tenures) {
      if (t < minAllowed) {
        toast.warning(`Validation Error: All tenures must be >= ${minAllowed} months for ${newOffer.kind} offers (PRD Section 5.2 C-4)`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const targetPaise = rupeesToPaise(newOffer.targetRupees);
      const minTargetPaise = rupeesToPaise(newOffer.minTargetRupees || newOffer.targetRupees);

      const payload = {
        kind: newOffer.kind,
        companyId: newOffer.companyId,
        title: newOffer.title.trim(),
        description: newOffer.description,
        useOfFunds: newOffer.useOfFunds,
        targetPaise,
        minTargetPaise,
        rateBps: parseInt(newOffer.rateBps, 10),
        tenures: newOffer.tenuresString.split(',').map(t => parseInt(t.trim(), 10)).filter(t => !isNaN(t)),
        perInvestorLimitPaise: targetPaise
      };

      const res = await adminApi.createOffer(payload);
      if (res.data.success) {
        toast.success(`Investment opportunity "${newOffer.title}" created successfully!`);
        setShowCreateModal(false);
        setNewOffer({
          kind: 'project',
          companyId: '',
          title: '',
          description: '',
          useOfFunds: '',
          targetRupees: '',
          minTargetRupees: '',
          rateBps: 300,
          tenuresString: '12, 18, 24',
          fundingWindowDays: 30,
          sharePriceRupees: '',
          preMoneyValuationRupees: '',
          equityInstrument: 'equity_shares',
          minShares: 1,
          hasVotingRights: false
        });
        fetchOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenTermsModal = offer => {
    setSelectedOfferTerms(offer);
    setTermsForm({
      targetRupees: offer.targetPaise ? (offer.targetPaise / 100).toString() : '',
      minTargetRupees: offer.minTargetPaise ? (offer.minTargetPaise / 100).toString() : '',
      rateBps: offer.rateBps || 300,
      tenuresString: offer.tenures ? offer.tenures.join(', ') : offer.kind === 'company' ? '60, 84, 120' : '12, 18, 24',
      windowDays: 30,
      termsBody: `Standard terms for ${offer.title} offering ${offer.rateBps ? offer.rateBps / 100 : 3}% monthly returns.`
    });
  };

  const handleSaveTerms = async e => {
    e.preventDefault();
    const tenures = termsForm.tenuresString
      .split(',')
      .map(t => parseInt(t.trim(), 10))
      .filter(t => !isNaN(t));

    const minAllowed = selectedOfferTerms.kind === 'company' ? 60 : 12;
    for (const t of tenures) {
      if (t < minAllowed) {
        toast.warning(`Validation Error: All tenures must be >= ${minAllowed} months for ${selectedOfferTerms.kind} offers`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        targetPaise: rupeesToPaise(termsForm.targetRupees),
        minTargetPaise: rupeesToPaise(termsForm.minTargetRupees || termsForm.targetRupees),
        rateBps: parseInt(termsForm.rateBps, 10),
        tenures,
        fundingWindowDays: parseInt(termsForm.windowDays, 10),
        termsBody: termsForm.termsBody
      };

      const res = await adminApi.setOfferTerms(selectedOfferTerms._id, payload);
      if (res.data.success) {
        toast.success('Offer terms configured and saved!');
        setSelectedOfferTerms(null);
        fetchOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save offer terms');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishOffer = async offerId => {
    try {
      setSubmitting(true);
      const res = await adminApi.publishOffer(offerId, { forceAccept: true });
      if (res.data.success) {
        toast.success('Offer is now published and OPEN for funding!');
        fetchOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHold = async offer => {
    const isPaused = offer.status === 'Paused';

    try {
      setSubmitting(true);
      const res = await adminApi.toggleOfferHold(offer._id, {
        reason: isPaused ? 'Resumed by Admin' : 'Funding held by Admin'
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update funding status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffer = async offer => {
    try {
      setSubmitting(true);
      const res = await adminApi.deleteOffer(offer._id);
      if (res.data.success) {
        toast.success(res.data.message || `Project "${offer.title}" has been deleted.`);
        fetchOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete project');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingRequestsCount = fundingRequests.filter(
    r => r.status === 'Submitted' || r.status === 'Under Review'
  ).length;

  const filteredRequests = fundingRequests.filter(r => {
    const isApproved = ['Approved', 'Open for Investment', 'Funded', 'Funding Completed'].includes(r.status);
    if (!isApproved) return false;
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.title?.toLowerCase().includes(s) ||
      r.companyId?.name?.toLowerCase().includes(s) ||
      r.companyId?.legalName?.toLowerCase().includes(s) ||
      r.category?.toLowerCase().includes(s) ||
      r.entityOrProjectName?.toLowerCase().includes(s);
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredOffers = offers.filter(o => {
    const matchesSearch = !search || o.title?.toLowerCase().includes(search.toLowerCase()) || o.companyId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredOfferInvestors = offerInvestors.filter(i => {
    if (!investorSearch.trim()) return true;
    const s = investorSearch.trim().toLowerCase();
    return (
      (i.investorName && i.investorName.toLowerCase().includes(s)) ||
      (i.investorEmail && i.investorEmail.toLowerCase().includes(s)) ||
      (i.investorMobile && i.investorMobile.toLowerCase().includes(s)) ||
      (i.certificateNumber && i.certificateNumber.toLowerCase().includes(s))
    );
  });

  return (
    <div className="page-container">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Investment Management</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Review company funding requests, configure terms, and manage marketplace investment opportunities.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              placeholder={activeSubTab === 'requests' ? 'Search requests, companies...' : 'Search offers, companies...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: '160px' }}
          >
            <option value="">All Statuses</option>
            {activeSubTab === 'requests' ? (
              <>
                <option value="Approved">Approved</option>
                <option value="Open for Investment">Open for Investment</option>
                <option value="Funded">Funded</option>
              </>
            ) : (
              <>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Open">Open</option>
                <option value="Active">Active</option>
                <option value="Funding closed">Funding closed</option>
              </>
            )}
          </select>

          <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} />
            <span>Create Opportunity</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs: Marketplace Offers vs Approved Company Proposals */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginTop: '4px' }}>
        <button
          onClick={() => { setActiveSubTab('offers'); setStatusFilter(''); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeSubTab === 'offers' ? '#0047BA' : '#F1F5F9',
            color: activeSubTab === 'offers' ? '#FFFFFF' : '#475569',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={16} />
          <span>Marketplace Investment Offers ({offers.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('requests'); setStatusFilter(''); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeSubTab === 'requests' ? '#0047BA' : '#F1F5F9',
            color: activeSubTab === 'requests' ? '#FFFFFF' : '#475569',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <FolderKanban size={16} />
          <span>Approved Company Proposals ({filteredRequests.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'requests' ? (
        <div className="glass-panel" style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading company funding requests from MongoDB...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} color="#16A34A" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#0F172A', fontWeight: 700 }}>
                No Approved Funding Proposals
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                Only company proposals approved in Fund Approvals will be listed here.
              </p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>S.No</th>
                    <th>Request Title & Model</th>
                    <th>Borrowing Company</th>
                    <th style={{ textAlign: 'right' }}>Target Amount</th>
                    <th>Return Rate & Tenure</th>
                    <th style={{ textAlign: 'center' }}>Documents</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((r, idx) => {
                    const isPending = r.status === 'Submitted' || r.status === 'Under Review';
                    const targetRupees = r.fundingTarget || 0;
                    const returnPct = r.expectedReturnRate || r.agreedReturnRate || 0;
                    const tenure = r.durationMonths ? `${r.durationMonths} Mo` : (r.investmentPeriodYears ? `${r.investmentPeriodYears} Yrs` : 'N/A');

                    return (
                      <tr key={r._id}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {idx + 1}
                        </td>
                        <td>
                          <div
                            onClick={() => handleViewInvestors(r)}
                            style={{ fontWeight: 700, color: '#0047BA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            title="Click to view participating investors"
                          >
                            <span>{r.title || r.entityOrProjectName}</span>
                            <Users size={13} color="#2563EB" />
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ padding: '1px 6px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700 }}>
                              {r.investmentModel || 'Fixed-Term'}
                            </span>
                            <span>•</span>
                            <span>{r.investmentPurpose || r.category || 'Company Investment'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{r.companyId?.legalName || r.companyId?.name || 'Company'}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                            CIN: {r.companyId?.cin || 'N/A'} • {r.companyId?.officialEmail || 'No email'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                          ₹{Number(targetRupees).toLocaleString('en-IN')}
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 400 }}>
                            Min: ₹{Number(r.minInvestment || 0).toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#16A34A' }}>
                            {returnPct ? `${returnPct}% p.a.` : 'Negotiable'}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                            Tenure: {tenure}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.76rem', fontWeight: 600 }}>
                            <FileText size={12} />
                            <span>{r.supportingDocuments?.length || 0} files</span>
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor:
                                r.status === 'Approved' || r.status === 'Open for Investment'
                                  ? '#ECFDF5'
                                  : r.status === 'Submitted' || r.status === 'Under Review'
                                  ? '#FFFBEB'
                                  : r.status === 'Rejected'
                                  ? '#FEF2F2'
                                  : '#F1F5F9',
                              color:
                                r.status === 'Approved' || r.status === 'Open for Investment'
                                  ? '#059669'
                                  : r.status === 'Submitted' || r.status === 'Under Review'
                                  ? '#D97706'
                                  : r.status === 'Rejected'
                                  ? '#DC2626'
                                  : '#475569',
                              border:
                                r.status === 'Approved' || r.status === 'Open for Investment'
                                  ? '1px solid #A7F3D0'
                                  : r.status === 'Submitted' || r.status === 'Under Review'
                                  ? '1px solid #FDE68A'
                                  : r.status === 'Rejected'
                                  ? '1px solid #FECACA'
                                  : '1px solid #E2E8F0'
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {isPending && (
                              <button
                                disabled={submitting}
                                onClick={() => handleDecideRequest(r._id, 'Approved', true)}
                                title="Quick Approve & Publish Live to Marketplace"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  backgroundColor: '#16A34A',
                                  color: '#FFFFFF',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>Approve & Go Live</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedRequest(r);
                                setRequestFeedback(r.reviewerFeedback || '');
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#0047BA',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={13} />
                              <span>Review Details</span>
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
      ) : (
      /* Offers Grid */
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading offers from MongoDB...
          </div>
        ) : filteredOffers.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No offers found matching your search.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th>Title & Kind</th>
                  <th>Company</th>
                  <th style={{ textAlign: 'right' }}>Target / Raised</th>
                  <th>Rate & Tenures</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Funding Progress</th>
                  <th>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((o, idx) => {
                  const target = o.targetPaise || 1;
                  const raised = o.raisedPaise || 0;
                  const progressPct = Math.min(100, Math.round((raised / target) * 100));

                  return (
                    <tr key={o._id}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div
                          onClick={() => handleViewInvestors(o)}
                          style={{
                            fontWeight: 700,
                            color: '#0047BA',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="Click to view participating investors"
                        >
                          <span>{o.title}</span>
                          <Users size={13} color="#2563EB" />
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: o.kind === 'equity' ? '#7C3AED' : o.kind === 'company' ? '#7E22CE' : '#0047BA'
                        }}>
                          {o.kind === 'equity' ? 'Equity / Shareholder' : o.kind === 'company' ? 'Company Investment' : 'Project Investment'}
                        </div>
                      </td>
                      <td>{o.companyId?.name || 'Company'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700 }}>{formatINR(o.targetPaise)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Raised: {formatINR(o.raisedPaise || 0)}
                        </div>
                      </td>
                      <td>
                        {o.kind === 'equity' ? (
                          <>
                            <div style={{ fontWeight: 600, color: '#7C3AED' }}>
                              {formatINR(o.sharePricePaise)} / share
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {o.equityOfferedPercentage ? `${o.equityOfferedPercentage}% Dilution` : 'Perpetual Equity'}
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: 600, color: '#0047BA' }}>
                              {o.rateBps ? `${o.rateBps / 100}% / month` : 'Not configured'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {o.tenures?.join(', ')} months
                            </div>
                          </>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${
                          o.status === 'Active' ? 'badge-emerald' :
                          o.status === 'Open' ? 'badge-blue' :
                          o.status === 'Paused' ? 'badge-amber' :
                          o.status === 'Submitted' ? 'badge-amber' :
                          o.status === 'Approved' ? 'badge-purple' : 'badge-slate'
                        }`}>
                          {o.status === 'Paused' ? 'HOLD' : o.status}
                        </span>
                      </td>
                      <td style={{ minWidth: '130px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                          <span>{progressPct}%</span>
                          <span style={{ color: 'var(--text-muted)' }}>{formatINR(o.remainingRoomPaise)} left</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${progressPct}%`, height: '100%', background: '#10b981', transition: 'width 0.3s ease' }} />
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {['Draft', 'Submitted'].includes(o.status) && (
                            <button
                              onClick={() => handleOpenTermsModal(o)}
                              className="btn-primary"
                              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            >
                              Configure Terms
                            </button>
                          )}
                          {['Approved', 'Ready'].includes(o.status) && (
                            <button
                              onClick={() => handlePublishOffer(o._id)}
                              className="btn-primary"
                              style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                            >
                              Publish Open
                            </button>
                          )}

                          {/* View Investors Button */}
                          <button
                            onClick={() => handleViewInvestors(o)}
                            className="btn-secondary"
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              color: '#0047BA',
                              borderColor: '#BFDBFE',
                              background: '#EFF6FF',
                              fontWeight: 700
                            }}
                            title="View participating investors and committed amounts"
                          >
                            <Users size={12} />
                            <span>Investors</span>
                          </button>

                          {/* Hold Funding / Resume Funding */}
                          {['Active', 'Open', 'Paused'].includes(o.status) && (
                            <button
                              onClick={() => handleToggleHold(o)}
                              className="btn-secondary"
                              style={{
                                padding: '5px 9px',
                                fontSize: '0.75rem',
                                color: o.status === 'Paused' ? '#15803D' : '#B45309',
                                borderColor: o.status === 'Paused' ? '#86EFAC' : '#FDE68A',
                                background: o.status === 'Paused' ? '#F0FDF4' : '#FEFCE8',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={o.status === 'Paused' ? 'Resume investor funding' : 'Put funding on hold'}
                            >
                              {o.status === 'Paused' ? <Play size={12} /> : <Pause size={12} />}
                              {o.status === 'Paused' ? 'Resume' : 'Hold'}
                            </button>
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
      )}

      {/* Configure Terms Sheet Modal */}
      {selectedOfferTerms && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: 'min(92vw, 640px)', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: 'var(--bg-modal)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
              Configure Term Sheet: {selectedOfferTerms.title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Setting terms per PRD Section 5.2 C-4. Kind: <strong style={{ textTransform: 'capitalize' }}>{selectedOfferTerms.kind}</strong> (Min tenure: {selectedOfferTerms.kind === 'company' ? '60' : '12'} months).
            </p>

            <form onSubmit={handleSaveTerms} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Target Amount (INR Rupees) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="e.g. 5000000"
                    value={termsForm.targetRupees}
                    onKeyDown={e => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={e => setTermsForm({ ...termsForm, targetRupees: e.target.value.replace(/\D/g, '') })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Minimum Target Amount (INR) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="e.g. 4000000"
                    value={termsForm.minTargetRupees}
                    onKeyDown={e => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={e => setTermsForm({ ...termsForm, minTargetRupees: e.target.value.replace(/\D/g, '') })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                    Monthly Return Rate in BPS * (100 bps = 1%)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="e.g. 300 for 3% monthly"
                    value={termsForm.rateBps}
                    onKeyDown={e => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={e => setTermsForm({ ...termsForm, rateBps: e.target.value.replace(/\D/g, '') })}
                    className="input-field"
                  />
                  <span style={{ fontSize: '0.7rem', color: '#34d399' }}>= {Number(termsForm.rateBps || 0) / 100}% per month</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                    Allowed Tenures in Months (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={selectedOfferTerms.kind === 'company' ? '60, 84, 120' : '12, 18, 24'}
                    value={termsForm.tenuresString}
                    onChange={e => setTermsForm({ ...termsForm, tenuresString: e.target.value })}
                    className="input-field"
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Must all be ≥ {selectedOfferTerms.kind === 'company' ? '60' : '12'} months
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Funding Window Duration (Days)</label>
                <input
                  type="number"
                  value={termsForm.windowDays}
                  onChange={e => setTermsForm({ ...termsForm, windowDays: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Legal Terms & Covenants</label>
                <textarea
                  value={termsForm.termsBody}
                  onChange={e => setTermsForm({ ...termsForm, termsBody: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedOfferTerms(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save Final Term Sheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Opportunity Modal */}
      {showCreateModal && (
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
          zIndex: 50,
          padding: '20px'
        }}>
          <div className="forge-card" style={{
            width: '100%',
            maxWidth: 'min(92vw, 620px)',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            background: '#FFFFFF'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Create Investment Opportunity
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  List a new vetted project or company-level investment opportunity
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5MW Solar Power Project Phase 1"
                  value={newOffer.title}
                  onChange={e => setNewOffer({ ...newOffer, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Investment Type *
                  </label>
                  <select
                    value={newOffer.kind}
                    onChange={e => {
                      const k = e.target.value;
                      setNewOffer({
                        ...newOffer,
                        kind: k,
                        tenuresString: k === 'company' ? '60, 84, 120' : '12, 18, 24'
                      });
                    }}
                    className="input-field"
                  >
                    <option value="project">1. Project Investment (Fixed Tenure ≥ 12m)</option>
                    <option value="company">2. Company Investment (Fixed Tenure ≥ 60m)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Issuing Company *
                  </label>
                  <select
                    required
                    value={newOffer.companyId}
                    onChange={e => setNewOffer({ ...newOffer, companyId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select an enrolled company</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.regNo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Target Funding (₹ INR) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="e.g. 5000000"
                    value={newOffer.targetRupees}
                    onKeyDown={e => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={e => setNewOffer({ ...newOffer, targetRupees: e.target.value.replace(/\D/g, '') })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Minimum Target (₹ INR)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Defaults to Target Funding"
                    value={newOffer.minTargetRupees}
                    onKeyDown={e => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={e => setNewOffer({ ...newOffer, minTargetRupees: e.target.value.replace(/\D/g, '') })}
                    className="input-field"
                  />
                </div>
              </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Monthly Return Rate in BPS * (100 bps = 1%)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="e.g. 300 for 3% monthly"
                      value={newOffer.rateBps}
                      onKeyDown={e => {
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={e => setNewOffer({ ...newOffer, rateBps: e.target.value.replace(/\D/g, '') })}
                      className="input-field"
                    />
                    <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                      = {Number(newOffer.rateBps || 0) / 100}% per month ({Number(newOffer.rateBps || 0) * 12 / 100}% p.a.)
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Allowed Tenures in Months (comma-separated) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={newOffer.kind === 'company' ? '60, 84, 120' : '12, 18, 24'}
                      value={newOffer.tenuresString}
                      onChange={e => setNewOffer({ ...newOffer, tenuresString: e.target.value })}
                      className="input-field"
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Must all be ≥ {newOffer.kind === 'company' ? '60' : '12'} months (PRD Rule)
                    </span>
                  </div>
                </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Project Description
                </label>
                <textarea
                  placeholder="Overview of the project or opportunity..."
                  value={newOffer.description}
                  onChange={e => setNewOffer({ ...newOffer, description: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Use of Funds
                </label>
                <textarea
                  placeholder="Specific allocation of capital..."
                  value={newOffer.useOfFunds}
                  onChange={e => setNewOffer({ ...newOffer, useOfFunds: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Creating...' : 'Create Opportunity (Draft)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Company Funding Request Review Dossier */}
      {selectedRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedRequest(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                    {selectedRequest.title || selectedRequest.entityOrProjectName}
                  </h3>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8'
                    }}
                  >
                    {selectedRequest.status}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  Submitted by {selectedRequest.companyId?.legalName || selectedRequest.companyId?.name} • CIN: {selectedRequest.companyId?.cin || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#E2E8F0',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Financial Metrics Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '12px',
                  backgroundColor: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Funding Target</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                    ₹{Number(selectedRequest.fundingTarget || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Min Investment</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    ₹{Number(selectedRequest.minInvestment || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Expected Return</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
                    {selectedRequest.expectedReturnRate || selectedRequest.agreedReturnRate || 0}% p.a.
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Tenure / Duration</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                    {selectedRequest.durationMonths ? `${selectedRequest.durationMonths} Months` : `${selectedRequest.investmentPeriodYears || 2} Years`}
                  </div>
                </div>
              </div>

              {/* Proposal Overview */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.86rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                  Project Overview & Proposal
                </h4>
                <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  {selectedRequest.detailedDescription || selectedRequest.shortDescription || 'No detailed overview provided.'}
                </div>
              </div>

              {/* Use of Funds */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.86rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                  Planned Use of Funds
                </h4>
                <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  {selectedRequest.useOfFunds || 'Capital will be deployed for enterprise growth and working capital.'}
                </div>
              </div>

              {/* Supporting Documents */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.86rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                  Attached Documents ({selectedRequest.supportingDocuments?.length || 0})
                </h4>
                {(!selectedRequest.supportingDocuments || selectedRequest.supportingDocuments.length === 0) ? (
                  <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '0.84rem' }}>
                    No supporting documents uploaded for this request.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {selectedRequest.supportingDocuments.map((doc, dIdx) => {
                      const docFilename = (doc.fileUrl || '').split('/').pop();
                      const downloadUrl = `/api/v1/admin/documents/${docFilename}/download`;
                      return (
                        <div
                          key={dIdx}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F8FAFC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <FileText size={18} color="#0047BA" style={{ flexShrink: 0 }} />
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: 600 }}>
                              {doc.name || docFilename}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => setPreviewDoc({ url: doc.fileUrl, title: doc.name || 'Document' })}
                              title="Preview Document"
                              style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                            >
                              <Eye size={12} />
                            </button>
                            <a
                              href={downloadUrl}
                              download
                              title="Download File"
                              target="_blank"
                              rel="noreferrer"
                              style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #0047BA', backgroundColor: '#EFF6FF', color: '#0047BA', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                            >
                              <Download size={12} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reviewer Feedback Input */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                  Compliance Remarks & Reviewer Feedback:
                </label>
                <textarea
                  value={requestFeedback}
                  onChange={e => setRequestFeedback(e.target.value)}
                  placeholder="Enter remarks or specific feedback for borrowing company (optional for approval, required for rejection/more info)..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                gap: '10px',
                backgroundColor: '#F8FAFC'
              }}
            >
              <button
                type="button"
                disabled={submitting}
                onClick={() => setSelectedRequest(null)}
                className="btn-secondary"
                style={{ padding: '9px 16px', fontSize: '0.84rem' }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecideRequest(selectedRequest._id, 'Additional Information Required', false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: '1px solid #F59E0B',
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <AlertTriangle size={14} />
                <span>Request More Info</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecideRequest(selectedRequest._id, 'Rejected', false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <XCircle size={14} />
                <span>Reject</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecideRequest(selectedRequest._id, 'Approved', false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: '1px solid #0047BA',
                  backgroundColor: '#EFF6FF',
                  color: '#0047BA',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>Approve (Draft Offer)</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecideRequest(selectedRequest._id, 'Approved', true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={15} />
                <span>Approve & Go Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participating Investors Modal */}
      {selectedOfferForInvestors && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '20px'
          }}
          onClick={() => setSelectedOfferForInvestors(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#0047BA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Users size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                    Participating Investors
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                    {selectedOfferForInvestors.title || selectedOfferForInvestors.entityOrProjectName} • {selectedOfferForInvestors.companyId?.legalName || selectedOfferForInvestors.companyId?.name || 'Company'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOfferForInvestors(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Summary KPI Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
                padding: '16px 24px',
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0'
              }}
            >
              <div style={{ backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Investors</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0047BA', marginTop: '2px' }}>
                  {offerInvestors.length}
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Capital Committed</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                  ₹{Number(offerInvestors.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Target Funding</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  ₹{Number(selectedOfferForInvestors.targetRupees || (selectedOfferForInvestors.targetPaise ? selectedOfferForInvestors.targetPaise / 100 : 0)).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* In-Modal Search Bar */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Filter by investor name, email, mobile or cert #..."
                  value={investorSearch}
                  onChange={e => setInvestorSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.84rem'
                  }}
                />
              </div>
            </div>

            {/* Modal Body / Investors Table */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {loadingInvestors ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>Loading participating investors...</div>
                </div>
              ) : filteredOfferInvestors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
                  <Users size={36} color="#CBD5E1" style={{ margin: '0 auto 10px', display: 'block' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>No Investors Found</div>
                  <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                    {investorSearch ? 'No investors match your filter query.' : 'No investors have committed funds to this opportunity yet.'}
                  </div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', width: '40px' }}>#</th>
                      <th style={{ padding: '8px 16px' }}>Investor Details</th>
                      <th style={{ padding: '8px 16px', textAlign: 'right' }}>Amount Invested</th>
                      <th style={{ padding: '8px 16px' }}>Date</th>
                      <th style={{ padding: '8px 16px' }}>Certificate / Ref</th>
                      <th style={{ padding: '8px 16px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOfferInvestors.map((inv, i) => (
                      <tr key={inv._id || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 12px', color: '#94A3B8', fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#EFF6FF',
                                color: '#0047BA',
                                fontWeight: 700,
                                fontSize: '0.84rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifySelf: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {(inv.investorName || 'I')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0F172A' }}>{inv.investorName}</div>
                              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                {inv.investorEmail} {inv.investorMobile !== '—' ? '• ' + inv.investorMobile : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#059669' }}>
                            ₹{Number(inv.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>
                          {inv.date ? new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.76rem', color: '#475569' }}>
                          {inv.certificateNumber || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: inv.status === 'Allotted' ? '#ECFDF5' : '#EFF6FF',
                              color: inv.status === 'Allotted' ? '#059669' : '#0047BA'
                            }}
                          >
                            {inv.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: '#F8FAFC'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedOfferForInvestors(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          documentUrl={previewDoc.url}
          title={previewDoc.title}
        />
      )}
    </div>
  );
}
