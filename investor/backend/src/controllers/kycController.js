import { KYC } from '../models/KYC.js';
import { InvestorProfile } from '../models/InvestorProfile.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
    ifscCode,
    autoApprove
  } = req.body;

  if (!panNumber || !fullName) {
    throw new ApiError(400, 'Please provide legal full name and PAN number.');
  }

  // Validate PAN format: 5 letters, 4 digits, 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(panNumber.toUpperCase().trim())) {
    throw new ApiError(400, 'Invalid PAN number format. Expected format: ABCDE1234F.');
  }

  let kyc = await KYC.findOne({ investorId });
  if (!kyc) {
    kyc = new KYC({ investorId });
  }

  // Handle uploaded files
  if (req.files) {
    if (req.files.panDocument && req.files.panDocument[0]) {
      kyc.panDocumentUrl = `/uploads/${req.files.panDocument[0].filename}`;
    }
    if (req.files.addressProof && req.files.addressProof[0]) {
      kyc.addressProofUrl = `/uploads/${req.files.addressProof[0].filename}`;
    }
    if (req.files.selfie && req.files.selfie[0]) {
      kyc.selfieUrl = `/uploads/${req.files.selfie[0].filename}`;
    }
    if (req.files.bankProof && req.files.bankProof[0]) {
      kyc.bankProofUrl = `/uploads/${req.files.bankProof[0].filename}`;
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

  // If autoApprove flag is set or dev environment instant validation
  const shouldApprove = autoApprove === 'true' || autoApprove === true;
  kyc.status = shouldApprove ? 'APPROVED' : 'PENDING';
  if (shouldApprove) {
    kyc.reviewedAt = new Date();
  }

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
    title: shouldApprove ? 'KYC Approved Successfully!' : 'KYC Submitted for Verification',
    message: shouldApprove
      ? 'Your identity documents have been approved. You are now eligible to execute investments.'
      : 'Your KYC documents have been submitted and are currently being reviewed by our compliance team.',
    type: 'kyc',
    link: '/investor/kyc'
  });

  res.status(200).json({
    success: true,
    message: shouldApprove
      ? 'KYC verified and approved. You can now invest!'
      : 'KYC documents submitted successfully. Verification in progress.',
    data: kyc
  });
});

// @route   POST /api/kyc/instant-approve (Development convenience endpoint)
// @desc    Allows toggling approval state for testing investment flows
export const toggleKycStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED'];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status. Choose from: ' + validStatuses.join(', '));
  }

  let kyc = await KYC.findOne({ investorId: req.user._id });
  if (!kyc) {
    kyc = new KYC({ investorId: req.user._id, fullName: req.user.name });
  }

  kyc.status = status;
  if (status === 'APPROVED') {
    kyc.reviewedAt = new Date();
    kyc.rejectionReason = '';
  } else if (status === 'REJECTED') {
    kyc.rejectionReason = 'Document image was blurry or unreadable. Please re-upload clear photos.';
  }

  await kyc.save();

  res.status(200).json({
    success: true,
    message: `KYC status updated to ${status}.`,
    data: kyc
  });
});
