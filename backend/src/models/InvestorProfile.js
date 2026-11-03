import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const investorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    dob: {
      type: Date
    },
    dateOfBirth: {
      type: Date
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true
    },
    aadhaarNumber: {
      type: String,
      trim: true
    },
    aadhaarVerified: {
      type: Boolean,
      default: false
    },
    nationality: {
      type: String,
      default: 'Indian'
    },
    occupation: {
      type: String,
      default: ''
    },
    annualIncomeRange: {
      type: String,
      default: ''
    },
    sourceOfFunds: {
      type: String,
      default: ''
    },
    address: {
      line1: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' }
    },
    kycStatus: {
      type: String,
      enum: Object.values(Statuses.KYC),
      default: Statuses.KYC.NOT_STARTED
    },
    kycReason: {
      type: String,
      default: null
    },
    nominee: {
      name: String,
      relation: String
    },
    documents: {
      idProof: String,
      addressProof: String,
      selfie: String,
      bankProof: String
    },
    bankAccount: {
      holderName: String,
      accountNo: String,
      ifsc: String,
      verified: {
        type: Boolean,
        default: false
      }
    },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, uppercase: true, default: '' },
      accountHolderName: { type: String, default: '' },
      chequeUrl: { type: String, default: '' },
      isVerified: { type: Boolean, default: false }
    },
    investmentProfile: {
      experience: { type: String, default: '' },
      preferredType: { type: String, default: '' },
      riskTolerance: { type: String, default: '' },
      expectedAmount: { type: String, default: '' },
      goals: { type: String, default: '' }
    },
    consents: {
      termsAccepted: { type: Boolean, default: true },
      privacyPolicyAccepted: { type: Boolean, default: true },
      riskDisclosureAccepted: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

investorProfileSchema.pre('save', function (next) {
  if (!this.pan && this.panNumber) this.pan = this.panNumber;
  if (!this.panNumber && this.pan) this.panNumber = this.pan;
  if (!this.dob && this.dateOfBirth) this.dob = this.dateOfBirth;
  if (!this.dateOfBirth && this.dob) this.dateOfBirth = this.dob;

  // Mirror bank details
  if (this.bankDetails && !this.bankAccount?.accountNo) {
    this.bankAccount = {
      holderName: this.bankDetails.accountHolderName,
      accountNo: this.bankDetails.accountNumber,
      ifsc: this.bankDetails.ifscCode,
      verified: this.bankDetails.isVerified
    };
  }
  next();
});

export const InvestorProfile = mongoose.models.InvestorProfile || mongoose.model('InvestorProfile', investorProfileSchema);

