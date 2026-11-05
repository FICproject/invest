import mongoose from 'mongoose';

const investmentRequestSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true },
    detailedDescription: { type: String, required: true },
    category: { type: String, required: true, default: 'Company Investment' },
    investmentPurpose: {
      type: String,
      enum: ['Company Investment', 'Project Investment'],
      default: 'Company Investment'
    },
    fundingDuration: {
      type: String,
      enum: ['Short-Term', 'Long-Term'],
      default: 'Short-Term'
    },
    entityOrProjectName: { type: String, trim: true },
    investmentPeriodYears: { type: Number, default: 2 },
    expectedReturnRate: { type: Number },
    investmentModel: {
      type: String,
      enum: ['Fixed-Term'],
      default: 'Fixed-Term',
      required: true,
      index: true
    },
    fundingTarget: { type: Number, required: true },
    minInvestment: { type: Number, required: true },
    maxInvestment: { type: Number },
    raisedAmount: { type: Number, default: 0 },
    committedAmount: { type: Number, default: 0 },

    // Fixed-term Debt
    durationMonths: { type: Number },
    agreedReturnRate: { type: Number },
    returnStructure: {
      type: String,
      enum: ['Simple Interest', 'Compound Annual', 'Profit Share Component', 'Monthly Yield']
    },
    repaymentTerms: { type: String },
    maturityDate: { type: Date },

    useOfFunds: { type: String, required: true },
    businessPlanUrl: { type: String },
    financialProjectionsUrl: { type: String },
    supportingDocuments: [
      {
        name: { type: String },
        fileUrl: { type: String }
      }
    ],
    campaignStartDate: { type: Date },
    campaignEndDate: { type: Date },

    status: {
      type: String,
      enum: [
        'Draft',
        'Submitted',
        'Under Review',
        'Approved',
        'Rejected',
        'Funded',
        'Additional Information Required',
        'Resubmission Required',
        'Changes Requested',
        'Open for Investment',
        'Funding Completed',
        'Cancelled'
      ],
      default: 'Draft',
      index: true
    },
    reviewerFeedback: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },

    // Counter-proposal / Resubmission changes requested by Admin
    proposedFundingTarget: { type: Number, default: null },
    proposedReturnRate: { type: Number, default: null },
    proposedDurationMonths: { type: Number, default: null },
    proposedMinInvestment: { type: Number, default: null },
    proposedMaxInvestment: { type: Number, default: null },
    adminSuggestions: {
      fundingTarget: { type: Number },
      returnRate: { type: Number },
      durationMonths: { type: Number },
      minInvestment: { type: Number },
      maxInvestment: { type: Number },
      notes: { type: String },
      suggestedAt: { type: Date },
      suggestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    revisionHistory: [
      {
        suggestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        suggestedAt: { type: Date, default: Date.now },
        decision: { type: String },
        feedback: { type: String },
        proposedFundingTarget: { type: Number },
        proposedReturnRate: { type: Number },
        proposedDurationMonths: { type: Number },
        proposedMinInvestment: { type: Number },
        originalFundingTarget: { type: Number },
        originalReturnRate: { type: Number }
      }
    ]
  },
  { timestamps: true }
);

export const InvestmentRequest = mongoose.model('InvestmentRequest', investmentRequestSchema);
