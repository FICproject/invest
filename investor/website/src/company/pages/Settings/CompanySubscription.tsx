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
import api from '../../services/api';
import { RazorpayCheckoutModal } from '../../../investor/components/payment/RazorpayCheckoutModal';

export const CompanySubscription: React.FC = () => {
  const { company } = useAuth();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [activeCheckoutOrder, setActiveCheckoutOrder] = useState<any>(null);

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
      const data = res.data?.data || res.data;
      if (data) {
        setIsSubscribed(Boolean(data.isSubscribed));
        if (data.currentPlan?.amount) {
          setSubscriptionAmount(data.currentPlan.amount);
        }
        const list = (data.history || []).map((s: any) => ({
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

      if (!orderData || !orderData.orderId) {
        throw new Error('Failed to create subscription order. Please try again.');
      }

      // 2. If real Razorpay SDK is available on window and valid test keys present
      if (typeof window !== 'undefined' && (window as any).Razorpay && !orderData.simulated && orderData.keyId && !orderData.keyId.includes('placeholder')) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: orderData.currency || 'INR',
          name: 'Connect Invest',
          description: `Platform Subscription - ${currentMonthName}`,
          order_id: orderData.orderId,
          prefill: {
            name: company?.legalName || company?.name || company?.businessName || '',
            email: company?.officialEmail || '',
            contact: company?.officialPhone || ''
          },
          theme: {
            color: '#0F1E36'
          },
          handler: async function (response: any) {
            await handleVerificationSuccess(orderData.orderId, response);
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
        // Open the visual Razorpay Checkout Test Mode Modal directly!
        setActiveCheckoutOrder({
          ...orderData,
          amount: subscriptionAmount || 500,
          title: `Corporate Platform Subscription - ${currentMonthName}`,
          companyName: company?.legalName || company?.name || company?.businessName || 'Corporate Portal'
        });
        setPaying(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Subscription payment initiation failed');
      setPaying(false);
    }
  };

  const handleVerificationSuccess = async (orderId: string, response: any) => {
    try {
      setPaying(true);
      const verifyRes = await api.post('/company/subscription/verify', {
        orderId: response.razorpay_order_id || orderId,
        paymentId: response.razorpay_payment_id || response.paymentId,
        signature: response.razorpay_signature || response.signature,
        paymentMethod: response.paymentMethod || 'Razorpay Gateway'
      });
      const invoice = verifyRes.data?.data;
      setPaymentSuccess(true);
      setIsSubscribed(true);
      fetchSubscriptionDetails();
      setTimeout(() => {
        setPaymentSuccess(false);
        setActiveCheckoutOrder(null);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment verification failed');
    } finally {
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
          onClick={handleRazorpayPayment}
          disabled={paying}
          className="text-xs font-bold shadow-md shadow-[#DE8E0A]/20"
        >
          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
          {paying ? 'Opening Gateway...' : `Pay Platform Fee (₹${subscriptionAmount})`}
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
              onClick={handleRazorpayPayment}
              disabled={paying}
              className="text-xs font-bold"
            >
              {paying ? 'Connecting...' : 'Pay Now'}
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

      {/* Success Notification Alert */}
      {paymentSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Payment of ₹{subscriptionAmount} successful via Razorpay! Your platform subscription is active.</span>
        </div>
      )}

      {/* Global Razorpay Test Mode Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={!!activeCheckoutOrder}
        onClose={() => {
          setActiveCheckoutOrder(null);
          setPaying(false);
        }}
        orderData={activeCheckoutOrder}
        onSuccess={(response) => {
          if (activeCheckoutOrder) {
            handleVerificationSuccess(activeCheckoutOrder.orderId, response);
          }
        }}
        onFailure={(err) => {
          alert('Razorpay Checkout failed: ' + (err.message || 'Payment not completed.'));
          setPaying(false);
        }}
      />
    </div>
  );
};
