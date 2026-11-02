import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const PayoutSchema = new mongoose.Schema(
  {
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      required: true
    },
    repaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repayment',
      default: null
    },
    dividendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dividend',
      default: null
    },
    payoutType: {
      type: String,
      enum: ['return', 'principal', 'dividend'],
      default: 'return'
    },
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    amountPaise: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(Statuses.PAYOUT),
      default: Statuses.PAYOUT.CALCULATED
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      default: null
    },
    bankRef: {
      type: String, // UTR or Bank payout reference
      default: null
    },
    failureReason: {
      type: String,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Payout = mongoose.model('Payout', PayoutSchema);
