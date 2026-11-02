import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  UploadCloud,
  FileText,
  Building,
  User,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { kycService } from '../../services/kycService';
import { validatePAN, validateIFSC } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';

export const KYCVerification = () => {
  const { user, kycStatus, updateKYCStatus, refreshMe } = useAuth();

  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    panNumber: '',
    addressProofType: 'Aadhaar Card',
    addressProofNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  // File uploads
  const [panFile, setPanFile] = useState(null);
  const [addressFile, setAddressFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [bankFile, setBankFile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await kycService.getKycStatus();
        if (isMounted && res.success && res.data) {
          setKycData(res.data);
          updateKYCStatus(res.data.status);
          if (res.data.fullName) {
            setFormData((prev) => ({
              ...prev,
              fullName: res.data.fullName || prev.fullName,
              panNumber: res.data.panNumber || prev.panNumber,
              addressProofType: res.data.addressProofType || prev.addressProofType,
              addressProofNumber: res.data.addressProofNumber || prev.addressProofNumber,
              bankName: res.data.bankName || prev.bankName,
              accountNumber: res.data.accountNumber || prev.accountNumber,
              ifscCode: res.data.ifscCode || prev.ifscCode
            }));
          }
        }
      } catch (err) {
        console.error('[KYC] Error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStatus();
    return () => { isMounted = false; };
  }, []);

  const handleSubmitKyc = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName.trim()) {
      setError('Please provide your full legal name as per PAN.');
      return;
    }

    if (!validatePAN(formData.panNumber)) {
      setError('Please provide a valid 10-character PAN number (e.g. ABCDE1234F).');
      return;
    }

    if (!formData.bankName || !formData.accountNumber) {
      setError('Please enter complete bank account coordinates.');
      return;
    }

    if (!validateIFSC(formData.ifscCode)) {
      setError('Please provide a valid 11-character bank IFSC code (e.g. HDFC0001234).');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName.trim());
      data.append('panNumber', formData.panNumber.toUpperCase().trim());
      data.append('addressProofType', formData.addressProofType);
      data.append('addressProofNumber', formData.addressProofNumber.trim());
      data.append('bankName', formData.bankName.trim());
      data.append('accountNumber', formData.accountNumber.trim());
      data.append('ifscCode', formData.ifscCode.toUpperCase().trim());
      data.append('autoApprove', true); // Instant verify for testing

      if (panFile) data.append('panDocument', panFile);
      if (addressFile) data.append('addressProof', addressFile);
      if (selfieFile) data.append('selfie', selfieFile);
      if (bankFile) data.append('bankProof', bankFile);

      const res = await kycService.submitKyc(data);
      if (res.success && res.data) {
        setKycData(res.data);
        updateKYCStatus(res.data.status);
        await refreshMe();
        setSuccess('KYC documents submitted and verified successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit KYC documents.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevToggle = async (targetStatus) => {
    try {
      setLoading(true);
      const res = await kycService.toggleStatus(targetStatus);
      if (res.success && res.data) {
        setKycData(res.data);
        updateKYCStatus(res.data.status);
        await refreshMe();
      }
    } catch (err) {
      setError(err.message || 'Status toggle failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading KYC compliance profile..." />
      </DashboardLayout>
    );
  }

  const status = kycData?.status || kycStatus || 'NOT_STARTED';

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            KYC Verification & Identity Governance
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Complete statutory identity and banking verification to unlock investment actions and automated payout distributions.
          </p>
        </div>

        {/* Current KYC Status Banner */}
        <div
          style={{
            borderRadius: '14px',
            padding: '24px',
            backgroundColor:
              status === 'APPROVED'
                ? '#ECFDF5'
                : status === 'PENDING'
                ? '#FEF3C7'
                : status === 'REJECTED'
                ? '#FEE2E2'
                : 'var(--bg-surface)',
            border:
              status === 'APPROVED'
                ? '1px solid #A7F3D0'
                : status === 'PENDING'
                ? '1px solid #FCD34D'
                : status === 'REJECTED'
                ? '1px solid #FCA5A5'
                : '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
            >
              {status === 'APPROVED' && <CheckCircle2 size={26} color="#10B981" />}
              {status === 'PENDING' && <Clock size={26} color="#F59E0B" />}
              {status === 'REJECTED' && <XCircle size={26} color="#EF4444" />}
              {status === 'NOT_STARTED' && <ShieldAlert size={26} color="var(--color-primary)" />}
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Verification Status
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>
                {status === 'APPROVED' && 'Verified & Approved'}
                {status === 'PENDING' && 'Verification Under Review'}
                {status === 'REJECTED' && 'Submission Rejected'}
                {status === 'NOT_STARTED' && 'Verification Not Started'}
              </div>
              {status === 'REJECTED' && kycData?.rejectionReason && (
                <div style={{ fontSize: '13px', color: '#B91C1C', marginTop: '4px' }}>
                  Reason: {kycData.rejectionReason}
                </div>
              )}
            </div>
          </div>

          {/* Developer Testing State Switcher Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(0,0,0,0.05)',
              padding: '4px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700'
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Dev Test Status:</span>
            {['APPROVED', 'PENDING', 'NOT_STARTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => handleDevToggle(st)}
                style={{
                  background: status === st ? 'var(--color-primary)' : 'transparent',
                  color: status === st ? '#FFFFFF' : 'var(--text-main)',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '10.5px',
                  fontWeight: '700'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#ECFDF5', color: '#065F46', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
            {success}
          </div>
        )}

        {/* KYC Submission Form */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(59, 10, 17, 0.04)'
          }}
        >
          <form onSubmit={handleSubmitKyc} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Section 1: Personal & PAN Details */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="var(--color-gold)" />
                <span>1. Personal & Tax Information</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <Input
                  label="Full Legal Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="As per PAN Card"
                  required
                />
                <Input
                  label="PAN Card Number"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  required
                />
              </div>
            </div>

            {/* Section 2: Address Proof */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--color-gold)" />
                <span>2. Address Proof Document</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    Document Type
                  </label>
                  <select
                    value={formData.addressProofType}
                    onChange={(e) => setFormData({ ...formData, addressProofType: e.target.value })}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID Card">Voter ID Card</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>

                <Input
                  label="Document Number"
                  value={formData.addressProofNumber}
                  onChange={(e) => setFormData({ ...formData, addressProofNumber: e.target.value })}
                  placeholder="e.g. XXXX-XXXX-1234"
                />
              </div>
            </div>

            {/* Section 3: Bank Account for Payout Distributions */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} color="var(--color-gold)" />
                <span>3. Bank Account Coordinates (For Payouts)</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank, ICICI Bank"
                  required
                />
                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Enter Account Number"
                  required
                />
                <Input
                  label="Bank IFSC Code"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001234"
                  required
                />
              </div>
            </div>

            {/* Section 4: File Upload Cards */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={18} color="var(--color-gold)" />
                <span>4. Document Uploads (JPEG, PNG, or PDF)</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                {[
                  { label: 'PAN Card Copy', setter: setPanFile, file: panFile },
                  { label: 'Address Proof (Front & Back)', setter: setAddressFile, file: addressFile },
                  { label: 'Investor Live Selfie', setter: setSelfieFile, file: selfieFile },
                  { label: 'Cancelled Cheque / Bank Passbook', setter: setBankFile, file: bankFile }
                ].map((doc, idx) => (
                  <label
                    key={idx}
                    style={{
                      border: '1.5px dashed var(--border-color)',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: doc.file ? 'var(--color-primary-subtle)' : 'var(--bg-surface-subtle)',
                      transition: 'border-color 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <UploadCloud size={22} color={doc.file ? 'var(--color-primary)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                      {doc.label}
                    </span>
                    <span style={{ fontSize: '11px', color: doc.file ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                      {doc.file ? doc.file.name : 'Choose file...'}
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          doc.setter(e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <Button
                variant="primary"
                type="submit"
                size="lg"
                isLoading={isSubmitting}
              >
                {status === 'APPROVED' ? 'Update & Re-verify KYC' : 'Submit for Verification'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
