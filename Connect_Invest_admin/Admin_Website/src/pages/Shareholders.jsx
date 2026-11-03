import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  PieChart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Award,
  Layers,
  Edit3,
  Percent
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Shareholders() {
  const toast = useToast();
  const [shareholders, setShareholders] = useState([]);
  const [summary, setSummary] = useState({
    totalShareholdersCount: 0,
    totalSharesIssued: 0,
    totalEquityCapitalRaisedPaise: 0,
    avgOwnershipPct: 0
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [allotmentFilter, setAllotmentFilter] = useState('');

  // Edit Allotment Modal
  const [editingShareholder, setEditingShareholder] = useState(null);
  const [editForm, setEditForm] = useState({
    certificateNo: '',
    dematFolioNumber: '',
    allotmentStatus: 'Allotted',
    ownershipPercentage: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchShareholders = async () => {
    try {
      setLoading(true);
      const [shRes, compRes] = await Promise.all([
        adminApi.getShareholders({
          companyId: selectedCompanyId || undefined,
          allotmentStatus: allotmentFilter || undefined,
          search: search || undefined
        }),
        adminApi.getCompanies()
      ]);

      if (shRes.data.success) {
        setShareholders(shRes.data.shareholders || []);
        if (shRes.data.summary) {
          setSummary(shRes.data.summary);
        }
      }
      if (compRes.data.success) {
        setCompanies(compRes.data.companies || []);
      }
    } catch (err) {
      console.error('Failed to load shareholders:', err);
      toast?.error?.('Failed to fetch shareholder registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShareholders();
  }, [selectedCompanyId, allotmentFilter]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    fetchShareholders();
  };

  const handleOpenEdit = sh => {
    setEditingShareholder(sh);
    setEditForm({
      certificateNo: sh.certificateNo === 'PENDING' ? '' : sh.certificateNo || '',
      dematFolioNumber: sh.dematFolioNumber || '',
      allotmentStatus: sh.allotmentStatus || 'Allotted',
      ownershipPercentage: sh.ownershipPercentage !== undefined ? sh.ownershipPercentage.toString() : ''
    });
  };

  const handleSaveAllotment = async e => {
    e.preventDefault();
    if (!editingShareholder) return;

    try {
      setSubmitting(true);
      const res = await adminApi.updateShareholderAllotment(editingShareholder.id, {
        certificateNo: editForm.certificateNo.trim() || 'PENDING',
        dematFolioNumber: editForm.dematFolioNumber.trim() || null,
        allotmentStatus: editForm.allotmentStatus,
        ownershipPercentage: editForm.ownershipPercentage ? Number(editForm.ownershipPercentage) : 0
      });

      if (res.data.success) {
        toast?.success?.('Shareholder allotment details updated successfully');
        setEditingShareholder(null);
        fetchShareholders();
      }
    } catch (err) {
      toast?.error?.(err.response?.data?.error || 'Failed to update allotment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', background: '#EDE9FE', color: '#6D28D9', fontSize: '0.74rem', fontWeight: 700, marginBottom: '6px' }}>
            <PieChart size={13} />
            EQUITY CAP TABLE & SHAREHOLDINGS
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Shareholder Management</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Track equity shares held, individual ownership percentages, cap tables, and legal allotment filings.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              placeholder="Search shareholder, company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          </form>

          <select
            value={selectedCompanyId}
            onChange={e => setSelectedCompanyId(e.target.value)}
            className="input-field"
            style={{ width: '200px' }}
          >
            <option value="">All Companies</option>
            {companies.map(c => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={allotmentFilter}
            onChange={e => setAllotmentFilter(e.target.value)}
            className="input-field"
            style={{ width: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="Allotted">Allotted</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Shareholders
            </span>
            <Users size={18} color="#6D28D9" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
            {summary.totalShareholdersCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Distinct equity share owners
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Shares Held
            </span>
            <Layers size={18} color="#0047BA" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0047BA', marginTop: '8px' }}>
            {summary.totalSharesIssued.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Units of equity allocated across rounds
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Equity Capital Raised
            </span>
            <TrendingUp size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#10B981', marginTop: '8px' }}>
            {formatINR(summary.totalEquityCapitalRaisedPaise)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Total equity funding secured
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Average Stake Held
            </span>
            <Percent size={18} color="#7C3AED" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#7C3AED', marginTop: '8px' }}>
            {summary.avgOwnershipPct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Mean shareholding per investor
          </div>
        </div>
      </div>

      {/* Main Shareholders Table */}
      <div className="forge-card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
            Loading shareholder registry from MongoDB...
          </div>
        ) : shareholders.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
            <PieChart size={40} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ margin: '0 0 6px', color: '#334155', fontWeight: 700 }}>No Shareholders Found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
              No equity investments match your current search filters. Create an Equity / Shareholder Investment offer to issue shares.
            </p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Shareholder</th>
                  <th style={{ width: '20%' }}>Issuing Company & Offer</th>
                  <th style={{ width: '13%', textAlign: 'right' }}>Shares Held</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Ownership Percentage</th>
                  <th style={{ width: '13%', textAlign: 'right' }}>Capital Invested</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Allotment</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {shareholders.map(sh => {
                  const pct = Number(sh.ownershipPercentage || 0);
                  // Scale width for visual indicator (capped at 100%)
                  const barWidth = Math.min(100, Math.max(6, pct * 5));

                  return (
                    <tr key={sh.id}>
                      {/* Shareholder Info */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#EDE9FE',
                            color: '#6D28D9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            flexShrink: 0
                          }}>
                            {sh.investor.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                              {sh.investor.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                              {sh.investor.email}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '1px' }}>
                              {sh.investor.mobile}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company & Offer Info */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} color="#0047BA" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>{sh.company.name}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                          CIN: {sh.company.regNo}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <span className="badge" style={{ padding: '1px 6px', fontSize: '0.66rem', background: '#EDE9FE', color: '#6D28D9', fontWeight: 600 }}>
                            {sh.offer.instrument.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </td>

                      {/* Shares Held & Issue Price */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#6D28D9', fontSize: '1rem' }}>
                          {sh.sharesAllotted.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '1px' }}>
                          @ {formatINR(sh.sharePricePaise)}/sh
                        </div>
                      </td>

                      {/* Shareholding Percentage (%) */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '140px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: '#F5F3FF',
                            border: '1px solid #DDD6FE',
                            color: '#6D28D9',
                            fontWeight: 800,
                            fontSize: '0.92rem'
                          }}>
                            <Percent size={13} />
                            <span>{pct.toFixed(2)}%</span>
                          </div>

                          {/* Visual Progress Bar */}
                          <div style={{ width: '100%', height: '5px', background: '#F1F5F9', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${barWidth}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)',
                              borderRadius: '3px'
                            }} />
                          </div>

                          <span style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '3px' }}>
                            Equity Stake
                          </span>
                        </div>
                      </td>

                      {/* Capital Invested */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                          {formatINR(sh.amountInvestedPaise)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                          Direct Equity
                        </div>
                      </td>

                      {/* Allotment & Certificate */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${
                          sh.allotmentStatus === 'Allotted' ? 'badge-emerald' : 'badge-amber'
                        }`} style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                          {sh.allotmentStatus}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', fontFamily: 'monospace' }}>
                          {sh.certificateNo || 'PENDING'}
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(sh)}
                          className="btn-secondary"
                          style={{
                            padding: '5px 8px',
                            fontSize: '0.72rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Edit Allotment & Certificate Details"
                        >
                          <Edit3 size={12} />
                          Edit
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

      {/* Edit Allotment Modal */}
      {editingShareholder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          padding: '20px'
        }}>
          <div className="forge-card" style={{ width: '100%', maxWidth: 'min(92vw, 520px)', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Manage Shareholder Allotment
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {editingShareholder.investor.name} • {editingShareholder.company.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingShareholder(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAllotment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Shareholding Percentage (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 2.50"
                  value={editForm.ownershipPercentage}
                  onChange={e => setEditForm({ ...editForm, ownershipPercentage: e.target.value })}
                  className="input-field"
                />
                <span style={{ fontSize: '0.72rem', color: '#6D28D9' }}>
                  Calculated from: {editingShareholder.sharesAllotted.toLocaleString('en-IN')} shares held
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Allotment Status *
                </label>
                <select
                  value={editForm.allotmentStatus}
                  onChange={e => setEditForm({ ...editForm, allotmentStatus: e.target.value })}
                  className="input-field"
                >
                  <option value="Allotted">Allotted (Shares Credited / PAS-3 Completed)</option>
                  <option value="Pending">Pending (Filing with RoC in Progress)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Share Certificate Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. CERT-APEX-EQ-2026-001"
                  value={editForm.certificateNo}
                  onChange={e => setEditForm({ ...editForm, certificateNo: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Demat / Client Master Folio (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. IN300126-10492817"
                  value={editForm.dematFolioNumber}
                  onChange={e => setEditForm({ ...editForm, dematFolioNumber: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingShareholder(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : 'Save Allotment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
