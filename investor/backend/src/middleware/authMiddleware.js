import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token missing or invalid. Please log in.');
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new ApiError(401, 'User account associated with this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired session token. Please log in again.');
  }
});
