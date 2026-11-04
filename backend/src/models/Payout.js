import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const payoutSchema = new mongoose.Schema(
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
      default: 'return'
    },
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
    },
    offerTitle: {
      type: String,
      default: ''
    },
    amountPaise: {
      type: Number
    },
    amount: {
      type: Number
    },
    status: {
      type: String,
      default: 'Calculated'
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      default: null
    },
    bankRef: {
      type: String,
      default: null
    },
    utrNumber: {
      type: String,
      default: ''
    },
    scheduledDate: {
      type: Date
    },
    paidDate: {
      type: Date
    },
    bankAccountEnding: {
      type: String,
      default: '4210'
    },
    isHold: {
      type: Boolean,
      default: false
    },
    holdReason: {
      type: String,
      default: null
    },
    heldAt: {
      type: Date,
      default: null
    },
    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    autoPaid: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

payoutSchema.pre('save', function (next) {
  if (this.amount && !this.amountPaise) {
    this.amountPaise = Math.round(this.amount * 100);
  } else if (this.amountPaise && !this.amount) {
    this.amount = this.amountPaise / 100;
  }
  next();
});

export const Payout = mongoose.models.Payout || mongoose.model('Payout', payoutSchema);

