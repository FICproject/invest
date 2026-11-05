import { Subscription } from '../models/Subscription.js';
import { InvestorProfile } from '../models/InvestorProfile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import { getSubscriptionFeeConfig } from '../services/configService.js';

// @route   GET /api/investor/subscription
// @desc    Get subscription status and payment history for logged-in investor
export const getInvestorSubscription = asyncHandler(async (req, res) => {
  const investorUser = req.user;
  const investorProfile = await InvestorProfile.findOne({
    $or: [{ userId: investorUser._id }, { email: investorUser.email }]
  });

  const query = {
    $or: [
      { userId: investorUser._id },
      { subscriberEmail: investorUser.email },
      ...(investorProfile ? [{ investorId: investorProfile._id }] : [])
    ]
  };

  const history = await Subscription.find(query).sort({ paymentDate: -1 });

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const activeSubscription = history.find(s => s.status === 'Paid' && s.billingMonth === currentMonth);

  const feeConfig = await getSubscriptionFeeConfig();
  const investorFee = feeConfig.investorFee;

  res.status(200).json({
    success: true,
    data: {
      isSubscribed: !!activeSubscription,
      currentPlan: {
        name: 'Investor Membership Plan',
        amount: investorFee,
        billingCycle: 'Monthly',
        billingMonth: currentMonth
      },
      history
    }
  });
});

// @route   POST /api/investor/subscription/create-order
// @desc    Create Razorpay Order for monthly investor subscription
export const createInvestorSubscriptionOrder = asyncHandler(async (req, res) => {
  const investorUser = req.user;
  const investorProfile = await InvestorProfile.findOne({
    $or: [{ userId: investorUser._id }, { email: investorUser.email }]
  });

  const billingMonth = req.body.billingMonth || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // 1. Prevent duplicate billing/payments if already subscribed for this month
  const existingSub = await Subscription.findOne({
    $or: [
      { userId: investorUser._id },
      { subscriberEmail: investorUser.email },
      ...(investorProfile ? [{ investorId: investorProfile._id }] : [])
    ],
    billingMonth,
    status: 'Paid'
  });

  if (existingSub) {
    throw new ApiError(400, `Subscription for ${billingMonth} is already active and paid. Duplicate payment is not allowed.`);
  }

  const feeConfig = await getSubscriptionFeeConfig();
  const investorFee = feeConfig.investorFee;
  const amountPaise = investorFee * 100;

  const rzpOrder = await createRazorpayOrder({
    amountPaise,
    currency: 'INR',
    receipt: `rcpt_inv_sub_${Date.now()}`,
    notes: {
      subscriberType: 'investor',
      investorId: investorProfile?._id?.toString() || '',
      investorName: investorUser.name,
      billingMonth
    }
  });

  res.status(201).json({
    success: true,
    message: 'Investor subscription Razorpay order generated successfully.',
    data: {
      orderId: rzpOrder.orderId,
      amount: investorFee,
      amountPaise,
      currency: 'INR',
      keyId: rzpOrder.key,
      billingMonth,
      investorName: investorUser.name,
      simulated: rzpOrder.simulated || false
    }
  });
});

// @route   POST /api/investor/subscription/verify
// @desc    Verify Razorpay investor subscription payment and record invoice
export const verifyInvestorSubscription = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, paymentMethod } = req.body;
  const investorUser = req.user;
  const investorProfile = await InvestorProfile.findOne({
    $or: [{ userId: investorUser._id }, { email: investorUser.email }]
  });

  // 1. Check idempotency: If paymentId / transactionRef or orderId already verified, return existing record
  const effectiveRef = paymentId || `ORDER_${orderId}`;
  if (paymentId) {
    const alreadyProcessed = await Subscription.findOne({ transactionRef: paymentId });
    if (alreadyProcessed) {
      return res.status(200).json({
        success: true,
        message: 'Subscription payment was already recorded.',
        data: alreadyProcessed
      });
    }
  }

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // 2. Prevent duplicate active subscription for the current billing cycle
  const existingActive = await Subscription.findOne({
    $or: [
      { userId: investorUser._id },
      { subscriberEmail: investorUser.email },
      ...(investorProfile ? [{ investorId: investorProfile._id }] : [])
    ],
    billingMonth: currentMonth,
    status: 'Paid'
  });

  if (existingActive) {
    return res.status(200).json({
      success: true,
      message: `Subscription for ${currentMonth} is already paid.`,
      data: existingActive
    });
  }

  if (signature) {
    const isValid = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature
    });
    if (!isValid) {
      throw new ApiError(400, 'Invalid payment signature. Razorpay verification failed.');
    }
  }

  const feeConfig = await getSubscriptionFeeConfig();
  const investorFee = feeConfig.investorFee;

  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  const invoiceNumber = `INV-INV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

  const subscription = await Subscription.create({
    subscriberType: 'investor',
    investorId: investorProfile?._id || null,
    userId: investorUser._id,
    subscriberName: investorUser.name || 'Investor Subscriber',
    subscriberEmail: investorUser.email,
    subscriberMobile: investorUser.mobile || '',
    planName: 'Investor Membership Plan',
    amount: investorFee,
    amountPaise: investorFee * 100,
    billingCycle: 'Monthly',
    billingMonth: currentMonth,
    paymentDate: new Date(),
    nextDueDate,
    status: 'Paid',
    transactionRef: paymentId || `RZP-PAY-${Date.now().toString().slice(-8)}`,
    paymentMethod: paymentMethod || 'UPI',
    invoiceNumber,
    notes: `Paid via Razorpay. Order: ${orderId}`
  });

  res.status(200).json({
    success: true,
    message: 'Subscription payment verified and recorded successfully.',
    data: subscription
  });
});
