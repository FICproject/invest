import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Loader, Modal } from '../../components/common';
import { financialService } from '../../services';
import {
  Coins,
  TrendingUp,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  FolderKanban,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  AlertCircle
} from 'lucide-react';

export const FixedTermReturns: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'company' | 'project' | 'repayments' | 'dividends'>('company');
  const [isLoading, setIsLoading] = useState(true);

  // Dividend Declaration Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newDividend, setNewDividend] = useState({
    declarationDate: new Date().toISOString().split('T')[0],
    recordDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    payoutDate: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
    financialYear: 'FY 2025-26',
    dividendType: 'Interim',
    amountPerShare: 3.0,
    boardResolutionRef: 'BR-DIV-2026/03',
    notes: 'Approved dividend disbursement to be transferred via direct bank mandate.',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await financialService.getReturnsAndDividends();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeclareDividend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financialService.declareDividend(newDividend);
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record dividend declaration.');
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (isLoading) return <Loader text="Loading Returns and Dividends data..." />;

  const summary = data?.summary || {
    totalReceived: 0,
    totalRepaid: 0,
    pendingRepayments: 0,
    averageReturnRate: 14.5,
  };

  const companyInvestments = data?.companyInvestments || [];
  const projectInvestments = data?.projectInvestments || [];
  const upcomingRepayments = data?.upcomingRepayments || [];
  const repaymentHistory = data?.repaymentHistory || [];
  const dividends = data?.dividends || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Returns and Dividends
          </h1>
          <p className="text-xs text-slate-500">
            Monitor capital received from Connect Invest, track pending obligations, repayment dates, and separate Company vs Project investments.
          </p>
        </div>

        {activeTab === 'dividends' && (
          <Button onClick={() => setModalOpen(true)} className="font-bold">
            <Plus className="w-4 h-4 mr-1.5" />
            Declare Dividend
          </Button>
        )}
      </div>

      {/* 4 Core KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-[#F4B41A] bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Capital Received</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {formatINR(summary.totalReceived)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">From Connect Invest network</span>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Amount Repaid</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-display">
            {formatINR(summary.totalRepaid)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Principal & interest settled</span>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Pending Repayments</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-display">
            {formatINR(summary.pendingRepayments)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Remaining dues & upcoming yields</span>
        </Card>

        <Card className="p-5 border-l-4 border-l-brand-500 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Avg Return Rate</span>
            <Coins className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {summary.averageReturnRate}% p.a.
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Contractual yield rate</span>
        </Card>
      </div>

      {/* Upcoming Repayment Dates Banner */}
      {upcomingRepayments.length > 0 && (
        <Card className="p-5 bg-[#FFFDF7] border-[#F4E9CD]">
          <div className="flex items-center justify-between mb-3 border-b border-[#F4E9CD] pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#DE8E0A]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Upcoming Repayment Dates & Scheduled Servicing
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Automatic bank settlement</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingRepayments.map((rep: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#EFE8D8] flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">{rep.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Due: {new Date(rep.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-[#DE8E0A]">{formatINR(rep.amount)}</div>
                  <Badge variant="warning">{rep.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#F2EBD9] space-x-6">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center space-x-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'company'
              ? 'border-[#DE8E0A] text-[#DE8E0A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Company Investments ({companyInvestments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('project')}
          className={`flex items-center space-x-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'project'
              ? 'border-[#DE8E0A] text-[#DE8E0A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Project Investments ({projectInvestments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('repayments')}
          className={`flex items-center space-x-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'repayments'
              ? 'border-[#DE8E0A] text-[#DE8E0A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Payment History ({repaymentHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dividends')}
          className={`flex items-center space-x-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'dividends'
              ? 'border-[#DE8E0A] text-[#DE8E0A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Equity Dividends ({dividends.length})</span>
        </button>
      </div>

      {/* TAB 1 & 2: Company or Project Investments */}
      {(activeTab === 'company' || activeTab === 'project') && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF7] text-slate-500 uppercase tracking-wider border-b border-[#F2EBD9]">
                <tr>
                  <th className="p-4">Investment Opportunity</th>
                  <th className="p-4">Investor / Creditor</th>
                  <th className="p-4">Principal Amount</th>
                  <th className="p-4">Return Rate</th>
                  <th className="p-4">Expected Yield</th>
                  <th className="p-4">Repaid Amount</th>
                  <th className="p-4">Pending Repayment</th>
                  <th className="p-4">Next Payment Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === 'company' ? companyInvestments : projectInvestments).length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      No {activeTab === 'company' ? 'Company' : 'Project'} investments found.
                    </td>
                  </tr>
                ) : (
                  (activeTab === 'company' ? companyInvestments : projectInvestments).map((inv: any) => (
                    <tr key={inv._id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{inv.title}</div>
                        <span className="text-[10px] text-slate-500">{inv.investmentModel}</span>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">{inv.investorName}</td>
                      <td className="p-4 font-bold text-slate-900">{formatINR(inv.principalAmount)}</td>
                      <td className="p-4 font-semibold text-[#DE8E0A]">{inv.returnRate}% p.a.</td>
                      <td className="p-4 font-semibold text-emerald-700">{formatINR(inv.expectedReturn)}</td>
                      <td className="p-4 font-semibold text-emerald-600">{formatINR(inv.repaidAmount)}</td>
                      <td className="p-4 font-bold text-amber-700">{formatINR(inv.pendingRepayment)}</td>
                      <td className="p-4 text-slate-600">
                        {new Date(inv.nextRepaymentDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge variant="success">{inv.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: Repayment History */}
      {activeTab === 'repayments' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF7] text-slate-500 uppercase tracking-wider border-b border-[#F2EBD9]">
                <tr>
                  <th className="p-4">Reference ID</th>
                  <th className="p-4">Repayment Title</th>
                  <th className="p-4">Amount Repaid</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Date Settled</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repaymentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No repayment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  repaymentHistory.map((tx: any) => (
                    <tr key={tx._id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-slate-900">{tx.referenceId}</td>
                      <td className="p-4 font-medium text-slate-800">{tx.title}</td>
                      <td className="p-4 font-bold text-emerald-700">{formatINR(tx.amount)}</td>
                      <td className="p-4 text-slate-600">{tx.paymentMethod}</td>
                      <td className="p-4 text-slate-500">
                        {new Date(tx.createdAt || tx.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge variant="success">{tx.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: Equity Dividends */}
      {activeTab === 'dividends' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF7] text-slate-500 uppercase tracking-wider border-b border-[#F2EBD9]">
                <tr>
                  <th className="p-4">Board Resolution Ref</th>
                  <th className="p-4">FY & Type</th>
                  <th className="p-4">Per Share Rate</th>
                  <th className="p-4">Total Consideration</th>
                  <th className="p-4">Eligible Shareholders</th>
                  <th className="p-4">Declaration Date</th>
                  <th className="p-4">Disbursement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dividends.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No board-approved dividend declarations logged yet.
                    </td>
                  </tr>
                ) : (
                  dividends.map((div: any) => (
                    <tr key={div._id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold font-mono text-slate-900">{div.boardResolutionRef}</td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800">{div.financialYear}</span>
                        <span className="block text-[10px] text-slate-500">{div.dividendType} Dividend</span>
                      </td>
                      <td className="p-4 font-bold text-brand-600">₹{div.amountPerShare} / share</td>
                      <td className="p-4 font-bold text-emerald-700">{formatINR(div.totalDividendAmount)}</td>
                      <td className="p-4 text-slate-600">{div.eligibleShareholdersCount} Shareholders</td>
                      <td className="p-4 text-slate-500">
                        {new Date(div.declarationDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge variant={div.disbursementStatus === 'Completed' ? 'success' : 'warning'}>
                          {div.disbursementStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Declare Dividend */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Declare Corporate Dividend (Board Resolution)"
      >
        <form onSubmit={handleDeclareDividend} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Board Resolution Reference *</label>
            <input
              type="text"
              required
              value={newDividend.boardResolutionRef}
              onChange={(e) => setNewDividend({ ...newDividend, boardResolutionRef: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              placeholder="BR-DIV-2026/01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Financial Year</label>
              <input
                type="text"
                required
                value={newDividend.financialYear}
                onChange={(e) => setNewDividend({ ...newDividend, financialYear: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dividend Amount Per Share (INR) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={newDividend.amountPerShare}
                onChange={(e) => setNewDividend({ ...newDividend, amountPerShare: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Official Declaration</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
