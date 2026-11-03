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

  const status = req.user.registrationStatus || 'Approved';

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
