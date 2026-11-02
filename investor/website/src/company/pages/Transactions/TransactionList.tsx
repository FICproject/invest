import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Loader } from '../../components/common';
import { transactionService } from '../../services';
import { Transaction } from '../../types';
import {
  Receipt,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Download,
  Wallet,
  Coins
} from 'lucide-react';

export const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState({ totalFundingReceived: 0, totalRepayments: 0, totalTransactionsCount: 0 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [model, setModel] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await transactionService.getTransactions({ search, type, status, model });
      setTransactions(res.transactions || []);
      if (res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, type, status, model]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Transaction ID,Date,Type,Amount,Payment Method,Status']
        .concat(
          transactions.map(
            (t) =>
              `${t.referenceId},${t.transactionDate || (t as any).createdAt},${t.type},${t.amount},${t.paymentMethod},${t.status}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `connect_invest_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Transactions
          </h1>
          <p className="text-xs text-slate-500">
            View all transactions between Connect Invest and the company, funding amounts received, and repayment records.
          </p>
        </div>

        <Button variant="outline" onClick={handleExportCSV} className="text-xs font-bold">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export Statement
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Funding Amounts Received</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-display">
            {formatINR(metrics.totalFundingReceived)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Inflows from capital rounds</span>
        </Card>

        <Card className="p-5 border-l-4 border-l-[#F4B41A] bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Repayment Transactions</span>
            <ArrowUpRight className="w-4 h-4 text-[#DE8E0A]" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {formatINR(metrics.totalRepayments)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Debt servicing & coupon payouts</span>
        </Card>

        <Card className="p-5 border-l-4 border-l-slate-400 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Logged Entries</span>
            <Receipt className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-display">
            {metrics.totalTransactionsCount || transactions.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified ledger records</span>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Transaction ID, title or method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#F4B41A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
          >
            <option value="All">All Transaction Types</option>
            <option value="Investment">Funding Received (Investment)</option>
            <option value="Payout">Repayment (Payout)</option>
            <option value="Refund">Refund</option>
            <option value="Deposit">Deposit</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
          >
            <option value="All">All Models</option>
            <option value="Fixed-Term">Fixed-Term</option>
            <option value="Equity">Equity</option>
          </select>
        </div>
      </Card>

      {/* Transactions Table */}
      {isLoading ? (
        <Loader text="Auditing transaction records..." />
      ) : transactions.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-500">
          No transactions match your current search and filter criteria.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF7] text-slate-500 uppercase tracking-wider border-b border-[#F2EBD9]">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Transaction Details</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx: any) => {
                  const isReceived = tx.type === 'Investment' || tx.type === 'Deposit';
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {tx.referenceId}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{tx.title}</div>
                        {tx.investmentModel && (
                          <span className="text-[10px] text-slate-500">{tx.investmentModel}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isReceived ? 'text-emerald-700' : 'text-[#DE8E0A]'
                          }`}
                        >
                          {isReceived ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {isReceived ? 'Funding Received' : 'Repayment'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        <span className={isReceived ? 'text-emerald-700' : 'text-slate-900'}>
                          {isReceived ? '+' : '-'} {formatINR(tx.amount)}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {tx.paymentMethod || 'Bank Transfer'}
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(tx.createdAt || tx.transactionDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            tx.status === 'Confirmed' || tx.status === 'Completed'
                              ? 'success'
                              : tx.status === 'Pending'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
