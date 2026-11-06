import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { broadcastSyncEvent } from '../services/sse.js';
import {
  validateMobile,
  validatePAN,
  validateBankAccount,
  validateIFSC,
  validateEmail,
  validateCIN,
  validateGSTIN,
  ERROR_MESSAGES
} from '../utils/validators.js';

const generateToken = (id) => {
  return jwt.sign({ id, userId: id }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
};

export const registerCompany = asyncHandler(async (req, res) => {
  const {
    // Step 1: Company Details
    companyLegalName,
    brandName,
    companyEmail,
    companyMobile,
    password,
    website,
    industry,
    companyType,
    // Step 2: Business Information
    cin,
    pan,
    gstin,
    incorporationDate,
    registeredAddress,
    city,
    state,
    pincode,
    description,
    // Step 3: Authorized Representative
    name, // rep name
    repDesignation,
    email, // rep email
    mobile, // rep mobile
    repPan,
    repIdentityVerified,
    // Step 4: Bank Details
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    cancelledChequeUrl,
    // Step 5: Company Documents
    incorporationCertificateUrl,
    panCardUrl,
    gstCertificateUrl,
    moaAoaUrl,
    shareholdingPatternUrl,
    financialStatementsUrl
  } = req.body;

  const adminEmail = (email || companyEmail || '').toLowerCase();
  const adminMobile = mobile || companyMobile || '';
  const adminName = name || 'Authorized Representative';

  if (!companyLegalName || !pan || !adminEmail || !adminMobile || !password) {
    throw new ApiError(400, 'Please provide all mandatory registration details.');
  }

  if (!validateEmail(adminEmail)) {
    throw new ApiError(400, 'Please enter a valid Company or Representative Email Address.');
  }

  // Mobile Validation: Official company mobile and representative mobile
  if (companyMobile && !validateMobile(companyMobile)) {
    throw new ApiError(400, `Official Company Mobile: ${ERROR_MESSAGES.MOBILE_INVALID}`);
  }
  if (!validateMobile(adminMobile)) {
    throw new ApiError(400, `Representative Mobile: ${ERROR_MESSAGES.MOBILE_INVALID}`);
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long.');
  }

  // CIN Validation (if provided)
  if (cin && !validateCIN(cin)) {
    throw new ApiError(400, ERROR_MESSAGES.CIN_INVALID);
  }

  // GSTIN Validation (if provided)
  if (gstin && !validateGSTIN(gstin)) {
    throw new ApiError(400, ERROR_MESSAGES.GSTIN_INVALID);
  }

  // Company PAN Validation
  if (!validatePAN(pan)) {
    throw new ApiError(400, `Company PAN: ${ERROR_MESSAGES.PAN_INVALID}`);
  }

  // Representative PAN Validation (if provided)
  if (repPan && !validatePAN(repPan)) {
    throw new ApiError(400, `Representative PAN: ${ERROR_MESSAGES.PAN_INVALID}`);
  }

  // Incorporation Date Validation (Past or today only, no 18+ restriction)
  if (incorporationDate) {
    const incDate = new Date(incorporationDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (isNaN(incDate.getTime()) || incDate > today) {
      throw new ApiError(400, 'Company incorporation date cannot be a future date.');
    }
  }

  // Bank Account Validation (if provided)
  if (accountNumber && !validateBankAccount(accountNumber)) {
    throw new ApiError(400, ERROR_MESSAGES.BANK_ACCOUNT_INVALID);
  }

  // IFSC Validation (if provided)
  if (ifscCode && !validateIFSC(ifscCode)) {
    throw new ApiError(400, ERROR_MESSAGES.IFSC_INVALID);
  }

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    throw new ApiError(409, 'An account with this email address already exists.');
  }

  const user = await User.create({
    name: adminName,
    email: adminEmail,
    mobile: adminMobile,
    password,
    role: 'company_admin',
    isVerified: true,
    registrationStatus: 'Pending Approval',
    submittedAt: new Date()
  });

  const company = await Company.create({
    legalName: companyLegalName,
    brandName: brandName || companyLegalName,
    tradingName: brandName || companyLegalName,
    companyType: companyType || 'Private Limited',
    industry: industry || 'Technology',
    pan: pan.toUpperCase(),
    cin: cin ? cin.toUpperCase() : undefined,
    gstin: gstin ? gstin.toUpperCase() : undefined,
    incorporationDate: incorporationDate ? new Date(incorporationDate) : undefined,
    website: website || '',
    officialEmail: companyEmail || adminEmail,
    officialMobile: companyMobile || adminMobile,
    registeredAddress: {
      street: registeredAddress || '',
      city: city || 'Bengaluru',
      state: state || 'Karnataka',
      pincode: pincode || '560001',
      country: 'India'
    },
    description: description || `${companyLegalName} - Innovating growth via Connect Invest.`,
    userId: user._id,
    ownerUserId: user._id,
    bankDetails: {
      accountHolderName: accountHolderName || companyLegalName,
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode ? ifscCode.toUpperCase() : '',
      chequeUrl: cancelledChequeUrl || '',
      isVerified: Boolean(accountNumber && ifscCode)
    },
    documents: {
      incorporationCertificateUrl: incorporationCertificateUrl || '',
      panCardUrl: panCardUrl || '',
      gstCertificateUrl: gstCertificateUrl || '',
      moaAoaUrl: moaAoaUrl || '',
      shareholdingPatternUrl: shareholdingPatternUrl || '',
      financialStatementsUrl: financialStatementsUrl || ''
    },
    directors: [
      {
        name: adminName,
        email: adminEmail,
        mobile: adminMobile,
        designation: repDesignation || 'Managing Director / Founder',
        pan: repPan ? repPan.toUpperCase() : '',
        sharesOwnedPercentage: 60,
        identityVerified: Boolean(repIdentityVerified)
      }
    ],
    status: 'Pending Approval',
    registrationStatus: 'Pending Approval',
    verificationStatus: 'Pending Approval'
  });

  user.companyId = company._id;
  await user.save();

  await Notification.create({
    companyId: company._id,
    title: 'Welcome to Connect Invest Company Portal!',
    message: `Your company ${company.legalName} has been submitted for admin compliance verification.`,
    type: 'system'
  });

  await AuditLog.create({
    companyId: company._id,
    userId: user._id,
    userEmail: user.email,
    action: 'REGISTER_COMPANY_PENDING',
    module: 'AUTH',
    details: { companyId: company._id, legalName: company.legalName, status: 'Pending Approval' }
  });

  // Broadcast real-time event to Admin Console
  broadcastSyncEvent('REGISTRATION', 'SUBMITTED', {
    id: company._id,
    companyId: company._id,
    userId: user._id,
    role: 'company',
    legalName: company.legalName,
    email: company.officialEmail,
    mobile: company.officialMobile,
    status: 'Pending Approval',
    submittedAt: new Date()
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Company registered successfully. Application is pending admin compliance approval.',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: company._id,
      registrationStatus: 'Pending Approval'
    },
    company,
    registrationStatus: 'Pending Approval'
  });
});

export const loginCompany = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  let company = null;
  if (user.companyId) {
    company = await Company.findById(user.companyId);
  }
  if (!company) {
    company = await Company.findOne({
      $or: [
        { ownerUserId: user._id },
        { userId: user._id },
        { officialEmail: user.email.toLowerCase() },
        { 'directors.email': user.email.toLowerCase() }
      ]
    });
    if (company && !user.companyId) {
      user.companyId = company._id;
      await user.save();
    }
  }

  const currentStatus = company?.registrationStatus || user.registrationStatus || 'Pending Approval';
  const currentReason = company?.rejectionReason || user.rejectionReason || null;
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      registrationStatus: currentStatus,
      rejectionReason: currentReason,
      adminRemarks: user.adminRemarks || null,
      accountStatus: company?.accountStatus || user.accountStatus || 'Active',
      accountSuspendedReason: company?.accountSuspendedReason || user.accountSuspendedReason || null,
      accountSuspendedAt: company?.accountSuspendedAt || user.accountSuspendedAt || null,
      fundingStatus: company?.fundingStatus || user.fundingStatus || 'Allowed',
      fundingSuspendedReason: company?.fundingSuspendedReason || user.fundingSuspendedReason || null,
      fundingSuspendedAt: company?.fundingSuspendedAt || user.fundingSuspendedAt || null
    },
    company,
    accountStatus: company?.accountStatus || user.accountStatus || 'Active',
    accountSuspendedReason: company?.accountSuspendedReason || user.accountSuspendedReason || null,
    fundingStatus: company?.fundingStatus || user.fundingStatus || 'Allowed',
    fundingSuspendedReason: company?.fundingSuspendedReason || user.fundingSuspendedReason || null,
    registrationStatus: currentStatus,
    rejectionReason: currentReason
  });
});

// @route   POST /api/company/auth/resubmit
// @desc    Resubmit corrected company details & documents after rejection or change request
export const resubmitCompany = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user || !user.companyId) {
    throw new ApiError(404, 'Associated company profile not found.');
  }

  const company = await Company.findById(user.companyId);
  if (!company) {
    throw new ApiError(404, 'Company entity not found.');
  }

  const {
    companyLegalName,
    brandName,
    cin,
    pan,
    gstin,
    website,
    industry,
    registeredAddress,
    city,
    state,
    pincode,
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    cancelledChequeUrl,
    incorporationCertificateUrl,
    panCardUrl,
    gstCertificateUrl,
    moaAoaUrl,
    shareholdingPatternUrl,
    financialStatementsUrl
  } = req.body;

  if (companyLegalName) company.legalName = companyLegalName;
  if (brandName) company.brandName = brandName;
  if (cin) {
    if (!validateCIN(cin)) throw new ApiError(400, ERROR_MESSAGES.CIN_INVALID);
    company.cin = cin.toUpperCase();
  }
  if (pan) {
    if (!validatePAN(pan)) throw new ApiError(400, ERROR_MESSAGES.PAN_INVALID);
    company.pan = pan.toUpperCase();
  }
  if (gstin) {
    if (!validateGSTIN(gstin)) throw new ApiError(400, ERROR_MESSAGES.GSTIN_INVALID);
    company.gstin = gstin.toUpperCase();
  }
  if (website) company.website = website;
  if (industry) company.industry = industry;

  if (registeredAddress || city || state || pincode) {
    company.registeredAddress = {
      street: registeredAddress || company.registeredAddress?.street || '',
      city: city || company.registeredAddress?.city || '',
      state: state || company.registeredAddress?.state || '',
      pincode: pincode || company.registeredAddress?.pincode || '',
      country: 'India'
    };
  }

  if (bankName || accountNumber || ifscCode) {
    company.bankDetails = {
      accountHolderName: accountHolderName || company.legalName,
      bankName: bankName || company.bankDetails?.bankName || '',
      accountNumber: accountNumber || company.bankDetails?.accountNumber || '',
      ifscCode: ifscCode ? ifscCode.toUpperCase() : (company.bankDetails?.ifscCode || ''),
      chequeUrl: cancelledChequeUrl || company.bankDetails?.chequeUrl || '',
      isVerified: false
    };
  }

  if (!company.documents) company.documents = {};
  if (incorporationCertificateUrl) company.documents.incorporationCertificateUrl = incorporationCertificateUrl;
  if (panCardUrl) company.documents.panCardUrl = panCardUrl;
  if (gstCertificateUrl) company.documents.gstCertificateUrl = gstCertificateUrl;
  if (moaAoaUrl) company.documents.moaAoaUrl = moaAoaUrl;
  if (shareholdingPatternUrl) company.documents.shareholdingPatternUrl = shareholdingPatternUrl;
  if (financialStatementsUrl) company.documents.financialStatementsUrl = financialStatementsUrl;

  company.status = 'Pending Approval';
  company.registrationStatus = 'Pending Approval';
  company.verificationStatus = 'Pending Approval';
  company.rejectionReason = null;
  company.statusHistory.push({
    status: 'Pending Approval',
    reason: 'Application resubmitted by company with updated information/documents',
    timestamp: new Date()
  });
  await company.save();

  user.registrationStatus = 'Pending Approval';
  user.rejectionReason = null;
  user.adminRemarks = null;
  user.statusHistory.push({
    status: 'Pending Approval',
    reason: 'Company application resubmitted',
    timestamp: new Date()
  });
  await user.save();

  broadcastSyncEvent('REGISTRATION', 'RESUBMITTED', {
    id: company._id,
    companyId: company._id,
    userId: user._id,
    role: 'company',
    legalName: company.legalName,
    status: 'Pending Approval',
    resubmittedAt: new Date()
  });

  res.status(200).json({
    success: true,
    message: 'Company registration details resubmitted successfully for compliance review.',
    data: {
      company,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registrationStatus: user.registrationStatus
      }
    }
  });
});

