import mongoose from 'mongoose';

const investmentOfferSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide offer title'],
      trim: true
    },
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Company', 'Project'],
      required: true,
      default: 'Company'
    },
    category: {
      type: String,
      enum: ['Renewable Energy', 'Real Estate', 'Food & Agriculture', 'Technology', 'Healthcare', 'Others'],
      required: true
    },
    description: {
      type: String,
      required: [true, 'Please provide offer description']
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please specify target amount in INR']
    },
    raisedAmount: {
      type: Number,
      default: 0
    },
    minInvestment: {
      type: Number,
      required: [true, 'Please specify minimum investment amount in INR']
    },
    maxInvestment: {
      type: Number,
      default: 50000000
    },
    returnRate: {
      type: Number,
      required: [true, 'Please specify return rate per annum (e.g. 10.5)']
    },
    tenureMonths: {
      type: Number,
      required: [true, 'Please specify tenure duration in months (e.g. 24)']
    },
    payoutFrequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'At Maturity'],
      default: 'Monthly'
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High'],
      default: 'Moderate'
    },
    status: {
      type: String,
      enum: ['Active', 'Fully Funded', 'Closed', 'Coming Soon'],
      default: 'Active'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: 'India'
    },
    securityType: {
      type: String,
      default: 'Secured Debenture / Corporate Bond'
    },
    financialHighlights: [String],
    documents: [
      {
        name: String,
        fileUrl: String,
        fileType: String
      }
    ]
  },
  { timestamps: true }
);

export const InvestmentOffer = mongoose.model('InvestmentOffer', investmentOfferSchema);
