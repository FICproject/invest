import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const RepaymentSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    payoutDate: {
      type: Date,
      required: true
    },
    kind: {
      type: String,
      enum: ['return', 'principal'],
      required: true
    },
    expectedPaise: {
      type: Number,
      required: true
    },
    receivedPaise: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(Statuses.REPAYMENT),
      default: Statuses.REPAYMENT.UPCOMING
    },
    reference: {
      type: String, // Bank reference of receipt from company
      default: null
    },
    receivedAt: {
      type: Date,
      default: null
    },
    defaultReportedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Repayment = mongoose.model('Repayment', RepaymentSchema);
