import mongoose from 'mongoose';

const directorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  din: { type: String },
  pan: { type: String },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  designation: { type: String, default: 'Director' },
  sharesOwnedPercentage: { type: Number, default: 0 },
  identityVerified: { type: Boolean, default: false }
});

const companySchema = new mongoose.Schema(
  {
    legalName: { type: String, required: true, trim: true },
    brandName: { type: String, trim: true },
    tradingName: { type: String, trim: true },
    cin: { type: String, trim: true, uppercase: true },
    pan: { type: String, required: true, trim: true, uppercase: true },
    gstin: { type: String, trim: true, uppercase: true },
    incorporationDate: { type: Date },
    companyType: {
      type: String,
      enum: ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Sole Proprietorship'],
      default: 'Private Limited'
    },
    industry: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    officialEmail: { type: String, trim: true },
    officialMobile: { type: String, trim: true },
    registeredAddress: {
      street: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },
    description: { type: String, required: true },
    bankDetails: {
      accountHolderName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, uppercase: true, default: '' },
      chequeUrl: { type: String, default: '' },
      isVerified: { type: Boolean, default: false }
    },
    documents: {
      incorporationCertificateUrl: { type: String, default: '' },
      panCardUrl: { type: String, default: '' },
      gstCertificateUrl: { type: String, default: '' },
      moaAoaUrl: { type: String, default: '' },
      shareholdingPatternUrl: { type: String, default: '' },
      financialStatementsUrl: { type: String, default: '' }
    },
    logoUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    directors: [directorSchema],
    authorizedCapital: { type: Number, default: 1000000 },
    paidUpCapital: { type: Number, default: 100000 },
    totalShares: { type: Number, default: 100000 },
    shareFaceValue: { type: Number, default: 10 },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'In Review', 'Verified', 'Rejected', 'Action Required'],
      default: 'Pending'
    },
    verificationRemarks: { type: String, default: '' },
    verifiedAt: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const Company = mongoose.model('Company', companySchema);

