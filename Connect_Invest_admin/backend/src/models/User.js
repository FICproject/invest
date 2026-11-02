import mongoose from 'mongoose';
import { Roles } from '../constants/index.js';

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: Object.values(Roles),
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    mobile: {
      type: String,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
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
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model('User', UserSchema);
