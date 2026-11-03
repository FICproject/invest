import mongoose from 'mongoose';

const shareAllocationSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    shareholderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shareholder', required: true, index: true },
    investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
    allotmentRound: { type: String, required: true },
    sharesCount: { type: Number, required: true },
    pricePerShare: { type: Number, required: true },
    totalConsideration: { type: Number, required: true },
    resolutionNumber: { type: String, required: true },
    resolutionDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Draft', 'Approved', 'Issued'],
      default: 'Approved'
    }
  },
  { timestamps: true }
);

export const ShareAllocation = mongoose.model('ShareAllocation', shareAllocationSchema);

