import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Download,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { investorService } from '../../services/investorService';
import { formatCurrency } from '../../utils/formatCurrency';

export const InvestorSubscription = () => {
  const { user } = useAuth();
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionAmount, setSubscriptionAmount] = useState(500);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextBillingDateFormatted = nextMonthDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const fetchSubscriptionDetails = async () => {
    try {
      setLoadingHistory(true);
      const res = await investorService.getSubscription();
      const subData = res?.data || res;
      if (subData) {
        setIsSubscribed(Boolean(subData.isSubscribed));
        if (subData.currentPlan?.amount) {
          setSubscriptionAmount(subData.currentPlan.amount);
        }
        const list = (subData.history || []).map((s) => ({
          id: s.invoiceNumber || s._id,
          month: s.billingMonth,
          amount: s.amount,
          paidOn: s.paymentDate ? new Date(s.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
          method: s.paymentMethod || 'Razorpay',
          status: s.status || 'Paid',
          receiptUrl: '#'
        }));
        setPaymentHistory(list);
      }
    } catch (e) {
      console.warn('Failed to fetch investor subscription history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const handleRazorpayPayment = async () => {
    setPaying(true);
    try {
      // 1. Request Razorpay order from backend
      const res = await investorService.createSubscriptionOrder({
        billingMonth: currentMonthName
      });
      // In our axios client (api.js), response interceptor already unwraps response.data directly!
      const orderData = res?.data || res;

      if (!orderData || !orderData.orderId) {
        throw new Error('Failed to create subscription order. Please try again.');
      }

      // 2. If Razorpay SDK is available on window and not simulated
      if (typeof window !== 'undefined' && window.Razorpay && !orderData.simulated) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: orderData.currency || 'INR',
          name: 'Connect Invest',
          description: `Investor Platform Subscription - ${currentMonthName}`,
          order_id: orderData.orderId,
          prefill: {
            name: user?.name || 'Investor',
            email: user?.email || '',
            contact: user?.mobile || ''
          },
          theme: {
            color: '#0047BA'
          },
          handler: async function (response) {
            try {
              const verifyRes = await investorService.verifySubscription({
                orderId: response.razorpay_order_id || orderData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                paymentMethod: selectedMethod === 'upi' ? 'UPI' : selectedMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking'
              });

              if (verifyRes?.success || verifyRes?.data?.success) {
                setPaymentSuccess(true);
                setIsSubscribed(true);
                fetchSubscriptionDetails();
                setTimeout(() => {
                  setPaymentSuccess(false);
                  setIsPayModalOpen(false);
                }, 2000);
              }
            } catch (err) {
              alert('Payment signature verification failed. Please contact support.');
            } finally {
              setPaying(false);
            }
          },
          modal: {
            ondismiss: function () {
              setPaying(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback / Test direct flow
        const verifyRes = await investorService.verifySubscription({
          orderId: orderData.orderId || `order_sim_${Date.now()}`,
          paymentId: `pay_sim_${Date.now()}`,
          paymentMethod: selectedMethod === 'upi' ? 'UPI' : selectedMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking'
        });

        if (verifyRes?.success || verifyRes?.data?.success) {
          setPaymentSuccess(true);
          setIsSubscribed(true);
          fetchSubscriptionDetails();
          setTimeout(() => {
            setPaymentSuccess(false);
            setIsPayModalOpen(false);
          }, 1800);
        }
        setPaying(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Payment initiation failed.');
      setPaying(false);
    }
  };

  return (
    <DashboardLayout title="Subscription" subtitle="Platform membership fee and billing history">
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Plan & Payment Header Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '5px',
              height: '100%',
              backgroundColor: isSubscribed ? '#10B981' : '#0047BA'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--color-primary-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary)',
                  flexShrink: 0
                }}
              >
                <Sparkles size={28} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                    Investor Membership Plan
                  </h2>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: isSubscribed ? '#ECFDF5' : '#EFF6FF',
                      color: isSubscribed ? '#059669' : '#0047BA',
                      border: `1px solid ${isSubscribed ? '#A7F3D0' : '#BFDBFE'}`
                    }}
                  >
                    {isSubscribed ? 'Active Subscription' : 'Pending Payment'}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '14px' }}>
                  Investor: <strong>{user?.name || 'Investor'}</strong> • Membership Access Verified
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12.5px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--color-primary)" />
                    <span>Current Billing Cycle: <strong>{currentMonthName}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#10B981" />
                    <span>Next Due Date: <strong>{nextBillingDateFormatted}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)' }}>₹{subscriptionAmount}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}> / month</span>
              </div>

              {isSubscribed ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Paid for {currentMonthName}</span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsPayModalOpen(true)}
                  style={{ fontWeight: '700', minWidth: '130px' }}
                >
                  Pay Now
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                color: '#0047BA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <TrendingUp size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                Premium Investment Offers
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Direct priority access to curated, verified commercial asset offerings and fixed-return debentures.
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                Automated Payout Ledgers
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Real-time tracking of monthly interest yields, return reconciliations, and direct bank distributions.
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileCheck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                GST Invoice Receipts
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Instant downloadable tax invoices for every monthly subscription payment with legitimate GST compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Payment History Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
              Subscription Payment History
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Verified monthly platform fee transaction receipts and invoices.
            </p>
          </div>

          {loadingHistory ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading subscription records...
            </div>
          ) : paymentHistory.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: '12px',
                border: '1px dashed var(--border-color)'
              }}
            >
              <CreditCard size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>No billing records yet</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Your payment receipts will show up here after completing your monthly fee.
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>INVOICE ID</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>BILLING MONTH</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>AMOUNT</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>PAYMENT METHOD</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>PAID ON</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--text-main)' }}>{inv.id}</td>
                      <td style={{ padding: '14px 16px' }}>{inv.month}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '700' }}>{formatCurrency(inv.amount)}</td>
                      <td style={{ padding: '14px 16px' }}>{inv.method}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{inv.paidOn}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: '#ECFDF5',
                            color: '#059669'
                          }}
                        >
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Razorpay Payment Modal */}
      {isPayModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            backdropFilter: 'blur(3px)',
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            {paymentSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <CheckCircle2 size={54} color="#10B981" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  Payment Successful!
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  Your subscription for {currentMonthName} has been activated.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                    Pay Monthly Platform Subscription
                  </h3>
                  <button
                    onClick={() => setIsPayModalOpen(false)}
                    style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-subtle)',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                      Membership Fee ({currentMonthName})
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Inclusive of all statutory taxes</div>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#0047BA' }}>
                    ₹{subscriptionAmount}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                    Select Preferred Gateway Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'upi', label: 'UPI / QR' },
                      { id: 'card', label: 'Card' },
                      { id: 'netbanking', label: 'NetBanking' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '8px',
                          border: selectedMethod === m.id ? '2px solid #0047BA' : '1px solid var(--border-color)',
                          backgroundColor: selectedMethod === m.id ? '#EFF6FF' : 'var(--bg-surface)',
                          fontWeight: '700',
                          fontSize: '12px',
                          color: selectedMethod === m.id ? '#0047BA' : 'var(--text-main)',
                          cursor: 'pointer'
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsPayModalOpen(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleRazorpayPayment}
                    isLoading={paying}
                    style={{ flex: 1.5, fontWeight: '700' }}
                  >
                    Pay ₹{subscriptionAmount} via Razorpay
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

