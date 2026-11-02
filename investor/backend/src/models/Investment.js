import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentOffer'
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentRequest'
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true
    },
    investmentModel: {
      type: String,
      enum: ['Fixed-Term', 'Equity']
    },
    investorName: {
      type: String
    },
    investorEmail: {
      type: String
    },
    amount: {
      type: Number
    },
    paymentStatus: {
      type: String,
      default: 'Committed'
    },
    allocationStatus: {
      type: String,
      default: 'Unallocated'
    },
    sharesAllocated: {
      type: Number,
      default: 0
    },
    sharePrice: {
      type: Number
    },
    equityPercentage: {
      type: Number
    },
    investedAt: {
      type: Date,
      default: Date.now
    },
    amountInvested: {
      type: Number
    },
    returnRate: {
      type: Number
    },
    tenureMonths: {
      type: Number
    },
    expectedReturns: {
      type: Number
    },
    returnsReceived: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    maturityDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Pending', 'Completed', 'Cancelled'],
      default: 'Confirmed'
    },
    payoutFrequency: {
      type: String,
      default: 'Monthly'
    },
    certificateNumber: {
      type: String,
      default: () => 'CI-CERT-' + Math.floor(100000 + Math.random() * 900000)
    }
  },
  { timestamps: true }
);

export const Investment = mongoose.model('Investment', investmentSchema);
