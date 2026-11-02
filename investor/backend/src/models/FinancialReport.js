import mongoose from 'mongoose';

const financialReportSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    financialYear: { type: String, required: true },
    periodType: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annual'],
      required: true
    },
    periodName: { type: String, required: true },
    revenue: { type: Number, required: true },
    operatingExpenses: { type: Number, required: true },
    netProfitOrLoss: { type: Number, required: true },
    cashFlowFromOperations: { type: Number, default: 0 },
    fundsRaisedInPeriod: { type: Number, default: 0 },
    investmentRelatedExpenses: { type: Number, default: 0 },
    auditStatus: {
      type: String,
      enum: ['Company-Reported', 'Independently Verified', 'Audited'],
      default: 'Company-Reported'
    },
    auditorName: { type: String },
    reportFileUrl: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

export const FinancialReport = mongoose.model('FinancialReport', financialReportSchema);

