import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema(
  {
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      default: ''
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    panDocumentUrl: {
      type: String,
      default: ''
    },
    addressProofType: {
      type: String,
      enum: ['Aadhaar Card', 'Passport', 'Voter ID Card', 'Driving License'],
      default: 'Aadhaar Card'
    },
    addressProofNumber: {
      type: String,
      default: ''
    },
    addressProofUrl: {
      type: String,
      default: ''
    },
    selfieUrl: {
      type: String,
      default: ''
    },
    bankProofUrl: {
      type: String,
      default: ''
    },
    bankName: {
      type: String,
      default: ''
    },
    accountNumber: {
      type: String,
      default: ''
    },
    ifscCode: {
      type: String,
      uppercase: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED', 'Pending Approval', 'Approved', 'Rejected', 'Resubmission Required'],
      default: 'Pending Approval'
    },
    registrationStatus: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'Rejected', 'Resubmission Required'],
      default: 'Pending Approval'
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export const KYC = mongoose.model('KYC', kycSchema);
