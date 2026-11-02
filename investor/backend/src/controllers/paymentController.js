import { Payment } from '../models/Payment.js';
import { InvestmentOffer } from '../models/InvestmentOffer.js';
import { Investment } from '../models/Investment.js';
import { Transaction } from '../models/Transaction.js';
import { Payout } from '../models/Payout.js';
import { Notification } from '../models/Notification.js';
import { KYC } from '../models/KYC.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @route   POST /api/payments/create-order
// @desc    Initiate investment payment order
export const createOrder = asyncHandler(async (req, res) => {
  const { offerId, amount, paymentMethod } = req.body;
  const investorId = req.user._id;

  if (!offerId || !amount) {
    throw new ApiError(400, 'Please provide investment offer ID and investment amount.');
  }

  const offer = await InvestmentOffer.findById(offerId);
  if (!offer) {
    throw new ApiError(404, 'Investment opportunity not found.');
  }

  const investAmount = Number(amount);
  if (isNaN(investAmount) || investAmount <= 0) {
    throw new ApiError(400, 'Invalid investment amount entered.');
  }

  if (investAmount < offer.minInvestment) {
    throw new ApiError(400, `Minimum investment for this opportunity is ₹${offer.minInvestment.toLocaleString('en-IN')}.`);
  }

  if (offer.maxInvestment && investAmount > offer.maxInvestment) {
    throw new ApiError(400, `Maximum investment limit is ₹${offer.maxInvestment.toLocaleString('en-IN')}.`);
  }

  // Check KYC status: PRD rule: "Do not allow investment actions that require KYC approval until the required verification is complete."
  const kyc = await KYC.findOne({ investorId });
  if (!kyc || kyc.status !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      code: 'KYC_REQUIRED',
      message: 'KYC Verification is required before you can execute an investment. Please complete and submit your KYC documents.',
      kycStatus: kyc ? kyc.status : 'NOT_STARTED'
    });
  }

  const orderId = 'ORD_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);

  const payment = await Payment.create({
    investorId,
    offerId,
    orderId,
    amount: investAmount,
    currency: 'INR',
    paymentMethod: paymentMethod || 'Net Banking',
    status: 'Created'
  });

  res.status(201).json({
    success: true,
    message: 'Payment order generated successfully.',
    data: {
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      offerTitle: offer.title,
      companyName: offer.companyName,
      returnRate: offer.returnRate,
      tenureMonths: offer.tenureMonths
    }
  });
});

// @route   POST /api/payments/verify
// @desc    Verify payment callback and create confirmed investment & ledger records
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, status } = req.body;
  const investorId = req.user._id;

  if (!orderId) {
    throw new ApiError(400, 'Payment Order ID is required for verification.');
  }

  const payment = await Payment.findOne({ orderId, investorId });
  if (!payment) {
    throw new ApiError(404, 'Payment order not found.');
  }

  if (status === 'Failed') {
    payment.status = 'Failed';
    payment.failureReason = 'Transaction cancelled or declined by issuing bank';
    await payment.save();

    await Transaction.create({
      investorId,
      title: 'Payment Failed',
      type: 'Investment',
      amount: payment.amount,
      status: 'Failed',
      referenceId: 'TXN_' + Date.now(),
      paymentMethod: payment.paymentMethod,
      description: 'Transaction was declined or cancelled.'
    });

    return res.status(400).json({
      success: false,
      message: 'Payment was unsuccessful or declined by your bank.'
    });
  }

  const offer = await InvestmentOffer.findById(payment.offerId);
  if (!offer) {
    throw new ApiError(404, 'Associated investment offer not found.');
  }

  // Calculate returns
  const principal = payment.amount;
  const annualRate = offer.returnRate;
  const tenureMonths = offer.tenureMonths;
  const totalInterest = Math.round((principal * annualRate * (tenureMonths / 12)) / 100);
  const totalMaturity = principal + totalInterest;

  const startDate = new Date();
  const maturityDate = new Date();
  maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

  // 1. Create Investment record
  const investment = await Investment.create({
    investorId,
    offerId: offer._id,
    amountInvested: principal,
    returnRate: annualRate,
    tenureMonths,
    expectedReturns: totalMaturity,
    returnsReceived: 0,
    startDate,
    maturityDate,
    status: 'Confirmed',
    payoutFrequency: offer.payoutFrequency
  });

  // 2. Update offer raised amount
  offer.raisedAmount += principal;
  if (offer.raisedAmount >= offer.targetAmount) {
    offer.status = 'Fully Funded';
  }
  await offer.save();

  // 3. Update payment status
  payment.status = 'Success';
  payment.paymentId = paymentId || 'PAY_' + Date.now();
  await payment.save();

  // 4. Create confirmed transaction record
  const txnRef = 'TXN_' + Math.floor(100000000 + Math.random() * 900000000);
  await Transaction.create({
    investorId,
    investmentId: investment._id,
    title: `Investment in ${offer.companyName}`,
    type: 'Investment',
    amount: principal,
    status: 'Confirmed',
    referenceId: txnRef,
    paymentMethod: payment.paymentMethod,
    description: `Allocated into ${offer.title} (${annualRate}% p.a. for ${tenureMonths} Months)`
  });

  // 5. Generate monthly scheduled payout records
  const monthlyReturnAmount = Math.round(totalInterest / tenureMonths);
  for (let m = 1; m <= tenureMonths; m++) {
    const payoutDate = new Date(startDate);
    payoutDate.setMonth(payoutDate.getMonth() + m);

    await Payout.create({
      investorId,
      investmentId: investment._id,
      offerTitle: offer.companyName,
      amount: m === tenureMonths ? monthlyReturnAmount + principal : monthlyReturnAmount,
      payoutType: m === tenureMonths ? 'Maturity Payout' : 'Monthly Interest',
      scheduledDate: payoutDate,
      status: 'Scheduled'
    });
  }

  // 6. Create congratulatory notification
  await Notification.create({
    investorId,
    title: 'Investment Confirmed!',
    message: `Your investment of ₹${principal.toLocaleString('en-IN')} in ${offer.companyName} is confirmed. Certificate ID: ${investment.certificateNumber}`,
    type: 'investment',
    link: '/investor/my-investments'
  });

  res.status(200).json({
    success: true,
    message: 'Investment confirmed successfully! Funds allocated and payout schedule initialized.',
    data: {
      investmentId: investment._id,
      certificateNumber: investment.certificateNumber,
      amountInvested: principal,
      expectedReturns: totalMaturity,
      maturityDate,
      transactionRef: txnRef
    }
  });
});
