import { Subscription } from '../models/Subscription.js';
import { Company } from '../models/Company.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import { getSubscriptionFeeConfig } from '../services/configService.js';

// @route   GET /api/company/subscription
// @desc    Get subscription status and history for logged-in company
export const getCompanySubscription = asyncHandler(async (req, res) => {
  const companyUser = req.user;
  const company = await Company.findOne({
    $or: [{ ownerId: companyUser._id }, { officialEmail: companyUser.email }]
  });

  const query = company
    ? { $or: [{ companyId: company._id }, { userId: companyUser._id }, { subscriberEmail: companyUser.email }] }
    : { userId: companyUser._id };

  const history = await Subscription.find(query).sort({ paymentDate: -1 });

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const activeSubscription = history.find(s => s.status === 'Paid' && s.billingMonth === currentMonth);

  const feeConfig = await getSubscriptionFeeConfig();
  const companyFee = feeConfig.companyFee;

  res.status(200).json({
    success: true,
    data: {
      isSubscribed: !!activeSubscription,
      currentPlan: {
        name: 'SaaS Platform License',
        amount: companyFee,
        billingCycle: 'Monthly',
        billingMonth: currentMonth
      },
      history
    }
  });
});

// @route   POST /api/company/subscription/create-order
// @desc    Create Razorpay Order for monthly platform subscription
export const createCompanySubscriptionOrder = asyncHandler(async (req, res) => {
  const companyUser = req.user;
  const company = await Company.findOne({
    $or: [{ ownerId: companyUser._id }, { officialEmail: companyUser.email }]
  });

  const feeConfig = await getSubscriptionFeeConfig();
  const companyFee = feeConfig.companyFee;
  const amountPaise = companyFee * 100;
  const billingMonth = req.body.billingMonth || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const rzpOrder = await createRazorpayOrder({
    amountPaise,
    currency: 'INR',
    receipt: `rcpt_sub_${Date.now()}`,
    notes: {
      subscriberType: 'company',
      companyId: company?._id?.toString() || '',
      companyName: company?.legalName || company?.name || companyUser.name,
      billingMonth
    }
  });

  res.status(201).json({
    success: true,
    message: 'Subscription Razorpay order generated successfully.',
    data: {
      orderId: rzpOrder.orderId,
      amount: companyFee,
      amountPaise,
      currency: 'INR',
      keyId: rzpOrder.key,
      billingMonth,
      companyName: company?.legalName || company?.name || companyUser.name,
      simulated: rzpOrder.simulated || false
    }
  });
});

// @route   POST /api/company/subscription/verify
// @desc    Verify Razorpay subscription payment and record invoice
export const verifyCompanySubscription = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, paymentMethod } = req.body;
  const companyUser = req.user;
  const company = await Company.findOne({
    $or: [{ ownerId: companyUser._id }, { officialEmail: companyUser.email }]
  });

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
  const companyFee = feeConfig.companyFee;

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

  const subscription = await Subscription.create({
    subscriberType: 'company',
    companyId: company?._id || null,
    userId: companyUser._id,
    subscriberName: company?.legalName || company?.name || companyUser.name || 'Company Subscriber',
    subscriberEmail: company?.officialEmail || companyUser.email,
    subscriberMobile: company?.officialPhone || companyUser.mobile || '',
    planName: 'SaaS Platform License',
    amount: companyFee,
    amountPaise: companyFee * 100,
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
