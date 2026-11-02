import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, Lock, CreditCard } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/formatCurrency';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

export const InvestmentModal = ({ isOpen, onClose, offer, onInvestmentSuccess }) => {
  const { kycStatus } = useAuth();
  const navigate = useNavigate();

  const min = offer ? offer.minInvestment : 5000;
  const max = offer ? offer.maxInvestment : 5000000;

  const [amount, setAmount] = useState(min);
  const [paymentMethod, setPaymentMethod] = useState('Net Banking');
  const [step, setStep] = useState('input'); // 'input' | 'processing' | 'success' | 'kyc_blocked'
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isKycApproved = kycStatus === 'APPROVED';

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!isKycApproved) {
      setStep('kyc_blocked');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < min) {
      setError(`Minimum investment amount is ${formatCurrency(min)}`);
      return;
    }
    if (max && numAmount > max) {
      setError(`Maximum allowed investment is ${formatCurrency(max)}`);
      return;
    }

    setIsSubmitting(true);
    setStep('processing');

    try {
      // 1. Create Order
      const orderRes = await paymentService.createOrder(offer._id, numAmount, paymentMethod);

      if (orderRes.success && orderRes.data) {
        const orderId = orderRes.data.orderId;

        // 2. Simulate gateway checkout latency
        setTimeout(async () => {
          try {
            const verifyRes = await paymentService.verifyPayment(orderId, 'PAY_' + Date.now(), 'Success');
            if (verifyRes.success && verifyRes.data) {
              setSuccessData(verifyRes.data);
              setStep('success');
              if (onInvestmentSuccess) onInvestmentSuccess(verifyRes.data);
            }
          } catch (err) {
            setError(err.message || 'Payment verification failed.');
            setStep('input');
          } finally {
            setIsSubmitting(false);
          }
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate investment.');
      setStep('input');
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep('input');
    setError('');
    setSuccessData(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetModal}
      title={step === 'success' ? 'Investment Confirmed' : `Invest in ${offer ? offer.companyName : 'Offer'}`}
      subtitle={step === 'success' ? 'Your portfolio has been updated' : 'Review terms and commit capital'}
      maxWidth="540px"
    >
      {/* State 1: KYC Blocked (PRD requirement: do not allow unverified investors to invest) */}
      {!isKycApproved && step === 'input' && (
        <div
          style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #FCD34D',
            padding: '16px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}
        >
          <AlertCircle size={20} color="#92400E" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400E' }}>
              KYC Verification Required
            </div>
            <div style={{ fontSize: '13px', color: '#78350F', marginTop: '4px', lineHeight: 1.5 }}>
              Per regulatory guidelines, your identity must be verified before participating in investment offers. Your current status is: <strong>{kycStatus}</strong>.
            </div>
            <div style={{ marginTop: '12px' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  resetModal();
                  navigate('/investor/kyc');
                }}
              >
                Complete KYC Verification
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* State 2: Input & Summary */}
      {step === 'input' && (
        <form onSubmit={handleProceedToPayment}>
          {error && (
            <div
              style={{
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            >
              {error}
            </div>
          )}

          {/* Offer Summary Banner */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Return Rate:</span>{' '}
                <strong style={{ color: 'var(--color-gold)' }}>{offer ? offer.returnRate : 10}% p.a.</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Tenure:</span>{' '}
                <strong>{offer ? offer.tenureMonths : 24} Months</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Payouts:</span>{' '}
                <strong>{offer ? offer.payoutFrequency : 'Monthly'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Security:</span>{' '}
                <strong>{offer ? offer.securityType || 'Debenture' : 'Secured'}</strong>
              </div>
            </div>
          </div>

          {/* Investment Amount Input */}
          <div style={{ marginBottom: '20px' }}>
            <Input
              label="Enter Investment Amount (INR)"
              type="number"
              min={min}
              max={max}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              prefix="₹"
              required
              helperText={`Applicable limits: ${formatCurrency(min)} – ${formatCurrency(max)}`}
            />
          </div>

          {/* Payment Method Selector */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
              Select Payment Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {['Net Banking', 'UPI', 'Bank Transfer', 'Debit/Credit Card'].map((method) => (
                <div
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: paymentMethod === method ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    backgroundColor: paymentMethod === method ? 'var(--color-primary-subtle)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: paymentMethod === method ? 'var(--color-primary)' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <CreditCard size={16} />
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="outline" size="md" onClick={resetModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!isKycApproved}
              icon={Lock}
            >
              Confirm & Pay {formatCurrency(amount)}
            </Button>
          </div>
        </form>
      )}

      {/* State 3: Processing State */}
      {step === 'processing' && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid rgba(59, 10, 17, 0.2)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px'
            }}
          />
          <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>
            Processing Payment & Allotment
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Communicating with banking gateway and generating your secured investment debenture certificate...
          </p>
        </div>
      )}

      {/* State 4: Success State */}
      {step === 'success' && successData && (
        <div style={{ textAlign: 'center', padding: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h4 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
            Investment Allotted Successfully!
          </h4>

          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Your investment of <strong>{formatCurrency(successData.amountInvested)}</strong> has been confirmed and recorded on the platform ledger.
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'left',
              fontSize: '13px',
              marginBottom: '24px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Certificate No:</span>
              <strong style={{ color: 'var(--color-primary)' }}>{successData.certificateNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Transaction Reference:</span>
              <strong>{successData.transactionRef}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Maturity Expected:</span>
              <strong style={{ color: '#10B981' }}>{formatCurrency(successData.expectedReturns)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="outline"
              fullWidth
              onClick={resetModal}
            >
              Close
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                resetModal();
                navigate('/investor/my-investments');
              }}
            >
              View My Investments
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
