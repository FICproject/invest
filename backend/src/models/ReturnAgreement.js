import mongoose from 'mongoose';

/**
 * ReturnAgreement Schema
 * Tracks agreed monthly return obligations between a company and an investment agreement
 */
const returnAgreementSchema = new mongoose.Schema(
  {
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
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentRequest'
    },
    agreementNumber: {
      type: String,
      unique: true,
      required: true
    },
    projectTitle: {
      type: String,
      default: ''
    },
    principalAmount: {
      type: Number,
      required: true
    },
    principalAmountPaise: {
      type: Number,
      required: true
    },
    agreedMonthlyRate: {
      type: Number, // percentage, e.g. 2 for 2% per month
      required: true
    },
    monthlyReturnAmount: {
      type: Number,
      required: true
    },
    monthlyReturnAmountPaise: {
      type: Number,
      required: true
    },
    paymentFrequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Maturity'],
      default: 'Monthly'
    },
    tenureMonths: {
      type: Number,
      default: 12
    },
    startDate: {
      type: Date,
      required: true
    },
    maturityDate: {
      type: Date,
      required: true
    },
    nextDueDate: {
      type: Date,
      required: true
    },
    agreementStatus: {
      type: String,
      enum: ['Active', 'Completed', 'Defaulted', 'Cancelled'],
      default: 'Active',
      index: true
    },
    totalReturnsPaid: {
      type: Number,
      default: 0
    },
    totalReturnsPaidPaise: {
      type: Number,
      default: 0
    },
    totalReturnsDue: {
      type: Number,
      default: 0
    },
    totalReturnsDuePaise: {
      type: Number,
      default: 0
    },
    disbursementReference: {
      type: String,
      default: ''
    },
    disbursedAt: {
      type: Date,
      default: Date.now
    },
    approvedTerms: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const ReturnAgreement =
  mongoose.models.ReturnAgreement || mongoose.model('ReturnAgreement', returnAgreementSchema);

