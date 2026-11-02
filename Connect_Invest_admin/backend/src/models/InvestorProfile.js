import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const InvestorProfileSchema = new mongoose.Schema(
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
    pan: {
      type: String, // Masked or encrypted
      trim: true
    },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String
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
    }
  },
  {
    timestamps: true
  }
);

export const InvestorProfile = mongoose.model('InvestorProfile', InvestorProfileSchema);
