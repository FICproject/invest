import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Building2, Layers } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { InvestmentCard } from '../../components/investment/InvestmentCard';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { investmentService } from '../../services/investmentService';

export const Opportunities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(initialType);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState('returnRate_desc');

  const typeFilterTabs = [
    { label: 'All', value: 'All' },
    { label: 'Companies', value: 'Company' },
    { label: 'Projects', value: 'Project' }
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
        console.error('[Opportunities] Failed to load offers:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOffers();
    return () => { isMounted = false; };
  }, [selectedType, search, sort]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 0 64px' }}>
        <div className="container">
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Investment Opportunities
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
              Discover approved corporate and project debt opportunities. All offers feature institutional-grade security.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              padding: '20px',
              marginBottom: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            {/* Search and Sort row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by company, project, or keyword..."
                  style={{
                    width: '100%',
                    height: '42px',
                    paddingLeft: '38px',
                    paddingRight: '14px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Sort By Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={{
                    height: '42px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="returnRate_desc">Highest Return Rate</option>
                  <option value="returnRate_asc">Lowest Return Rate</option>
                  <option value="minInvestment_asc">Lowest Min Investment</option>
                  <option value="minInvestment_desc">Highest Min Investment</option>
                  <option value="raised_desc">Most Funded</option>
                </select>
              </div>
            </div>

            {/* Offer Type Filter Pills: All, Companies, Projects */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              {typeFilterTabs.map((tab) => {
                const isSelected = selectedType === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setSelectedType(tab.value)}
                    style={{
                      padding: '8px 22px',
                      borderRadius: '24px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      border: isSelected ? '1px solid #4A0E17' : '1px solid #ECE5DE',
                      backgroundColor: isSelected ? '#4A0E17' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#1F2421',
                      boxShadow: isSelected ? '0 4px 12px rgba(74, 14, 23, 0.2)' : 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <Loader message="Loading available investment opportunities from backend..." />
          ) : offers.length === 0 ? (
            <EmptyState
              title="No investment opportunities found"
              description="Try adjusting your search criteria or filters to view other opportunities."
              actionLabel="Clear Filters"
              onAction={() => {
                setSelectedType('All');
                setSearch('');
              }}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}
            >
              {offers.map((offer) => (
                <InvestmentCard key={offer._id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
