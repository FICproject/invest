import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const dividendSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
    },
    financialYear: {
      type: String,
      required: true
    },
    declarationDate: {
      type: Date,
      default: Date.now
    },
    recordDate: {
      type: Date,
      required: true
    },
    payoutDate: {
      type: Date
    },
    dividendPerSharePaise: {
      type: Number
    },
    amountPerShare: {
      type: Number
    },
    totalPoolPaise: {
      type: Number
    },
    totalDividendAmount: {
      type: Number
    },
    dividendType: {
      type: String,
      default: 'Interim'
    },
    eligibleShareholdersCount: {
      type: Number,
      default: 0
    },
    boardResolutionRef: {
      type: String
    },
    approvalStatus: {
      type: String,
      default: 'Proposed'
    },
    disbursementStatus: {
      type: String,
      default: 'Pending'
    },
    status: {
      type: String,
      default: 'Declared'
    },
    bankRef: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

dividendSchema.pre('save', function (next) {
  if (this.amountPerShare && !this.dividendPerSharePaise) {
    this.dividendPerSharePaise = Math.round(this.amountPerShare * 100);
  } else if (this.dividendPerSharePaise && !this.amountPerShare) {
    this.amountPerShare = this.dividendPerSharePaise / 100;
  }

  if (this.totalDividendAmount && !this.totalPoolPaise) {
    this.totalPoolPaise = Math.round(this.totalDividendAmount * 100);
  } else if (this.totalPoolPaise && !this.totalDividendAmount) {
    this.totalDividendAmount = this.totalPoolPaise / 100;
  }
  next();
});

export const Dividend = mongoose.models.Dividend || mongoose.model('Dividend', dividendSchema);

