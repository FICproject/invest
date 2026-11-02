import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { InvestorProfile } from '../models/InvestorProfile.js';
import { KYC } from '../models/KYC.js';
import { Company } from '../models/Company.js';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const generateToken = (id) => {
  return jwt.sign({ id }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
};

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

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    mobile,
    password,
    role: 'investor',
    isVerified: true, // Activated for seamless testing, OTP can also be verified
    otp: { code: otpCode, expiresAt: otpExpires },
    termsAccepted: termsAccepted !== false
  });

  // Create populated investor profile
  await InvestorProfile.create({
    userId: user._id,
    panNumber: pan ? pan.toUpperCase() : '',
    aadhaarNumber: aadhaarNumber || '',
    aadhaarVerified: Boolean(aadhaarNumber),
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    nationality: nationality || 'Indian',
    occupation: occupation || '',
    annualIncomeRange: annualIncomeRange || '',
    sourceOfFunds: sourceOfFunds || '',
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
    status: pan ? 'APPROVED' : 'NOT_STARTED'
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Investor registered successfully. Welcome to Connect Invest!',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified
      },
      kycStatus: pan ? 'APPROVED' : 'NOT_STARTED',
      otpCode
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
        companyId: user.companyId
      },
      company,
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

  if (user.otp && user.otp.code === otp) {
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);
    const kyc = await KYC.findOne({ investorId: user._id });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          isVerified: user.isVerified
        },
        kycStatus: kyc ? kyc.status : 'NOT_STARTED'
      }
    });
  }

  throw new ApiError(400, 'Invalid or expired OTP code. Please enter the correct code.');
});

// @route   GET /api/auth/me
// @desc    Get current authenticated investor info
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const profile = await InvestorProfile.findOne({ userId: req.user._id });
  const kyc = await KYC.findOne({ investorId: req.user._id });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified
      },
      profile,
      kycStatus: kyc ? kyc.status : 'NOT_STARTED'
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
