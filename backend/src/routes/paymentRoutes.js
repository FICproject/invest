import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireApprovedUser } from '../middleware/requireApprovedUser.js';

const router = express.Router();

router.use(protect, requireApprovedUser);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

export default router;
