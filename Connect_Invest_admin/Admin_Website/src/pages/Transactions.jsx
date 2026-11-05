import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Building2,
  TrendingUp,
  Wallet,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { adminApi, formatINR } from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalVolumePaise: 0,
    creditsTotalPaise: 0,
    debitsTotalPaise: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTransactions({
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        search: search.trim() || undefined
      });
      if (res.data?.success) {
        setTransactions(res.data.transactions || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    fetchTransactions();
  };

  return (
    <div className="page-container">
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Transactions Ledger
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Universal audit record of all capital flows, investor inflows, company disbursements, repayments, returns, and subscription fees.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Sync Transactions</span>
        </button>
      </div>

      {/* Top 3 Metric Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #0047BA' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Platform Volume</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {formatINR(stats.totalVolumePaise)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Aggregate gross transaction throughput
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Inflows (Credits)</span>
            <ArrowDownLeft size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            {formatINR(stats.creditsTotalPaise)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Investor capital & company repayments
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Outflows (Debits)</span>
            <ArrowUpRight size={16} color="#D97706" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '6px' }}>
            {formatINR(stats.debitsTotalPaise)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Company disbursements & investor returns
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          {/* Quick Flow Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'CREDIT', label: 'Inflows (Credits)' },
              { id: 'DEBIT', label: 'Outflows (Debits)' },
              { id: 'INVESTMENT', label: 'Investments' },
              { id: 'PAYOUT', label: 'Returns & Payouts' },
              { id: 'REPAYMENT', label: 'Repayments' },
              { id: 'SUBSCRIPTION', label: 'Subscriptions' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: typeFilter === f.id ? '#0047BA' : '#E2E8F0',
                  backgroundColor: typeFilter === f.id ? '#EFF6FF' : '#FFFFFF',
                  color: typeFilter === f.id ? '#0047BA' : '#64748B',
                  transition: 'all 0.15s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search reference, investor, company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ height: '36px', padding: '0 14px', fontSize: '0.8rem' }}>
              Search
            </button>
          </form>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading transactions ledger from MongoDB...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No transactions found matching criteria.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>S.No</th>
                  <th>Transaction Ref & Date</th>
                  <th>Flow</th>
                  <th>Category / Description</th>
                  <th>Party Involved</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Gateway / Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => {
                  const isCredit = tx.flow === 'CREDIT';

                  return (
                    <tr key={tx.id || tx.txRef}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem', color: '#0047BA' }}>
                          {tx.txRef}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: isCredit ? '#DCFCE7' : '#FEF3C7',
                          color: isCredit ? '#15803D' : '#B45309'
                        }}>
                          {isCredit ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                          <span>{tx.flow}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {tx.title}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                          {tx.category}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>
                          {tx.party}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                          {tx.partySub}
                        </div>
                      </td>
                      <td>
                        <div style={{
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: isCredit ? '#059669' : '#D97706'
                        }}>
                          {isCredit ? '+' : '-'}{formatINR(tx.amountPaise)}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${tx.status === 'Completed' || tx.status === 'Paid' ? 'badge-emerald' :
                          tx.status === 'Verified Ready' || tx.status === 'Ready' ? 'badge-cyan' :
                            tx.status === 'Due' ? 'badge-amber' : 'badge-slate'
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {tx.gatewayRef}
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
    </div>
  );
}

