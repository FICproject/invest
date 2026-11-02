import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentOffer',
      required: true
    },
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    paymentId: {
      type: String
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      default: 'Net Banking'
    },
    status: {
      type: String,
      enum: ['Created', 'Processing', 'Success', 'Failed'],
      default: 'Created'
    },
    failureReason: {
      type: String
    }
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
