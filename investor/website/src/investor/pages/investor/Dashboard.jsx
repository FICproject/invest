import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Coins,
  Hourglass,
  Layers,
  Calendar,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  FileText
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { InvestmentCard } from '../../components/investment/InvestmentCard';
import {
  PortfolioDonutChart,
  MonthlyReturnsLineChart,
  InvestmentStatusChart
} from '../../components/investment/PortfolioChart';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { investorService } from '../../services/investorService';
import { investmentService } from '../../services/investmentService';
import { useAuth } from '../../context/AuthContext';

export const Dashboard = () => {
  const { user, kycStatus } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const [dashRes, offersRes] = await Promise.all([
          investorService.getDashboardSummary(),
          investmentService.getFeaturedOffers()
        ]);

        if (isMounted) {
          if (dashRes.success) setDashboardData(dashRes.data);
          if (offersRes.success) setFeaturedOffers(offersRes.data);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch dashboard data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading your investor portfolio overview..." />
      </DashboardLayout>
    );
  }

  const metrics = dashboardData?.metrics || {
    totalInvested: 250000,
    totalReturnsEarned: 2000,
    pendingReturns: 9000,
    activeInvestments: 2,
    nextPayoutDate: '2026-04-15'
  };

  const isKycIncomplete = kycStatus !== 'APPROVED';

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Welcome Greeting Banner */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
              Welcome back, {user ? user.name.split(' ')[0] : 'Investor'}!
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Here's your live investment portfolio and payout overview.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => navigate('/investor/statements')}
            >
              Download Statement
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/opportunities')}
            >
              Explore Investments
            </Button>
          </div>
        </div>

        {/* KYC Incomplete Warning Banner if not approved */}
        {isKycIncomplete && (
          <div
            style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldAlert size={22} color="#92400E" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400E' }}>
                  KYC Verification Pending ({kycStatus})
                </div>
                <div style={{ fontSize: '13px', color: '#78350F' }}>
                  Complete your identity verification to enable active investments and automated return distributions.
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/investor/kyc')}
            >
              Verify KYC
            </Button>
          </div>
        )}

        {/* 1. Top 5 Metric Cards matching Image 1 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}
        >
          {[
            {
              label: 'Total Invested',
              value: formatCurrency(metrics.totalInvested),
              icon: Wallet,
              color: 'var(--color-primary)'
            },
            {
              label: 'Total Returns Earned',
              value: formatCurrency(metrics.totalReturnsEarned),
              icon: Coins,
              color: '#10B981'
            },
            {
              label: 'Pending Returns',
              value: formatCurrency(metrics.pendingReturns),
              icon: Hourglass,
              color: '#F59E0B'
            },
            {
              label: 'Active Investments',
              value: metrics.activeInvestments,
              icon: Layers,
              color: 'var(--color-gold)'
            },
            {
              label: 'Next Payout Date',
              value: metrics.nextPayoutDate ? formatDate(metrics.nextPayoutDate) : '15 Apr 2026',
              icon: Calendar,
              color: 'var(--color-primary)'
            }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-primary-subtle)',
                    color: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Charts Row: Portfolio Overview & Monthly Returns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)',
            gap: '20px'
          }}
          className="dashboard-charts-grid"
        >
          {/* Portfolio Donut */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Portfolio Overview</h3>
            </div>
            <PortfolioDonutChart
              sectors={dashboardData?.portfolioOverview}
              totalInvested={metrics.totalInvested}
            />
          </div>

          {/* Monthly Returns Line Chart */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Monthly Returns</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 6 Months</span>
            </div>
            <MonthlyReturnsLineChart data={dashboardData?.monthlyReturns} />
          </div>
        </div>

        {/* 3. Second Row: Investment Status & Recent Activity */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
            gap: '20px'
          }}
          className="dashboard-status-grid"
        >
          {/* Status Gauge */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Investment Status</h3>
            <InvestmentStatusChart status={dashboardData?.investmentStatus} />
          </div>

          {/* Recent Investment Activity */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Investment Activity</h3>
              <button
                onClick={() => navigate('/investor/my-investments')}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
              >
                View All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(dashboardData?.recentActivity || [
                { title: 'Investment in GreenTech Solutions', amount: 15000, date: '2026-03-19', status: 'Confirmed' },
                { title: 'Monthly return received', amount: 2500, date: '2026-03-25', status: 'Completed' },
                { title: 'Investment in Skyline Project', amount: 23500, date: '2026-02-28', status: 'Pending' }
              ]).map((act, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-subtle)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Building2 size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {formatDate(act.date, 'short')}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                      {formatCurrency(act.amount)}
                    </div>
                    <span className={`badge badge-${act.status.toLowerCase()}`}>
                      {act.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Explore Investment Offers Row matching Image 1 */}
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Explore Investment Offers</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Discover vetted opportunities and grow your wealth.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/opportunities')}
            >
              View All Opportunities
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px'
            }}
          >
            {featuredOffers.slice(0, 4).map((offer) => (
              <InvestmentCard key={offer._id} offer={offer} />
            ))}
          </div>
        </div>

        {/* 5. Bottom Row: Recent Transactions Ledger */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Recent Transactions</h3>
            <button
              onClick={() => navigate('/investor/transactions')}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Transaction</th>
                  <th style={{ padding: '10px 12px' }}>Amount</th>
                  <th style={{ padding: '10px 12px' }}>Method</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(dashboardData?.recentTransactions || []).map((txn) => (
                  <tr key={txn._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(txn.createdAt, 'short')}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                      {txn.title}
                    </td>
                    <td style={{ padding: '12px', fontWeight: '700', color: txn.type === 'Payout' ? '#10B981' : 'var(--text-main)' }}>
                      {txn.type === 'Payout' ? '+' : '-'} {formatCurrency(txn.amount)}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {txn.paymentMethod || 'Net Banking'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${txn.status.toLowerCase()}`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-charts-grid,
          .dashboard-status-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};
