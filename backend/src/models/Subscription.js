import mongoose from 'mongoose';

const SubscriptionPaymentSchema = new mongoose.Schema(
  {
    subscriberType: {
      type: String,
      enum: ['investor', 'company'],
      required: true
    },
    // Reference to Investor Profile or Company
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestorProfile'
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    subscriberName: {
      type: String,
      required: true,
      trim: true
    },
    subscriberEmail: {
      type: String,
      required: true,
      trim: true
    },
    subscriberMobile: {
      type: String,
      trim: true
    },
    // Pricing & billing
    planName: {
      type: String,
      default: 'SaaS Platform License'
    },
    amount: {
      type: Number,
      default: 500 // In Rupees
    },
    amountPaise: {
      type: Number,
      default: 50000 // In Paise
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annual'],
      default: 'Monthly'
    },
    billingMonth: {
      type: String, // e.g. "October 2026"
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    nextDueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue', 'Waived', 'Cancelled'],
      default: 'Paid'
    },
    transactionRef: {
      type: String,
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Net Banking', 'Credit/Debit Card', 'Auto-Debit / eNACH', 'Bank Transfer (NEFT/RTGS)'],
      default: 'UPI'
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const Subscription = mongoose.model('Subscription', SubscriptionPaymentSchema);
