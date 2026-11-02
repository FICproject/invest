import express from 'express';
import { getPayouts } from '../controllers/payoutController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getPayouts);

export default router;
