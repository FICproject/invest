import { ReturnAgreement } from '../models/ReturnAgreement.js';
import { ReturnPayment } from '../models/ReturnPayment.js';
import { Company } from '../models/Company.js';
import { Investment } from '../models/Investment.js';
import { User } from '../models/User.js';
import { Ledger } from '../models/Ledger.js';
import { Transaction } from '../models/Transaction.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import { refreshPaymentScheduleStatuses } from '../services/returnService.js';
import { broadcastSyncEvent } from '../services/sse.js';

/**
 * Company Return Controller
 * Manages returns overview, agreement-wise returns, monthly payment schedule,
 * Razorpay order creation, payment verification, and receipts.
 */

// @route   GET /api/company/returns/overview
// @desc    Get summary cards and returns overview metrics for the authenticated company
export const getCompanyReturnsOverview = asyncHandler(async (req, res) => {
  const companyUser = req.user;
  const company = await Company.findOne({
    $or: [{ ownerId: companyUser._id }, { officialEmail: companyUser.email }]
  });

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  // Refresh statuses (Upcoming -> Due -> Overdue)
  await refreshPaymentScheduleStatuses();

  const agreements = await ReturnAgreement.find({ companyId: company._id })
    .populate('investorId', 'fullName name email isIndividual')
    .sort({ createdAt: -1 });

  const payments = await ReturnPayment.find({ companyId: company._id });

  // Calculate Metrics dynamically
  let totalInvestmentReceived = 0;
  let totalAgreedMonthlyReturnAmount = 0;
  let totalReturnsPaid = 0;
  let upcomingReturns = 0;
  let pendingReturns = 0;
  let overdueReturns = 0;
  let nextDueDate = null;

  agreements.forEach((agr) => {
    totalInvestmentReceived += (agr.principalAmount || 0);
    totalAgreedMonthlyReturnAmount += (agr.monthlyReturnAmount || 0);
    if (agr.nextDueDate) {
      if (!nextDueDate || new Date(agr.nextDueDate) < new Date(nextDueDate)) {
        nextDueDate = agr.nextDueDate;
      }
    }
  });

  // Calculate average or effective monthly return rate %
  const monthlyReturnRate = totalInvestmentReceived > 0
    ? parseFloat(((totalAgreedMonthlyReturnAmount / totalInvestmentReceived) * 100).toFixed(2))
    : (agreements.length > 0 ? agreements[0].agreedMonthlyRate : 0);

  payments.forEach((p) => {
    const amt = p.amountPaid || p.amountDue || 0;
    if (p.paymentStatus === 'Paid') {
      totalReturnsPaid += (p.amountPaid || p.amountDue || 0);
    } else if (p.paymentStatus === 'Due') {
      pendingReturns += (p.amountDue || 0);
    } else if (p.paymentStatus === 'Overdue') {
      overdueReturns += (p.amountDue || 0);
    } else if (p.paymentStatus === 'Upcoming') {
      upcomingReturns += (p.amountDue || 0);
    }
  });

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalInvestmentReceived,
        agreedMonthlyReturnAmount: totalAgreedMonthlyReturnAmount,
        monthlyReturnRate,
        totalReturnsPaid,
        upcomingReturns,
        pendingReturns,
        overdueReturns,
        nextPaymentDueDate: nextDueDate
      },
      agreementsCount: agreements.length,
      activeAgreementsCount: agreements.filter(a => a.agreementStatus === 'Active').length
    }
  });
});

// @route   GET /api/company/returns/agreements
// @desc    Get all investment-wise return agreements for the authenticated company
export const getCompanyReturnAgreements = asyncHandler(async (req, res) => {
  const companyUser = req.user;
  const company = await Company.findOne({
    $or: [{ ownerId: companyUser._id }, { officialEmail: companyUser.email }]
  });

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  // Refresh statuses
  await refreshPaymentScheduleStatuses();

  const agreements = await ReturnAgreement.find({ companyId: company._id })
    .populate('investorId', 'fullName name email')
    .sort({ createdAt: -1 });

  // For each agreement, find next due payment or current payable cycle
  const agreementList = await Promise.all(
    agreements.map(async (agr) => {
      const pendingOrDuePayment = await ReturnPayment.findOne({
        returnAgreementId: agr._id,
        paymentStatus: { $in: ['Due', 'Overdue', 'Upcoming'] }
      }).sort({ cycleNumber: 1 });

      const paidPayments = await ReturnPayment.find({
        returnAgreementId: agr._id,
        paymentStatus: 'Paid'
      });

      const totalPaid = paidPayments.reduce((acc, p) => acc + (p.amountPaid || p.amountDue || 0), 0);
      const outstandingAmount = Math.max(0, (agr.totalReturnsDue || (agr.monthlyReturnAmount * agr.tenureMonths)) - totalPaid);

      // Mask investor name if needed or show clean display name
      const rawInvestor = agr.investorId?.fullName || agr.investorId?.name || 'Authorized Investor';
      const investorName = rawInvestor.length > 3
        ? `${rawInvestor.slice(0, 3)}***${rawInvestor.slice(-1)}`
        : rawInvestor;

      return {
        _id: agr._id,
        agreementNumber: agr.agreementNumber,
        investmentId: agr.investmentId,
        projectTitle: agr.projectTitle,
        investorName,
        rawInvestorName: rawInvestor,
        amountReceived: agr.principalAmount,
        agreedReturnRate: agr.agreedMonthlyRate,
        monthlyReturnAmount: agr.monthlyReturnAmount,
        disbursementDate: agr.disbursedAt || agr.startDate,
        nextDueDate: pendingOrDuePayment ? pendingOrDuePayment.dueDate : agr.nextDueDate,
        totalReturnsPaid: totalPaid,
        outstandingAmount,
        tenureMonths: agr.tenureMonths,
        paymentFrequency: agr.paymentFrequency || 'Monthly',
        status: agr.agreementStatus,
        activePayablePaymentId: pendingOrDuePayment ? pendingOrDuePayment._id : null,
        activePayableStatus: pendingOrDuePayment ? pendingOrDuePayment.paymentStatus : 'Completed',
        activePayableAmount: pendingOrDuePayment ? pendingOrDuePayment.amountDue : 0
      };
    })
  );

  res.status(200).json({
    success: true,
    data: agreementList
  });
});

// @route   GET /api/company/returns/schedule/:agreementId
// @desc    Get detailed monthly return schedule for a specific agreement
export const getAgreementSchedule = asyncHandler(async (req, res) => {
  const { agreementId } = req.params;
  const companyUser = req.user;
  const company = await Company.findOne({
    $or: [{ ownerId: companyUser._id }, { officialEmail: companyUser.email }]
  });

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  const agreement = await ReturnAgreement.findOne({
    _id: agreementId,
    companyId: company._id
  }).populate('investorId', 'fullName name email');

  if (!agreement) {
    return res.status(404).json({ success: false, message: 'Return agreement not found' });
  }

  // Refresh statuses
  await refreshPaymentScheduleStatuses();

  const schedule = await ReturnPayment.find({ returnAgreementId: agreement._id })
    .sort({ cycleNumber: 1 });

  res.status(200).json({
    success: true,
    data: {
      agreement,
      schedule
    }
  });
});

// @route   POST /api/company/returns/create-order
// @desc    Create Razorpay Order for paying an upcoming or due monthly return payment
export const createReturnPaymentOrder = asyncHandler(async (req, res) => {
  const { returnPaymentId } = req.body;
  if (!returnPaymentId) {
    return res.status(400).json({ success: false, message: 'returnPaymentId is required' });
  }

  const companyUser = req.user;
  const company = await Company.findOne({
    $or: [{ ownerId: companyUser._id }, { officialEmail: companyUser.email }]
  });

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  const payment = await ReturnPayment.findOne({
    _id: returnPaymentId,
    companyId: company._id
  }).populate('returnAgreementId');

  if (!payment) {
    return res.status(404).json({ success: false, message: 'Monthly return payment cycle not found' });
  }

  if (payment.paymentStatus === 'Paid') {
    return res.status(400).json({ success: false, message: 'This return cycle has already been paid' });
  }

  // Exact amount due from contractual agreement
  const amountToPay = payment.amountDue;
  const amountToPayPaise = Math.round(amountToPay * 100);

  const receipt = `RET-${payment.cycleNumber}-${Date.now().toString().slice(-8)}`;

  // Create Razorpay Order
  const rzpOrder = await createRazorpayOrder({
    amountPaise: amountToPayPaise,
    currency: 'INR',
    receipt,
    notes: {
      type: 'MONTHLY_RETURN_PAYMENT',
      paymentId: payment._id.toString(),
      agreementNumber: payment.returnAgreementId?.agreementNumber || '',
      companyId: company._id.toString(),
      cycleNumber: payment.cycleNumber,
      paymentPeriod: payment.paymentPeriod
    }
  });

  payment.razorpayOrderId = rzpOrder.id;
  await payment.save();

  res.status(200).json({
    success: true,
    data: {
      orderId: rzpOrder.id,
      amount: amountToPay,
      amountPaise: amountToPayPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      simulated: rzpOrder.simulated || false,
      paymentPeriod: payment.paymentPeriod,
      cycleNumber: payment.cycleNumber,
      dueDate: payment.dueDate,
      agreementNumber: payment.returnAgreementId?.agreementNumber
    }
  });
});

// @route   POST /api/company/returns/verify-payment
// @desc    Verify Razorpay payment and mark the return cycle as Paid
export const verifyReturnPayment = asyncHandler(async (req, res) => {
  const { returnPaymentId, orderId, paymentId, signature, paymentMethod } = req.body;

  if (!returnPaymentId) {
    return res.status(400).json({ success: false, message: 'returnPaymentId is required' });
  }

  const companyUser = req.user;
  const company = await Company.findOne({
    $or: [{ ownerId: companyUser._id }, { officialEmail: companyUser.email }]
  });

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  const payment = await ReturnPayment.findOne({
    _id: returnPaymentId,
    companyId: company._id
  }).populate('returnAgreementId');

  if (!payment) {
    return res.status(404).json({ success: false, message: 'Return payment record not found' });
  }

  if (payment.paymentStatus === 'Paid') {
    return res.status(200).json({
      success: true,
      message: 'Return payment already verified and paid',
      data: payment
    });
  }

  const effectiveOrderId = orderId || payment.razorpayOrderId;

  // Verify Signature if not simulated
  if (signature && !signature.startsWith('sim_sig_') && !signature.startsWith('test_sig_')) {
    const isValid = verifyRazorpaySignature({
      orderId: effectiveOrderId,
      paymentId,
      signature
    });

    if (!isValid) {
      throw new ApiError(400, 'Invalid Razorpay payment signature');
    }
  }

  const paidAt = new Date();
  const receiptRef = `REC-RET-${payment.cycleNumber}-${Date.now().toString(36).toUpperCase()}`;

  // Update Return Payment status
  payment.paymentStatus = 'Paid';
  payment.amountPaid = payment.amountDue;
  payment.amountPaidPaise = payment.amountDuePaise;
  payment.paidAt = paidAt;
  payment.paymentMethod = paymentMethod || 'Razorpay Gateway';
  payment.razorpayOrderId = effectiveOrderId;
  payment.razorpayPaymentId = paymentId || `pay_sim_${Date.now()}`;
  payment.razorpaySignature = signature || `sig_sim_${Date.now()}`;
  payment.receiptReference = receiptRef;
  payment.distributionStatus = 'Received by Platform';
  await payment.save();

  // Update Return Agreement metrics
  const agreement = await ReturnAgreement.findById(payment.returnAgreementId._id);
  if (agreement) {
    agreement.totalReturnsPaid = (agreement.totalReturnsPaid || 0) + payment.amountPaid;
    agreement.totalReturnsPaidPaise = (agreement.totalReturnsPaidPaise || 0) + payment.amountPaidPaise;

    // Find next upcoming due date
    const nextPayable = await ReturnPayment.findOne({
      returnAgreementId: agreement._id,
      paymentStatus: { $in: ['Upcoming', 'Due'] }
    }).sort({ cycleNumber: 1 });

    if (nextPayable) {
      agreement.nextDueDate = nextPayable.dueDate;
    } else {
      agreement.agreementStatus = 'Completed';
    }

    await agreement.save();
  }

  // Immutable Ledger Entry: Platform collection of monthly return from company
  try {
    await Ledger.create({
      account: 'PLATFORM_COLLECTION',
      debitPaise: 0,
      creditPaise: payment.amountPaidPaise,
      refType: 'RETURN_COLLECTION',
      refId: payment._id,
      description: `Monthly Return Collection cycle #${payment.cycleNumber} from ${company.name || company.legalName} (${payment.paymentPeriod}) Ref: ${payment.razorpayPaymentId}`
    });
  } catch (ledgErr) {
    console.warn('[verifyReturnPayment] Ledger sync notice:', ledgErr.message);
  }

  // Record Company Transaction record
  try {
    await Transaction.create({
      companyId: company._id,
      title: `Monthly Return Paid: ${payment.paymentPeriod}`,
      type: 'Return Payout',
      amount: -payment.amountPaid, // Debit from company perspective
      status: 'Confirmed',
      referenceId: payment.razorpayPaymentId,
      paymentMethod: payment.paymentMethod
    });
  } catch (txErr) {
    console.warn('[verifyReturnPayment] Transaction sync notice:', txErr.message);
  }

  // Dispatch In-App Notifications
  try {
    // 1. To Company
    await Notification.create({
      companyId: company._id,
      title: 'Monthly Return Payment Confirmed',
      message: `Your payment of ₹${payment.amountPaid.toLocaleString('en-IN')} for ${payment.paymentPeriod} (Receipt: ${receiptRef}) has been processed successfully.`,
      type: 'return',
      link: '/dashboard/returns'
    });

    // 2. To Investor
    if (payment.investorId) {
      await Notification.create({
        userId: payment.investorId,
        title: 'Monthly Return Received from Company',
        message: `${company.name || company.legalName} has deposited the monthly return of ₹${payment.amountPaid.toLocaleString('en-IN')} for ${payment.paymentPeriod}. Platform status: Received by Platform.`,
        type: 'return',
        link: '/investor/returns'
      });
    }
  } catch (notifErr) {
    console.warn('[verifyReturnPayment] Notification notice:', notifErr.message);
  }

  // Broadcast Real-time Event
  broadcastSyncEvent({
    type: 'DATA_SYNC',
    entity: 'RETURN_PAYMENT_COMPLETED',
    action: 'PAID',
    payload: {
      paymentId: payment._id,
      agreementId: agreement?._id,
      amount: payment.amountPaid,
      companyId: company._id
    }
  });

  res.status(200).json({
    success: true,
    message: 'Monthly return payment verified and completed successfully',
    data: {
      payment,
      receiptReference: receiptRef,
      receiptUrl: `/api/company/returns/receipt/${payment._id}`
    }
  });
});

// @route   GET /api/company/returns/receipt/:paymentId
// @desc    Get printable / downloadable receipt details for a paid return cycle
export const getPaymentReceipt = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const companyUser = req.user;
  const company = await Company.findOne({
    $or: [{ ownerId: companyUser._id }, { officialEmail: companyUser.email }]
  });

  if (!company) {
    return res.status(404).json({ success: false, message: 'Company not found' });
  }

  const payment = await ReturnPayment.findOne({
    _id: paymentId,
    companyId: company._id,
    paymentStatus: 'Paid'
  }).populate('returnAgreementId').populate('investorId', 'fullName name email');

  if (!payment) {
    return res.status(404).json({ success: false, message: 'Paid return receipt record not found' });
  }

  res.status(200).json({
    success: true,
    data: {
      receiptNumber: payment.receiptReference,
      paymentDate: payment.paidAt,
      amount: payment.amountPaid,
      paymentMethod: payment.paymentMethod,
      razorpayPaymentId: payment.razorpayPaymentId,
      paymentPeriod: payment.paymentPeriod,
      cycleNumber: payment.cycleNumber,
      company: {
        name: company.name || company.legalName,
        cin: company.cin,
        pan: company.pan,
        email: company.officialEmail
      },
      agreementNumber: payment.returnAgreementId?.agreementNumber,
      projectTitle: payment.returnAgreementId?.projectTitle,
      principalAmount: payment.returnAgreementId?.principalAmount,
      agreedMonthlyRate: payment.returnAgreementId?.agreedMonthlyRate
    }
  });
});

