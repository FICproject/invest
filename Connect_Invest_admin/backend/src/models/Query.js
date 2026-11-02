import mongoose from 'mongoose';

const QueryMessageSchema = new mongoose.Schema(
  {
    senderType: {
      type: String,
      enum: ['admin', 'investor', 'company'],
      required: true
    },
    senderName: {
      type: String,
      default: 'Admin'
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    attachments: [
      {
        filename: String,
        url: String
      }
    ],
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const QuerySchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true
    },
    // Sender Information
    senderType: {
      type: String,
      enum: ['investor', 'company'],
      required: true
    },
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestorProfile'
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    userEmail: {
      type: String,
      required: true,
      trim: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    userPhone: {
      type: String,
      trim: true
    },
    // Category & Topic
    category: {
      type: String,
      enum: ['Payment & Payouts', 'Repayment & Dues', 'KYC Verification', 'KYB Verification', 'Project & Offer Details', 'Account & Access', 'Technical Issue', 'Other'],
      default: 'Payment & Payouts'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Waiting on User', 'Resolved', 'Closed'],
      default: 'Open'
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    relatedOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
    },
    relatedTransactionRef: {
      type: String,
      trim: true
    },
    messages: [QueryMessageSchema],
    assignedTo: {
      type: String,
      default: 'Master Admin'
    },
    resolvedAt: {
      type: Date
    },
    resolutionNote: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const Query = mongoose.model('Query', QuerySchema);
