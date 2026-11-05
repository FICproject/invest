import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Search, Filter, SlidersHorizontal, Building2, Layers } from 'lucide-react';
import { InvestmentListItem } from '../../components/investment/InvestmentListItem';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { investmentService } from '../../services/investmentService';

export const InvestmentOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('returnRate_desc');

  const typeFilterTabs = [
    { label: 'All Offers', value: 'All' },
    { label: 'Project Investment', value: 'Project' },
    { label: 'Capital / Company Investment', value: 'Company' }
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const params = {
          type: selectedType !== 'All' ? selectedType : undefined,
          search: search.trim() || undefined,
          sort
        };
        const res = await investmentService.getAllOffers(params);
        if (isMounted && res.success && res.data) {
          setOffers(res.data);
        }
      } catch (err) {
        console.error('[InvestmentOffers] Failed to load offers:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOffers();
    return () => { isMounted = false; };
  }, [selectedType, search, sort]);

  return (
    <DashboardLayout
      title="Investment Offers"
      subtitle="Discover verified opportunities open for investor participation"
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Search & Filter Bar */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search by company, title, or industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px 11px 42px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  fontSize: '13.5px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={16} color="var(--text-muted)" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="returnRate_desc">Highest Returns First</option>
                <option value="returnRate_asc">Lowest Returns First</option>
                <option value="minInvestment_asc">Lowest Min Investment</option>
                <option value="minInvestment_desc">Highest Min Investment</option>
                <option value="raised_desc">Most Funded</option>
              </select>
            </div>
          </div>

          {/* Type Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            {typeFilterTabs.map((tab) => {
              const active = selectedType === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedType(tab.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: active ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                    backgroundColor: active ? 'var(--color-primary-subtle)' : 'var(--bg-surface)',
                    color: active ? 'var(--color-primary)' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <Loader message="Loading verified investment offers..." />
        ) : offers.length === 0 ? (
          <EmptyState
            title="No investment opportunities found"
            description="Check back shortly as new investment offers are verified and published to the marketplace."
          />
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {offers.map((offer) => (
              <InvestmentListItem key={offer._id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

