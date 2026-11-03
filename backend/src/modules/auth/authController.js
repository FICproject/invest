import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/index.js';
import { ErrorCodes, Roles, Constraints } from '../../constants/index.js';
import { logAction } from '../../middleware/audit.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: ErrorCodes.BAD_REQUEST,
        error: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        code: ErrorCodes.UNAUTHORIZED,
        error: 'Invalid email or password'
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        code: ErrorCodes.FORBIDDEN,
        error: `Account is blocked: ${user.blockReason || 'Contact support'}`
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: ErrorCodes.UNAUTHORIZED,
        error: 'Invalid email or password'
      });
    }

    // Direct single-step sign-in (2FA disabled)
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET || 'connect_invest_dev_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await logAction({
      actorId: user._id,
      role: user.role,
      action: 'ADMIN_SIGN_IN',
      targetEntity: 'User',
      targetId: user._id,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Sign in successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function verify2FA(req, res, next) {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        code: ErrorCodes.BAD_REQUEST,
        error: 'Email and security code are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        code: ErrorCodes.UNAUTHORIZED,
        error: 'User not found'
      });
    }

    if (!user.twoFactorCode || !user.twoFactorExpiresAt || new Date() > user.twoFactorExpiresAt) {
      return res.status(400).json({
        success: false,
        code: ErrorCodes.BAD_REQUEST,
        error: 'Security code has expired. Please sign in again.'
      });
    }

    if (user.twoFactorCode !== code.trim()) {
      return res.status(400).json({
        success: false,
        code: ErrorCodes.BAD_REQUEST,
        error: 'Invalid security code'
      });
    }

    // Clear OTP
    user.twoFactorCode = null;
    user.twoFactorExpiresAt = null;
    await user.save();

    // Issue JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET || 'connect_invest_dev_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await logAction({
      actorId: user._id,
      role: user.role,
      action: 'ADMIN_SIGN_IN',
      targetEntity: 'User',
      targetId: user._id,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
}
