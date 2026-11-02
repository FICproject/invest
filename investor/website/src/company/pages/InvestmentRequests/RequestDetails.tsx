import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Loader } from '../../components/common';
import { investmentService } from '../../services';
import { InvestmentRequest, Investment } from '../../types';
import {
  ArrowLeft,
  Coins,
  TrendingUp,
  Clock,
  ShieldCheck,
  Calendar,
  Building,
  FolderKanban,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Edit,
  Save,
  MessageSquare
} from 'lucide-react';

export const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<InvestmentRequest | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit fields
  const [editForm, setEditForm] = useState({
    title: '',
    entityOrProjectName: '',
    fundingTarget: 0,
    minInvestment: 0,
    maxInvestment: 0,
    expectedReturnRate: 0,
    investmentPeriodYears: 2,
    useOfFunds: '',
  });

  const fetchRequest = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await investmentService.getRequestById(id);
      setRequest(res.request);
      setInvestments(res.investments || []);
      if (res.request) {
        setEditForm({
          title: res.request.title || '',
          entityOrProjectName: res.request.entityOrProjectName || res.request.title || '',
          fundingTarget: res.request.fundingTarget || 0,
          minInvestment: res.request.minInvestment || 0,
          maxInvestment: res.request.maxInvestment || res.request.fundingTarget || 0,
          expectedReturnRate: res.request.expectedReturnRate || res.request.agreedReturnRate || 0,
          investmentPeriodYears: res.request.investmentPeriodYears || 2,
          useOfFunds: res.request.useOfFunds || res.request.detailedDescription || '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  if (isLoading) return <Loader text="Loading request dossier..." />;
  if (!request) return <div className="p-8 text-center text-slate-500">Opportunity request not found.</div>;

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

  const canEdit = ['Draft', 'Submitted', 'Under Review'].includes(request.status);

  const handleSaveEdit = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await investmentService.updateRequest(id, {
        ...editForm,
        shortDescription: editForm.useOfFunds,
        detailedDescription: editForm.useOfFunds,
        agreedReturnRate: editForm.expectedReturnRate,
        durationMonths: editForm.investmentPeriodYears * 12,
      });
      setIsEditing(false);
      await fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update request');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitDraft = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await investmentService.updateRequest(id, { isDraft: false });
      await fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSaving(false);
    }
  };

  const percent =
    request.fundingTarget > 0
      ? Math.round(((request.raisedAmount || 0) / request.fundingTarget) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/requests"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#DE8E0A]"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to All Requests
        </Link>

        {canEdit && !isEditing && (
          <div className="flex items-center space-x-3">
            {request.status === 'Draft' && (
              <Button onClick={handleSubmitDraft} isLoading={isSaving} className="font-bold text-xs">
                Submit for Review
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsEditing(true)} className="text-xs font-semibold">
              <Edit className="w-3.5 h-3.5 mr-1" />
              Edit Request
            </Button>
          </div>
        )}
      </div>

      {/* Admin / Reviewer Feedback Banner */}
      {request.reviewerFeedback && (
        <Card className="p-4 bg-amber-50 border-amber-200 flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-xs text-amber-900 block">Admin Feedback / Review Notes:</span>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">{request.reviewerFeedback}</p>
          </div>
        </Card>
      )}

      {/* Header Profile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#EFE8D8] shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant="purple">
              {request.investmentPurpose || request.category || 'Company Investment'}
            </Badge>
            <Badge variant="info">
              {request.fundingDuration || 'Short-Term'} ({request.investmentPeriodYears || 2} Years)
            </Badge>
            <Badge variant={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            {request.entityOrProjectName || request.title}
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">{request.shortDescription}</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block uppercase font-bold">Funding Target</span>
          <p className="text-2xl font-extrabold text-slate-900 font-display">
            {formatINR(request.fundingTarget)}
          </p>
          <span className="text-xs text-emerald-600 font-bold">
            {formatINR(request.raisedAmount || 0)} committed ({percent}%)
          </span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Details or Edit Form */}
        <Card className="p-6 md:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              {isEditing ? 'Edit Funding Request Parameters' : 'Funding Request Overview'}
            </h3>
            {isEditing && (
              <span className="text-[11px] text-amber-600 font-medium">Modifying saved details</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Project Name</label>
                <input
                  type="text"
                  value={editForm.entityOrProjectName}
                  onChange={(e) => setEditForm({ ...editForm, entityOrProjectName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Amount</label>
                  <input
                    type="number"
                    value={editForm.fundingTarget}
                    onChange={(e) => setEditForm({ ...editForm, fundingTarget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Ticket Amount</label>
                  <input
                    type="number"
                    value={editForm.minInvestment}
                    onChange={(e) => setEditForm({ ...editForm, minInvestment: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Ticket Amount</label>
                  <input
                    type="number"
                    value={editForm.maxInvestment}
                    onChange={(e) => setEditForm({ ...editForm, maxInvestment: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Return Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.expectedReturnRate}
                    onChange={(e) => setEditForm({ ...editForm, expectedReturnRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Investment Period (Years)</label>
                  <input
                    type="number"
                    value={editForm.investmentPeriodYears}
                    onChange={(e) => setEditForm({ ...editForm, investmentPeriodYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Funding Purpose / Description</label>
                <textarea
                  rows={4}
                  value={editForm.useOfFunds}
                  onChange={(e) => setEditForm({ ...editForm, useOfFunds: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit} isLoading={isSaving} className="font-bold">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#F4E9CD] grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">Investment Purpose</span>
                  <span className="text-xs font-bold text-slate-900">{request.investmentPurpose || 'Company Investment'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">Duration Option</span>
                  <span className="text-xs font-bold text-slate-900">{request.fundingDuration || 'Short-Term'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">Investment Period</span>
                  <span className="text-xs font-bold text-slate-900">{request.investmentPeriodYears || Math.round((request.durationMonths || 24) / 12)} Years</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">Expected Return</span>
                  <span className="text-xs font-bold text-[#DE8E0A]">{request.expectedReturnRate || request.agreedReturnRate || 0}% p.a.</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">Min Investment</span>
                  <span className="text-xs font-semibold text-slate-800">{formatINR(request.minInvestment)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-bold">Max Investment</span>
                  <span className="text-xs font-semibold text-slate-800">{formatINR(request.maxInvestment || request.fundingTarget)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Funding Purpose & Capital Deployment
                </h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                  {request.useOfFunds || request.detailedDescription || 'No detailed purpose stated.'}
                </p>
              </div>

              {/* Supporting Documents Section */}
              {request.supportingDocuments && request.supportingDocuments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Supporting Documents
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {request.supportingDocuments.map((doc, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-[#EFE8D8] bg-white flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-[#DE8E0A] flex-shrink-0" />
                          <span className="text-xs font-medium text-slate-800 truncate">{doc.name}</span>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="p-1 text-slate-400 hover:text-[#DE8E0A]"
                          title="Download document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Right Col: Request Status Tracker */}
        <Card className="p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
            Request Status Tracker
          </h3>

          <div className="space-y-4">
            {[
              { key: 'Draft', label: '1. Draft Created', desc: 'Saved in internal drafts' },
              { key: 'Submitted', label: '2. Submitted', desc: 'Transmitted to Connect Invest' },
              { key: 'Under Review', label: '3. Under Review', desc: 'Diligence and financial checks' },
              { key: 'Approved', label: '4. Approved', desc: 'Ready for investor participation' },
              { key: 'Funded', label: '5. Funded', desc: 'Capital successfully raised' },
            ].map((st, i) => {
              const statusOrder = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Funded'];
              const currentIdx = statusOrder.indexOf(request.status);
              const thisIdx = statusOrder.indexOf(st.key);
              const isPastOrCurrent = currentIdx >= thisIdx && currentIdx !== -1;
              const isCurrent = request.status === st.key;

              return (
                <div key={st.key} className="flex items-start space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[#F4B41A] text-[#1F2421] ring-4 ring-[#FFF9ED]'
                        : isPastOrCurrent
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPastOrCurrent && !isCurrent ? '✓' : i + 1}
                  </div>
                  <div>
                    <span
                      className={`text-xs font-bold block ${
                        isCurrent ? 'text-[#DE8E0A]' : isPastOrCurrent ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block">{st.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {request.status === 'Rejected' && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              <span className="font-bold block">Status: Rejected</span>
              <span>This request was declined during evaluation. Check admin feedback above.</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
            <div>Created: {new Date(request.createdAt).toLocaleDateString()}</div>
            {request.updatedAt && <div>Last Updated: {new Date(request.updatedAt).toLocaleDateString()}</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};
