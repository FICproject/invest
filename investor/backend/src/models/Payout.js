import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      required: true
    },
    offerTitle: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      required: true
    },
    payoutType: {
      type: String,
      enum: ['Monthly Interest', 'Quarterly Dividend', 'Principal Return', 'Maturity Payout'],
      default: 'Monthly Interest'
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    paidDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Pending', 'Completed', 'Failed'],
      default: 'Scheduled'
    },
    utrNumber: {
      type: String,
      default: ''
    },
    bankAccountEnding: {
      type: String,
      default: '4210'
    }
  },
  { timestamps: true }
);

export const Payout = mongoose.model('Payout', payoutSchema);
