import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { investorService } from '../../services/investorService';
import { validateIFSC } from '../../utils/validators';

export const BankDetails = () => {
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

    if (!bankDetails.bankName || !bankDetails.accountNumber) {
      setError('Please provide bank name and account number.');
      return;
    }

    if (!validateIFSC(bankDetails.ifscCode)) {
      setError('Invalid IFSC format. Expected format: HDFC0001234.');
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
              onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
              placeholder="As registered in your bank records"
              required
            />

            <Input
              label="Bank Name"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              placeholder="e.g. HDFC Bank Ltd."
              required
            />

            <Input
              label="Bank Account Number"
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
              placeholder="Enter full account number"
              required
            />

            <Input
              label="Bank IFSC Code"
              value={bankDetails.ifscCode}
              onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
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
