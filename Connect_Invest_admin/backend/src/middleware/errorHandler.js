import { ErrorCodes } from '../constants/index.js';

export function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  const statusCode = err.statusCode || 500;
  const code = err.code || ErrorCodes.BAD_REQUEST;
  const message = err.message || 'Internal server error occurred';

  res.status(statusCode).json({
    success: false,
    code,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
