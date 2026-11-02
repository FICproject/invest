import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/common';
import { investmentService } from '../../services';
import {
  Building,
  FolderKanban,
  Clock,
  Calendar,
  Percent,
  Banknote,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CreateRequest: React.FC = () => {
  const navigate = useNavigate();

  // Step state: 1: Investment Purpose, 2: Terms & Amounts, 3: Review & Submit
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Required Fields per specifications
  const [investmentPurpose, setInvestmentPurpose] = useState<'Company Investment' | 'Project Investment'>('Company Investment');
  const [fundingDuration, setFundingDuration] = useState<'Short-Term' | 'Long-Term'>('Short-Term');
  const [entityOrProjectName, setEntityOrProjectName] = useState('');
  const [requiredFundingAmount, setRequiredFundingAmount] = useState<number>(5000000);
  const [minAmount, setMinAmount] = useState<number>(100000);
  const [maxAmount, setMaxAmount] = useState<number>(5000000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(14.0);
  const [investmentPeriodYears, setInvestmentPeriodYears] = useState<number>(2); // Min 2 for Short-Term, Min 5 for Long-Term
  const [fundingPurpose, setFundingPurpose] = useState('');
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);

  // Update minimum allowable period when funding duration toggles
  const handleDurationChange = (type: 'Short-Term' | 'Long-Term') => {
    setFundingDuration(type);
    if (type === 'Short-Term') {
      if (investmentPeriodYears < 2 || investmentPeriodYears > 4) {
        setInvestmentPeriodYears(2);
      }
    } else {
      if (investmentPeriodYears < 5) {
        setInvestmentPeriodYears(5);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSupportingFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    setError('');

    if (!isDraft) {
      if (!entityOrProjectName.trim()) {
        setError('Please enter the Company or Project Name.');
        return;
      }
      if (!fundingPurpose.trim()) {
        setError('Please enter the Funding Purpose / Description.');
        return;
      }
      if (requiredFundingAmount <= 0) {
        setError('Please provide a valid funding amount.');
        return;
      }
      if (fundingDuration === 'Short-Term' && investmentPeriodYears < 2) {
        setError('Short-Term investments require a minimum period of 2 Years.');
        return;
      }
      if (fundingDuration === 'Long-Term' && investmentPeriodYears < 5) {
        setError('Long-Term investments require a minimum period of 5 Years.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('investmentPurpose', investmentPurpose);
      formData.append('fundingDuration', fundingDuration);
      formData.append('entityOrProjectName', entityOrProjectName || (investmentPurpose === 'Company Investment' ? 'Target Company Investment' : 'Project Venture'));
      formData.append('title', entityOrProjectName || `${investmentPurpose} - ${fundingDuration}`);
      formData.append('fundingTarget', String(requiredFundingAmount));
      formData.append('minInvestment', String(minAmount));
      formData.append('maxInvestment', String(maxAmount || requiredFundingAmount));
      formData.append('expectedReturnRate', String(expectedReturnRate));
      formData.append('investmentPeriodYears', String(investmentPeriodYears));
      formData.append('durationMonths', String(investmentPeriodYears * 12));
      formData.append('fundingPurpose', fundingPurpose || 'Capital requirement for enterprise growth');
      formData.append('shortDescription', fundingPurpose || `${investmentPurpose} for ${entityOrProjectName}`);
      formData.append('detailedDescription', fundingPurpose || `${investmentPurpose} for ${entityOrProjectName}`);
      formData.append('useOfFunds', fundingPurpose || 'General business expansion');
      formData.append('investmentModel', 'Fixed-Term');
      formData.append('isDraft', String(isDraft));

      supportingFiles.forEach((file) => {
        formData.append('documents', file);
      });

      const res = await investmentService.createRequest(formData);
      // Navigate to the Request listing page after submission
      navigate('/dashboard/requests', { replace: true });
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit funding request. Please check inputs and try again.'
      );
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          Create Funding Request
        </h1>
        <p className="text-xs text-slate-500">
          Request capital from Connect Invest for another company or a specific project.
        </p>
      </div>

      {/* 3-Step Wizard Indicator */}
      <div className="flex items-center justify-between border-b border-[#F2EBD9] pb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-[#F4B41A] text-[#1F2421]' : 'bg-slate-100 text-slate-400'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-bold ${step === 1 ? 'text-[#DE8E0A]' : 'text-slate-500'}`}>
            Purpose & Duration
          </span>
        </div>

        <div className="w-12 h-0.5 bg-[#F2EBD9]" />

        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-[#F4B41A] text-[#1F2421]' : 'bg-slate-100 text-slate-400'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-bold ${step === 2 ? 'text-[#DE8E0A]' : 'text-slate-500'}`}>
            Funding Details
          </span>
        </div>

        <div className="w-12 h-0.5 bg-[#F2EBD9]" />

        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-[#F4B41A] text-[#1F2421]' : 'bg-slate-100 text-slate-400'
            }`}
          >
            3
          </div>
          <span className={`text-xs font-bold ${step === 3 ? 'text-[#DE8E0A]' : 'text-slate-500'}`}>
            Review & Submit
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Purpose & Duration */}
      {step === 1 && (
        <div className="space-y-6">
          {/* 1. Investment Purpose */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Investment Purpose *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setInvestmentPurpose('Company Investment')}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  investmentPurpose === 'Company Investment'
                    ? 'border-[#F4B41A] bg-white ring-2 ring-[#F4B41A]/30 shadow-sm'
                    : 'border-[#EFE8D8] bg-white hover:border-[#F4B41A]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF9ED] text-[#B37400] flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  {investmentPurpose === 'Company Investment' && (
                    <CheckCircle2 className="w-5 h-5 text-[#DE8E0A]" />
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">Company Investment</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Funding required to invest in another operating company, enterprise acquisition, or strategic joint entity.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setInvestmentPurpose('Project Investment')}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  investmentPurpose === 'Project Investment'
                    ? 'border-[#F4B41A] bg-white ring-2 ring-[#F4B41A]/30 shadow-sm'
                    : 'border-[#EFE8D8] bg-white hover:border-[#F4B41A]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF9ED] text-[#B37400] flex items-center justify-center">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  {investmentPurpose === 'Project Investment' && (
                    <CheckCircle2 className="w-5 h-5 text-[#DE8E0A]" />
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">Project Investment</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Funding required for a specific capital project, development asset, industrial setup, or expansion initiative.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Funding Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Funding Duration *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleDurationChange('Short-Term')}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  fundingDuration === 'Short-Term'
                    ? 'border-[#F4B41A] bg-white ring-2 ring-[#F4B41A]/30 shadow-sm'
                    : 'border-[#EFE8D8] bg-white hover:border-[#F4B41A]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#DE8E0A] uppercase tracking-wider">
                    Short-Term Option
                  </span>
                  {fundingDuration === 'Short-Term' && (
                    <CheckCircle2 className="w-5 h-5 text-[#DE8E0A]" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">Minimum 2 Years</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ideal for accelerated turnaround capital, short-cycle asset rollout, and 2 to 4 year tenures.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDurationChange('Long-Term')}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  fundingDuration === 'Long-Term'
                    ? 'border-[#F4B41A] bg-white ring-2 ring-[#F4B41A]/30 shadow-sm'
                    : 'border-[#EFE8D8] bg-white hover:border-[#F4B41A]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#DE8E0A] uppercase tracking-wider">
                    Long-Term Option
                  </span>
                  {fundingDuration === 'Long-Term' && (
                    <CheckCircle2 className="w-5 h-5 text-[#DE8E0A]" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">Minimum 5 Years</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Suitable for structural facility setups, corporate investments, and multi-year long tenures (5+ years).
                </p>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(2)} className="font-bold">
              <span>Continue to Funding Details</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Funding Details Form */}
      {step === 2 && (
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {investmentPurpose === 'Company Investment' ? 'Target Company Name *' : 'Project Name *'}
              </label>
              <input
                type="text"
                required
                value={entityOrProjectName}
                onChange={(e) => setEntityOrProjectName(e.target.value)}
                placeholder={investmentPurpose === 'Company Investment' ? 'e.g. Apex Industrial Solutions Ltd' : 'e.g. Phase 2 Manufacturing Expansion'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#F4B41A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Investment Period (in Years) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={fundingDuration === 'Short-Term' ? 2 : 5}
                  value={investmentPeriodYears}
                  onChange={(e) => setInvestmentPeriodYears(Math.max(fundingDuration === 'Short-Term' ? 2 : 5, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#F4B41A]"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  Years (Min {fundingDuration === 'Short-Term' ? 2 : 5})
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {fundingDuration === 'Short-Term' ? 'Short-Term: Minimum 2 Years (longer allowed).' : 'Long-Term: Minimum 5 Years (longer allowed).'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Funding Amount (INR) *
              </label>
              <input
                type="number"
                required
                step="50000"
                value={requiredFundingAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRequiredFundingAmount(val);
                  if (maxAmount < val) setMaxAmount(val);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#F4B41A]"
              />
              <span className="text-[11px] text-[#DE8E0A] font-semibold mt-1 block">
                {formatINR(requiredFundingAmount)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Amount (INR) *
              </label>
              <input
                type="number"
                step="10000"
                value={minAmount}
                onChange={(e) => setMinAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#F4B41A]"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">{formatINR(minAmount)}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Maximum Amount (INR) *
              </label>
              <input
                type="number"
                step="50000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#F4B41A]"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">{formatINR(maxAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expected Return Rate (% per annum) *
            </label>
            <div className="relative max-w-xs">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#F4B41A]"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">% p.a.</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Agreed annual yield rate offered to investors.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Funding Purpose / Description *
            </label>
            <textarea
              rows={4}
              required
              value={fundingPurpose}
              onChange={(e) => setFundingPurpose(e.target.value)}
              placeholder="Provide clear details on how the capital will be deployed, key project milestones, repayment capability, and projected revenue growth..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#F4B41A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supporting Documents (Pitch Deck, Feasibility Report, Projections)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.xlsx"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FFF9ED] file:text-[#B37400] hover:file:bg-[#F4B41A]"
            />
            {supportingFiles.length > 0 && (
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                {supportingFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#DE8E0A]" />
                    <span>{f.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="font-bold">
              Review Proposal
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Review & Submit */}
      {step === 3 && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Review Funding Proposal
            </h3>
            <p className="text-xs text-slate-500">
              Verify all proposal parameters before submitting to Connect Invest for review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#FFFDF7] border border-[#F4E9CD]">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Investment Purpose</span>
              <span className="text-sm font-bold text-slate-900">{investmentPurpose}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Funding Duration</span>
              <span className="text-sm font-bold text-slate-900">
                {fundingDuration} ({investmentPeriodYears} Years)
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Name / Entity</span>
              <span className="text-sm font-bold text-slate-900">{entityOrProjectName || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Expected Return</span>
              <span className="text-sm font-bold text-[#DE8E0A]">{expectedReturnRate}% p.a.</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Required Amount</span>
              <span className="text-base font-black text-slate-900">{formatINR(requiredFundingAmount)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Ticket Range</span>
              <span className="text-sm font-medium text-slate-700">
                Min {formatINR(minAmount)} – Max {formatINR(maxAmount)}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Purpose / Description</span>
            <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
              {fundingPurpose || 'No description entered.'}
            </p>
          </div>

          {supportingFiles.length > 0 && (
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Attached Files</span>
              <div className="flex flex-wrap gap-2">
                {supportingFiles.map((f, i) => (
                  <span key={i} className="text-xs bg-[#FFF9ED] text-[#B37400] px-3 py-1 rounded-lg border border-[#F4E9CD] flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Edit Details
            </Button>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                type="button"
                isLoading={isSubmitting}
                onClick={() => handleSubmit(true)}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                isLoading={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="font-bold"
              >
                Submit Funding Request
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
