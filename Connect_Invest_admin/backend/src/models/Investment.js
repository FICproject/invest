import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const InvestmentSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tenureMonths: {
      type: Number,
      default: null
    },
    amountPaise: {
      type: Number,
      required: true
    },
    monthlyReturnPaise: {
      type: Number,
      default: 0
    },
    // Equity Investment Fields
    sharesAllotted: {
      type: Number,
      default: 0
    },
    sharePricePaise: {
      type: Number,
      default: null
    },
    ownershipPercentage: {
      type: Number,
      default: 0
    },
    allotmentStatus: {
      type: String,
      enum: ['Pending', 'Allotted', 'Cancelled'],
      default: 'Pending'
    },
    certificateNo: {
      type: String,
      default: null
    },
    dematFolioNumber: {
      type: String,
      default: null
    },
    termsVersion: {
      type: Number,
      required: true,
      default: 1
    },
    status: {
      type: String,
      enum: Object.values(Statuses.INVESTMENT),
      default: Statuses.INVESTMENT.PENDING_PAYMENT
    },
    gatewayRef: {
      type: String,
      unique: true,
      sparse: true
    },
    activationDate: {
      type: Date,
      default: null
    },
    maturityDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Investment = mongoose.model('Investment', InvestmentSchema);
