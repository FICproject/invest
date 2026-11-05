import express from 'express';
import {
  getDashboardSummary,
  getMyInvestments,
  getProfile,
  updateProfile,
  updateBankDetails,
  getNotifications,
  markNotificationRead,
  requestInvestment,
  respondToInvestmentCounter
} from '../controllers/investorController.js';
import {
  getInvestorSubscription,
  createInvestorSubscriptionOrder,
  verifyInvestorSubscription
} from '../controllers/investorSubscriptionController.js';
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

// Subscription routes
router.get('/subscription', getInvestorSubscription);
router.post('/subscription/create-order', createInvestorSubscriptionOrder);
router.post('/subscription/verify', verifyInvestorSubscription);

// Dashboard and investments strictly require Approved status
router.get('/dashboard', requireApprovedUser, getDashboardSummary);
router.get('/my-investments', requireApprovedUser, getMyInvestments);
router.post('/request-investment', requireApprovedUser, requestInvestment);
router.post('/investments/:id/respond', requireApprovedUser, respondToInvestmentCounter);

export default router;
