import { Payment } from '../models/Payment.js';
import { InvestmentOffer } from '../models/InvestmentOffer.js';
import { Investment } from '../models/Investment.js';
import { Transaction } from '../models/Transaction.js';
import { Payout } from '../models/Payout.js';
import { Notification } from '../models/Notification.js';
import { KYC } from '../models/KYC.js';
import { Company } from '../models/Company.js';
import { Release } from '../models/Release.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import { broadcastSyncEvent } from '../services/sse.js';

// @route   POST /api/payments/create-order
// @desc    Initiate investment payment order
export const createOrder = asyncHandler(async (req, res) => {
  let { offerId, amount, paymentMethod, investmentId } = req.body;
  const investorId = req.user._id;

  let existingInvestment = null;
  if (investmentId) {
    existingInvestment = await Investment.findById(investmentId);
    if (existingInvestment) {
      if (!offerId && existingInvestment.offerId) {
        offerId = existingInvestment.offerId;
      }
      if (!amount && (existingInvestment.amountInvested || existingInvestment.amount)) {
        amount = existingInvestment.amountInvested || existingInvestment.amount;
      }
    }
  }

  if (offerId && typeof offerId === 'object' && offerId._id) {
    offerId = offerId._id;
  }

  if (!offerId || !amount) {
    throw new ApiError(400, 'Please provide investment offer ID and investment amount.');
  }

  let offer = await InvestmentOffer.findById(offerId);
  if (!offer) {
    offer = await Company.model('Offer').findById(offerId).catch(() => null);
  }
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
  const isKycApproved = kyc && (kyc.status === 'Approved' || kyc.status === 'APPROVED');
  if (!isKycApproved) {
    return res.status(403).json({
      success: false,
      code: 'KYC_REQUIRED',
      message: 'KYC Verification is required before you can execute an investment. Please complete and submit your KYC documents.',
      kycStatus: kyc ? kyc.status : 'NOT_STARTED'
    });
  }

  // Check if target Company has active fundraising status
  if (offer.companyId) {
    const targetComp = await Company.findById(offer.companyId);
    if (targetComp) {
      if (targetComp.accountStatus === 'Suspended' || targetComp.accountStatus === 'Revoked') {
        return res.status(403).json({
          success: false,
          code: 'COMPANY_ACCOUNT_SUSPENDED',
          message: `Fundraising for this company is currently suspended by Platform Administration.${targetComp.accountSuspendedReason ? ' Reason: ' + targetComp.accountSuspendedReason : ''}`
        });
      }
      if (targetComp.fundingStatus === 'Suspended' || targetComp.fundingStatus === 'Revoked') {
        return res.status(403).json({
          success: false,
          code: 'COMPANY_FUNDING_SUSPENDED',
          message: `Fundraising for this company has been suspended by Platform Administration.${targetComp.fundingSuspendedReason ? ' Reason: ' + targetComp.fundingSuspendedReason : ''}`
        });
      }
    }
  }

  // Generate Razorpay Order
  const rzpOrder = await createRazorpayOrder({
    amountPaise: investAmount * 100,
    currency: 'INR',
    receipt: `rcpt_inv_${Date.now()}`,
    notes: {
      investorId: investorId.toString(),
      offerId: offer._id.toString(),
      offerTitle: offer.title,
      investmentId: investmentId ? investmentId.toString() : ''
    }
  });

  const orderId = rzpOrder.orderId;

  const payment = await Payment.create({
    investorId,
    offerId,
    investmentId: investmentId || null,
    orderId,
    razorpayOrderId: rzpOrder.orderId,
    amount: investAmount,
    currency: 'INR',
    paymentMethod: paymentMethod || 'Razorpay Gateway',
    status: 'Created'
  });

  res.status(201).json({
    success: true,
    message: 'Payment order generated successfully.',
    data: {
      orderId: payment.orderId,
      razorpayOrderId: rzpOrder.orderId,
      keyId: rzpOrder.key,
      amount: payment.amount,
      amountPaise: Math.round(payment.amount * 100),
      currency: payment.currency,
      offerTitle: offer.title,
      companyName: offer.companyName,
      returnRate: offer.returnRate,
      tenureMonths: offer.tenureMonths,
      simulated: rzpOrder.simulated || false
    }
  });
});

// @route   POST /api/payments/verify
// @desc    Verify payment callback and create confirmed investment & ledger records
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, razorpayOrderId, razorpayPaymentId, razorpaySignature, status } = req.body;
  const investorId = req.user._id;

  const effectiveOrderId = orderId || razorpayOrderId;
  const effectivePaymentId = paymentId || razorpayPaymentId;
  const effectiveSignature = signature || razorpaySignature;

  if (!effectiveOrderId) {
    throw new ApiError(400, 'Payment Order ID is required for verification.');
  }

  const payment = await Payment.findOne({
    $or: [{ orderId: effectiveOrderId }, { razorpayOrderId: effectiveOrderId }],
    investorId
  });
  if (!payment) {
    throw new ApiError(404, 'Payment order not found.');
  }

  // If Razorpay signature is passed, verify cryptographic hash
  if (effectiveSignature) {
    const isValid = verifyRazorpaySignature({
      orderId: effectiveOrderId,
      paymentId: effectivePaymentId,
      signature: effectiveSignature
    });
    if (!isValid) {
      payment.status = 'Failed';
      payment.failureReason = 'Razorpay signature verification failed';
      await payment.save();
      throw new ApiError(400, 'Invalid payment signature. Transaction security verification failed.');
    }
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
      paymentMethod: (payment.paymentMethod && ['Net Banking', 'UPI', 'Bank Transfer', 'Debit/Credit Card', 'Credit/Debit Card', 'Razorpay Gateway'].includes(payment.paymentMethod)) ? payment.paymentMethod : 'Net Banking',
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

  // 1. Update existing Investment record or create new
  const targetInvId = req.body.investmentId || payment.investmentId;
  let investment = null;
  if (targetInvId) {
    investment = await Investment.findById(targetInvId);
  }

  if (investment) {
    investment.status = 'Confirmed';
    investment.paymentStatus = 'Completed';
    investment.amountInvested = principal;
    investment.amount = principal;
    investment.amountPaise = Math.round(principal * 100);
    investment.returnRate = annualRate;
    investment.tenureMonths = tenureMonths;
    investment.expectedReturns = totalMaturity;
    investment.startDate = startDate;
    investment.maturityDate = maturityDate;
    if (!investment.certificateNumber) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      investment.certificateNumber = `CERT-${year}-${rand}`;
      investment.certificateNo = investment.certificateNumber;
    }
    await investment.save();
  } else {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    investment = await Investment.create({
      investorId,
      offerId: offer._id,
      amountInvested: principal,
      amount: principal,
      amountPaise: Math.round(principal * 100),
      returnRate: annualRate,
      tenureMonths,
      expectedReturns: totalMaturity,
      returnsReceived: 0,
      startDate,
      maturityDate,
      status: 'Confirmed',
      paymentStatus: 'Completed',
      certificateNumber: `CERT-${year}-${rand}`,
      certificateNo: `CERT-${year}-${rand}`,
      payoutFrequency: offer.payoutFrequency || 'Monthly'
    });
  }

  // 2. Update offer raised amount
  offer.raisedAmount += principal;
  if (offer.raisedAmount >= offer.targetAmount) {
    offer.status = 'Fully Funded';
  }
  await offer.save();

  // 3. Update payment status
  payment.status = 'Success';
  payment.paymentId = effectivePaymentId || 'PAY_' + Date.now();
  if (effectivePaymentId) payment.razorpayPaymentId = effectivePaymentId;
  if (effectiveSignature) payment.razorpaySignature = effectiveSignature;
  await payment.save();

  const validPaymentMethods = [
    'Net Banking',
    'UPI',
    'Bank Transfer',
    'Debit/Credit Card',
    'Credit/Debit Card',
    'Razorpay Gateway'
  ];
  const finalPaymentMethod = (payment.paymentMethod && validPaymentMethods.includes(payment.paymentMethod))
    ? payment.paymentMethod
    : 'Net Banking';

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
    paymentMethod: finalPaymentMethod,
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

  // 6. Create congratulatory notification for Investor
  await Notification.create({
    investorId,
    title: 'Investment Confirmed!',
    message: `Your investment of ₹${principal.toLocaleString('en-IN')} in ${offer.companyName} is confirmed. Certificate ID: ${investment.certificateNumber}`,
    type: 'investment',
    link: '/investor/my-investments'
  });

  // 7. PRD Flow: Forward funds to company via Admin Fund Release queue
  // When an investor pays for a project, a Release record is created in PREPARED status
  // so the Platform Administrator can review, verify, and forward/disburse the collected fund to the respective company.
  try {
    let targetCompany = null;
    if (offer.companyId) {
      targetCompany = await Company.findById(offer.companyId);
    }
    if (!targetCompany && offer.companyName) {
      targetCompany = await Company.findOne({
        $or: [
          { name: new RegExp(`^${offer.companyName.trim()}$`, 'i') },
          { legalName: new RegExp(`^${offer.companyName.trim()}$`, 'i') },
          { brandName: new RegExp(`^${offer.companyName.trim()}$`, 'i') }
        ]
      });
    }

    if (targetCompany) {
      // Find an admin user to attach
      const adminUser = await User.findOne({ role: 'admin' });

      const bankSnapshot = targetCompany.bankAccount || {
        holderName: targetCompany.bankDetails?.accountHolderName || targetCompany.name,
        accountNo: targetCompany.bankDetails?.accountNumber || 'Pending Account Details',
        ifsc: targetCompany.bankDetails?.ifscCode || 'N/A',
        bankName: targetCompany.bankDetails?.bankName || 'Company Bank'
      };

      const releaseRecord = await Release.create({
        investmentOfferId: offer._id,
        investmentId: investment._id,
        offerTitle: offer.title,
        companyName: targetCompany.name || offer.companyName,
        companyId: targetCompany._id,
        amountPaise: Math.round(principal * 100),
        amount: principal,
        investorName: req.user?.name || 'Investor',
        adminId: adminUser?._id || null,
        status: 'Prepared',
        bankAccountSnapshot: bankSnapshot
      });

      broadcastSyncEvent('release_created', {
        releaseId: releaseRecord._id,
        companyName: targetCompany.name,
        amount: principal
      });
    }
  } catch (releaseErr) {
    console.warn('[PaymentController] Fund release creation notice:', releaseErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Investment confirmed successfully! Funds received and queued for Admin disbursement to the company.',
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
