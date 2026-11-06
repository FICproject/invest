import mongoose from 'mongoose';

/**
 * ReturnPayment Schema
 * Tracks each monthly return cycle payment from company to platform,
 * and onward disbursement tracking to investor.
 */
const returnPaymentSchema = new mongoose.Schema(
  {
    returnAgreementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReturnAgreement',
      required: true,
      index: true
    },
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      required: true,
      index: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    paymentPeriod: {
      type: String, // e.g. "Month 1 (Dec 2026)"
      required: true
    },
    cycleNumber: {
      type: Number,
      required: true
    },
    dueDate: {
      type: Date,
      required: true,
      index: true
    },
    amountDue: {
      type: Number,
      required: true
    },
    amountDuePaise: {
      type: Number,
      required: true
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    amountPaidPaise: {
      type: Number,
      default: 0
    },
    // Company Payment via Razorpay
    razorpayOrderId: {
      type: String,
      default: null,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true
    },
    razorpaySignature: {
      type: String,
      default: null
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    paymentStatus: {
      type: String,
      enum: ['Upcoming', 'Due', 'Processing', 'Paid', 'Failed', 'Overdue', 'Partially Paid', 'Cancelled'],
      default: 'Upcoming',
      index: true
    },
    paidAt: {
      type: Date,
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    receiptReference: {
      type: String,
      default: null
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay Gateway'
    },
    failureReason: {
      type: String,
      default: null
    },
    // Investor Distribution Status Tracking
    // Clearly distinguishes: Paid by Company | Received by Platform | Disbursed to Investor
    distributionStatus: {
      type: String,
      enum: ['Pending Collection', 'Received by Platform', 'Disbursed to Investor'],
      default: 'Pending Collection'
    },
    investorDisbursedAt: {
      type: Date,
      default: null
    },
    investorPayoutUtr: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const ReturnPayment =
  mongoose.models.ReturnPayment || mongoose.model('ReturnPayment', returnPaymentSchema);

