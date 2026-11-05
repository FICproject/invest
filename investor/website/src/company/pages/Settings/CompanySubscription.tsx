import React, { useState } from 'react';
import { Card, Button, Badge } from '../../components/common';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Download,
  ShieldCheck,
  Zap,
  Building2,
  ArrowRight,
  Clock,
  QrCode,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../../investor/services/api';

export const CompanySubscription: React.FC = () => {
  const { company } = useAuth();
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);

  // Current month billing details (₹500 / month)
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextBillingDateFormatted = nextMonthDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionAmount, setSubscriptionAmount] = useState(500);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch real subscription status and payments from backend on load
  const fetchSubscriptionDetails = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/company/subscription');
      if (res.data?.success && res.data?.data) {
        setIsSubscribed(Boolean(res.data.data.isSubscribed));
        if (res.data.data.currentPlan?.amount) {
          setSubscriptionAmount(res.data.data.currentPlan.amount);
        }
        const list = (res.data.data.history || []).map((s: any) => ({
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
      console.warn('Failed to fetch subscription history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  React.useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const handleRazorpayPayment = async () => {
    setPaying(true);
    try {
      // 1. Request Razorpay order from backend
      const res = await api.post('/company/subscription/create-order', {
        billingMonth: currentMonthName
      });
      const orderData = res.data?.data || res.data;

      // 2. If Razorpay SDK is available on window and not simulation
      if (typeof window !== 'undefined' && (window as any).Razorpay && !orderData.simulated) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: orderData.currency || 'INR',
          name: 'Connect Invest',
          description: `Platform Subscription - ${currentMonthName}`,
          order_id: orderData.orderId,
          prefill: {
            name: company?.legalName || company?.name || '',
            email: company?.officialEmail || '',
            contact: company?.officialPhone || ''
          },
          theme: {
            color: '#DE8E0A'
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await api.post('/company/subscription/verify', {
                orderId: response.razorpay_order_id || orderData.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                paymentMethod: selectedMethod === 'upi' ? 'UPI' : selectedMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking'
              });
              const invoice = verifyRes.data?.data;
              setPaymentSuccess(true);
              setPaymentHistory([
                {
                  id: invoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
                  month: currentMonthName,
                  amount: 500,
                  paidOn: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                  method: `Razorpay (${invoice?.transactionRef || 'Paid'})`,
                  status: 'Paid',
                  receiptUrl: '#'
                },
                ...paymentHistory
              ]);
            } catch (err: any) {
              alert(err.response?.data?.message || 'Payment verification failed');
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

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct simulation / verification fallback
        const verifyRes = await api.post('/company/subscription/verify', {
          orderId: orderData?.orderId || `order_sim_${Date.now()}`,
          paymentId: `PAY_${Date.now()}`,
          signature: 'simulated_valid_signature',
          paymentMethod: selectedMethod === 'upi' ? 'UPI' : selectedMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking'
        });
        const invoice = verifyRes.data?.data;
        setPaying(false);
        setPaymentSuccess(true);
        setPaymentHistory([
          {
            id: invoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
            month: currentMonthName,
            amount: 500,
            paidOn: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            method: selectedMethod === 'upi' ? 'UPI (Instant QR)' : selectedMethod === 'card' ? 'Corporate Card' : 'Net Banking',
            status: 'Paid',
            receiptUrl: '#'
          },
          ...paymentHistory
        ]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Subscription payment failed');
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Monthly Platform Fee & Subscription
          </h1>
          <p className="text-xs text-slate-500">
            Monthly platform access fee (₹500 / month) for corporate listing, investor syndicate syndication, and escrow services.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setPaymentSuccess(false);
            setIsPayModalOpen(true);
          }}
          className="text-xs font-bold shadow-md shadow-[#DE8E0A]/20"
        >
          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
          Pay Platform Fee (₹500)
        </Button>
      </div>

      {/* Main Status Banner */}
      <Card className="p-6 bg-gradient-to-r from-[#FFFDF7] via-white to-[#FFF9ED] border border-[#EFE8D8] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#DE8E0A]/10 text-[#DE8E0A] flex items-center justify-center flex-shrink-0">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Corporate Portal Active Plan
                </h3>
                {isSubscribed ? (
                  <Badge variant="success">Active / In Good Standing</Badge>
                ) : (
                  <Badge variant="neutral">Pending Activation</Badge>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Company: <strong>{company?.businessName || 'Company Portal'}</strong> • CIN / Registration Verified
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Current Billing Cycle: <strong>{currentMonthName}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Next Due Date: <strong>{nextBillingDateFormatted}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Highlight Pill */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Monthly Fee
              </div>
              <div className="text-2xl font-black text-slate-900 font-display">
                ₹{subscriptionAmount} <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPaymentSuccess(false);
                setIsPayModalOpen(true);
              }}
              className="text-xs font-bold"
            >
              Pay Now
            </Button>
          </div>
        </div>
      </Card>

      {/* Included Platform Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Live Investor Syndication</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Publish and manage capital offerings with active discovery by accredited individual & institutional investors.
          </p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#DE8E0A]/10 text-[#DE8E0A] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Direct Compliance & Trustee Reporting</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Verified corporate bank reconciliation, regulatory compliance reporting, and automated payout disbursement ledgers.
          </p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">GST Invoice & Tax Reports</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Instant automated GST tax invoices generated each billing month for corporate accounting deductions.
          </p>
        </Card>
      </div>

      {/* Payment History & Monthly Invoices Table */}
      <Card className="p-0 overflow-hidden bg-white border border-slate-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Subscription Payment History
            </h3>
            <p className="text-[11px] text-slate-500">
              Verified monthly platform fee transaction receipts and GST invoices.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFDF7] text-slate-500 uppercase tracking-wider border-b border-[#F2EBD9]">
              <tr>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Billing Month</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Paid On</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paymentHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    {loadingHistory ? 'Loading subscription history...' : 'No subscription payments recorded yet. Click Pay Now above to activate.'}
                  </td>
                </tr>
              ) : (
                paymentHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-mono font-bold text-slate-800">{item.id}</td>
                    <td className="p-4 font-medium text-slate-700">{item.month}</td>
                    <td className="p-4 font-black text-slate-900 font-display">₹{item.amount}</td>
                    <td className="p-4 text-slate-600">{item.method}</td>
                    <td className="p-4 text-slate-500">{item.paidOn}</td>
                    <td className="p-4">
                      <Badge variant={item.status === 'Paid' ? 'success' : 'neutral'}>{item.status}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Downloading GST Invoice ${item.id} for ₹${item.amount}`)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DE8E0A] hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pay Platform Fee Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 relative">
            {paymentSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Payment Successful!</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  ₹500 has been paid successfully for {currentMonthName}. Your platform listing and privileges are active.
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setIsPayModalOpen(false)}
                  className="font-bold text-xs"
                >
                  Done
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Pay Monthly Platform Fee
                    </h3>
                    <p className="text-xs text-slate-500">Billing Cycle: {currentMonthName}</p>
                  </div>
                  <button
                    onClick={() => setIsPayModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Amount Summary */}
                <div className="bg-[#FFFDF7] border border-[#F2EBD9] p-4 rounded-xl flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-slate-600 font-semibold">Monthly Platform Access Fee</div>
                    <div className="text-[11px] text-slate-400">Includes all portal tools & investor sync</div>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-display">₹{subscriptionAmount}</div>
                </div>

                {/* Method selector */}
                <div className="space-y-2 mb-6">
                  <label className="text-xs font-bold text-slate-700">Choose Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('upi')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        selectedMethod === 'upi'
                          ? 'border-[#DE8E0A] bg-[#FFFDF7] text-[#DE8E0A]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      UPI / QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        selectedMethod === 'card'
                          ? 'border-[#DE8E0A] bg-[#FFFDF7] text-[#DE8E0A]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('netbanking')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        selectedMethod === 'netbanking'
                          ? 'border-[#DE8E0A] bg-[#FFFDF7] text-[#DE8E0A]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      Net Banking
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setIsPayModalOpen(false)}
                    className="font-bold text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleRazorpayPayment}
                    disabled={paying}
                    className="font-bold text-xs"
                  >
                    {paying ? 'Processing ₹500...' : 'Pay ₹500 Now'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
