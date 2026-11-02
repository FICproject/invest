import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireCompanyAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token missing or invalid');
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User account not found');
    }

    req.user = user;

    if (user.companyId) {
      const company = await Company.findById(user.companyId);
      if (company) {
        req.company = company;
      }
    }

    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired session token');
  }
});

export const requireCompany = asyncHandler(async (req, res, next) => {
  if (!req.company) {
    throw new ApiError(400, 'Company profile is required for this operation');
  }
  next();
});

