import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetEntity: {
      type: String,
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    reason: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Immutable
  }
);

// Prevent updating or deleting audit logs per PRD 5.5 M-3
AuditLogSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany', 'findOneAndDelete'], function () {
  throw new Error('Audit log entries are add-only and cannot be modified or deleted');
});

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
