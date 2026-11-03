import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentRequest'
    },
    investmentModel: {
      type: String
    },
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment'
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Investment', 'Payout', 'Refund', 'Deposit'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Pending', 'Failed'],
      default: 'Confirmed'
    },
    referenceId: {
      type: String,
      required: true,
      unique: true
    },
    paymentMethod: {
      type: String,
      enum: ['Net Banking', 'UPI', 'Bank Transfer', 'Debit/Credit Card'],
      default: 'Net Banking'
    },
    description: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export const Transaction = mongoose.model('Transaction', transactionSchema);
