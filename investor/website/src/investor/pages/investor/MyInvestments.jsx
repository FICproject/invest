import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, Calendar, TrendingUp, Award, Layers } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { investorService } from '../../services/investorService';

export const MyInvestments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchInvestments = async () => {
      setLoading(true);
      try {
        const params = {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: search.trim() || undefined
        };
        const res = await investorService.getMyInvestments(params);
        if (isMounted && res.success && res.data) {
          setInvestments(res.data);
        }
      } catch (err) {
        console.error('[MyInvestments] Error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInvestments();
    return () => { isMounted = false; };
  }, [statusFilter, search]);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
              My Investments
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Manage your active asset allocations, certificate numbers, and maturity schedules.
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={() => navigate('/opportunities')}>
            New Investment
          </Button>
        </div>

        {/* Filters & Search */}
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
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Confirmed', 'Pending', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: statusFilter === tab ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                  backgroundColor: statusFilter === tab ? 'var(--color-primary)' : 'transparent',
                  color: statusFilter === tab ? '#FFFFFF' : 'var(--text-main)',
                  transition: 'all 0.15s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company or certificate..."
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

        {/* Table / Card List */}
        {loading ? (
          <Loader message="Fetching your investment records..." />
        ) : investments.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No investments found"
            description="You do not have any investments matching this criteria. Explore available offers to grow your wealth."
            actionLabel="Explore Opportunities"
            onAction={() => navigate('/opportunities')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {investments.map((inv) => {
              const offer = inv.offerId;
              return (
                <div
                  key={inv._id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}
                >
                  {/* Left: Info */}
                  <div style={{ minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge badge-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Cert: <strong>{inv.certificateNumber}</strong>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '2px' }}>
                      {offer ? offer.companyName : 'Investment Offer'}
                    </h3>
                    <div style={{ fontSize: '13px', color: 'var(--color-gold)', fontWeight: '600' }}>
                      {offer ? offer.title : 'Corporate Debt'}
                    </div>
                  </div>

                  {/* Middle: Key Figures */}
                  <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Invested Amount</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                        {formatCurrency(inv.amountInvested)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Return Rate</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-gold)' }}>
                        {inv.returnRate}% p.a.
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Expected Returns</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#10B981' }}>
                        {formatCurrency(inv.expectedReturns)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Maturity Date</div>
                      <div style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-main)' }}>
                        {formatDate(inv.maturityDate)}
                      </div>
                    </div>
                  </div>

                  {/* Right Action */}
                  <div>
                    {offer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/opportunities/${offer._id}`)}
                      >
                        Offer Prospectus
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
