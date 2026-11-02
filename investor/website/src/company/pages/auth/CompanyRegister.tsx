import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Lock,
  User,
  CreditCard,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  UploadCloud,
  FileText
} from 'lucide-react';
import { Input } from '../../../investor/components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import logoImg from '../../assets/logo.png';

export const CompanyRegister: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 5-STEP COMPANY FORM STATE
  const [formData, setFormData] = useState({
    // Step 1: Company Details
    companyLegalName: '',
    brandName: '',
    companyEmail: '',
    companyMobile: '',
    password: '',
    confirmPassword: '',
    website: '',
    industry: 'Technology',
    companyType: 'Private Limited',
    // Step 2: Business Information
    cin: '',
    pan: '',
    gstin: '',
    incorporationDate: '',
    registeredAddress: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    // Step 3: Authorized Representative
    name: '',
    repDesignation: 'Director / Founder',
    email: '',
    mobile: '',
    repPan: '',
    repIdentityVerified: true,
    // Step 4: Bank Details
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    cancelledChequeUrl: '',
    // Step 5: Company Documents
    incorporationCertificateUrl: '',
    panCardUrl: '',
    gstCertificateUrl: '',
    moaAoaUrl: '',
    shareholdingPatternUrl: '',
    financialStatementsUrl: '',
    termsAccepted: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = (s: number) => {
    setError('');
    if (s === 1) {
      if (!formData.companyLegalName.trim()) return 'Please enter Registered Company Name.';
      if (!formData.companyEmail.trim()) return 'Please enter Company Email Address.';
      if (!formData.companyMobile.trim()) return 'Please enter Official Mobile Number.';
      if (formData.password.length < 6) return 'Password must be at least 6 characters.';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    }
    if (s === 2) {
      if (!formData.pan.trim() || formData.pan.trim().length !== 10) return 'Please enter a valid 10-character Company PAN.';
      if (!formData.registeredAddress.trim()) return 'Please enter Registered Office Address.';
      if (!formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) return 'Please enter City, State, and Pincode.';
    }
    if (s === 3) {
      if (!formData.name.trim()) return 'Please enter Representative Full Name.';
      if (!formData.repDesignation.trim()) return 'Please enter Representative Designation.';
      if (!formData.email.trim()) return 'Please enter Representative Work Email.';
      if (!formData.mobile.trim()) return 'Please enter Representative Mobile Number.';
    }
    if (s === 4) {
      if (!formData.accountHolderName.trim()) return 'Please enter Bank Account Holder Name.';
      if (!formData.bankName.trim()) return 'Please enter Bank Name.';
      if (!formData.accountNumber.trim()) return 'Please enter Account Number.';
      if (!formData.ifscCode.trim()) return 'Please enter IFSC Code.';
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.termsAccepted) {
      setError('Please accept terms and declarations to finish registration.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.register({
        companyLegalName: formData.companyLegalName.trim(),
        brandName: formData.brandName.trim() || formData.companyLegalName.trim(),
        companyEmail: formData.companyEmail.trim().toLowerCase(),
        companyMobile: formData.companyMobile.trim(),
        password: formData.password,
        website: formData.website.trim(),
        industry: formData.industry,
        companyType: formData.companyType,
        cin: formData.cin.trim() ? formData.cin.trim().toUpperCase() : undefined,
        pan: formData.pan.trim().toUpperCase(),
        gstin: formData.gstin.trim() ? formData.gstin.trim().toUpperCase() : undefined,
        incorporationDate: formData.incorporationDate || undefined,
        registeredAddress: formData.registeredAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        description: formData.description.trim(),
        name: formData.name.trim(),
        repDesignation: formData.repDesignation.trim(),
        email: (formData.email || formData.companyEmail).trim().toLowerCase(),
        mobile: (formData.mobile || formData.companyMobile).trim(),
        repPan: formData.repPan.trim().toUpperCase(),
        repIdentityVerified: formData.repIdentityVerified,
        accountHolderName: formData.accountHolderName.trim() || formData.companyLegalName.trim(),
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifscCode: formData.ifscCode.trim().toUpperCase(),
        cancelledChequeUrl: formData.cancelledChequeUrl,
        incorporationCertificateUrl: formData.incorporationCertificateUrl,
        panCardUrl: formData.panCardUrl,
        gstCertificateUrl: formData.gstCertificateUrl,
        moaAoaUrl: formData.moaAoaUrl,
        shareholdingPatternUrl: formData.shareholdingPatternUrl,
        financialStatementsUrl: formData.financialStatementsUrl
      });

      login(data.token, data.user, data.company);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Company Details', icon: Building2 },
    { num: 2, label: 'Business Info', icon: FileText },
    { num: 3, label: 'Auth Representative', icon: User },
    { num: 4, label: 'Bank Details', icon: CreditCard },
    { num: 5, label: 'Company Documents', icon: FileCheck2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] via-[#FFF9ED] to-[#FFFDF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#F4E9CD] shadow-xl shadow-[#F4B41A]/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F4B41A] via-[#E8A51D] to-[#DE8E0A]" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <Link to="/" className="inline-flex items-center space-x-2.5">
            <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-2xl font-display text-[#1F2421]">
              Connect<span className="text-[#DE8E0A]">Invest</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-[#1F2421] pt-1 font-display">Company Registration (5 Steps)</h2>
          <p className="text-xs text-[#556171]">
            Set up your corporate profile to unlock Fixed-Term and Equity fundraising
          </p>
        </div>

        {/* 5-Step Stepper Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#1F2421] uppercase tracking-wide">
              Step {step} of 5: {steps[step - 1].label}
            </span>
            <span className="text-xs font-bold text-[#B37400]">
              {Math.round((step / 5) * 100)}% Completed
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B37400] transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-5 gap-2 mt-4">
            {steps.map((st) => {
              const IconComp = st.icon;
              const isDone = step > st.num;
              const isCurr = step === st.num;
              return (
                <div
                  key={st.num}
                  className={`flex items-center space-x-1.5 p-1.5 rounded-lg text-center justify-center transition-all ${
                    isCurr
                      ? 'bg-[#FFF9ED] text-[#B37400] font-bold border border-[#F4E9CD]'
                      : isDone
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-400 opacity-60'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <div>
          {/* Step 1: Company Details */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Registered Company Name"
                name="companyLegalName"
                value={formData.companyLegalName}
                onChange={handleChange}
                placeholder="As registered with MCA"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Brand / Business Name"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  placeholder="Trading Name"
                />
                <Input
                  label="Company Website (Optional)"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company Email Address"
                  name="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  placeholder="official@company.com"
                  required
                />
                <Input
                  label="Official Mobile Number"
                  name="companyMobile"
                  value={formData.companyMobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F2421] mb-1">Business Category / Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-[#1F2421]"
                  >
                    <option value="Technology">Technology & Software</option>
                    <option value="Healthcare">Healthcare & BioTech</option>
                    <option value="Manufacturing">Manufacturing & Hardware</option>
                    <option value="Fintech">Financial Services / FinTech</option>
                    <option value="Renewable Energy">Renewable Energy & CleanTech</option>
                    <option value="Real Estate">Real Estate & Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F2421] mb-1">Company Legal Structure</label>
                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-[#1F2421]"
                  >
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                />
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company PAN Number"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="10-character PAN"
                  required
                />
                <Input
                  label="Company Registration Number (CIN)"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  placeholder="21-character CIN"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="GST Number (Optional)"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="15-character GSTIN"
                />
                <Input
                  label="Date of Incorporation"
                  name="incorporationDate"
                  type="date"
                  value={formData.incorporationDate}
                  onChange={handleChange}
                />
              </div>
              <Input
                label="Registered Office Address"
                name="registeredAddress"
                value={formData.registeredAddress}
                onChange={handleChange}
                placeholder="Floor, Building, Road / Street"
                required
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />
                <Input
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1F2421] mb-1">Business Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief overview of business activities, products, and revenue model."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-[#1F2421]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Authorized Representative */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Representative Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full legal name"
                  required
                />
                <Input
                  label="Designation"
                  name="repDesignation"
                  value={formData.repDesignation}
                  onChange={handleChange}
                  placeholder="e.g. Managing Director / Founder"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Representative Work Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rep@company.com"
                  required
                />
                <Input
                  label="Representative Mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  required
                />
              </div>
              <Input
                label="Representative PAN Details"
                name="repPan"
                value={formData.repPan}
                onChange={handleChange}
                placeholder="Personal PAN of signatory"
              />
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-slate-800">Identity Verification</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  You are authorized by board resolution or entity charter to act on behalf of the company on Connect Invest.
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Bank Details */}
          {step === 4 && (
            <div className="space-y-4">
              <Input
                label="Account Holder Name (Corporate Account)"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="Company bank account title"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g. Axis Bank, HDFC Bank"
                  required
                />
                <Input
                  label="IFSC Code"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="11-character IFSC"
                  required
                />
              </div>
              <Input
                label="Bank Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Corporate account number"
                required
              />
              <div>
                <label className="block text-xs font-bold text-[#1F2421] mb-1">Cancelled Cheque / Bank Proof</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                  <UploadCloud className="w-6 h-6 text-[#B37400] mx-auto mb-1" />
                  <div className="text-xs text-slate-600">Upload bank proof (cheque or passbook)</div>
                  <input
                    type="file"
                    onChange={(e) => setFormData(prev => ({ ...prev, cancelledChequeUrl: e.target.files?.[0]?.name || 'cheque.pdf' }))}
                    className="mt-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Company Documents */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="text-xs font-bold text-slate-800">Company Documents Checklist</div>
                <div className="text-[11px] text-slate-500">
                  Certificate of Incorporation, Company PAN, GST Certificate, MOA/AOA, and Financials.
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">1. Certificate of Incorporation:</span>
                    <input
                      type="file"
                      onChange={(e) => setFormData(prev => ({ ...prev, incorporationCertificateUrl: e.target.files?.[0]?.name || 'coi.pdf' }))}
                      className="block mt-1 text-[11px]"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">2. Company PAN & GST:</span>
                    <input
                      type="file"
                      onChange={(e) => setFormData(prev => ({ ...prev, panCardUrl: e.target.files?.[0]?.name || 'pan.pdf' }))}
                      className="block mt-1 text-[11px]"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">3. MOA & AOA:</span>
                    <input
                      type="file"
                      onChange={(e) => setFormData(prev => ({ ...prev, moaAoaUrl: e.target.files?.[0]?.name || 'moa.pdf' }))}
                      className="block mt-1 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mt-0.5"
                />
                <span>I affirm that all business details, authorized signatory filings, and statutory records are true and authorized.</span>
              </label>
            </div>
          )}

          {/* Stepper Footer Buttons */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center space-x-1.5 px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-[#B37400] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#996300]"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 disabled:opacity-50"
              >
                <span>{isLoading ? 'Registering Company...' : 'Submit Company Registration'}</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Redirect */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
          Already registered your business?{' '}
          <Link to="/login?role=company" className="font-bold text-[#B37400] hover:underline">
            Sign In to Company Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
