import mongoose from 'mongoose';

const shareholderSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    panOrId: { type: String, required: true },
    sharesHeld: { type: Number, required: true, default: 0 },
    shareClass: {
      type: String,
      enum: ['Equity Shares', 'CCPS', 'Founder Equity', 'Ordinary Class B'],
      default: 'Equity Shares'
    },
    ownershipPercentage: { type: Number, required: true, default: 0 },
    totalInvestedAmount: { type: Number, required: true, default: 0 },
    folioNumber: { type: String, required: true },
    certificateNumber: { type: String },
    issuanceStatus: {
      type: String,
      enum: ['Pending Allotment', 'Board Approved', 'Issued', 'Cancelled'],
      default: 'Pending Allotment'
    },
    allotmentDate: { type: Date, default: Date.now },
    agreementStatus: {
      type: String,
      enum: ['Draft', 'Sent for Signature', 'Executed', 'Exempt'],
      default: 'Executed'
    }
  },
  { timestamps: true }
);

export const Shareholder = mongoose.model('Shareholder', shareholderSchema);

