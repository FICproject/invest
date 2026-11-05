import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Layers, TrendingUp, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export const InvestmentListItem = ({ offer }) => {
  const navigate = useNavigate();

  if (!offer) return null;

  const isCompany = offer.type === 'Company';
  const minPeriod = isCompany ? '5 Years' : `${offer.tenureMonths ? offer.tenureMonths + ' Months' : '2 Years'}`;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'all 0.15s ease'
      }}
      className="investment-list-item"
    >
      {/* 1. Entity & Category */}
      <div style={{ minWidth: '220px', flex: '1 1 240px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: isCompany ? '#FEF3C7' : '#FDE8E8',
              color: isCompany ? '#92400E' : '#9B1C1C',
              border: isCompany ? '1px solid #FCD34D' : '1px solid #FBD5D5'
            }}
          >
            {isCompany ? <Building2 size={12} /> : <Layers size={12} />}
            {offer.type || 'Project'} Investment
          </span>
          {offer.category && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              • {offer.category}
            </span>
          )}
        </div>

        <h4
          style={{
            fontSize: '17px',
            fontWeight: '800',
            color: 'var(--text-main)',
            marginBottom: '3px'
          }}
        >
          {offer.title || offer.companyName}
        </h4>
        <div style={{ fontSize: '13px', color: 'var(--color-gold)', fontWeight: '600' }}>
          {offer.companyName} {offer.location ? `· ${offer.location}` : ''}
        </div>
      </div>

      {/* 2. Key Investment Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Min. Investment
          </div>
          <div style={{ fontSize: '15.5px', fontWeight: '800', color: 'var(--text-main)' }}>
            {formatCurrency(offer.minInvestment || 50000)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Max. Investment
          </div>
          <div style={{ fontSize: '15.5px', fontWeight: '800', color: 'var(--text-main)' }}>
            {formatCurrency(offer.maxInvestment || offer.targetAmount || 500000)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Return Rate
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-gold)' }}>
            {offer.returnRate || 3}% p.a.
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Tenure / Period
          </div>
          <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-main)' }}>
            {minPeriod}
          </div>
        </div>
      </div>

      {/* 3. Action */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => navigate(`/opportunities/${offer._id}`)}
          style={{
            backgroundColor: '#4A0E17',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 22px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(74, 14, 23, 0.25)',
            transition: 'background-color 0.15s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#621320')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4A0E17')}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

