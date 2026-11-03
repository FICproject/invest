import express from 'express';
import {
  getDashboardSummary,
  getMyInvestments,
  getProfile,
  updateProfile,
  updateBankDetails,
  getNotifications,
  markNotificationRead
} from '../controllers/investorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireApprovedUser } from '../middleware/requireApprovedUser.js';

const router = express.Router();

router.use(protect);

// Profile and notifications (accessible during approval review)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/bank-details', updateBankDetails);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

// Dashboard and investments strictly require Approved status
router.get('/dashboard', requireApprovedUser, getDashboardSummary);
router.get('/my-investments', requireApprovedUser, getMyInvestments);

export default router;
