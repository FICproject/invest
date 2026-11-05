import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Smartphone,
  CreditCard,
  Building,
  Wallet,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight
} from 'lucide-react';

export const RazorpayAdminDisburseModal = ({
  isOpen,
  onClose,
  disburseData,
  onSuccess,
  onFailure
}) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'banking' | 'wallet'
  const [upiSubTab, setUpiSubTab] = useState('vpa');
  const [vpaInput, setVpaInput] = useState('success@razorpay');
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState('Administrator');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProcessing(false);
      setErrorMessage('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !disburseData) return null;

  const amount = Number(disburseData.amount || 0);
  const orderTitle = disburseData.title || 'PRODUCT ORDER';
  const orderSubtitle = disburseData.recipientName || disburseData.companyName || 'Verified Vendor';

  const banks = [
    { id: 'HDFC', name: 'HDFC Bank' },
    { id: 'SBI', name: 'State Bank of India' },
    { id: 'ICICI', name: 'ICICI Bank' },
    { id: 'AXIS', name: 'Axis Bank' },
    { id: 'KOTAK', name: 'Kotak Mahindra' }
  ];

  const wallets = [
    { id: 'Paytm', name: 'Paytm Wallet' },
    { id: 'PhonePe', name: 'PhonePe' },
    { id: 'Mobikwik', name: 'Mobikwik' },
    { id: 'AmazonPay', name: 'Amazon Pay' }
  ];

  const handleExecutePayment = async () => {
    setProcessing(true);
    setErrorMessage('');

    try {
      await new Promise(res => setTimeout(res, 1200));

      if (activeTab === 'upi' && vpaInput.includes('fail')) {
        throw new Error('Transaction was declined by issuing UPI bank (Test Mode Failure)');
      }

      const utr = 'RZP-' + Math.floor(10000000 + Math.random() * 90000000);
      const paymentId = 'pay_' + Math.random().toString(36).substring(2, 10);

      let methodDisplay = 'UPI';
      if (activeTab === 'card') methodDisplay = 'Debit/Credit Card';
      if (activeTab === 'banking') methodDisplay = 'Net Banking';
      if (activeTab === 'wallet') methodDisplay = 'Wallet';

      if (onSuccess) {
        onSuccess({
          utrNumber: utr,
          paymentId,
          method: methodDisplay,
          amount
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing failed');
      if (onFailure) onFailure(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 15, 29, 0.72)',
        backdropFilter: 'blur(7px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 999999,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !processing) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header (Dark Navy with Razorpay branding & Test Mode) */}
        <div
          style={{
            backgroundColor: '#0F1E36',
            color: '#FFFFFF',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#0C2340',
                border: '1.5px solid #2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '18px',
                color: '#3B82F6'
              }}
            >
              R
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '-0.2px' }}>
                  Razorpay Payment
                </span>
                <span
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase'
                  }}
                >
                  TEST MODE
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Shield size={11} color="#10B981" />
                <span>Secured by Razorpay 256-Bit SSL</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                TOTAL AMOUNT
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#F59E0B', letterSpacing: '-0.5px' }}>
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#CBD5E1',
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 2. Order Summary Details Strip */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            padding: '12px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}
        >
          <div>
            <div style={{ fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#D97706' }}>📦</span>
              <span>{orderTitle}</span>
            </div>
            <div style={{ color: '#64748B', fontSize: '11px', marginTop: '1px' }}>
              {orderSubtitle}
            </div>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#D97706',
              backgroundColor: '#FEF3C7',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #FCD34D'
            }}
          >
            CONFIRMED DETAILS ✓
          </span>
        </div>

        {/* 3. Payment Method Tabs (Exact 4 Tabs: UPI / QR, Cards, Banking, Wallet) */}
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
            SELECT PAYMENT METHOD
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px'
            }}
          >
            {[
              { id: 'upi', label: 'UPI / QR', icon: Smartphone },
              { id: 'card', label: 'Cards', icon: CreditCard },
              { id: 'banking', label: 'Banking', icon: Building },
              { id: 'wallet', label: 'Wallet', icon: Wallet }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setErrorMessage('');
                  }}
                  disabled={processing}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px 6px',
                    borderRadius: '10px',
                    border: isActive ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                    color: isActive ? '#1D4ED8' : '#475569',
                    fontWeight: isActive ? '700' : '600',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconComp size={18} color={isActive ? '#2563EB' : '#64748B'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Tab Body Content */}
        <div style={{ padding: '20px 24px 24px', minHeight: '190px' }}>
          {/* A. UPI / QR Tab */}
          {activeTab === 'upi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '8px',
                  padding: '3px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setUpiSubTab('vpa')}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: upiSubTab === 'vpa' ? '#FFFFFF' : 'transparent',
                    color: upiSubTab === 'vpa' ? '#0F172A' : '#64748B',
                    boxShadow: upiSubTab === 'vpa' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  UPI ID / VPA
                </button>
                <button
                  type="button"
                  onClick={() => setUpiSubTab('qr')}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: upiSubTab === 'qr' ? '#FFFFFF' : 'transparent',
                    color: upiSubTab === 'qr' ? '#0F172A' : '#64748B',
                    boxShadow: upiSubTab === 'qr' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <QrCode size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                  Scan QR Code
                </button>
              </div>

              {upiSubTab === 'vpa' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      Google Pay / PhonePe / Paytm / BHIM
                    </span>
                    <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: '800', backgroundColor: '#DCFCE7', padding: '1px 5px', borderRadius: '4px' }}>
                      INSTANT
                    </span>
                  </div>
                  <input
                    type="text"
                    value={vpaInput}
                    onChange={(e) => setVpaInput(e.target.value)}
                    placeholder="Enter UPI ID (e.g. yourname@oksbi)"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', fontSize: '11.5px', color: '#64748B' }}>
                    <span>Quick test:</span>
                    <button
                      type="button"
                      onClick={() => setVpaInput('success@razorpay')}
                      style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                    >
                      success@razorpay
                    </button>
                    <button
                      type="button"
                      onClick={() => setVpaInput('fail@upi')}
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                    >
                      fail@upi
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ width: '130px', height: '130px', margin: '0 auto', backgroundColor: '#F8FAFC', border: '2px dashed #94A3B8', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={56} color="#0F172A" />
                    <span style={{ fontSize: '10px', color: '#64748B', marginTop: '6px' }}>Razorpay Test QR</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '8px' }}>
                    Scan with any UPI app in test mode to authorize ₹{amount.toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* B. Cards Tab */}
          {activeTab === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  CARD NUMBER
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111 1111 1111 1111"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    VALID THRU
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  CARDHOLDER NAME
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Name on card"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* C. Banking Tab */}
          {activeTab === 'banking' && (
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>
                POPULAR BANKS
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {banks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: selectedBank === b.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      backgroundColor: selectedBank === b.id ? '#EFF6FF' : '#FFFFFF',
                      color: selectedBank === b.id ? '#1E40AF' : '#1E293B',
                      fontSize: '12.5px',
                      fontWeight: selectedBank === b.id ? '700' : '600',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* D. Wallet Tab */}
          {activeTab === 'wallet' && (
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>
                SELECT WALLET
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWallet(w.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: selectedWallet === w.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      backgroundColor: selectedWallet === w.id ? '#EFF6FF' : '#FFFFFF',
                      color: selectedWallet === w.id ? '#1E40AF' : '#1E293B',
                      fontSize: '13px',
                      fontWeight: selectedWallet === w.id ? '700' : '600',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                color: '#B91C1C',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div style={{ marginTop: '18px' }}>
            <button
              type="button"
              onClick={handleExecutePayment}
              disabled={processing}
              style={{
                width: '100%',
                backgroundColor: '#0F1E36',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '13px',
                fontSize: '14.5px',
                fontWeight: '800',
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(15, 30, 54, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {processing ? (
                <span>Communicating with Razorpay...</span>
              ) : (
                <>
                  <Lock size={15} />
                  <span>
                    PAY ₹{amount.toLocaleString('en-IN')} VIA {activeTab.toUpperCase()}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Cancel Payment option */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
              Merchant: Connect App India
            </span>
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '11.5px',
                textDecoration: 'underline',
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
