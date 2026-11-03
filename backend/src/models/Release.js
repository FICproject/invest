import mongoose from 'mongoose';
import { Statuses } from '../constants/index.js';

const ReleaseSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    amountPaise: {
      type: Number,
      required: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(Statuses.RELEASE_AND_REFUND),
      default: Statuses.RELEASE_AND_REFUND.PREPARED
    },
    reference: {
      type: String, // Bank transfer reference to company
      default: null
    },
    bankAccountSnapshot: {
      holderName: String,
      accountNo: String,
      ifsc: String,
      bankName: String
    },
    releasedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Release = mongoose.model('Release', ReleaseSchema);
