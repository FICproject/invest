import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const investmentSchema = new mongoose.Schema(
  {
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
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
    tenureMonths: {
      type: Number,
      default: null
    },
    amountPaise: {
      type: Number
    },
    amount: {
      type: Number
    },
    amountInvested: {
      type: Number
    },
    monthlyReturnPaise: {
      type: Number,
      default: 0
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
    paymentStatus: {
      type: String,
      default: 'Committed'
    },
    allocationStatus: {
      type: String,
      default: 'Unallocated'
    },
    sharesAllotted: {
      type: Number,
      default: 0
    },
    sharesAllocated: {
      type: Number,
      default: 0
    },
    sharePricePaise: {
      type: Number,
      default: null
    },
    sharePrice: {
      type: Number
    },
    ownershipPercentage: {
      type: Number,
      default: 0
    },
    equityPercentage: {
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
      default: 1
    },
    // Approval Workflow fields (Investor Investment Request)
    proposedAmount: {
      type: Number,
      default: null
    },
    proposedAmountPaise: {
      type: Number,
      default: null
    },
    adminSuggestions: {
      type: String,
      default: ''
    },
    adminFeedback: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    investorNote: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    revisionHistory: [
      {
        amount: Number,
        proposedAmount: Number,
        feedback: String,
        decision: String,
        date: { type: Date, default: Date.now },
        changedBy: { type: String, default: 'admin' }
      }
    ],
    status: {
      type: String,
      enum: Object.values(Statuses.INVESTMENT),
      default: Statuses.INVESTMENT.PENDING_PAYMENT
    },
    activationDate: {
      type: Date,
      default: null
    },
    maturityDate: {
      type: Date,
      default: null
    },
    investedAt: {
      type: Date,
      default: Date.now
    },
    // Maturity Release & Redemption tracking
    principalReleaseStatus: {
      type: String,
      enum: ['Pending', 'Ready', 'Released', 'On Hold'],
      default: 'Pending'
    },
    principalReleasedAt: {
      type: Date,
      default: null
    },
    principalReleaseUtr: {
      type: String,
      default: null
    },
    principalReleaseRemarks: {
      type: String,
      default: null
    },
    principalReleasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

investmentSchema.pre('save', function (next) {
  if (this.amount && !this.amountPaise) {
    this.amountPaise = Math.round(this.amount * 100);
    this.amountInvested = this.amount;
  } else if (this.amountPaise && !this.amount) {
    this.amount = this.amountPaise / 100;
    this.amountInvested = this.amount;
  }

  if (this.proposedAmount && !this.proposedAmountPaise) {
    this.proposedAmountPaise = Math.round(this.proposedAmount * 100);
  } else if (this.proposedAmountPaise && !this.proposedAmount) {
    this.proposedAmount = this.proposedAmountPaise / 100;
  }

  if (this.sharesAllocated && !this.sharesAllotted) {
    this.sharesAllotted = this.sharesAllocated;
  } else if (this.sharesAllotted && !this.sharesAllocated) {
    this.sharesAllocated = this.sharesAllotted;
  }

  if (this.equityPercentage && !this.ownershipPercentage) {
    this.ownershipPercentage = this.equityPercentage;
  } else if (this.ownershipPercentage && !this.equityPercentage) {
    this.equityPercentage = this.ownershipPercentage;
  }

  next();
});

export const Investment = mongoose.models.Investment || mongoose.model('Investment', investmentSchema);

