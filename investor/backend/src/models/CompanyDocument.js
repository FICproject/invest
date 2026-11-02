import mongoose from 'mongoose';

const companyDocumentSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    documentType: {
      type: String,
      required: true,
      enum: [
        'Certificate of Incorporation',
        'PAN Card',
        'GST Certificate',
        'MOA & AOA',
        'Financial Statement',
        'Audit Report',
        'Pitch Deck',
        'Board Resolution',
        'Project Document',
        'Funding Agreement',
        'Repayment Agreement',
        'Other'
      ]
    },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Action Required'],
      default: 'Pending'
    },
    remarks: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const CompanyDocument = mongoose.model('CompanyDocument', companyDocumentSchema);

