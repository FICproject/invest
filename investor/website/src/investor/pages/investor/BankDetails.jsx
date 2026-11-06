import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { investorService } from '../../services/investorService';
import { validateIFSC, validateBankAccount, ERROR_MESSAGES } from '../../utils/validators';

export const BankDetails = () => {
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validateField = (name, value) => {
    let err = '';
    if (name === 'accountNumber') {
      if (!value) err = 'Bank account number is required.';
      else if (!validateBankAccount(value)) err = ERROR_MESSAGES.BANK_ACCOUNT_INVALID;
    } else if (name === 'ifscCode') {
      if (!value) err = 'IFSC code is required.';
      else if (!validateIFSC(value)) err = ERROR_MESSAGES.IFSC_INVALID;
    } else if (name === 'bankName') {
      if (!value.trim()) err = 'Bank name is required.';
    } else if (name === 'accountHolderName') {
      if (!value.trim()) err = 'Account holder name is required.';
    }
    setFieldErrors(prev => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, bankDetails[field]);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchBank = async () => {
      try {
        const res = await investorService.getProfile();
        if (isMounted && res.success && res.data?.profile?.bankDetails) {
          const b = res.data.profile.bankDetails;
          setBankDetails({
            bankName: b.bankName || '',
            accountNumber: b.accountNumber || '',
            ifscCode: b.ifscCode || '',
            accountHolderName: b.accountHolderName || res.data.user.name || ''
          });
        }
      } catch (err) {
        console.error('[BankDetails] Error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBank();
    return () => { isMounted = false; };
  }, []);

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!bankDetails.bankName.trim() || !bankDetails.accountHolderName.trim()) {
      setError('Please provide all required bank account fields.');
      return;
    }

    if (!validateBankAccount(bankDetails.accountNumber)) {
      setError(ERROR_MESSAGES.BANK_ACCOUNT_INVALID);
      return;
    }

    if (!validateIFSC(bankDetails.ifscCode)) {
      setError(ERROR_MESSAGES.IFSC_INVALID);
      return;
    }

    setIsSaving(true);
    try {
      const res = await investorService.updateBankDetails(bankDetails);
      if (res.success) {
        setMessage('Bank account details saved successfully. Payouts will be routed here.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update bank details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading bank account details..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
            Bank Account for Payout Distributions
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            All monthly yields, maturity principal payments, and refunds are directly settled to this account.
          </p>
        </div>

        {message && (
          <div style={{ backgroundColor: '#ECFDF5', color: '#065F46', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 16px rgba(59, 10, 17, 0.04)'
          }}
        >
          <form onSubmit={handleSaveBank} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Input
              label="Account Holder Name"
              value={bankDetails.accountHolderName}
              onChange={(e) => {
                setBankDetails({ ...bankDetails, accountHolderName: e.target.value });
                if (touched.accountHolderName) validateField('accountHolderName', e.target.value);
              }}
              onBlur={() => handleBlur('accountHolderName')}
              error={touched.accountHolderName ? fieldErrors.accountHolderName : ''}
              placeholder="As registered in your bank records"
              required
            />

            <Input
              label="Bank Name"
              value={bankDetails.bankName}
              onChange={(e) => {
                setBankDetails({ ...bankDetails, bankName: e.target.value });
                if (touched.bankName) validateField('bankName', e.target.value);
              }}
              onBlur={() => handleBlur('bankName')}
              error={touched.bankName ? fieldErrors.bankName : ''}
              placeholder="e.g. HDFC Bank Ltd."
              required
            />

            <Input
              label="Bank Account Number"
              value={bankDetails.accountNumber}
              maxLength={18}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 18);
                setBankDetails({ ...bankDetails, accountNumber: val });
                if (touched.accountNumber) validateField('accountNumber', val);
              }}
              onBlur={() => handleBlur('accountNumber')}
              error={touched.accountNumber ? fieldErrors.accountNumber : ''}
              placeholder="9 to 18 digits (e.g. 123456789012)"
              required
            />

            <Input
              label="Bank IFSC Code"
              value={bankDetails.ifscCode}
              maxLength={11}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
                setBankDetails({ ...bankDetails, ifscCode: val });
                if (touched.ifscCode) validateField('ifscCode', val);
              }}
              onBlur={() => handleBlur('ifscCode')}
              error={touched.ifscCode ? fieldErrors.ifscCode : ''}
              placeholder="e.g. HDFC0001234"
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="primary" type="submit" size="md" isLoading={isSaving}>
                Save Bank Details
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
