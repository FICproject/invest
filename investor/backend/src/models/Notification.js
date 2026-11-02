import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['investment', 'payout', 'kyc', 'system'],
      default: 'system'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
