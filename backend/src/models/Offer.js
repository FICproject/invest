import mongoose from 'mongoose';
import { OfferKind, Statuses } from '../constants/index.js';

const MilestoneSchema = new mongoose.Schema({
  title: String,
  targetDate: Date,
  description: String,
  completed: {
    type: Boolean,
    default: false
  }
});

const OfferSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: Object.values(OfferKind),
      required: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    useOfFunds: {
      type: String
    },
    targetPaise: {
      type: Number,
      required: true
    },
    minTargetPaise: {
      type: Number,
      required: true
    },
    raisedPaise: {
      type: Number,
      default: 0
    },
    heldPaise: {
      type: Number,
      default: 0
    },
    perInvestorLimitPaise: {
      type: Number,
      default: null
    },
    windowStart: {
      type: Date
    },
    windowEnd: {
      type: Date
    },
    rateBps: {
      type: Number, // Basis points (e.g. 300 = 3% per month) for debt offers; 0 for equity
      default: 0
    },
    tenures: {
      type: [Number], // Allowed tenures in months (>= 12 for project, >= 60 for company); empty for equity
      default: []
    },
    // Equity / Shareholder Investment fields (kind === 'equity')
    sharePricePaise: {
      type: Number,
      default: null
    },
    faceValuePaise: {
      type: Number,
      default: 1000 // ₹10 default face value in paise
    },
    preMoneyValuationPaise: {
      type: Number,
      default: null
    },
    postMoneyValuationPaise: {
      type: Number,
      default: null
    },
    totalSharesOffered: {
      type: Number,
      default: null
    },
    minShares: {
      type: Number,
      default: 1
    },
    equityInstrument: {
      type: String,
      enum: ['equity_shares', 'ccps', 'isafe'],
      default: 'equity_shares'
    },
    equityOfferedPercentage: {
      type: Number,
      default: null // e.g. 5.5%
    },
    hasVotingRights: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: Object.values(Statuses.OFFER),
      default: Statuses.OFFER.DRAFT
    },
    activationDate: {
      type: Date,
      default: null
    },
    maturityDate: {
      type: Date,
      default: null
    },
    returnComments: {
      type: String,
      default: null
    },
    milestones: [MilestoneSchema],
    photos: [String],
    documents: [
      {
        name: String,
        url: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// Virtual for remaining room in whole paise
OfferSchema.virtual('remainingRoomPaise').get(function () {
  return Math.max(0, this.targetPaise - (this.raisedPaise + this.heldPaise));
});

OfferSchema.set('toJSON', { virtuals: true });
OfferSchema.set('toObject', { virtuals: true });

export const Offer = mongoose.model('Offer', OfferSchema);
