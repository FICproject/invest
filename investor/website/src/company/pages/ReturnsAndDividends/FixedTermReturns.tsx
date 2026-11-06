import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Loader, Modal } from '../../components/common';
import { returnService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { RazorpayCheckoutModal } from '../../../investor/components/payment/RazorpayCheckoutModal';
import {
  Coins,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  FileText,
  CreditCard,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export const FixedTermReturns: React.FC = () => {
  const { company } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [activeAgreementSchedule, setActiveAgreementSchedule] = useState<any>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  // Razorpay Checkout State
  const [activeCheckoutOrder, setActiveCheckoutOrder] = useState<any>(null);
  const [payingPaymentId, setPayingPaymentId] = useState<string | null>(null);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  const fetchReturnsData = async () => {
    try {
      const [overviewRes, agreementsRes] = await Promise.all([
        returnService.getOverview(),
        returnService.getAgreements()
      ]);
      if (overviewRes?.success) setOverview(overviewRes.data);
      if (agreementsRes?.success) setAgreements(agreementsRes.data || []);
    } catch (err) {
      console.error('[FixedTermReturns] Error loading returns data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReturnsData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReturnsData();
  };

  const handleViewSchedule = async (agreementId: string) => {
    try {
      setLoadingSchedule(true);
      setScheduleModalOpen(true);
      const res = await returnService.getSchedule(agreementId);
      if (res?.success) {
        setActiveAgreementSchedule(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load return schedule');
      setScheduleModalOpen(false);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleViewReceipt = async (paymentId: string) => {
    try {
      setLoadingReceipt(true);
      setReceiptModalOpen(true);
      const res = await returnService.getReceipt(paymentId);
      if (res?.success) {
        setReceiptData(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Receipt not available');
      setReceiptModalOpen(false);
    } finally {
      setLoadingReceipt(false);
    }
  };

  // Initiate Pay Now via Razorpay
  const handleInitiatePayment = async (returnPaymentId: string, agreementTitle?: string) => {
    try {
      setPayingPaymentId(returnPaymentId);
      const res = await returnService.createOrder(returnPaymentId);
      const orderData = res?.data;

      if (!orderData || !orderData.orderId) {
        throw new Error('Failed to initiate Razorpay order.');
      }

      // Check if live window.Razorpay SDK is available
      if (
        typeof window !== 'undefined' &&
        (window as any).Razorpay &&
        !orderData.simulated &&
        orderData.keyId &&
        !orderData.keyId.includes('placeholder')
      ) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: 'INR',
          name: 'Connect Invest',
          description: `Monthly Return - ${orderData.paymentPeriod}`,
          order_id: orderData.orderId,
          prefill: {
            name: (company as any)?.legalName || (company as any)?.name || '',
            email: (company as any)?.officialEmail || '',
            contact: (company as any)?.officialPhone || ''
          },
          theme: { color: '#0F1E36' },
          handler: async function (response: any) {
            await handlePaymentVerificationSuccess(returnPaymentId, orderData.orderId, response);
          },
          modal: {
            ondismiss: function () {
              setPayingPaymentId(null);
            }
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Open the test/simulated modal
        setActiveCheckoutOrder({
          ...orderData,
          returnPaymentId,
          title: `Monthly Return - ${orderData.paymentPeriod}`,
          companyName: (company as any)?.legalName || (company as any)?.name || 'Borrower Company'
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Payment initiation failed');
      setPayingPaymentId(null);
    }
  };

  const handlePaymentVerificationSuccess = async (returnPaymentId: string, orderId: string, response: any) => {
    try {
      const verifyRes = await returnService.verifyPayment({
        returnPaymentId,
        orderId: response.razorpay_order_id || orderId,
        paymentId: response.razorpay_payment_id || response.paymentId || `pay_sim_${Date.now()}`,
        signature: response.razorpay_signature || response.signature || 'test_sig',
        paymentMethod: response.paymentMethod || 'Razorpay Gateway'
      });

      if (verifyRes?.success) {
        setPaymentSuccessToast(`Payment of ₹${verifyRes.data?.payment?.amountPaid?.toLocaleString('en-IN')} confirmed! Ref: ${verifyRes.data?.receiptReference}`);
        setActiveCheckoutOrder(null);
        setPayingPaymentId(null);
        // Refresh data
        await fetchReturnsData();
        // If schedule modal was open, refresh it as well
        if (activeAgreementSchedule?.agreement?._id) {
          const updatedScheduleRes = await returnService.getSchedule(activeAgreementSchedule.agreement._id);
          if (updatedScheduleRes?.success) setActiveAgreementSchedule(updatedScheduleRes.data);
        }
      }
    } catch (vErr: any) {
      alert(vErr.response?.data?.message || 'Payment verification failed');
      setPayingPaymentId(null);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) return <Loader text="Loading Returns Management System..." />;

  const metrics = overview?.metrics || {
    totalInvestmentReceived: 0,
    agreedMonthlyReturnAmount: 0,
    monthlyReturnRate: 0,
    totalReturnsPaid: 0,
    upcomingReturns: 0,
    pendingReturns: 0,
    overdueReturns: 0,
    nextPaymentDueDate: null
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {paymentSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{paymentSuccessToast}</span>
          </div>
          <button
            onClick={() => setPaymentSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            Returns Management
            <Badge variant="brand">Fixed-Term Agreement</Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your contractual monthly return obligations, view agreement schedules, and disburse scheduled returns securely via Razorpay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 8 Dynamic Summary Cards (Section 2.A) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Investment Amount Received */}
        <Card className="p-4 border-l-4 border-l-brand-600 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Capital Received</span>
            <ArrowDownLeft className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-display">
            {formatINR(metrics.totalInvestmentReceived)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Approved & disbursed</span>
        </Card>

        {/* Agreed Monthly Return Amount */}
        <Card className="p-4 border-l-4 border-l-[#F4B41A] bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Agreed Monthly Return</span>
            <Coins className="w-4 h-4 text-[#DE8E0A]" />
          </div>
          <div className="text-xl font-black text-slate-900 font-display">
            {formatINR(metrics.agreedMonthlyReturnAmount)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Combined monthly cycle</span>
        </Card>

        {/* Monthly Return Rate */}
        <Card className="p-4 border-l-4 border-l-indigo-500 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Monthly Return Rate</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-700 font-display">
            {metrics.monthlyReturnRate}% / mo
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">As per approved agreements</span>
        </Card>

        {/* Total Returns Paid */}
        <Card className="p-4 border-l-4 border-l-emerald-500 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Returns Paid</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 font-display">
            {formatINR(metrics.totalReturnsPaid)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Disbursed successfully</span>
        </Card>

        {/* Upcoming Returns */}
        <Card className="p-4 border-l-4 border-l-sky-500 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Upcoming Returns</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-700 font-display">
            {formatINR(metrics.upcomingReturns)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Scheduled upcoming cycles</span>
        </Card>

        {/* Pending Returns */}
        <Card className="p-4 border-l-4 border-l-amber-500 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Pending Returns (Due)</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700 font-display">
            {formatINR(metrics.pendingReturns)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Payment due now</span>
        </Card>

        {/* Overdue Returns */}
        <Card className="p-4 border-l-4 border-l-rose-500 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overdue Returns</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-700 font-display">
            {formatINR(metrics.overdueReturns)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Grace period exceeded</span>
        </Card>

        {/* Next Payment Due Date */}
        <Card className="p-4 border-l-4 border-l-purple-500 bg-white">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Next Payment Due Date</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-black text-purple-900 font-display">
            {formatDate(metrics.nextPaymentDueDate)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Upcoming cycle deadline</span>
        </Card>
      </div>

      {/* Investment-wise Returns Table (Section 2.B) */}
      <Card className="overflow-hidden bg-white shadow-sm border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Investment-wise Return Agreements
            </h2>
            <p className="text-xs text-slate-500">
              Contractual obligations are isolated per investment agreement. Do not combine terms across different agreements.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {agreements.length} Active Agreement{agreements.length === 1 ? '' : 's'}
          </Badge>
        </div>

        {agreements.length === 0 ? (
          <div className="p-12 text-center">
            <Coins className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Return Obligations Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Return schedules activate automatically when Admin disburses approved investment funds to your verified corporate bank account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Investment ID</th>
                  <th className="p-3.5">Investor</th>
                  <th className="p-3.5">Amount Received</th>
                  <th className="p-3.5">Agreed Rate</th>
                  <th className="p-3.5">Monthly Amount</th>
                  <th className="p-3.5">Disbursement Date</th>
                  <th className="p-3.5">Next Due Date</th>
                  <th className="p-3.5">Total Paid</th>
                  <th className="p-3.5">Outstanding</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {agreements.map((agr) => {
                  const hasPayable = agr.activePayablePaymentId && (agr.activePayableStatus === 'Due' || agr.activePayableStatus === 'Overdue' || agr.activePayableStatus === 'Upcoming');
                  return (
                    <tr key={agr._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-brand-600 block">
                          {agr.agreementNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">
                          {agr.projectTitle}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-800 font-semibold">
                        {agr.investorName}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {formatINR(agr.amountReceived)}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="font-semibold text-brand-600 bg-brand-50/40">
                          {agr.agreedReturnRate}% / mo
                        </Badge>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-700">
                        {formatINR(agr.monthlyReturnAmount)}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {formatDate(agr.disbursementDate)}
                      </td>
                      <td className="p-3.5 text-slate-900 font-medium">
                        {formatDate(agr.nextDueDate)}
                      </td>
                      <td className="p-3.5 font-bold text-emerald-700">
                        {formatINR(agr.totalReturnsPaid)}
                      </td>
                      <td className="p-3.5 font-bold text-amber-700">
                        {formatINR(agr.outstandingAmount)}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            agr.status === 'Active'
                              ? 'success'
                              : agr.status === 'Completed'
                              ? 'brand'
                              : 'warning'
                          }
                        >
                          {agr.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSchedule(agr._id)}
                          className="text-[11px] py-1 px-2.5 h-auto font-semibold"
                        >
                          Schedule
                        </Button>
                        {hasPayable && (
                          <Button
                            size="sm"
                            disabled={payingPaymentId === agr.activePayablePaymentId}
                            onClick={() => handleInitiatePayment(agr.activePayablePaymentId, agr.projectTitle)}
                            className={`text-[11px] py-1 px-3 h-auto font-bold shadow-sm ${
                              agr.activePayableStatus === 'Overdue'
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'bg-[#DE8E0A] hover:bg-[#c27c08] text-white'
                            }`}
                          >
                            <CreditCard className="w-3 h-3 mr-1 inline" />
                            {payingPaymentId === agr.activePayablePaymentId ? 'Processing...' : 'Pay Now'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Monthly Return Schedule Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={activeAgreementSchedule ? `Monthly Return Schedule – ${activeAgreementSchedule.agreement?.agreementNumber}` : 'Return Schedule'}
      >
        {loadingSchedule ? (
          <div className="py-8">
            <Loader text="Loading schedule..." />
          </div>
        ) : activeAgreementSchedule ? (
          <div className="space-y-4 text-xs">
            {/* Agreement Terms Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Principal</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatINR(activeAgreementSchedule.agreement?.principalAmount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Monthly Rate</span>
                <span className="font-bold text-brand-600 text-sm">
                  {activeAgreementSchedule.agreement?.agreedMonthlyRate}% / mo
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Monthly Return</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {formatINR(activeAgreementSchedule.agreement?.monthlyReturnAmount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Tenure</span>
                <span className="font-bold text-slate-900 text-sm">
                  {activeAgreementSchedule.agreement?.tenureMonths} Months
                </span>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="max-h-[380px] overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Cycle / Period</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Amount Due</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeAgreementSchedule.schedule?.map((item: any) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-400">{item.cycleNumber}</td>
                      <td className="p-3 font-medium text-slate-800">{item.paymentPeriod}</td>
                      <td className="p-3 text-slate-600">{formatDate(item.dueDate)}</td>
                      <td className="p-3 font-bold text-slate-900">{formatINR(item.amountDue)}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            item.paymentStatus === 'Paid'
                              ? 'success'
                              : item.paymentStatus === 'Due'
                              ? 'warning'
                              : item.paymentStatus === 'Overdue'
                              ? 'danger'
                              : 'outline'
                          }
                        >
                          {item.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {item.paymentStatus === 'Paid' ? (
                          <button
                            onClick={() => handleViewReceipt(item._id)}
                            className="text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        ) : item.paymentStatus === 'Due' || item.paymentStatus === 'Overdue' || item.paymentStatus === 'Upcoming' ? (
                          <Button
                            size="sm"
                            disabled={payingPaymentId === item._id}
                            onClick={() => handleInitiatePayment(item._id, activeAgreementSchedule.agreement?.projectTitle)}
                            className="text-[10px] py-0.5 px-2.5 h-auto font-bold bg-[#DE8E0A] hover:bg-[#c27c08]"
                          >
                            Pay Now
                          </Button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Payment Receipt Modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Payment Receipt – Monthly Return"
      >
        {loadingReceipt ? (
          <div className="py-8">
            <Loader text="Generating receipt..." />
          </div>
        ) : receiptData ? (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Receipt Reference</span>
                <p className="font-mono font-bold text-slate-900 text-sm">{receiptData.receiptNumber}</p>
              </div>
              <Badge variant="success" className="text-xs">
                Paid & Verified
              </Badge>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Borrower Company</span>
                <span className="font-bold text-slate-800">{receiptData.company?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Agreement Reference</span>
                <span className="font-mono font-semibold text-slate-800">{receiptData.agreementNumber}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Period Paid</span>
                <span className="font-semibold text-slate-800">{receiptData.paymentPeriod} (Cycle #{receiptData.cycleNumber})</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Payment Date</span>
                <span className="text-slate-800">{formatDate(receiptData.paymentDate)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Razorpay Payment ID</span>
                <span className="font-mono text-slate-800">{receiptData.razorpayPaymentId}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-sm font-bold text-slate-900">Total Return Amount Paid</span>
                <span className="text-base font-black text-emerald-700 font-display">
                  {formatINR(receiptData.amount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                Print Receipt
              </Button>
              <Button size="sm" onClick={() => setReceiptModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Razorpay Test Mode Checkout Modal */}
      {activeCheckoutOrder && (
        <RazorpayCheckoutModal
          isOpen={!!activeCheckoutOrder}
          onClose={() => {
            setActiveCheckoutOrder(null);
            setPayingPaymentId(null);
          }}
          orderData={activeCheckoutOrder}
          onSuccess={(response: any) => {
            handlePaymentVerificationSuccess(
              activeCheckoutOrder.returnPaymentId,
              activeCheckoutOrder.orderId,
              response
            );
          }}
          onFailure={(error: any) => {
            console.warn('Payment failed or dismissed:', error);
            setPayingPaymentId(null);
          }}
        />
      )}
    </div>
  );
};
