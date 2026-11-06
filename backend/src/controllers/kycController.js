import { KYC } from '../models/KYC.js';
import { InvestorProfile } from '../models/InvestorProfile.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  validatePAN,
  validateAadhaar,
  validateBankAccount,
  validateIFSC,
  ERROR_MESSAGES
} from '../utils/validators.js';

// @route   GET /api/kyc/status
// @desc    Get KYC verification status and document details
export const getKycStatus = asyncHandler(async (req, res) => {
  let kyc = await KYC.findOne({ investorId: req.user._id });

  if (!kyc) {
    kyc = await KYC.create({
      investorId: req.user._id,
      fullName: req.user.name,
      status: 'NOT_STARTED'
    });
  }

  res.status(200).json({
    success: true,
    data: kyc
  });
});

// @route   POST /api/kyc/submit
// @desc    Submit KYC identity documents and bank account information
export const submitKyc = asyncHandler(async (req, res) => {
  const investorId = req.user._id;
  const {
    fullName,
    panNumber,
    addressProofType,
    addressProofNumber,
    bankName,
    accountNumber,
    ifscCode
  } = req.body;

  if (!panNumber || !fullName) {
    throw new ApiError(400, 'Please provide legal full name and PAN number.');
  }

  // Validate PAN format: 5 letters, 4 digits, 1 letter
  if (!validatePAN(panNumber)) {
    throw new ApiError(400, ERROR_MESSAGES.PAN_INVALID);
  }

  // Validate Aadhaar if selected as address proof or provided
  if ((addressProofType === 'Aadhaar Card' || addressProofType === 'Aadhaar') && addressProofNumber) {
    if (!validateAadhaar(addressProofNumber)) {
      throw new ApiError(400, ERROR_MESSAGES.AADHAAR_INVALID);
    }
  }

  // Validate Bank Account Number if provided
  if (accountNumber && !validateBankAccount(accountNumber)) {
    throw new ApiError(400, ERROR_MESSAGES.BANK_ACCOUNT_INVALID);
  }

  // Validate Bank IFSC if provided
  if (ifscCode && !validateIFSC(ifscCode)) {
    throw new ApiError(400, ERROR_MESSAGES.IFSC_INVALID);
  }

  let kyc = await KYC.findOne({ investorId });
  if (!kyc) {
    kyc = new KYC({ investorId });
  }

  // Handle uploaded files
  if (req.files) {
    if (req.files.panDocument && req.files.panDocument[0]) {
      const f = req.files.panDocument[0];
      kyc.panDocumentUrl = f.secure_url || f.path || `/uploads/${f.filename}`;
    }
    if (req.files.addressProof && req.files.addressProof[0]) {
      const f = req.files.addressProof[0];
      kyc.addressProofUrl = f.secure_url || f.path || `/uploads/${f.filename}`;
    }
    if (req.files.selfie && req.files.selfie[0]) {
      const f = req.files.selfie[0];
      kyc.selfieUrl = f.secure_url || f.path || `/uploads/${f.filename}`;
    }
    if (req.files.bankProof && req.files.bankProof[0]) {
      const f = req.files.bankProof[0];
      kyc.bankProofUrl = f.secure_url || f.path || `/uploads/${f.filename}`;
    }
  }

  kyc.fullName = fullName;
  kyc.panNumber = panNumber.toUpperCase().trim();
  kyc.addressProofType = addressProofType || 'Aadhaar Card';
  kyc.addressProofNumber = addressProofNumber || '';
  kyc.bankName = bankName || '';
  kyc.accountNumber = accountNumber || '';
  kyc.ifscCode = ifscCode ? ifscCode.toUpperCase().trim() : '';
  kyc.submittedAt = new Date();

  kyc.status = 'PENDING';
  await kyc.save();

  // Also sync profile with verified bank details and PAN
  let profile = await InvestorProfile.findOne({ userId: investorId });
  if (profile) {
    profile.panNumber = kyc.panNumber;
    if (bankName && accountNumber && ifscCode) {
      profile.bankDetails = {
        bankName,
        accountNumber,
        ifscCode: kyc.ifscCode,
        accountHolderName: fullName,
        isVerified: true
      };
    }
    await profile.save();
  }

  // Create status notification
  await Notification.create({
    investorId,
    title: 'KYC Submitted for Verification',
    message: 'Your KYC documents have been submitted and are currently being reviewed by our compliance team.',
    type: 'kyc',
    link: '/investor/kyc'
  });

  res.status(200).json({
    success: true,
    message: 'KYC documents submitted successfully. Verification in progress by platform compliance.',
    data: kyc
  });
});
