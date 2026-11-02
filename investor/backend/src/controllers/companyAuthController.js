import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const generateToken = (id) => {
  return jwt.sign({ id }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
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
    throw new ApiError(400, 'Please provide all mandatory registration details');
  }

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    throw new ApiError(409, 'An account with this email address already exists');
  }

  const user = await User.create({
    name: adminName,
    email: adminEmail,
    mobile: adminMobile,
    password,
    role: 'company_admin',
    isVerified: true
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
    verificationStatus: 'Verified'
  });

  user.companyId = company._id;
  await user.save();

  await Notification.create({
    companyId: company._id,
    title: 'Welcome to Connect Invest Company Portal!',
    message: `Your company ${company.legalName} has been initialized successfully.`,
    type: 'system'
  });

  await AuditLog.create({
    companyId: company._id,
    userId: user._id,
    userEmail: user.email,
    action: 'REGISTER_COMPANY',
    module: 'AUTH',
    details: { companyId: company._id, legalName: company.legalName }
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Company registered successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: company._id
    },
    company
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
      companyId: user.companyId
    },
    company
  });
});

