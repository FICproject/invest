import mongoose from 'mongoose';

const PlatformConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

export const PlatformConfig = mongoose.model('PlatformConfig', PlatformConfigSchema);

