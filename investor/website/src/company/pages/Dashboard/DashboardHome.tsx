import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Coins,
  Briefcase,
  Users2,
  PieChart as PieIcon,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  AlertCircle,
  FileCheck2,
  DollarSign,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, Badge, Loader, Button } from '../../components/common';
import { investmentService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export const DashboardHome: React.FC = () => {
  const { company } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await investmentService.getDashboardOverview();
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard overview data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (isLoading) return <Loader text="Assembling company intelligence..." />;

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchOverview}>
          Retry
        </Button>
      </div>
    );
  }

  const { kpi, charts, recentInvestments, recentTransactions, latestNotifications, pendingDocs } = data;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#F4B41A] via-[#E8A51D] to-[#DE8E0A] rounded-3xl p-6 sm:p-8 text-[#1F2421] shadow-xl shadow-[#F4B41A]/10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-white/30 px-2.5 py-0.5 rounded-full backdrop-blur-sm text-[#1F2421]">
              Corporate Workspace
            </span>
            <span className="text-xs text-[#1F2421]/80 font-medium">• Real-Time Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#1F2421]">
            Welcome back, {company?.legalName || 'Partner Enterprise'}
          </h1>
          <p className="text-xs sm:text-sm text-[#1F2421]/90 max-w-2xl font-medium">
            Monitor real-time funding progress, manage cap table share allocations, track investor commitments, and fulfill compliance deliverables.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/dashboard/requests/create">
            <Button className="bg-[#1F2421] text-white hover:bg-black border-0 font-bold shadow-md">
              <Plus className="w-4 h-4 mr-1.5" />
              New Funding Request
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards Grid (8 Cards as requested) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Funds Requested */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Requested</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF9ED] text-[#B37400] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {formatINR(kpi?.totalFundsRequested)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active Campaigns & Drafts</span>
        </Card>

        {/* Total Funds Raised */}
        <Card className="p-5 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Funds Raised</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-2 font-display">
            {formatINR(kpi?.totalFundsRaised)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {kpi?.fundingProgress}% of target funded
          </span>
        </Card>

        {/* Active Investment Requests */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Requests</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {kpi?.activeRequestsCount || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Live in Marketplace</span>
        </Card>

        {/* Total Investors */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Investors</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {kpi?.totalInvestors || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Committed Backers</span>
        </Card>

        {/* Total Shareholders */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shareholders</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF9ED] text-[#DE8E0A] flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {kpi?.totalShareholders || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">On MCA Cap Table</span>
        </Card>

        {/* Funding Progress */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Funding Progress</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              {kpi?.fundingProgress || 0}%
            </p>
            <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#F4B41A] h-full rounded-full"
                style={{ width: `${Math.min(kpi?.fundingProgress || 0, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Aggregated fulfillment</span>
        </Card>

        {/* Available Funds */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Capital</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {formatINR(kpi?.availableFunds)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Disbursed / Escrowed</span>
        </Card>

        {/* Pending Approvals */}
        <Card className="p-5 border-amber-100 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-900 mt-2 font-display">
            {kpi?.pendingApprovals || 0}
          </p>
          <span className="text-[11px] text-amber-700 mt-1 block">Under Admin Audit</span>
        </Card>
      </div>

      {/* 3. Charts Section: Investment Activity & Model Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Over Time (Area Chart) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#EFE8D8] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Funding Activity Over Time</h3>
              <p className="text-xs text-slate-500">
                Monthly progression of capital requests vs actual received capital
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                <span className="text-slate-600">Requested</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#F4B41A]"></span>
                <span className="text-slate-900">Raised</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.activityData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRaised" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F4B41A" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F4B41A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRequested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 100000}L`}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(val), '']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #F4E9CD',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requested"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRequested)"
                />
                <Area
                  type="monotone"
                  dataKey="raised"
                  stroke="#DE8E0A"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRaised)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Model Distribution (Pie Chart) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EFE8D8] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Investment Model Split</h3>
            <p className="text-xs text-slate-500">Distribution between Fixed-Term and Equity</p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.modelDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.modelDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [formatINR(val), 'Capital']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">Total Raised</span>
              <span className="text-sm font-extrabold text-slate-900 font-display">
                {formatINR(kpi?.totalFundsRaised)}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {(charts?.modelDistribution || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatINR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Recent Activity, Transactions & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Investments */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFE8D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display">Recent Investments</h3>
            <Link to="/dashboard/investments" className="text-xs font-semibold text-[#DE8E0A] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentInvestments && recentInvestments.length > 0 ? (
              recentInvestments.map((inv: any) => (
                <div
                  key={inv._id}
                  className="p-3 rounded-2xl bg-[#FFFDF7] border border-[#EFE8D8] flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{inv.investorName}</p>
                    <p className="text-[11px] text-slate-500">
                      {inv.investmentModel} • {new Date(inv.investedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-[#DE8E0A]">{formatINR(inv.amount)}</p>
                    <Badge variant={inv.paymentStatus === 'Settled' || inv.paymentStatus === 'Received' ? 'success' : 'warning'}>
                      {inv.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent investor pledges yet.</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFE8D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display">Recent Ledger Activity</h3>
            <Link to="/dashboard/transactions" className="text-xs font-semibold text-[#DE8E0A] hover:underline">
              Transactions
            </Link>
          </div>

          <div className="space-y-3">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map((tx: any) => (
                <div
                  key={tx._id}
                  className="p-3 rounded-2xl bg-[#FFFDF7] border border-[#EFE8D8] shadow-sm flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{tx.type}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{tx.referenceId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">{formatINR(tx.amount)}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">{tx.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No transaction records logged.</p>
            )}
          </div>
        </div>

        {/* Pending Documents & Compliance */}
        <div className="bg-white rounded-3xl p-6 border border-[#EFE8D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display">Compliance & Alerts</h3>
            <Link to="/dashboard/documents" className="text-xs font-semibold text-[#DE8E0A] hover:underline">
              Documents
            </Link>
          </div>

          <div className="space-y-3">
            {latestNotifications && latestNotifications.length > 0 ? (
              latestNotifications.slice(0, 3).map((notif: any) => (
                <div
                  key={notif._id}
                  className={`p-3 rounded-2xl border text-xs space-y-1 ${
                    notif.priority === 'urgent'
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-[#FFF9ED] border-[#F4E9CD]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{notif.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{notif.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">All compliance tasks up to date.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

