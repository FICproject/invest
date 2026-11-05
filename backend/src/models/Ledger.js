import mongoose from 'mongoose';

const LedgerSchema = new mongoose.Schema(
  {
    account: {
      type: String, // e.g. 'PLATFORM_COLLECTION', 'INVESTOR_WALLET', 'COMPANY_DISBURSEMENT', 'RETURNS_POOL'
      required: true,
      index: true
    },
    debitPaise: {
      type: Number,
      default: 0
    },
    creditPaise: {
      type: Number,
      default: 0
    },
    refType: {
      type: String, // 'INVESTMENT', 'RELEASE', 'REPAYMENT', 'PAYOUT', 'REFUND'
      required: true,
      index: true
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    description: {
      type: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Immutable
  }
);

// Prevent updating or deleting ledger entries
LedgerSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany', 'findOneAndDelete'], function () {
  throw new Error('Ledger records are immutable and cannot be updated or deleted');
});

export const Ledger = mongoose.model('Ledger', LedgerSchema);
