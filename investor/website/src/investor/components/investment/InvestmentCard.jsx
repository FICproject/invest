import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Layers, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { formatCurrency, formatLargeCurrency } from '../../utils/formatCurrency';
import { Button } from '../common/Button';

export const InvestmentCard = ({ offer }) => {
  const navigate = useNavigate();

  if (!offer) return null;

  const isCompany = offer.type === 'Company';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #ECE5DE',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      className="investment-card"
    >
      {/* Card Header Image & Badge */}
      <div style={{ position: 'relative', height: '150px', overflow: 'hidden', backgroundColor: '#EAE5DE' }}>
        <img
          src={offer.imageUrl || 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80'}
          alt={offer.companyName}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '20px',
              backgroundColor: isCompany ? '#FEF3C7' : '#FDE8E8',
              color: isCompany ? '#92400E' : '#9B1C1C',
              border: isCompany ? '1px solid #FCD34D' : '1px solid #FBD5D5'
            }}
          >
            {isCompany ? <Building2 size={12} /> : <Layers size={12} />}
            {offer.type}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h4
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15.5px',
            fontWeight: '700',
            color: '#1F2421',
            marginBottom: '3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={offer.companyName}
        >
          {offer.companyName}
        </h4>

        <div style={{ fontSize: '12px', fontWeight: '600', color: '#C8963E', marginBottom: '8px' }}>
          {offer.category}{offer.location ? ` · ${offer.location}` : ''}
        </div>

        <p
          style={{
            fontSize: '12px',
            color: '#64748B',
            lineHeight: 1.45,
            marginBottom: '14px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '35px'
          }}
        >
          {offer.description}
        </p>

        {/* 1. Minimum Investment Amount & 2. Maximum Investment Amount */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            paddingBottom: '12px',
            marginBottom: '12px',
            borderBottom: '1px solid #ECE5DE',
            fontSize: '11.5px'
          }}
        >
          <div>
            <div style={{ color: '#64748B', whiteSpace: 'nowrap' }}>Min. Investment</div>
            <div style={{ fontWeight: '700', color: '#1F2421', fontSize: '13px' }}>
              {formatCurrency(offer.minInvestment || 1000)}
            </div>
          </div>
          <div>
            <div style={{ color: '#64748B', whiteSpace: 'nowrap' }}>Max. Investment</div>
            <div style={{ fontWeight: '700', color: '#1F2421', fontSize: '13px' }}>
              {formatCurrency(offer.maxInvestment || 10000000)}
            </div>
          </div>
        </div>

        {/* 3. Return Rate & 4. Investment Type & Minimum Period */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '16px',
            fontSize: '11.5px'
          }}
        >
          <div>
            <div style={{ color: '#64748B', whiteSpace: 'nowrap' }}>Return Rate</div>
            <div style={{ fontWeight: '700', color: '#C8963E', fontSize: '13px' }}>
              {offer.returnRate || 3}% / Month
            </div>
          </div>
          <div>
            <div style={{ color: '#64748B', whiteSpace: 'nowrap' }}>Min. Period</div>
            <div style={{ fontWeight: '700', color: '#1F2421', fontSize: '13px' }}>
              {isCompany ? '5 Years' : '2 Years'}
            </div>
          </div>
        </div>

        {/* View Details Action */}
        <div style={{ marginTop: 'auto' }}>
          <button
            type="button"
            onClick={() => navigate(`/opportunities/${offer._id}`)}
            style={{
              width: '100%',
              backgroundColor: '#4A0E17',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '9px 0',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#621320')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4A0E17')}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
