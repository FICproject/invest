import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const directorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  din: { type: String, default: '' },
  pan: { type: String, default: '' },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  designation: { type: String, default: 'Director' },
  sharesOwnedPercentage: { type: Number, default: 0 },
  identityVerified: { type: Boolean, default: false }
});

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    legalName: {
      type: String,
      trim: true
    },
    brandName: {
      type: String,
      trim: true
    },
    tradingName: {
      type: String,
      trim: true
    },
    regNo: {
      type: String, // CIN / LLPIN
      trim: true
    },
    cin: {
      type: String,
      trim: true,
      uppercase: true
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true
    },
    incorporationDate: {
      type: Date
    },
    companyType: {
      type: String,
      enum: ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Sole Proprietorship'],
      default: 'Private Limited'
    },
    industry: {
      type: String,
      trim: true,
      default: 'General'
    },
    sector: {
      type: String,
      trim: true,
      default: 'General'
    },
    website: {
      type: String,
      trim: true
    },
    officialEmail: {
      type: String,
      trim: true
    },
    officialMobile: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Pending Approval'
    },
    registrationStatus: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'Rejected', 'Resubmission Required'],
      default: 'Pending Approval',
      index: true
    },
    rejectionReason: {
      type: String,
      default: null
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        reason: { type: String, default: '' },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        adminName: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    verificationStatus: {
      type: String,
      enum: ['Pending', 'In Review', 'Verified', 'Rejected', 'Action Required', 'Active', 'Pending Approval', 'Approved', 'Resubmission Required'],
      default: 'Pending Approval'
    },
    statusReason: {
      type: String,
      default: null
    },
    verificationRemarks: {
      type: String,
      default: ''
    },
    verifiedAt: {
      type: Date
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' }
    },
    profile: {
      description: String,
      sector: String,
      website: String,
      city: String,
      state: String,
      foundedYear: Number
    },
    pendingProfile: {
      description: String,
      sector: String,
      website: String,
      city: String,
      state: String,
      submittedAt: Date
    },
    bankAccount: {
      holderName: String,
      accountNo: String,
      ifsc: String,
      bankName: String,
      verified: {
        type: Boolean,
        default: false
      },
      effectiveFrom: {
        type: Date,
        default: Date.now
      }
    },
    bankDetails: {
      accountHolderName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, uppercase: true, default: '' },
      chequeUrl: { type: String, default: '' },
      isVerified: { type: Boolean, default: false }
    },
    kybDocuments: {
      incorporationCert: String,
      panCard: String,
      gstCert: String,
      signatoryProof: String,
      bankStatement: String
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
    shareFaceValue: { type: Number, default: 10 }
  },
  {
    timestamps: true
  }
);

// Synchronize Admin and Investor/Company field representations
companySchema.pre('save', function (next) {
  if (!this.name && this.legalName) this.name = this.legalName;
  if (!this.legalName && this.name) this.legalName = this.name;
  if (!this.regNo && this.cin) this.regNo = this.cin;
  if (!this.cin && this.regNo) this.cin = this.regNo;
  if (!this.ownerUserId && this.userId) this.ownerUserId = this.userId;
  if (!this.userId && this.ownerUserId) this.userId = this.ownerUserId;

  // Mirror verification and status
  if (this.verificationStatus === 'Verified' && this.status !== Statuses.COMPANY.APPROVED) {
    this.status = Statuses.COMPANY.APPROVED;
  } else if (this.status === Statuses.COMPANY.APPROVED && this.verificationStatus !== 'Verified') {
    this.verificationStatus = 'Verified';
  }

  // Mirror bank details
  if (this.bankDetails && !this.bankAccount?.accountNo) {
    this.bankAccount = {
      holderName: this.bankDetails.accountHolderName,
      accountNo: this.bankDetails.accountNumber,
      ifsc: this.bankDetails.ifscCode,
      bankName: this.bankDetails.bankName,
      verified: this.bankDetails.isVerified
    };
  }

  next();
});

export const Company = mongoose.models.Company || mongoose.model('Company', companySchema);

