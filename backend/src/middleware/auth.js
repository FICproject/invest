import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Roles, ErrorCodes } from '../constants/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ENV } from '../config/env.js';

export async function authenticate(req, res, next) {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        code: ErrorCodes.UNAUTHORIZED,
        error: 'Authentication token missing or invalid',
        message: 'Authentication token missing or invalid'
      });
    }

    const secret = process.env.JWT_SECRET || ENV.JWT_SECRET || 'connect_invest_super_secure_jwt_secret_key_2026_unified!';
    const decoded = jwt.verify(token, secret);

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        code: ErrorCodes.UNAUTHORIZED,
        error: 'User not found',
        message: 'User account associated with this token no longer exists'
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        code: ErrorCodes.FORBIDDEN,
        error: `Account is blocked: ${user.blockReason || 'Contact support'}`,
        message: `Account is blocked: ${user.blockReason || 'Contact support'}`
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: ErrorCodes.UNAUTHORIZED,
      error: 'Invalid or expired session token',
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== Roles.ADMIN && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      code: ErrorCodes.FORBIDDEN,
      error: 'Administrative privileges required',
      message: 'Administrative privileges required'
    });
  }
  next();
}

// Aliases for investor controller compatibility
export const protect = authenticate;

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `User role '${req.user?.role}' is not authorized to access this resource.`);
    }
    next();
  };
};

