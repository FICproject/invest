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

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/my-investments', getMyInvestments);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/bank-details', updateBankDetails);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
