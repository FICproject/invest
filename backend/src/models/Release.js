import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const ReleaseSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      default: null
    },
    investmentOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentOffer',
      default: null
    },
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      default: null
    },
    offerTitle: {
      type: String,
      default: ''
    },
    investorName: {
      type: String,
      default: ''
    },
    companyName: {
      type: String,
      default: ''
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    amountPaise: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      default: 0
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: Object.values(Statuses.RELEASE_AND_REFUND),
      default: Statuses.RELEASE_AND_REFUND.PREPARED
    },
    reference: {
      type: String, // Bank transfer reference to company
      default: null
    },
    paymentGateway: {
      type: String,
      default: 'Razorpay'
    },
    razorpayPayoutId: {
      type: String,
      default: null
    },
    razorpayFundAccountId: {
      type: String,
      default: null
    },
    razorpayUtr: {
      type: String,
      default: null
    },
    bankAccountSnapshot: {
      holderName: String,
      accountNo: String,
      ifsc: String,
      bankName: String
    },
    releasedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Release = mongoose.model('Release', ReleaseSchema);
