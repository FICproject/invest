import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Loader } from '../../components/common';
import { investmentService } from '../../services';
import { Investment } from '../../types';
import { Briefcase, Coins, TrendingUp, Filter, CheckCircle2, DollarSign } from 'lucide-react';

export const Opportunities: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filterModel, setFilterModel] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [totals, setTotals] = useState({ committed: 0, received: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvestments = async () => {
    setIsLoading(true);
    try {
      const res = await investmentService.getInvestments({
        model: filterModel,
        status: filterStatus,
      });
      setInvestments(res.investments || []);
      setTotals({ committed: res.totalCommitted || 0, received: res.totalReceived || 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [filterModel, filterStatus]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          Investment Management & Capital Pipeline
        </h1>
        <p className="text-xs text-slate-500">
          Reconcile committed investor subscriptions against confirmed escrow receipts
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Subscriptions</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {formatINR(totals.committed)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">All pledges received</span>
        </Card>

        <Card className="p-5 border-emerald-100 bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Confirmed Capital (Escrow/Bank)</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-display">
            {formatINR(totals.received)}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Settled funds available for draw</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Settlement</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-2 font-display">
            {formatINR(Math.max(0, totals.committed - totals.received))}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Under bank gateway reconciliation</span>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Pipeline:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
          >
            <option value="All">All Models</option>
            <option value="Fixed-Term">Fixed-Term</option>
            <option value="Equity">Equity</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Received">Received / In Bank</option>
            <option value="Settled">Settled / Closed</option>
            <option value="Committed">Committed / Pending Fund Transfer</option>
          </select>
        </div>
      </Card>

      {/* Investments Table */}
      {isLoading ? (
        <Loader text="Loading ledger entries..." />
      ) : investments.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">
          No investment records matching filters.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8FA] text-slate-500 uppercase tracking-wider border-b border-pink-100">
                <tr>
                  <th className="p-4">Backer / Investor</th>
                  <th className="p-4">Associated Opportunity</th>
                  <th className="p-4">Model</th>
                  <th className="p-4">Committed</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Issuance State</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {investments.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{inv.investorName}</p>
                      <p className="text-[10px] text-slate-400">{inv.investorEmail}</p>
                    </td>
                    <td className="p-4 max-w-xs truncate font-medium text-slate-700">
                      {inv.requestId?.title || 'Direct Opportunity'}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center space-x-1 font-semibold">
                        {inv.investmentModel === 'Fixed-Term' ? (
                          <Coins className="w-3.5 h-3.5 text-brand-600" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                        )}
                        <span>{inv.investmentModel}</span>
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{formatINR(inv.amount)}</td>
                    <td className="p-4">
                      <Badge variant={inv.paymentStatus === 'Received' || inv.paymentStatus === 'Settled' ? 'success' : 'warning'}>
                        {inv.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {inv.allocationStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500">
                      {inv.transactionReference || 'PENDING-REF'}
                    </td>
                    <td className="p-4 text-slate-400">{new Date(inv.investedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

