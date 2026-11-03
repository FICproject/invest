import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Building2,
  Briefcase,
  User,
  Filter,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';

export default function InvestmentsPortfolio() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [totalPaise, setTotalPaise] = useState(0);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllInvestments({ status: statusFilter, search });
      if (res.data.success) {
        setInvestments(res.data.investments);
        setTotalPaise(res.data.totalInvestedPaise || 0);
      }
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [statusFilter]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    fetchInvestments();
  };

  const activeCount = investments.filter(i => i.status === 'Active' || i.status === 'Confirmed').length;
  const maturedCount = investments.filter(i => i.status === 'Matured' || i.status === 'Completed').length;

  return (
    <div className="page-container">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A' }}>Investments Portfolio</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Monitor all capital deployed across projects and companies by verified investors.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Search investor, project, company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          </form>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: '160px' }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Matured">Matured</option>
            <option value="Pending payment">Pending Payment</option>
            <option value="Defaulted">Defaulted</option>
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
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Capital Deployed
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0047BA', marginTop: '6px' }}>
            {formatINR(totalPaise)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Across all verified investment commitments
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: '#FFFFFF' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Commitments
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {investments.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Total investor participation records
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: '#FFFFFF' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
            Active Deployments
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', marginTop: '6px' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Currently generating monthly investor returns
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: '#FFFFFF' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
            Completed / Matured
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6366F1', marginTop: '6px' }}>
            {maturedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
            Fully repaid at tenure completion
          </div>
        </div>
      </div>

      {/* Main Investments Table */}
      <div className="forge-card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
            Loading investments portfolio records...
          </div>
        ) : investments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
            No investment records found matching the filter criteria.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th style={{ width: '20%' }}>Investor</th>
                  <th style={{ width: '22%' }}>Project / Opportunity</th>
                  <th style={{ width: '18%' }}>Issuing Company</th>
                  <th style={{ width: '13%', textAlign: 'right' }}>Amount Invested</th>
                  <th style={{ width: '11%', textAlign: 'right' }}>Monthly Return</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Tenure</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '12%' }}>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv, idx) => (
                  <tr key={inv.id}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#E0EDFD',
                          color: '#0047BA',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}>
                          {inv.investor.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>{inv.investor.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{inv.investor.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>{inv.offer.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span
                          className="badge"
                          style={{
                            padding: '1px 6px',
                            fontSize: '0.65rem',
                            background: inv.offer.kind === 'equity' ? '#EDE9FE' : '#F1F5F9',
                            color: inv.offer.kind === 'equity' ? '#6D28D9' : '#475569'
                          }}
                        >
                          {inv.offer.kind === 'equity' ? 'Equity' : inv.offer.kind}
                        </span>
                        {inv.offer.kind === 'equity' ? (
                          <span style={{ fontWeight: 600, color: '#6D28D9' }}>
                            {inv.ownershipPercentage ? `${inv.ownershipPercentage}% Ownership` : 'Shareholder'}
                          </span>
                        ) : inv.offer.rateBps ? (
                          <span style={{ fontWeight: 600, color: '#0047BA' }}>{(inv.offer.rateBps / 100).toFixed(1)}% p.a.</span>
                        ) : null}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={14} color="#0047BA" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{inv.company.name}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                        CIN: {inv.company.regNo} • {inv.company.sector}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>
                        {formatINR(inv.amountPaise)}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {inv.offer.kind === 'equity' ? (
                        <div>
                          <div style={{ fontWeight: 700, color: '#7C3AED', fontSize: '0.88rem' }}>
                            {inv.sharesAllotted || Math.floor(inv.amountPaise / (inv.sharePricePaise || 10000))} shares
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            Dividends + Gain
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontWeight: 600, color: '#10B981', fontSize: '0.88rem' }}>
                          {formatINR(inv.monthlyReturnPaise)}/mo
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {inv.offer.kind === 'equity' ? (
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7C3AED' }}>Perpetual</div>
                      ) : (
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{inv.tenureMonths} Months</div>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${
                        inv.status === 'Active' ? 'badge-emerald' :
                        inv.status === 'Confirmed' ? 'badge-blue' :
                        inv.status === 'Matured' ? 'badge-purple' :
                        inv.status === 'Defaulted' ? 'badge-rose' : 'badge-amber'
                      }`}>
                        {inv.status}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>
                        <div><strong style={{ color: '#475569' }}>Active:</strong> {inv.activationDate ? new Date(inv.activationDate).toLocaleDateString('en-IN') : 'Pending'}</div>
                        <div>
                          <strong style={{ color: '#475569' }}>{inv.offer.kind === 'equity' ? 'Exit:' : 'Matures:'}</strong>{' '}
                          {inv.offer.kind === 'equity'
                            ? 'Secondary / IPO'
                            : inv.maturityDate
                            ? new Date(inv.maturityDate).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
