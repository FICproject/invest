import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Loader, Modal } from '../../components/common';
import { shareholderService } from '../../services';
import { Shareholder, ShareAllocation } from '../../types';
import {
  Users2,
  PieChart as PieIcon,
  Plus,
  FileCheck2,
  Building,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#e11d5a', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

export const ShareholderList: React.FC = () => {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [allocations, setAllocations] = useState<ShareAllocation[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [capTableData, setCapTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Allotment Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newAllotment, setNewAllotment] = useState({
    shareholderId: '',
    allotmentRound: 'Series A Tranche 3',
    sharesCount: 10000,
    pricePerShare: 500,
    resolutionNumber: 'BR-2026-ALLOT-04',
    resolutionDate: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await shareholderService.getShareholders();
      setShareholders(res.shareholders || []);
      setAllocations(res.allocations || []);
      setMetrics(res.metrics || {});
      setCapTableData(res.capTableData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAllotment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shareholderService.createAllocation(newAllotment);
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record share allotment.');
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Shareholder Directory & Capitalization Table
          </h1>
          <p className="text-xs text-slate-500">
            Official equity share registry, ownership distribution, and board resolution allotments
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="font-bold shadow-md shadow-brand-500/20">
          <Plus className="w-4 h-4 mr-1.5" />
          Record Share Allotment
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Shareholders</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">
            {metrics?.totalShareholders || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered in Register of Members</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Shares Issued</span>
          <p className="text-2xl font-extrabold text-brand-600 mt-2 font-display">
            {metrics?.totalSharesIssued?.toLocaleString() || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Equity & CCPS units</span>
        </Card>

        <Card className="p-5 border-emerald-100 bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Paid-Up Equity Consideration</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-display">
            {formatINR(metrics?.totalEquityCapitalRaised || 0)}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Total invested capital</span>
        </Card>
      </div>

      {/* Cap Table Chart & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-pink-50 pb-3">
            <h3 className="text-base font-bold text-slate-900">Shareholder Register (MCA Compliant)</h3>
            <span className="text-xs text-slate-400">Equity Investments Only</span>
          </div>

          {isLoading ? (
            <Loader text="Loading Cap Table..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF8FA] text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Shareholder Name</th>
                    <th className="p-3">Folio No.</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Shares Held</th>
                    <th className="p-3">Ownership %</th>
                    <th className="p-3">Total Invested</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shareholders.map((sh) => (
                    <tr key={sh._id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{sh.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">PAN: {sh.panOrId}</p>
                      </td>
                      <td className="p-3 font-mono text-slate-600 font-medium">{sh.folioNumber}</td>
                      <td className="p-3">
                        <Badge variant={sh.shareClass.includes('Founder') ? 'purple' : 'info'}>
                          {sh.shareClass}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{sh.sharesHeld.toLocaleString()}</td>
                      <td className="p-3 font-extrabold text-brand-600">{sh.ownershipPercentage}%</td>
                      <td className="p-3 font-medium text-slate-700">{formatINR(sh.totalInvestedAmount)}</td>
                      <td className="p-3">
                        <Badge variant={sh.issuanceStatus === 'Issued' ? 'success' : 'warning'}>
                          {sh.issuanceStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ownership Distribution Donut */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-pink-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Cap Table Distribution</h3>
            <p className="text-xs text-slate-500">Ownership stake percentages</p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capTableData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="percentage"
                >
                  {capTableData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Ownership']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-slate-400">Total Shares</span>
              <span className="text-sm font-extrabold text-slate-900 font-display">
                {metrics?.totalSharesIssued?.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            {capTableData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-medium text-slate-700 truncate max-w-[130px]">{item.name}</span>
                </div>
                <strong className="text-slate-900">{item.percentage}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Allocation Records Table */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-pink-50 pb-3">
          Historical Share Allotment Resolutions
        </h3>

        {allocations.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No share allotment resolutions logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF8FA] text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Allotment Round</th>
                  <th className="p-3">Allottee</th>
                  <th className="p-3">Board Resolution Ref</th>
                  <th className="p-3">Shares Count</th>
                  <th className="p-3">Price / Share</th>
                  <th className="p-3">Consideration</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map((al) => (
                  <tr key={al._id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{al.allotmentRound}</td>
                    <td className="p-3">{al.shareholderId?.name || 'Shareholder'}</td>
                    <td className="p-3 font-mono font-semibold text-brand-600">{al.resolutionNumber}</td>
                    <td className="p-3 font-bold">{al.sharesCount.toLocaleString()}</td>
                    <td className="p-3">{formatINR(al.pricePerShare)}</td>
                    <td className="p-3 font-bold text-emerald-700">{formatINR(al.totalConsideration)}</td>
                    <td className="p-3 text-slate-400">
                      {new Date(al.resolutionDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <Badge variant="success">{al.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Allotment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Official Board Share Allotment"
      >
        <form onSubmit={handleCreateAllotment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Shareholder *</label>
            <select
              required
              value={newAllotment.shareholderId}
              onChange={(e) => setNewAllotment({ ...newAllotment, shareholderId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              <option value="">-- Choose Allottee --</option>
              {shareholders.map((sh) => (
                <option key={sh._id} value={sh._id}>
                  {sh.name} ({sh.folioNumber}) - {sh.shareClass}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Allotment Round</label>
              <input
                type="text"
                required
                value={newAllotment.allotmentRound}
                onChange={(e) => setNewAllotment({ ...newAllotment, allotmentRound: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Number *</label>
              <input
                type="text"
                required
                value={newAllotment.resolutionNumber}
                onChange={(e) => setNewAllotment({ ...newAllotment, resolutionNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Number of Shares *</label>
              <input
                type="number"
                required
                value={newAllotment.sharesCount}
                onChange={(e) =>
                  setNewAllotment({ ...newAllotment, sharesCount: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price per Share (INR) *</label>
              <input
                type="number"
                required
                value={newAllotment.pricePerShare}
                onChange={(e) =>
                  setNewAllotment({ ...newAllotment, pricePerShare: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-pink-50 text-xs text-brand-900 font-medium">
            Total Consideration:{' '}
            <strong>
              {formatINR(newAllotment.sharesCount * newAllotment.pricePerShare)}
            </strong>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit & Recalculate Cap Table</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

