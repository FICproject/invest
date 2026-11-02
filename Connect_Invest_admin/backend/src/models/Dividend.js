import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const DividendSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    financialYear: {
      type: String,
      required: true // e.g. "FY 2026-27"
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
      type: Number,
      required: true
    },
    totalPoolPaise: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(Statuses.DIVIDEND || {
        DECLARED: 'Declared',
        COLLECTED: 'Collected',
        BATCHED: 'Batched',
        PAID: 'Paid',
        CANCELLED: 'Cancelled'
      }),
      default: 'Declared'
    },
    bankRef: {
      type: String,
      default: null
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const Dividend = mongoose.model('Dividend', DividendSchema);

