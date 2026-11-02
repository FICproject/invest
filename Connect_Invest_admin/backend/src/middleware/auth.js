import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { Roles, ErrorCodes } from '../constants/index.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: ErrorCodes.UNAUTHORIZED,
        error: 'Authentication token missing or invalid'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'connect_invest_dev_secret');

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        code: ErrorCodes.UNAUTHORIZED,
        error: 'User not found'
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        code: ErrorCodes.FORBIDDEN,
        error: `Account is blocked: ${user.blockReason || 'Contact support'}`
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: ErrorCodes.UNAUTHORIZED,
      error: 'Invalid or expired session token'
    });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== Roles.ADMIN) {
    return res.status(403).json({
      success: false,
      code: ErrorCodes.FORBIDDEN,
      error: 'Access restricted to administrators only'
    });
  }
  next();
}
