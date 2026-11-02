import React, { useState, useEffect } from 'react';
import { CreditCard, Search, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { payoutService } from '../../services/payoutService';

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const params = {
          type: typeFilter !== 'All' ? typeFilter : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: search.trim() || undefined
        };
        const res = await payoutService.getTransactions(params);
        if (isMounted && res.success && res.data) {
          setTransactions(res.data);
        }
      } catch (err) {
        console.error('[Transactions] Error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTransactions();
    return () => { isMounted = false; };
  }, [typeFilter, statusFilter, search]);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            Transactions & Payments
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Complete audit trail of all capital commitments, payout distributions, and bank settlements.
          </p>
        </div>

        {/* Filter Controls */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px'
          }}
        >
          {/* Type Filters */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Investment', 'Payout', 'Refund'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: typeFilter === t ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                  backgroundColor: typeFilter === t ? 'var(--color-primary)' : 'transparent',
                  color: typeFilter === t ? '#FFFFFF' : 'var(--text-main)',
                  transition: 'all 0.15s'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search by reference ID */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or reference ID..."
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '36px',
                paddingRight: '12px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-subtle)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <Loader message="Loading ledger records..." />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No transactions found"
            description="There are no transaction records matching your current filter criteria."
          />
        ) : (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <th style={{ padding: '12px 16px' }}>Date & Time</th>
                    <th style={{ padding: '12px 16px' }}>Transaction</th>
                    <th style={{ padding: '12px 16px' }}>Reference ID</th>
                    <th style={{ padding: '12px 16px' }}>Amount</th>
                    <th style={{ padding: '12px 16px' }}>Payment Method</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => {
                    const isCredit = txn.type === 'Payout' || txn.type === 'Refund';
                    return (
                      <tr key={txn._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatDate(txn.createdAt, 'short')}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--text-main)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCredit ? (
                              <ArrowDownLeft size={16} color="#10B981" />
                            ) : (
                              <ArrowUpRight size={16} color="var(--color-primary)" />
                            )}
                            <span>{txn.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {txn.referenceId}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '800', color: isCredit ? '#10B981' : 'var(--text-main)' }}>
                          {isCredit ? '+' : '-'} {formatCurrency(txn.amount)}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                          {txn.paymentMethod}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge badge-${txn.status.toLowerCase()}`}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
