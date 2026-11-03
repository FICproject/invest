import mongoose from 'mongoose';

const OfferTermsSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    version: {
      type: Number,
      required: true,
      default: 1
    },
    body: {
      type: String,
      required: true
    },
    repaymentScheduleSummary: {
      type: String
    },
    acceptedByCompanyAt: {
      type: Date,
      default: null
    },
    acceptedByCompanyUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

OfferTermsSchema.index({ offerId: 1, version: 1 }, { unique: true });

export const OfferTerms = mongoose.model('OfferTerms', OfferTermsSchema);
