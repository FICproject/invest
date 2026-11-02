import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Building2,
  Rocket,
  Download,
  Calendar,
  ChevronDown,
  TrendingUp,
  Coins,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Layers,
  UserPlus,
  PlusCircle,
  Wallet
} from 'lucide-react';
import StatCard from '../components/StatCard';
import InteractivePieChart from '../components/InteractivePieChart';
import { adminApi, formatINR } from '../services/api';
import { initRealTimeSync } from '../services/realTimeSync';

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [recentData, setRecentData] = useState({
    recentInvestors: [],
    recentCompanies: [],
    recentTransactions: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30D');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await adminApi.getDashboard();
        if (res.data.success) {
          setStats(res.data.stats);
          if (res.data.distribution) {
            setDistribution(res.data.distribution);
          }
          setRecentData({
            recentInvestors: res.data.recentInvestors || [],
            recentCompanies: res.data.recentCompanies || [],
            recentTransactions: res.data.recentTransactions || [],
            recentActivities: res.data.recentActivities || []
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();

    // Listen for live database updates from Mobile or other sessions
    const unsubscribe = initRealTimeSync((event) => {
      console.log('[Dashboard Live Sync Event]:', event);
      fetchStats();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const s = stats || {};

  // Periods & dynamic chart configurations
  const periodOptions = [
    { id: '7D', label: 'Last 7 days' },
    { id: '30D', label: 'Last 30 days' },
    { id: '90D', label: 'Last 90 days' },
    { id: '1Y', label: 'Last 1 year' },
    { id: 'ALL', label: 'All time' }
  ];

  const trendsByPeriod = {
    '7D': [
      { month: 'Mon', invested: 0.22, returnVal: 0.12 },
      { month: 'Tue', invested: 0.35, returnVal: 0.20 },
      { month: 'Wed', invested: 0.48, returnVal: 0.30 },
      { month: 'Thu', invested: 0.65, returnVal: 0.42 },
      { month: 'Fri', invested: 0.88, returnVal: 0.55 },
      { month: 'Sat', invested: 1.10, returnVal: 0.75 },
      { month: 'Sun', invested: 1.25, returnVal: 0.90 }
    ],
    '30D': [
      { month: 'Jan', invested: 0.52, returnVal: 0.28 },
      { month: 'Feb', invested: 0.68, returnVal: 0.45 },
      { month: 'Mar', invested: 0.85, returnVal: 0.52 },
      { month: 'Apr', invested: 1.05, returnVal: 0.65 },
      { month: 'May', invested: 1.25, returnVal: 0.82 },
      { month: 'Jun', invested: 1.35, returnVal: 0.95 },
      { month: 'Jul', invested: 1.45, returnVal: 1.30 }
    ],
    '90D': [
      { month: 'Nov', invested: 0.40, returnVal: 0.20 },
      { month: 'Dec', invested: 0.65, returnVal: 0.38 },
      { month: 'Jan', invested: 0.95, returnVal: 0.58 },
      { month: 'Feb', invested: 1.20, returnVal: 0.80 },
      { month: 'Mar', invested: 1.40, returnVal: 1.05 },
      { month: 'Apr', invested: 1.65, returnVal: 1.25 },
      { month: 'May', invested: 1.85, returnVal: 1.50 }
    ],
    '1Y': [
      { month: 'Q1', invested: 0.65, returnVal: 0.35 },
      { month: 'Q2', invested: 1.10, returnVal: 0.70 },
      { month: 'Q3', invested: 1.50, returnVal: 1.10 },
      { month: 'Q4', invested: 1.90, returnVal: 1.55 }
    ],
    'ALL': [
      { month: '2023', invested: 0.80, returnVal: 0.45 },
      { month: '2024', invested: 1.35, returnVal: 0.90 },
      { month: '2025', invested: 1.75, returnVal: 1.30 },
      { month: '2026', invested: 2.10, returnVal: 1.70 }
    ]
  };

  const monthlyTrends = trendsByPeriod[period] || trendsByPeriod['30D'];
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Live database records
  const investorsList = recentData.recentInvestors || [];
  const companiesList = recentData.recentCompanies || [];
  const transactionsList = recentData.recentTransactions || [];
  const activitiesList = recentData.recentActivities || [];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Title & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>

        {/* Date Filter Pill Button with interactive dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              border: dropdownOpen ? '1px solid #0047BA' : '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#1E293B',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <Calendar size={16} color="#64748B" />
            <span>{periodOptions.find(p => p.id === period)?.label || 'Last 30 days'}</span>
            <ChevronDown size={14} color="#64748B" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.12)',
              padding: '6px',
              minWidth: '170px',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              {periodOptions.map(opt => {
                const isSelected = opt.id === period;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPeriod(opt.id);
                      setDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: isSelected ? '#EFF6FF' : 'transparent',
                      color: isSelected ? '#0047BA' : '#334155',
                      border: 'none',
                      fontSize: '0.84rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span style={{ color: '#0047BA', fontSize: '0.78rem' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 1: 4 KPI Cards matching Image */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '18px'
      }}>
        {/* Card 1: Total Investors */}
        <div className="forge-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#0047BA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <Users size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Total Investors</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {s.totalInvestorsCount !== undefined ? s.totalInvestorsCount.toLocaleString('en-IN') : '...'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>Active registered profiles</div>
          </div>
        </div>

        {/* Card 2: Verified Investors */}
        <div className="forge-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <ShieldCheck size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Verified Investors</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {s.verifiedInvestorsCount !== undefined ? s.verifiedInvestorsCount.toLocaleString('en-IN') : '...'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>KYC Approved & Compliant</div>
          </div>
        </div>

        {/* Card 3: Registered Companies */}
        <div className="forge-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#8B5CF6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <Building2 size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Registered Companies</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {s.registeredCompaniesCount !== undefined ? s.registeredCompaniesCount.toLocaleString('en-IN') : '...'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>Corporate entities on platform</div>
          </div>
        </div>

        {/* Card 4: Active Opportunities */}
        <div className="forge-card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <Rocket size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Active Opportunities</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {s.activeOffersCount !== undefined ? s.activeOffersCount.toLocaleString('en-IN') : '...'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>Currently raising capital</div>
          </div>
        </div>
      </div>

      {/* Row 2: Investment Overview (Bars + Line) + Investment Distribution (Donut) + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1.6fr 0.95fr', gap: '18px' }}>
        {/* Card 1: Investment Overview (Bar + Line Hybrid Chart) */}
        <div className="forge-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="#0047BA" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Investment Overview
                </h3>
              </div>

              {/* Legend with Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0047BA' }} />
                  <span>Invested Amount</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FAB800' }} />
                  <span>Returns</span>
                </div>
              </div>
            </div>

            {/* Hybrid Bar + Line SVG Chart */}
            <div style={{ position: 'relative', height: '190px', width: '100%', marginTop: '10px' }}>
              <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                {/* Horizontal Grid Lines */}
                <line x1="40" y1="20" x2="490" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <text x="5" y="24" fontSize="10" fill="#94A3B8" fontWeight="600">₹2M</text>

                <line x1="40" y1="65" x2="490" y2="65" stroke="#F1F5F9" strokeWidth="1" />
                <text x="5" y="69" fontSize="10" fill="#94A3B8" fontWeight="600">₹1.5M</text>

                <line x1="40" y1="110" x2="490" y2="110" stroke="#F1F5F9" strokeWidth="1" />
                <text x="5" y="114" fontSize="10" fill="#94A3B8" fontWeight="600">₹1M</text>

                <line x1="40" y1="145" x2="490" y2="145" stroke="#F1F5F9" strokeWidth="1" />
                <text x="5" y="149" fontSize="10" fill="#94A3B8" fontWeight="600">₹0.5M</text>

                <line x1="40" y1="165" x2="490" y2="165" stroke="#E2E8F0" strokeWidth="1" />
                <text x="15" y="169" fontSize="10" fill="#94A3B8" fontWeight="600">₹0</text>

                {/* Vertical Blue Bars dynamically spaced */}
                {monthlyTrends.map((d, i) => {
                  const totalItems = monthlyTrends.length;
                  const step = 400 / (totalItems + 1);
                  const x = 55 + (i + 1) * step;
                  const barH = (d.invested / 2.0) * 145;
                  const barY = 165 - barH;
                  return (
                    <g key={i}>
                      <rect
                        x={x - 10}
                        y={barY}
                        width="20"
                        height={barH}
                        rx="4"
                        fill="#0047BA"
                        style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                      />
                      <text x={x} y="178" fontSize="11" fill="#64748B" fontWeight="600" textAnchor="middle">
                        {d.month}
                      </text>
                    </g>
                  );
                })}

                {/* Continuous Yellow Returns Line */}
                <path
                  d={monthlyTrends.map((d, i) => {
                    const totalItems = monthlyTrends.length;
                    const step = 400 / (totalItems + 1);
                    const x = 55 + (i + 1) * step;
                    const y = 165 - (d.returnVal / 2.0) * 145;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#FAB800"
                  strokeWidth="2.8"
                />

                {/* Line Nodes */}
                {monthlyTrends.map((d, i) => {
                  const totalItems = monthlyTrends.length;
                  const step = 400 / (totalItems + 1);
                  const x = 55 + (i + 1) * step;
                  const y = 165 - (d.returnVal / 2.0) * 145;
                  return (
                    <circle
                      key={`node-${i}`}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#FAB800"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Investment Distribution (Donut Chart) */}
        <div className="forge-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={18} color="#0047BA" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Investment Distribution
              </h3>
            </div>

            <InteractivePieChart
              data={distribution}
              size={172}
              innerRadiusRatio={0.68}
              centerLabel={s.totalRaisedPaise ? formatINR(s.totalRaisedPaise) : '₹0'}
              centerSublabel="Total Invested"
              layout="horizontal"
            />
          </div>
        </div>

        {/* Card 3: Quick Actions 2x2 Grid */}
        <div className="forge-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Rocket size={18} color="#0047BA" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Quick Actions
              </h3>
            </div>

            {/* 2x2 Grid of Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => setActiveTab('investors')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0047BA'; e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <UserPlus size={20} color="#0047BA" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>Add Investor</span>
              </button>

              <button
                onClick={() => setActiveTab('companies')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0047BA'; e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <Building2 size={20} color="#0047BA" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>Add Company</span>
              </button>

              <button
                onClick={() => setActiveTab('offers')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0047BA'; e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <PlusCircle size={20} color="#0047BA" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B', textAlign: 'center' }}>Create Opportunity</span>
              </button>

              <button
                onClick={() => setActiveTab('payouts')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0047BA'; e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <Wallet size={20} color="#0047BA" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>Returns & Payouts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Investors + Recent Companies Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        {/* Table 1: Recent Investors */}
        <div className="forge-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#0047BA" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Recent Investors
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('investors')}
              style={{ background: 'none', border: 'none', color: '#0047BA', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All →
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ color: '#64748B', textAlign: 'left', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '8px 4px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '8px 4px', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '8px 4px', fontWeight: 600 }}>Investment Amount</th>
                <th style={{ padding: '8px 4px', fontWeight: 600, textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {investorsList.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                    No registered investors yet.
                  </td>
                </tr>
              ) : (
                investorsList.map((inv, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < investorsList.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600, color: '#1E293B' }}>{inv.name}</td>
                    <td style={{ padding: '10px 4px', color: '#64748B' }}>{inv.email}</td>
                    <td style={{ padding: '10px 4px', fontWeight: 600, color: '#1E293B' }}>{inv.amount}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: inv.status === 'Verified' ? '#DCFCE7' : '#FEF3C7',
                        color: inv.status === 'Verified' ? '#15803D' : '#B45309'
                      }}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table 2: Recent Companies */}
        <div className="forge-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#0047BA" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Recent Companies
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('companies')}
              style={{ background: 'none', border: 'none', color: '#0047BA', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All →
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ color: '#64748B', textAlign: 'left', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '8px 4px', fontWeight: 600 }}>Company Name</th>
                <th style={{ padding: '8px 4px', fontWeight: 600 }}>Industry</th>
                <th style={{ padding: '8px 4px', fontWeight: 600 }}>Funding Required</th>
                <th style={{ padding: '8px 4px', fontWeight: 600, textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {companiesList.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                    No companies onboarded yet.
                  </td>
                </tr>
              ) : (
                companiesList.map((comp, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < companiesList.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600, color: '#1E293B' }}>{comp.name}</td>
                    <td style={{ padding: '10px 4px', color: '#64748B' }}>{comp.industry}</td>
                    <td style={{ padding: '10px 4px', fontWeight: 600, color: '#1E293B' }}>{comp.fundingRequired}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: comp.status === 'Approved' ? '#DCFCE7' : comp.status === 'Under Review' ? '#E0EDFD' : comp.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                        color: comp.status === 'Approved' ? '#15803D' : comp.status === 'Under Review' ? '#1D4ED8' : comp.status === 'Rejected' ? '#B91C1C' : '#B45309'
                      }}>
                        {comp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Recent Transactions + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '18px' }}>
        {/* Card 1: Recent Transactions */}
        <div className="forge-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={18} color="#0047BA" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Recent Transactions
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('releases')}
              style={{ background: 'none', border: 'none', color: '#0047BA', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All →
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ color: '#64748B', textAlign: 'left', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Investor / Company</th>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '6px 4px', fontWeight: 600, textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactionsList.map((tx, idx) => (
                <tr key={idx} style={{ borderBottom: idx < transactionsList.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                  <td style={{ padding: '8px 4px', color: '#64748B' }}>{tx.date}</td>
                  <td style={{ padding: '8px 4px', fontWeight: 600, color: '#1E293B' }}>{tx.type}</td>
                  <td style={{ padding: '8px 4px', color: '#334155' }}>{tx.party}</td>
                  <td style={{ padding: '8px 4px', fontWeight: 600, color: '#1E293B' }}>{tx.amount}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: tx.status === 'Completed' ? '#DCFCE7' : '#FEF3C7',
                      color: tx.status === 'Completed' ? '#15803D' : '#B45309'
                    }}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card 2: Recent Activity Timeline */}
        <div className="forge-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calendar size={18} color="#0047BA" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Recent Activity
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activitiesList.map((act, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: act.color || '#0047BA',
                    flexShrink: 0
                  }} />
                  <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 500, lineHeight: 1.3 }}>
                    {act.text}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
