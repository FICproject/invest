import express from 'express';
import { getTransactions, getStatement } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTransactions);
router.get('/statement', getStatement);

export default router;
