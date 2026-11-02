import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    regNo: {
      type: String, // CIN / LLPIN / Registration Number
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(Statuses.COMPANY),
      default: Statuses.COMPANY.INVITED
    },
    statusReason: {
      type: String,
      default: null
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
    kybDocuments: {
      incorporationCert: String,
      panCard: String,
      gstCert: String,
      signatoryProof: String,
      bankStatement: String
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
    }
  },
  {
    timestamps: true
  }
);

export const Company = mongoose.model('Company', CompanySchema);
