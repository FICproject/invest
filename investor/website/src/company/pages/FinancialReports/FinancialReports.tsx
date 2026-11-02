import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Loader, Modal } from '../../components/common';
import { financialService } from '../../services';
import { FinancialReport } from '../../types';
import {
  BarChart3,
  TrendingUp,
  Download,
  Plus,
  Filter,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const FinancialReports: React.FC = () => {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [trends, setTrends] = useState<any[]>([]);
  const [filterYear, setFilterYear] = useState('All');
  const [filterPeriod, setFilterPeriod] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReport, setNewReport] = useState({
    financialYear: 'FY 2025-26',
    periodType: 'Quarterly',
    periodName: 'Q3 FY26',
    revenue: 21000000,
    operatingExpenses: 15500000,
    netProfitOrLoss: 5500000,
    fundsRaisedInPeriod: 0,
    auditStatus: 'Company-Reported',
    auditorName: '',
    notes: 'Preliminary internal management accounts.',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await financialService.getReports({
        year: filterYear,
        periodType: filterPeriod,
      });
      setReports(res.reports || []);
      setMetrics(res.metrics || {});
      setTrends(res.periodTrends || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterYear, filterPeriod]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('financialYear', newReport.financialYear);
        formData.append('periodType', newReport.periodType);
        formData.append('periodName', newReport.periodName);
        formData.append('revenue', String(newReport.revenue));
        formData.append('operatingExpenses', String(newReport.operatingExpenses));
        formData.append('netProfitOrLoss', String(newReport.netProfitOrLoss));
        formData.append('fundsRaisedInPeriod', String(newReport.fundsRaisedInPeriod));
        formData.append('auditStatus', newReport.auditStatus);
        formData.append('auditorName', newReport.auditorName);
        formData.append('notes', newReport.notes);
        formData.append('file', selectedFile);

        await financialService.createReport(formData);
      } else {
        await financialService.createReport(newReport);
      }
      setModalOpen(false);
      setSelectedFile(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit financial report');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      ['Period,FY,Revenue,Expenses,Net Profit,Audit Status']
        .concat(
          reports.map(
            (r) =>
              `${r.periodName},${r.financialYear},${r.revenue},${r.operatingExpenses},${r.netProfitOrLoss},${r.auditStatus}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Financial Performance & Statutory Reports
          </h1>
          <p className="text-xs text-slate-500">
            P&L statements, verified auditor reports, operating performance & investor disclosures
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Submit Period Financials
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {formatINR(metrics?.totalRevenue)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Selected periods</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operating Expenses</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-700 mt-2 font-display">
            {formatINR(metrics?.totalExpenses)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Opex & R&D costs</span>
        </Card>

        <Card className="p-5 border-emerald-100 bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Net Profit / Margin</span>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-2 font-display">
            {formatINR(metrics?.netProfit)}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Retained earnings basis</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capital Inflows</span>
          <p className="text-xl sm:text-2xl font-extrabold text-brand-600 mt-2 font-display">
            {formatINR(metrics?.fundsRaised)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Funds raised in periods</span>
        </Card>
      </div>

      {/* Revenue vs Expense Comparison Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-pink-50 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Period-wise Financial Progression</h3>
            <p className="text-xs text-slate-500">Revenue against Operational Expenses and Net Profit</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val / 100000}L`}
              />
              <Tooltip
                formatter={(val: any) => [formatINR(val), '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #fed7e2' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#e11d5a" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Opex" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports Table with Distinguishment of Audited vs Reported */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-pink-50 pb-3">
          <h3 className="text-base font-bold text-slate-900">Disclosed Period Statements</h3>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="All">All Fiscal Years</option>
              <option value="FY 2025-26">FY 2025-26</option>
              <option value="FY 2024-25">FY 2024-25</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <Loader text="Loading statements..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8FA] text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Period</th>
                  <th className="p-3">FY</th>
                  <th className="p-3">Revenue</th>
                  <th className="p-3">Opex</th>
                  <th className="p-3">Net Profit</th>
                  <th className="p-3">Audit Verification Status</th>
                  <th className="p-3">Auditor / Source</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{r.periodName}</td>
                    <td className="p-3 font-mono text-slate-600">{r.financialYear}</td>
                    <td className="p-3 font-semibold text-slate-800">{formatINR(r.revenue)}</td>
                    <td className="p-3 text-slate-600">{formatINR(r.operatingExpenses)}</td>
                    <td className="p-3 font-extrabold text-emerald-700">{formatINR(r.netProfitOrLoss)}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          r.auditStatus === 'Audited'
                            ? 'success'
                            : r.auditStatus === 'Independently Verified'
                            ? 'purple'
                            : 'warning'
                        }
                      >
                        {r.auditStatus}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-500">{r.auditorName || 'Self-Declared by Directors'}</td>
                    <td className="p-3 text-right">
                      {r.reportFileUrl ? (
                        <a
                          href={r.reportFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#DE8E0A] bg-[#FFF9ED] hover:bg-[#F4B41A] hover:text-[#1F2421] transition"
                        >
                          <Download size={13} />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <button
                          onClick={handleExportCSV}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="Export row statement"
                        >
                          <Download size={13} />
                          <span>CSV</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Submit Report Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Disclose Financial Period Report"
      >
        <form onSubmit={handleCreateReport} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Period Type *</label>
              <select
                value={newReport.periodType}
                onChange={(e) => setNewReport({ ...newReport, periodType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="Monthly">Monthly Financials</option>
                <option value="Quarterly">Quarterly Report</option>
                <option value="Annual">Annual Statutory Report</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Financial Year *</label>
              <input
                type="text"
                required
                value={newReport.financialYear}
                onChange={(e) => setNewReport({ ...newReport, financialYear: e.target.value })}
                placeholder="FY 2025-26"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Period Name *</label>
            <input
              type="text"
              required
              value={newReport.periodName}
              onChange={(e) => setNewReport({ ...newReport, periodName: e.target.value })}
              placeholder="e.g. October 2026 or Annual FY26"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Revenue (INR) *</label>
              <input
                type="number"
                required
                value={newReport.revenue}
                onChange={(e) => setNewReport({ ...newReport, revenue: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Operating Expenses *</label>
              <input
                type="number"
                required
                value={newReport.operatingExpenses}
                onChange={(e) =>
                  setNewReport({ ...newReport, operatingExpenses: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Verification Status</label>
              <select
                value={newReport.auditStatus}
                onChange={(e) => setNewReport({ ...newReport, auditStatus: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="Company-Reported">Company-Reported (Internal)</option>
                <option value="Independently Verified">Independently Verified</option>
                <option value="Audited">Statutory Audited</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chartered Accountant / Firm</label>
              <input
                type="text"
                value={newReport.auditorName}
                onChange={(e) => setNewReport({ ...newReport, auditorName: e.target.value })}
                placeholder="e.g. KPMG / Local CA firm"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Upload Financial Report Document (PDF, XLSX)
            </label>
            <input
              type="file"
              accept=".pdf,.xlsx,.xls,.csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FFF9ED] file:text-[#B37400] hover:file:bg-[#F4B41A]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Financial Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

