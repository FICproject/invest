import { ErrorCodes } from '../constants/index.js';

export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.statusCode || (typeof err.status === 'number' ? err.status : 500);
  const code = err.code || ErrorCodes.BAD_REQUEST || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error occurred';

  res.status(statusCode).json({
    success: false,
    code,
    error: message,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

