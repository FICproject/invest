import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    action: { type: String, required: true },
    module: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

