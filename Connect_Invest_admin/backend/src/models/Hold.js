import mongoose from 'mongoose';

const HoldSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true
    },
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amountPaise: {
      type: Number,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '0s' } // TTL index automatically cleans up expired holds after 10 minutes
    }
  },
  {
    timestamps: true
  }
);

export const Hold = mongoose.model('Hold', HoldSchema);
