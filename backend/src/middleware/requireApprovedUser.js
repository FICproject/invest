import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware: requireApprovedUser
 * Ensures that the authenticated user has an 'Approved' registration status
 * before allowing access to operational dashboard and transactional endpoints.
 */
export const requireApprovedUser = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication is required.'));
  }

  // Admins always bypass this check
  if (req.user.role === 'admin') {
    return next();
  }

  // 1. Check Account Suspension & Revocation
  if (req.user.accountStatus === 'Suspended' || req.user.accountStatus === 'Revoked') {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_SUSPENDED',
      accountStatus: req.user.accountStatus,
      rejectionReason: req.user.accountSuspendedReason || null,
      adminRemarks: req.user.accountSuspendedReason || null,
      suspendedAt: req.user.accountSuspendedAt,
      message: `Access denied. Your account has been ${req.user.accountStatus.toLowerCase()} by Platform Administration.${req.user.accountSuspendedReason ? ' Reason: ' + req.user.accountSuspendedReason : ''}`
    });
  }

  if (req.company && (req.company.accountStatus === 'Suspended' || req.company.accountStatus === 'Revoked')) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_SUSPENDED',
      accountStatus: req.company.accountStatus,
      rejectionReason: req.company.accountSuspendedReason || null,
      adminRemarks: req.company.accountSuspendedReason || null,
      suspendedAt: req.company.accountSuspendedAt,
      message: `Access denied. The company account has been ${req.company.accountStatus.toLowerCase()} by Platform Administration.${req.company.accountSuspendedReason ? ' Reason: ' + req.company.accountSuspendedReason : ''}`
    });
  }

  // 2. Check Registration Approval Status
  const status = req.user.registrationStatus || 'Pending Approval';

  if (status !== 'Approved') {
    return res.status(403).json({
      success: false,
      code: 'REGISTRATION_NOT_APPROVED',
      registrationStatus: status,
      rejectionReason: req.user.rejectionReason || null,
      adminRemarks: req.user.adminRemarks || null,
      message: `Access denied. Your account registration is currently ${status}. Dashboard operations are locked until Admin approval.`
    });
  }

  next();
};

/**
 * Middleware: requireActiveFunding
 * Ensures that the investor has active funding privileges, or the company
 * has active fundraising privileges before allowing transactional capital operations.
 */
export const requireActiveFunding = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication is required.'));
  }

  if (req.user.role === 'admin') {
    return next();
  }

  // Check user funding suspension
  if (req.user.fundingStatus === 'Suspended' || req.user.fundingStatus === 'Revoked') {
    return res.status(403).json({
      success: false,
      code: 'FUNDING_SUSPENDED',
      fundingStatus: req.user.fundingStatus,
      reason: req.user.fundingSuspendedReason || null,
      suspendedAt: req.user.fundingSuspendedAt,
      message: `Funding operations are currently ${req.user.fundingStatus.toLowerCase()} for your account.${req.user.fundingSuspendedReason ? ' Reason: ' + req.user.fundingSuspendedReason : ''}`
    });
  }

  // Check company funding suspension
  if (req.company && (req.company.fundingStatus === 'Suspended' || req.company.fundingStatus === 'Revoked')) {
    return res.status(403).json({
      success: false,
      code: 'FUNDING_SUSPENDED',
      fundingStatus: req.company.fundingStatus,
      reason: req.company.fundingSuspendedReason || null,
      suspendedAt: req.company.fundingSuspendedAt,
      message: `Fundraising operations are currently ${req.company.fundingStatus.toLowerCase()} for this company.${req.company.fundingSuspendedReason ? ' Reason: ' + req.company.fundingSuspendedReason : ''}`
    });
  }

  next();
};

