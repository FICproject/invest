import express from 'express';
import {
  register,
  login,
  verifyOTP,
  getMe,
  forgotPassword,
  resetPassword,
  uploadRegistrationDocument,
  resubmit
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// File upload for registration (supports 'file' or 'document' field name)
router.post(
  '/upload-doc',
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'document', maxCount: 1 }]),
  uploadRegistrationDocument
);

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.post('/resubmit', protect, resubmit);

export default router;
