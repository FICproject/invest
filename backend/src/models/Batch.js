import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Draft', 'Prepared', 'Approved', 'Paid', 'Failed'],
      default: 'Prepared'
    },
    totalPaise: {
      type: Number,
      required: true
    },
    payoutCount: {
      type: Number,
      default: 0
    },
    reference: {
      type: String, // Payment gateway or bank batch execution reference
      default: null
    },
    executedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Batch = mongoose.model('Batch', BatchSchema);
