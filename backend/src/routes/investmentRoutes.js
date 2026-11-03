import express from 'express';
import {
  getAllOffers,
  getFeaturedOffers,
  getOfferById,
  calculateReturns
} from '../controllers/investmentController.js';

const router = express.Router();

router.get('/', getAllOffers);
router.get('/featured', getFeaturedOffers);
router.get('/:id', getOfferById);
router.post('/calculate', calculateReturns);

export default router;
