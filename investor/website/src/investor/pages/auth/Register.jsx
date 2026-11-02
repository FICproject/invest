import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Building2,
  User,
  CheckCircle,
  Briefcase,
  CreditCard,
  Target,
  FileCheck2,
  UploadCloud,
  FileText
} from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth as useInvestorAuth } from '../../context/AuthContext';
import { useAuth as useCompanyAuth } from '../../../company/context/AuthContext';
import { authService as companyAuthService } from '../../../company/services';
import { evaluatePasswordStrength, validateEmail, validateMobile } from '../../utils/validators';

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const investorAuth = useInvestorAuth();
  const companyAuth = useCompanyAuth();

  const searchParams = new URLSearchParams(location.search);
  const initialRole = searchParams.get('role') === 'company' ? 'company' : 'investor';

  const [activeRole, setActiveRole] = useState(initialRole);
  const [investorStep, setInvestorStep] = useState(1);
  const [companyStep, setCompanyStep] = useState(1);

  // Sync role if query parameter changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'company' && activeRole !== 'company') {
      setActiveRole('company');
      setCompanyStep(1);
      setError('');
    } else if (roleParam === 'investor' && activeRole !== 'investor') {
      setActiveRole('investor');
      setInvestorStep(1);
      setError('');
    }
  }, [location.search]);

  // 1. INVESTOR 5-STEP FORM STATE
  const [investorData, setInvestorData] = useState({
    // Step 1: Basic Details
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    // Step 2: Personal & KYC Details
    pan: '',
    aadhaarNumber: '',
    residentialAddress: '',
    city: '',
    state: '',
    pincode: '',
    nationality: 'Indian',
    occupation: 'Salaried Professional',
    annualIncomeRange: '₹10 Lakh - ₹25 Lakh',
    sourceOfFunds: 'Salary / Business Profits',
    // Step 3: Bank Details
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    cancelledChequeUrl: '',
    // Step 4: Investment Profile
    investmentExperience: '1-3 Years',
    preferredInvestmentType: 'Fixed-Term & Equity (Diversified)',
    riskTolerance: 'Moderate',
    expectedInvestmentAmount: '₹5,00,000 - ₹25,00,000',
    investmentGoals: 'Capital Appreciation & Regular Yield',
    // Step 5: Verification & Consent
    panCardUrl: '',
    identityProofUrl: '',
    termsAccepted: true,
    privacyPolicyAccepted: true,
    riskDisclosureAccepted: true
  });

  // 2. COMPANY 5-STEP FORM STATE
  const [companyData, setCompanyData] = useState({
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
    name: '', // rep name
    repDesignation: 'Director / Founder',
    email: '', // rep email
    mobile: '', // rep mobile
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

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = evaluatePasswordStrength(
    activeRole === 'investor' ? investorData.password : companyData.password
  );

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setError('');
  };

  const handleInvestorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInvestorData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCompanyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- INVESTOR STEP VALIDATIONS ---
  const validateInvestorStep = (step) => {
    setError('');
    if (step === 1) {
      if (!investorData.name.trim()) return 'Please enter your Full Legal Name.';
      if (!validateEmail(investorData.email)) return 'Please enter a valid Email Address.';
      if (!validateMobile(investorData.mobile)) return 'Please enter a valid 10-digit Mobile Number.';
      if (investorData.password.length < 6) return 'Password must be at least 6 characters.';
      if (investorData.password !== investorData.confirmPassword) return 'Passwords do not match.';
      if (!investorData.dateOfBirth) return 'Please enter your Date of Birth.';
    }
    if (step === 2) {
      if (!investorData.pan.trim() || investorData.pan.trim().length !== 10) return 'Please enter a valid 10-character PAN Number.';
      if (!investorData.residentialAddress.trim()) return 'Please enter your Residential Address.';
      if (!investorData.city.trim() || !investorData.state.trim() || !investorData.pincode.trim()) return 'Please fill in City, State, and Pincode.';
    }
    if (step === 3) {
      if (!investorData.accountHolderName.trim()) return 'Please enter Account Holder Name.';
      if (!investorData.bankName.trim()) return 'Please enter Bank Name.';
      if (!investorData.accountNumber.trim()) return 'Please enter Bank Account Number.';
      if (!investorData.ifscCode.trim()) return 'Please enter Bank IFSC Code.';
    }
    if (step === 4) {
      if (!investorData.investmentExperience) return 'Please select your investment experience.';
      if (!investorData.preferredInvestmentType) return 'Please select preferred investment type.';
    }
    return null;
  };

  const nextInvestorStep = () => {
    const err = validateInvestorStep(investorStep);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setInvestorStep((prev) => Math.min(prev + 1, 5));
  };

  const prevInvestorStep = () => {
    setError('');
    setInvestorStep((prev) => Math.max(prev - 1, 1));
  };

  // --- COMPANY STEP VALIDATIONS ---
  const validateCompanyStep = (step) => {
    setError('');
    if (step === 1) {
      if (!companyData.companyLegalName.trim()) return 'Please enter Registered Company Name.';
      if (!validateEmail(companyData.companyEmail)) return 'Please enter a valid Company Email Address.';
      if (!validateMobile(companyData.companyMobile)) return 'Please enter Official Mobile Number.';
      if (companyData.password.length < 6) return 'Password must be at least 6 characters.';
      if (companyData.password !== companyData.confirmPassword) return 'Passwords do not match.';
    }
    if (step === 2) {
      if (!companyData.pan.trim() || companyData.pan.trim().length !== 10) return 'Please enter a valid 10-character Company PAN.';
      if (!companyData.registeredAddress.trim()) return 'Please enter Registered Office Address.';
      if (!companyData.city.trim() || !companyData.state.trim() || !companyData.pincode.trim()) return 'Please enter City, State, and Pincode.';
    }
    if (step === 3) {
      if (!companyData.name.trim()) return 'Please enter Representative Full Name.';
      if (!companyData.repDesignation.trim()) return 'Please enter Representative Designation.';
      if (!validateEmail(companyData.email)) return 'Please enter Representative Work Email.';
      if (!validateMobile(companyData.mobile)) return 'Please enter Representative Mobile Number.';
    }
    if (step === 4) {
      if (!companyData.accountHolderName.trim()) return 'Please enter Bank Account Holder Name.';
      if (!companyData.bankName.trim()) return 'Please enter Bank Name.';
      if (!companyData.accountNumber.trim()) return 'Please enter Account Number.';
      if (!companyData.ifscCode.trim()) return 'Please enter IFSC Code.';
    }
    return null;
  };

  const nextCompanyStep = () => {
    const err = validateCompanyStep(companyStep);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setCompanyStep((prev) => Math.min(prev + 1, 5));
  };

  const prevCompanyStep = () => {
    setError('');
    setCompanyStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Investor Registration
  const handleInvestorSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!investorData.termsAccepted || !investorData.privacyPolicyAccepted || !investorData.riskDisclosureAccepted) {
      setError('You must accept Terms, Privacy Policy, and Risk Disclosures.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await investorAuth.register({
        name: investorData.name.trim(),
        email: investorData.email.trim().toLowerCase(),
        mobile: investorData.mobile.trim(),
        password: investorData.password,
        dateOfBirth: investorData.dateOfBirth,
        pan: investorData.pan.trim().toUpperCase(),
        aadhaarNumber: investorData.aadhaarNumber.trim(),
        residentialAddress: investorData.residentialAddress.trim(),
        city: investorData.city.trim(),
        state: investorData.state.trim(),
        pincode: investorData.pincode.trim(),
        nationality: investorData.nationality,
        occupation: investorData.occupation,
        annualIncomeRange: investorData.annualIncomeRange,
        sourceOfFunds: investorData.sourceOfFunds,
        accountHolderName: investorData.accountHolderName.trim(),
        bankName: investorData.bankName.trim(),
        accountNumber: investorData.accountNumber.trim(),
        ifscCode: investorData.ifscCode.trim().toUpperCase(),
        cancelledChequeUrl: investorData.cancelledChequeUrl,
        investmentExperience: investorData.investmentExperience,
        preferredInvestmentType: investorData.preferredInvestmentType,
        riskTolerance: investorData.riskTolerance,
        expectedInvestmentAmount: investorData.expectedInvestmentAmount,
        investmentGoals: investorData.investmentGoals,
        panCardUrl: investorData.panCardUrl,
        identityProofUrl: investorData.identityProofUrl,
        termsAccepted: investorData.termsAccepted,
        privacyPolicyAccepted: investorData.privacyPolicyAccepted,
        riskDisclosureAccepted: investorData.riskDisclosureAccepted
      });

      navigate('/verify-otp', {
        state: {
          email: investorData.email,
          mobile: investorData.mobile,
          otpCode: res.data?.otpCode
        }
      });
    } catch (err) {
      setError(err.message || 'Investor registration failed. Please review your entries.');
    } finally {
      setIsLoading(false);
    }
  };

  // Final Company Registration
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyData.termsAccepted) {
      setError('Please accept terms and declarations to finish registration.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await companyAuthService.register({
        companyLegalName: companyData.companyLegalName.trim(),
        brandName: companyData.brandName.trim() || companyData.companyLegalName.trim(),
        companyEmail: companyData.companyEmail.trim().toLowerCase(),
        companyMobile: companyData.companyMobile.trim(),
        password: companyData.password,
        website: companyData.website.trim(),
        industry: companyData.industry,
        companyType: companyData.companyType,
        cin: companyData.cin.trim() ? companyData.cin.trim().toUpperCase() : undefined,
        pan: companyData.pan.trim().toUpperCase(),
        gstin: companyData.gstin.trim() ? companyData.gstin.trim().toUpperCase() : undefined,
        incorporationDate: companyData.incorporationDate || undefined,
        registeredAddress: companyData.registeredAddress.trim(),
        city: companyData.city.trim(),
        state: companyData.state.trim(),
        pincode: companyData.pincode.trim(),
        description: companyData.description.trim(),
        name: companyData.name.trim(),
        repDesignation: companyData.repDesignation.trim(),
        email: (companyData.email || companyData.companyEmail).trim().toLowerCase(),
        mobile: (companyData.mobile || companyData.companyMobile).trim(),
        repPan: companyData.repPan.trim().toUpperCase(),
        repIdentityVerified: companyData.repIdentityVerified,
        accountHolderName: companyData.accountHolderName.trim() || companyData.companyLegalName.trim(),
        bankName: companyData.bankName.trim(),
        accountNumber: companyData.accountNumber.trim(),
        ifscCode: companyData.ifscCode.trim().toUpperCase(),
        cancelledChequeUrl: companyData.cancelledChequeUrl,
        incorporationCertificateUrl: companyData.incorporationCertificateUrl,
        panCardUrl: companyData.panCardUrl,
        gstCertificateUrl: companyData.gstCertificateUrl,
        moaAoaUrl: companyData.moaAoaUrl,
        shareholdingPatternUrl: companyData.shareholdingPatternUrl,
        financialStatementsUrl: companyData.financialStatementsUrl
      });

      if (res && res.token) {
        companyAuth.login(res.token, res.user, res.company);
        navigate('/dashboard');
      } else {
        navigate('/login?role=company');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Company registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const investorSteps = [
    { num: 1, label: 'Basic Details', icon: User },
    { num: 2, label: 'Personal & KYC', icon: ShieldCheck },
    { num: 3, label: 'Bank Details', icon: CreditCard },
    { num: 4, label: 'Investment Profile', icon: Target },
    { num: 5, label: 'Verification & Consent', icon: FileCheck2 },
  ];

  const companySteps = [
    { num: 1, label: 'Company Details', icon: Building2 },
    { num: 2, label: 'Business Info', icon: FileText },
    { num: 3, label: 'Auth Representative', icon: User },
    { num: 4, label: 'Bank Details', icon: CreditCard },
    { num: 5, label: 'Company Documents', icon: FileCheck2 },
  ];

  const currentStepNum = activeRole === 'investor' ? investorStep : companyStep;
  const currentStepList = activeRole === 'investor' ? investorSteps : companySteps;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-main)'
      }}
      className="auth-split-wrapper"
    >
      {/* Left Panel: Deep Burgundy Brand Banner */}
      <div
        style={{
          flex: 0.9,
          backgroundColor: '#3B0A11',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 40px',
          color: '#FFFFFF'
        }}
        className="auth-banner-panel"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(43, 6, 12, 0.96) 0%, rgba(59, 10, 17, 0.8) 40%, rgba(35, 4, 9, 0.96) 100%)',
            zIndex: 2
          }}
        />

        {/* Brand Header */}
        <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(200, 150, 62, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gold-light)'
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>
              Connect <span style={{ color: 'var(--color-gold)' }}>Invest</span>
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--color-gold-light)', letterSpacing: '1px', marginTop: '3px', textTransform: 'uppercase' }}>
              {activeRole === 'company' ? 'Company Registration' : 'Individual Investor Registration'}
            </div>
          </div>
        </div>

        {/* Stepper Progress Card on Left Bar */}
        <div style={{ position: 'relative', zIndex: 3, margin: '30px 0' }}>
          <div style={{ fontSize: '12px', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
            Step {currentStepNum} of 5
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentStepList.map((step) => {
              const IconComp = step.icon;
              const isDone = currentStepNum > step.num;
              const isCurr = currentStepNum === step.num;
              return (
                <div
                  key={step.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: isCurr ? 1 : isDone ? 0.9 : 0.45,
                    transition: 'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? '#059669' : isCurr ? '#B37400' : 'rgba(255,255,255,0.1)',
                      border: isCurr ? '2px solid #FCD34D' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '800',
                      color: '#FFF'
                    }}
                  >
                    {isDone ? <CheckCircle size={16} /> : <IconComp size={15} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: isCurr ? '700' : '500', color: isCurr ? '#FFF' : '#E8DEDF' }}>
                      {step.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.7)'
          }}
        >
          <ShieldCheck size={16} color="var(--color-gold)" />
          <span>Regulated Intermediary Platform & 256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Right Panel: Progressive Form Panel */}
      <div
        style={{
          flex: 1.3,
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 36px',
          backgroundColor: 'var(--bg-app)',
          overflowY: 'auto'
        }}
        className="auth-form-panel"
      >
        {/* Header: Back Link & Portal indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 10, 17, 0.05)',
              border: '1px solid rgba(59, 10, 17, 0.12)'
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </Link>

          <div style={{ fontSize: '13px', fontWeight: '700', color: '#B37400' }}>
            {activeRole === 'investor' ? 'Individual Investor' : 'Company / Business'} • Step {currentStepNum} of 5
          </div>
        </div>

        {/* Centered Registration Card */}
        <div
          style={{
            maxWidth: '680px',
            width: '100%',
            margin: '0 auto',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '28px 28px',
            boxShadow: '0 8px 30px rgba(59, 10, 17, 0.06)'
          }}
          className="auth-card"
        >
          {/* ROLE SELECTOR */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--color-gold-hover)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Select Registration Type:
            </label>
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(59, 10, 17, 0.06)',
                borderRadius: '10px',
                padding: '4px',
                border: '1px solid var(--border-color)'
              }}
            >
              <button
                type="button"
                onClick={() => handleRoleChange('investor')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '13px',
                  backgroundColor: activeRole === 'investor' ? '#FFFFFF' : 'transparent',
                  color: activeRole === 'investor' ? '#3B0A11' : 'var(--text-muted)',
                  boxShadow: activeRole === 'investor' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <User size={15} color={activeRole === 'investor' ? '#B37400' : '#888'} />
                <span>1. Investor Registration</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('company')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '13px',
                  backgroundColor: activeRole === 'company' ? '#FFFFFF' : 'transparent',
                  color: activeRole === 'company' ? '#3B0A11' : 'var(--text-muted)',
                  boxShadow: activeRole === 'company' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Building2 size={15} color={activeRole === 'company' ? '#B37400' : '#888'} />
                <span>2. Company Registration</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#1F2421' }}>
                {activeRole === 'investor'
                  ? `Step ${investorStep}: ${investorSteps[investorStep - 1].label}`
                  : `Step ${companyStep}: ${companySteps[companyStep - 1].label}`}
              </span>
              <span style={{ fontSize: '12px', color: '#B37400', fontWeight: '700' }}>
                {Math.round((currentStepNum / 5) * 100)}% Completed
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(currentStepNum / 5) * 100}%`,
                  height: '100%',
                  backgroundColor: '#B37400',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#DC2626',
                fontSize: '12.5px',
                marginBottom: '18px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. INVESTOR 5-STEP FORM                                   */}
          {/* ========================================================= */}
          {activeRole === 'investor' && (
            <div>
              {/* Step 1: Basic Details */}
              {investorStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Input
                    label="Full Legal Name"
                    name="name"
                    value={investorData.name}
                    onChange={handleInvestorChange}
                    placeholder="As per PAN Card"
                    required
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={investorData.email}
                      onChange={handleInvestorChange}
                      placeholder="name@example.com"
                      required
                    />
                    <Input
                      label="Mobile Number"
                      name="mobile"
                      value={investorData.mobile}
                      onChange={handleInvestorChange}
                      placeholder="10-digit mobile"
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      value={investorData.password}
                      onChange={handleInvestorChange}
                      placeholder="Min 6 characters"
                      required
                    />
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={investorData.confirmPassword}
                      onChange={handleInvestorChange}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                  <Input
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={investorData.dateOfBirth}
                    onChange={handleInvestorChange}
                    required
                  />
                </div>
              )}

              {/* Step 2: Personal & KYC Details */}
              {investorStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="PAN Number"
                      name="pan"
                      value={investorData.pan}
                      onChange={handleInvestorChange}
                      placeholder="e.g. ABCDE1234F"
                      required
                    />
                    <Input
                      label="Aadhaar Number (Optional verification)"
                      name="aadhaarNumber"
                      value={investorData.aadhaarNumber}
                      onChange={handleInvestorChange}
                      placeholder="12-digit Aadhaar number"
                    />
                  </div>

                  <Input
                    label="Residential Address"
                    name="residentialAddress"
                    value={investorData.residentialAddress}
                    onChange={handleInvestorChange}
                    placeholder="Flat / House No, Street, Landmark"
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <Input
                      label="City"
                      name="city"
                      value={investorData.city}
                      onChange={handleInvestorChange}
                      placeholder="e.g. Mumbai"
                      required
                    />
                    <Input
                      label="State"
                      name="state"
                      value={investorData.state}
                      onChange={handleInvestorChange}
                      placeholder="e.g. Maharashtra"
                      required
                    />
                    <Input
                      label="Pincode"
                      name="pincode"
                      value={investorData.pincode}
                      onChange={handleInvestorChange}
                      placeholder="6-digit PIN"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Occupation</label>
                      <select
                        name="occupation"
                        value={investorData.occupation}
                        onChange={handleInvestorChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                      >
                        <option value="Salaried Professional">Salaried Professional</option>
                        <option value="Business Owner / Entrepreneur">Business Owner / Entrepreneur</option>
                        <option value="Doctor / CA / Lawyer">Doctor / CA / Lawyer</option>
                        <option value="Retired">Retired</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Annual Income Range</label>
                      <select
                        name="annualIncomeRange"
                        value={investorData.annualIncomeRange}
                        onChange={handleInvestorChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                      >
                        <option value="Below ₹10 Lakh">Below ₹10 Lakh</option>
                        <option value="₹10 Lakh - ₹25 Lakh">₹10 Lakh - ₹25 Lakh</option>
                        <option value="₹25 Lakh - ₹50 Lakh">₹25 Lakh - ₹50 Lakh</option>
                        <option value="₹50 Lakh - ₹1 Crore">₹50 Lakh - ₹1 Crore</option>
                        <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Source of Funds</label>
                    <Input
                      name="sourceOfFunds"
                      value={investorData.sourceOfFunds}
                      onChange={handleInvestorChange}
                      placeholder="e.g. Salary, Business Income, Investments"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Bank Details */}
              {investorStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Input
                    label="Account Holder Name"
                    name="accountHolderName"
                    value={investorData.accountHolderName}
                    onChange={handleInvestorChange}
                    placeholder="As registered with your bank"
                    required
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Bank Name"
                      name="bankName"
                      value={investorData.bankName}
                      onChange={handleInvestorChange}
                      placeholder="e.g. HDFC Bank, ICICI Bank"
                      required
                    />
                    <Input
                      label="IFSC Code"
                      name="ifscCode"
                      value={investorData.ifscCode}
                      onChange={handleInvestorChange}
                      placeholder="11-character IFSC"
                      required
                    />
                  </div>
                  <Input
                    label="Account Number"
                    name="accountNumber"
                    value={investorData.accountNumber}
                    onChange={handleInvestorChange}
                    placeholder="Enter bank account number"
                    required
                  />
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Cancelled Cheque or Bank Proof (Optional during signup)
                    </label>
                    <div style={{ border: '2px dashed #D1D5DB', borderRadius: '10px', padding: '16px', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                      <UploadCloud size={24} color="#B37400" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '12px', color: '#4B5563' }}>Upload cancelled cheque or account statement (PDF/JPG)</div>
                      <input
                        type="file"
                        onChange={(e) => setInvestorData(prev => ({ ...prev, cancelledChequeUrl: e.target.files?.[0]?.name || 'cheque.pdf' }))}
                        style={{ marginTop: '8px', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Investment Profile */}
              {investorStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Investment Experience</label>
                    <select
                      name="investmentExperience"
                      value={investorData.investmentExperience}
                      onChange={handleInvestorChange}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    >
                      <option value="First-Time Investor">First-Time Investor</option>
                      <option value="1-3 Years">1-3 Years Experience</option>
                      <option value="3-5 Years">3-5 Years Experience</option>
                      <option value="5+ Years (Seasoned)">5+ Years (Seasoned Angel / Private Market)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Preferred Investment Type</label>
                    <select
                      name="preferredInvestmentType"
                      value={investorData.preferredInvestmentType}
                      onChange={handleInvestorChange}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    >
                      <option value="Fixed-Term Returns (Monthly Yield)">Fixed-Term Returns (Monthly Yield)</option>
                      <option value="Equity Investment (Capital Appreciation)">Equity Investment (Capital Appreciation)</option>
                      <option value="Fixed-Term & Equity (Diversified)">Both / Diversified</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Risk Tolerance</label>
                    <select
                      name="riskTolerance"
                      value={investorData.riskTolerance}
                      onChange={handleInvestorChange}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    >
                      <option value="Conservative (Focus on Capital Preservation)">Conservative (Focus on Capital Preservation)</option>
                      <option value="Moderate (Balanced Growth & Yield)">Moderate (Balanced Growth & Yield)</option>
                      <option value="Aggressive (High Growth / Venture Risk)">Aggressive (High Growth / Venture Risk)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Expected Investment Amount"
                      name="expectedInvestmentAmount"
                      value={investorData.expectedInvestmentAmount}
                      onChange={handleInvestorChange}
                      placeholder="e.g. ₹5,00,000 - ₹25,00,000"
                    />
                    <Input
                      label="Investment Goals"
                      name="investmentGoals"
                      value={investorData.investmentGoals}
                      onChange={handleInvestorChange}
                      placeholder="e.g. Regular monthly cash flow"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Verification & Consent */}
              {investorStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px', backgroundColor: '#F9FAFB' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>Upload PAN Card & Identity Proof</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>Upload clear image or PDF of your PAN Card for automated verification.</div>
                    <input
                      type="file"
                      onChange={(e) => setInvestorData(prev => ({ ...prev, panCardUrl: e.target.files?.[0]?.name || 'pan_card.jpg' }))}
                      style={{ fontSize: '12px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={investorData.termsAccepted}
                        onChange={handleInvestorChange}
                        style={{ marginTop: '2px' }}
                      />
                      <span>I accept the <strong>Terms & Conditions</strong> of Connect Invest.</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="privacyPolicyAccepted"
                        checked={investorData.privacyPolicyAccepted}
                        onChange={handleInvestorChange}
                        style={{ marginTop: '2px' }}
                      />
                      <span>I agree to the <strong>Privacy Policy</strong> and data processing for KYC.</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="riskDisclosureAccepted"
                        checked={investorData.riskDisclosureAccepted}
                        onChange={handleInvestorChange}
                        style={{ marginTop: '2px' }}
                      />
                      <span><strong>Risk Disclosure Acknowledgement:</strong> I understand that private market investments involve capital risks and past performance does not guarantee future results.</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                {investorStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevInvestorStep}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : <div />}

                {investorStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextInvestorStep}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#B37400',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Next Step <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleInvestorSubmit}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? 'Creating Account...' : 'Complete Registration'} <CheckCircle size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. COMPANY 5-STEP FORM                                    */}
          {/* ========================================================= */}
          {activeRole === 'company' && (
            <div>
              {/* Step 1: Company Details */}
              {companyStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Input
                    label="Registered Company Name"
                    name="companyLegalName"
                    value={companyData.companyLegalName}
                    onChange={handleCompanyChange}
                    placeholder="As registered with MCA / ROC"
                    required
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Brand / Business Name"
                      name="brandName"
                      value={companyData.brandName}
                      onChange={handleCompanyChange}
                      placeholder="Trading name"
                    />
                    <Input
                      label="Company Website (Optional)"
                      name="website"
                      value={companyData.website}
                      onChange={handleCompanyChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Company Official Email"
                      name="companyEmail"
                      type="email"
                      value={companyData.companyEmail}
                      onChange={handleCompanyChange}
                      placeholder="contact@company.com"
                      required
                    />
                    <Input
                      label="Official Mobile Number"
                      name="companyMobile"
                      value={companyData.companyMobile}
                      onChange={handleCompanyChange}
                      placeholder="Official phone"
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Business Category / Industry</label>
                      <select
                        name="industry"
                        value={companyData.industry}
                        onChange={handleCompanyChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
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
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Company Legal Structure</label>
                      <select
                        name="companyType"
                        value={companyData.companyType}
                        onChange={handleCompanyChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                      >
                        <option value="Private Limited">Private Limited</option>
                        <option value="Public Limited">Public Limited</option>
                        <option value="LLP">Limited Liability Partnership (LLP)</option>
                        <option value="Partnership">Partnership</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Portal Password"
                      name="password"
                      type="password"
                      value={companyData.password}
                      onChange={handleCompanyChange}
                      placeholder="Min 6 characters"
                      required
                    />
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={companyData.confirmPassword}
                      onChange={handleCompanyChange}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Business Information */}
              {companyStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Company PAN Number"
                      name="pan"
                      value={companyData.pan}
                      onChange={handleCompanyChange}
                      placeholder="10-character PAN"
                      required
                    />
                    <Input
                      label="Corporate Identification Number (CIN)"
                      name="cin"
                      value={companyData.cin}
                      onChange={handleCompanyChange}
                      placeholder="21-character CIN"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="GST Number (Optional)"
                      name="gstin"
                      value={companyData.gstin}
                      onChange={handleCompanyChange}
                      placeholder="15-character GSTIN"
                    />
                    <Input
                      label="Date of Incorporation"
                      name="incorporationDate"
                      type="date"
                      value={companyData.incorporationDate}
                      onChange={handleCompanyChange}
                    />
                  </div>

                  <Input
                    label="Registered Office Address"
                    name="registeredAddress"
                    value={companyData.registeredAddress}
                    onChange={handleCompanyChange}
                    placeholder="Floor, Building, Road / Area"
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <Input
                      label="City"
                      name="city"
                      value={companyData.city}
                      onChange={handleCompanyChange}
                      placeholder="City"
                      required
                    />
                    <Input
                      label="State"
                      name="state"
                      value={companyData.state}
                      onChange={handleCompanyChange}
                      placeholder="State"
                      required
                    />
                    <Input
                      label="Pincode"
                      name="pincode"
                      value={companyData.pincode}
                      onChange={handleCompanyChange}
                      placeholder="Pincode"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Business Description</label>
                    <textarea
                      name="description"
                      value={companyData.description}
                      onChange={handleCompanyChange}
                      placeholder="Provide a brief summary of operations, revenue model and sector focus."
                      rows={3}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Authorized Representative */}
              {companyStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Representative Full Name"
                      name="name"
                      value={companyData.name}
                      onChange={handleCompanyChange}
                      placeholder="Managing Director / Founder"
                      required
                    />
                    <Input
                      label="Designation"
                      name="repDesignation"
                      value={companyData.repDesignation}
                      onChange={handleCompanyChange}
                      placeholder="e.g. CEO, Managing Director"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Representative Work Email"
                      name="email"
                      type="email"
                      value={companyData.email}
                      onChange={handleCompanyChange}
                      placeholder="rep@company.com"
                      required
                    />
                    <Input
                      label="Representative Mobile"
                      name="mobile"
                      value={companyData.mobile}
                      onChange={handleCompanyChange}
                      placeholder="10-digit mobile"
                      required
                    />
                  </div>

                  <Input
                    label="Representative PAN Details"
                    name="repPan"
                    value={companyData.repPan}
                    onChange={handleCompanyChange}
                    placeholder="Representative personal PAN"
                  />

                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px', backgroundColor: '#F9FAFB' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '700' }}>Identity Verification Consent</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                      As authorized signatory, you affirm that you have the board authority to register and represent this legal entity on Connect Invest.
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Bank Details */}
              {companyStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Input
                    label="Account Holder Name (Corporate Account)"
                    name="accountHolderName"
                    value={companyData.accountHolderName}
                    onChange={handleCompanyChange}
                    placeholder="e.g. Nexus Tech Innovations Pvt Ltd"
                    required
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Bank Name"
                      name="bankName"
                      value={companyData.bankName}
                      onChange={handleCompanyChange}
                      placeholder="e.g. Axis Bank, HDFC"
                      required
                    />
                    <Input
                      label="IFSC Code"
                      name="ifscCode"
                      value={companyData.ifscCode}
                      onChange={handleCompanyChange}
                      placeholder="11-character IFSC"
                      required
                    />
                  </div>
                  <Input
                    label="Account Number"
                    name="accountNumber"
                    value={companyData.accountNumber}
                    onChange={handleCompanyChange}
                    placeholder="Enter current account number"
                    required
                  />
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Cancelled Cheque / Bank Proof</label>
                    <div style={{ border: '2px dashed #D1D5DB', borderRadius: '10px', padding: '16px', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                      <UploadCloud size={24} color="#B37400" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '12px', color: '#4B5563' }}>Upload corporate cancelled cheque or bank verification statement</div>
                      <input
                        type="file"
                        onChange={(e) => setCompanyData(prev => ({ ...prev, cancelledChequeUrl: e.target.files?.[0]?.name || 'company_cheque.pdf' }))}
                        style={{ marginTop: '8px', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Company Documents */}
              {companyStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px', backgroundColor: '#F9FAFB' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>Upload Statutory Company Documents</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>
                      Certificate of Incorporation, Company PAN, GST Certificate, MOA & AOA, Shareholding Pattern & Financials.
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600' }}>1. Certificate of Incorporation (ROC)</div>
                        <input
                          type="file"
                          onChange={(e) => setCompanyData(prev => ({ ...prev, incorporationCertificateUrl: e.target.files?.[0]?.name || 'coi.pdf' }))}
                          style={{ fontSize: '11px', marginTop: '2px' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600' }}>2. Company PAN & GST Certificate</div>
                        <input
                          type="file"
                          onChange={(e) => setCompanyData(prev => ({ ...prev, panCardUrl: e.target.files?.[0]?.name || 'company_pan.pdf' }))}
                          style={{ fontSize: '11px', marginTop: '2px' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600' }}>3. MOA & AOA / Shareholding Pattern</div>
                        <input
                          type="file"
                          onChange={(e) => setCompanyData(prev => ({ ...prev, moaAoaUrl: e.target.files?.[0]?.name || 'moa_aoa.pdf' }))}
                          style={{ fontSize: '11px', marginTop: '2px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', cursor: 'pointer', marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={companyData.termsAccepted}
                      onChange={handleCompanyChange}
                      style={{ marginTop: '2px' }}
                    />
                    <span>I declare that all corporate details, statutory documents and authorized representative declarations submitted are authentic and conform with MCA regulations.</span>
                  </label>
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                {companyStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevCompanyStep}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : <div />}

                {companyStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextCompanyStep}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#B37400',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Next Step <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompanySubmit}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? 'Registering Corporate Entity...' : 'Submit Company Registration'} <CheckCircle size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer Login Redirect */}
          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F3F4F6', fontSize: '13px', color: '#6B7280' }}>
            Already have an account?{' '}
            <Link
              to={activeRole === 'company' ? '/login?role=company' : '/login'}
              style={{ fontWeight: '700', color: '#B37400', textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
