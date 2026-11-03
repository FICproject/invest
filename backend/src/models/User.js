import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Roles } from '../constants/index.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide legal full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    mobile: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      select: false
    },
    passwordHash: {
      type: String
    },
    role: {
      type: String,
      enum: ['admin', 'investor', 'company', 'company_admin', 'company_member', 'companyOwner'],
      default: 'investor'
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active'
    },
    blockReason: {
      type: String,
      default: null
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false }
    },
    twoFactorCode: {
      type: String,
      default: null
    },
    twoFactorExpiresAt: {
      type: Date,
      default: null
    },
    invitationToken: {
      type: String,
      default: null
    },
    invitationExpiresAt: {
      type: Date,
      default: null
    },
    termsAccepted: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving and synchronize password & passwordHash
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      this.passwordHash = hash;
    } else {
      this.passwordHash = this.password;
    }
  } else if (this.isModified('passwordHash') && this.passwordHash) {
    if (!this.password) {
      this.password = this.passwordHash;
    }
  }
  next();
});

// Compare password method supporting both password and passwordHash
userSchema.methods.comparePassword = async function (candidatePassword) {
  const hash = this.password || this.passwordHash;
  if (!hash) return false;
  return await bcrypt.compare(candidatePassword, hash);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);

