import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Calendar,
  Clock,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Search
} from 'lucide-react';
import { adminApi, formatINR, rupeesToPaise } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Offers() {
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
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

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const [offersRes, compRes] = await Promise.all([
        adminApi.getOffers(),
        adminApi.getCompanies()
      ]);
      if (offersRes.data.success) {
        // Exclude equity from investment list per specification
        const nonEquityOffers = (offersRes.data.offers || []).filter(o => o.kind !== 'equity');
        setOffers(nonEquityOffers);
      }
      if (compRes.data.success) setCompanies(compRes.data.companies);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

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

  const handleActivateOffer = async offerId => {
    try {
      setSubmitting(true);
      const res = await adminApi.activateOffer(offerId);
      if (res.data.success) {
        toast.success(res.data.message || 'Offer activated successfully!');
        fetchOffers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to activate offer');
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

  const filteredOffers = offers.filter(o => {
    const matchesSearch = !search || o.title?.toLowerCase().includes(search.toLowerCase()) || o.companyId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Investment Management</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Review project drafts, publish offers, and activate funding cycles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              placeholder="Search title, company..."
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
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Open">Open</option>
            <option value="Active">Active</option>
            <option value="Funding closed">Funding closed</option>
          </select>

          <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} />
            <span>Create Opportunity</span>
          </button>
        </div>
      </div>

      {/* Offers Grid */}
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
                        <div style={{ fontWeight: 600 }}>{o.title}</div>
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
                          {o.status === 'Open' && raised >= (o.minTargetPaise || 0) && (
                            <button
                              onClick={() => handleActivateOffer(o._id)}
                              className="btn-primary"
                              style={{ padding: '5px 10px', fontSize: '0.75rem', background: '#6366f1' }}
                            >
                              Activate Offer
                            </button>
                          )}

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

                          {/* Delete Project */}
                          <button
                            onClick={() => handleDeleteOffer(o)}
                            className="btn-danger"
                            style={{
                              padding: '5px 8px',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Delete project"
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '28px', background: 'var(--bg-modal)' }}>
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
            maxWidth: '620px',
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
    </div>
  );
}
