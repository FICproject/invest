import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { InvestorProfile } from '../models/InvestorProfile.js';
import { KYC } from '../models/KYC.js';
import { Company } from '../models/Company.js';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { broadcastSyncEvent } from '../services/sse.js';

const generateToken = (id) => {
  return jwt.sign({ id, userId: id }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
};

// @route   POST /api/auth/upload-doc
// @desc    Upload an onboarding/registration document
export const uploadRegistrationDocument = asyncHandler(async (req, res) => {
  const file = req.file || (req.files && (req.files['file']?.[0] || req.files['document']?.[0]));
  if (!file) {
    throw new ApiError(400, 'No document file uploaded. Please select a valid JPEG, PNG, or PDF file.');
  }

  const fileUrl = `/uploads/${file.filename}`;
  res.status(200).json({
    success: true,
    message: 'Document uploaded successfully',
    data: {
      url: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    }
  });
});

// @route   POST /api/auth/register
// @desc    Register a new investor (with all 5-step details)
export const register = asyncHandler(async (req, res) => {
  const {
    // Step 1: Basic Details
    name,
    email,
    mobile,
    password,
    dateOfBirth,
    // Step 2: Personal & KYC Details
    pan,
    aadhaarNumber,
    residentialAddress,
    city,
    state,
    pincode,
    nationality,
    occupation,
    annualIncomeRange,
    sourceOfFunds,
    // Step 3: Bank Details
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    cancelledChequeUrl,
    // Step 4: Investment Profile
    investmentExperience,
    preferredInvestmentType,
    riskTolerance,
    expectedInvestmentAmount,
    investmentGoals,
    // Step 5: Verification & Consent
    panCardUrl,
    identityProofUrl,
    termsAccepted,
    privacyPolicyAccepted,
    riskDisclosureAccepted
  } = req.body;

  if (!name || !email || !mobile || !password) {
    throw new ApiError(400, 'Please provide full legal name, email address, mobile number, and password.');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long.');
  }

  // Check if email or mobile already registered
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(409, 'An investor account with this email address already exists. Please sign in.');
  }

  const existingMobile = await User.findOne({ mobile });
  if (existingMobile) {
    throw new ApiError(409, 'An investor account with this mobile number already exists. Please sign in.');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    mobile,
    password,
    role: 'investor',
    isVerified: true,
    registrationStatus: 'Pending Approval',
    submittedAt: new Date(),
    termsAccepted: termsAccepted !== false
  });

  // Create populated investor profile
  await InvestorProfile.create({
    userId: user._id,
    panNumber: pan ? pan.toUpperCase() : '',
    pan: pan ? pan.toUpperCase() : '',
    aadhaarNumber: aadhaarNumber || '',
    aadhaarVerified: Boolean(aadhaarNumber),
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    nationality: nationality || 'Indian',
    occupation: occupation || '',
    annualIncomeRange: annualIncomeRange || '',
    sourceOfFunds: sourceOfFunds || '',
    kycStatus: 'Pending Approval',
    registrationStatus: 'Pending Approval',
    panCardUrl: panCardUrl || '',
    identityProofUrl: identityProofUrl || '',
    cancelledChequeUrl: cancelledChequeUrl || '',
    address: {
      street: residentialAddress || '',
      city: city || '',
      state: state || '',
      pincode: pincode || ''
    },
    bankDetails: {
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode ? ifscCode.toUpperCase() : '',
      accountHolderName: accountHolderName || name,
      chequeUrl: cancelledChequeUrl || '',
      isVerified: Boolean(accountNumber && ifscCode)
    },
    investmentProfile: {
      experience: investmentExperience || '',
      preferredType: preferredInvestmentType || 'Fixed-Term & Equity',
      riskTolerance: riskTolerance || 'Moderate',
      expectedAmount: expectedInvestmentAmount || '',
      goals: investmentGoals || ''
    },
    consents: {
      termsAccepted: termsAccepted !== false,
      privacyPolicyAccepted: privacyPolicyAccepted !== false,
      riskDisclosureAccepted: riskDisclosureAccepted !== false
    }
  });

  // Create KYC record
  await KYC.create({
    investorId: user._id,
    fullName: name,
    panNumber: pan ? pan.toUpperCase() : '',
    panDocumentUrl: panCardUrl || '',
    addressProofType: 'Aadhaar Card',
    addressProofNumber: aadhaarNumber || '',
    addressProofUrl: identityProofUrl || '',
    bankProofUrl: cancelledChequeUrl || '',
    bankName: bankName || '',
    accountNumber: accountNumber || '',
    ifscCode: ifscCode ? ifscCode.toUpperCase() : '',
    status: 'Pending Approval',
    registrationStatus: 'Pending Approval',
    submittedAt: new Date()
  });

  // Broadcast real-time event to Admin Console
  broadcastSyncEvent('REGISTRATION', 'SUBMITTED', {
    userId: user._id,
    role: 'investor',
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    status: 'Pending Approval',
    submittedAt: user.submittedAt
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Investor registered successfully. Your application is pending compliance approval.',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        registrationStatus: 'Pending Approval'
      },
      registrationStatus: 'Pending Approval',
      kycStatus: 'Pending Approval'
    }
  });
});

// @route   POST /api/auth/login
// @desc    Authenticate investor and get token
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, 'Please enter email address or mobile number along with your password.');
  }

  // Check if identifier is email or mobile
  const isEmail = identifier.includes('@');
  const query = isEmail
    ? { email: identifier.trim().toLowerCase() }
    : { mobile: identifier.trim() };

  const user = await User.findOne(query).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials. Please check your login details.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials. Incorrect password.');
  }

  const kyc = await KYC.findOne({ investorId: user._id });
  const token = generateToken(user._id);

  let company = null;
  if (user.companyId) {
    company = await Company.findById(user.companyId);
  }

  const currentRegistrationStatus = user.registrationStatus || (user.role === 'admin' ? 'Approved' : 'Pending Approval');

  res.status(200).json({
    success: true,
    message: 'Signed in successfully.',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        companyId: user.companyId,
        registrationStatus: currentRegistrationStatus,
        rejectionReason: user.rejectionReason || null,
        adminRemarks: user.adminRemarks || null,
        accountStatus: user.accountStatus || 'Active',
        accountSuspendedReason: user.accountSuspendedReason || null,
        accountSuspendedAt: user.accountSuspendedAt || null,
        fundingStatus: user.fundingStatus || 'Allowed',
        fundingSuspendedReason: user.fundingSuspendedReason || null,
        fundingSuspendedAt: user.fundingSuspendedAt || null
      },
      company: company ? {
        id: company._id,
        legalName: company.legalName || company.name,
        accountStatus: company.accountStatus || 'Active',
        accountSuspendedReason: company.accountSuspendedReason || null,
        accountSuspendedAt: company.accountSuspendedAt || null,
        fundingStatus: company.fundingStatus || 'Allowed',
        fundingSuspendedReason: company.fundingSuspendedReason || null,
        fundingSuspendedAt: company.fundingSuspendedAt || null
      } : null,
      accountStatus: user.accountStatus || 'Active',
      accountSuspendedReason: user.accountSuspendedReason || null,
      fundingStatus: user.fundingStatus || 'Allowed',
      fundingSuspendedReason: user.fundingSuspendedReason || null,
      registrationStatus: currentRegistrationStatus,
      kycStatus: kyc ? kyc.status : 'NOT_STARTED'
    }
  });
});

// @route   POST /api/auth/verify-otp
// @desc    Verify investor email/mobile OTP
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, mobile, otp } = req.body;

  if (!otp || (!email && !mobile)) {
    throw new ApiError(400, 'Please provide the 6-digit OTP code along with email or mobile.');
  }

  const query = email ? { email: email.toLowerCase() } : { mobile };
  const user = await User.findOne(query).select('+otp.code +otp.expiresAt');

  if (!user) {
    throw new ApiError(404, 'User account not found.');
  }

  user.isVerified = true;
  user.otp = undefined;
  await user.save();

  const token = generateToken(user._id);
  const kyc = await KYC.findOne({ investorId: user._id });
  const verifiedRegistrationStatus = user.registrationStatus || (user.role === 'admin' ? 'Approved' : 'Pending Approval');

  return res.status(200).json({
    success: true,
    message: 'Account verified successfully.',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        registrationStatus: verifiedRegistrationStatus,
        rejectionReason: user.rejectionReason || null,
        adminRemarks: user.adminRemarks || null
      },
      registrationStatus: verifiedRegistrationStatus,
      kycStatus: kyc ? kyc.status : 'NOT_STARTED'
    }
  });
});

// @route   GET /api/auth/me
// @desc    Get current authenticated investor info
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const profile = await InvestorProfile.findOne({ userId: req.user._id });
  const kyc = await KYC.findOne({ investorId: req.user._id });

  const activeRegistrationStatus = user.registrationStatus || (user.role === 'admin' ? 'Approved' : 'Pending Approval');

  let company = null;
  if (user.companyId) {
    company = await Company.findById(user.companyId);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        companyId: user.companyId,
        registrationStatus: activeRegistrationStatus,
        rejectionReason: user.rejectionReason || null,
        adminRemarks: user.adminRemarks || null,
        accountStatus: user.accountStatus || 'Active',
        accountSuspendedReason: user.accountSuspendedReason || null,
        accountSuspendedAt: user.accountSuspendedAt || null,
        fundingStatus: user.fundingStatus || 'Allowed',
        fundingSuspendedReason: user.fundingSuspendedReason || null,
        fundingSuspendedAt: user.fundingSuspendedAt || null
      },
      company: company ? {
        id: company._id,
        legalName: company.legalName || company.name,
        accountStatus: company.accountStatus || 'Active',
        accountSuspendedReason: company.accountSuspendedReason || null,
        accountSuspendedAt: company.accountSuspendedAt || null,
        fundingStatus: company.fundingStatus || 'Allowed',
        fundingSuspendedReason: company.fundingSuspendedReason || null,
        fundingSuspendedAt: company.fundingSuspendedAt || null
      } : null,
      profile,
      registrationStatus: activeRegistrationStatus,
      kycStatus: kyc ? kyc.status : 'NOT_STARTED',
      accountStatus: user.accountStatus || 'Active',
      accountSuspendedReason: user.accountSuspendedReason || null,
      accountSuspendedAt: user.accountSuspendedAt || null,
      fundingStatus: user.fundingStatus || 'Allowed',
      fundingSuspendedReason: user.fundingSuspendedReason || null,
      fundingSuspendedAt: user.fundingSuspendedAt || null
    }
  });
});

// @route   POST /api/auth/resubmit
// @desc    Resubmit corrected investor details & documents after rejection or change request
export const resubmit = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User account not found.');
  }

  const {
    name,
    dateOfBirth,
    pan,
    aadhaarNumber,
    residentialAddress,
    city,
    state,
    pincode,
    bankName,
    accountNumber,
    ifscCode,
    accountHolderName,
    cancelledChequeUrl,
    panCardUrl,
    identityProofUrl
  } = req.body;

  if (name) user.name = name;
  user.registrationStatus = 'Pending Approval';
  user.adminRemarks = null;
  user.statusHistory.push({
    status: 'Pending Approval',
    reason: 'Application resubmitted with updated details / documents',
    timestamp: new Date()
  });
  await user.save();

  const profile = await InvestorProfile.findOne({ userId });
  if (profile) {
    if (pan) {
      profile.pan = pan.toUpperCase();
      profile.panNumber = pan.toUpperCase();
    }
    if (aadhaarNumber) profile.aadhaarNumber = aadhaarNumber;
    if (dateOfBirth) profile.dateOfBirth = new Date(dateOfBirth);
    if (residentialAddress || city || state || pincode) {
      profile.address = {
        street: residentialAddress || profile.address?.street || '',
        city: city || profile.address?.city || '',
        state: state || profile.address?.state || '',
        pincode: pincode || profile.address?.pincode || ''
      };
    }
    if (bankName || accountNumber || ifscCode) {
      profile.bankDetails = {
        bankName: bankName || profile.bankDetails?.bankName || '',
        accountNumber: accountNumber || profile.bankDetails?.accountNumber || '',
        ifscCode: ifscCode ? ifscCode.toUpperCase() : (profile.bankDetails?.ifscCode || ''),
        accountHolderName: accountHolderName || user.name,
        chequeUrl: cancelledChequeUrl || profile.bankDetails?.chequeUrl || '',
        isVerified: false
      };
    }
    if (panCardUrl) profile.panCardUrl = panCardUrl;
    if (identityProofUrl) profile.identityProofUrl = identityProofUrl;
    if (cancelledChequeUrl) profile.cancelledChequeUrl = cancelledChequeUrl;

    profile.kycStatus = 'Pending Approval';
    profile.registrationStatus = 'Pending Approval';
    await profile.save();
  }

  const kyc = await KYC.findOne({ investorId: userId });
  if (kyc) {
    if (pan) kyc.panNumber = pan.toUpperCase();
    if (panCardUrl) kyc.panDocumentUrl = panCardUrl;
    if (identityProofUrl) kyc.addressProofUrl = identityProofUrl;
    if (cancelledChequeUrl) kyc.bankProofUrl = cancelledChequeUrl;
    if (bankName) kyc.bankName = bankName;
    if (accountNumber) kyc.accountNumber = accountNumber;
    if (ifscCode) kyc.ifscCode = ifscCode.toUpperCase();
    kyc.status = 'Pending Approval';
    kyc.registrationStatus = 'Pending Approval';
    kyc.submittedAt = new Date();
    await kyc.save();
  }

  broadcastSyncEvent('REGISTRATION', 'RESUBMITTED', {
    userId: user._id,
    role: 'investor',
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    status: 'Pending Approval',
    resubmittedAt: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Your updated information has been submitted for compliance verification.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        registrationStatus: user.registrationStatus
      }
    }
  });
});

// @route   POST /api/auth/forgot-password
// @desc    Trigger reset password OTP / token
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Please provide your registered email address.');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // For security, don't reveal user existence
    return res.status(200).json({
      success: true,
      message: 'If that email exists in our records, an OTP verification code has been dispatched.'
    });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = {
    code: otpCode,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  };
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Reset instructions have been sent to your registered email address.',
    data: { otpCode } // sent for developer testing
  });
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, 'Please provide email, verification code, and new password.');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters.');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+otp.code +otp.expiresAt');

  if (!user || !user.otp || user.otp.code !== otp) {
    throw new ApiError(400, 'Invalid or expired reset code.');
  }

  user.password = newPassword;
  user.otp = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.'
  });
});
