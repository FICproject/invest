import mongoose from 'mongoose';

const dividendSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    declarationDate: { type: Date, required: true },
    recordDate: { type: Date, required: true },
    payoutDate: { type: Date },
    financialYear: { type: String, required: true },
    dividendType: {
      type: String,
      enum: ['Interim', 'Final', 'Special'],
      default: 'Interim'
    },
    amountPerShare: { type: Number, required: true },
    totalDividendAmount: { type: Number, required: true },
    eligibleShareholdersCount: { type: Number, default: 0 },
    boardResolutionRef: { type: String, required: true },
    approvalStatus: {
      type: String,
      enum: ['Proposed', 'Board Approved', 'AGM Approved', 'Disbursed', 'Cancelled'],
      default: 'Proposed'
    },
    disbursementStatus: {
      type: String,
      enum: ['Pending', 'In Process', 'Completed', 'Failed'],
      default: 'Pending'
    },
    notes: { type: String }
  },
  { timestamps: true }
);

export const Dividend = mongoose.model('Dividend', dividendSchema);

