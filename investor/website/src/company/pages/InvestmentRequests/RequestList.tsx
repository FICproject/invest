import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Loader } from '../../components/common';
import { investmentService } from '../../services';
import { InvestmentRequest } from '../../types';
import {
  Plus,
  Filter,
  Building,
  FolderKanban,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const RequestList: React.FC = () => {
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [filterPurpose, setFilterPurpose] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await investmentService.getRequests({
        status: filterStatus !== 'All' ? filterStatus : undefined,
      });
      let list = res.requests || [];
      if (filterPurpose !== 'All') {
        list = list.filter((r: any) => (r.investmentPurpose || r.category) === filterPurpose);
      }
      setRequests(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterPurpose, filterStatus]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getStatusBadgeVariant = (st: string) => {
    switch (st) {
      case 'Funded':
      case 'Funding Completed':
      case 'Approved':
      case 'Open for Investment':
        return 'success';
      case 'Submitted':
      case 'Under Review':
        return 'warning';
      case 'Draft':
        return 'slate';
      case 'Rejected':
      case 'Cancelled':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Request button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2421] font-display">
            Funding Requests
          </h1>
          <p className="text-xs text-[#556171]">
            Create, track, and manage funding requests for Company Investments and Project Investments.
          </p>
        </div>
        <Link to="/dashboard/requests/create">
          <Button className="font-bold shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Funding Request
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Requests:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Purpose Filter */}
          <select
            value={filterPurpose}
            onChange={(e) => setFilterPurpose(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#F4B41A]"
          >
            <option value="All">All Investment Purposes</option>
            <option value="Company Investment">Company Investment</option>
            <option value="Project Investment">Project Investment</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#F4B41A]"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Funded">Funded</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Requests Listing */}
      {isLoading ? (
        <Loader text="Loading funding requests..." />
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF9ED] text-[#B37400] flex items-center justify-center mx-auto">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No funding requests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Submit your first capital request for another company or a specific project.
          </p>
          <Link to="/dashboard/requests/create">
            <Button size="sm">Create First Request</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => {
            const isProject = (req.investmentPurpose || req.category) === 'Project Investment';
            const percent =
              req.fundingTarget > 0 ? Math.round(((req.raisedAmount || 0) / req.fundingTarget) * 100) : 0;

            return (
              <Card key={req._id} className="p-6 flex flex-col justify-between space-y-5 hover:border-[#F4B41A] transition">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                      {isProject ? (
                        <FolderKanban className="w-3.5 h-3.5 text-[#DE8E0A]" />
                      ) : (
                        <Building className="w-3.5 h-3.5 text-[#B37400]" />
                      )}
                      <span>{req.investmentPurpose || req.category || 'Company Investment'}</span>
                    </span>
                    <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {req.entityOrProjectName || req.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {req.shortDescription || req.useOfFunds}
                  </p>
                </div>

                {/* Metrics Breakdown */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#F4E9CD] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Required Funding:</span>
                    <strong className="text-slate-900">{formatINR(req.fundingTarget)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Committed / Raised:</span>
                    <strong className="text-emerald-700">{formatINR(req.raisedAmount || 0)}</strong>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#EFE8D8] rounded-full h-2 overflow-hidden mt-1">
                    <div
                      className="bg-[#DE8E0A] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{percent}% funded</span>
                    <span>Range: {formatINR(req.minInvestment)} – {formatINR(req.maxInvestment || req.fundingTarget)}</span>
                  </div>
                </div>

                {/* Duration & Return Rate */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium">
                    Duration: <strong>{req.fundingDuration || 'Short-Term'} ({req.investmentPeriodYears || Math.round((req.durationMonths || 24) / 12)} Yrs)</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#FFF9ED] text-[#B37400] font-medium border border-[#F4E9CD]">
                    Expected Return: <strong>{req.expectedReturnRate || req.agreedReturnRate || 0}% p.a.</strong>
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/dashboard/requests/${req._id}`}
                    className="text-xs font-bold text-[#DE8E0A] hover:underline inline-flex items-center space-x-1"
                  >
                    <span>View Details & Tracker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
