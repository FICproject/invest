import mongoose from 'mongoose';

const investorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      default: ''
    },
    aadhaarVerified: {
      type: Boolean,
      default: false
    },
    dateOfBirth: {
      type: Date
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
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' }
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
    },
    notificationPreferences: {
      emailAlerts: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: true },
      payoutNotifications: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export const InvestorProfile = mongoose.model('InvestorProfile', investorProfileSchema);
