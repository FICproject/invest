import express from 'express';
import { getKycStatus, submitKyc, toggleKycStatus } from '../controllers/kycController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadKycDocs } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/status', getKycStatus);
router.post(
  '/submit',
  uploadKycDocs.fields([
    { name: 'panDocument', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'bankProof', maxCount: 1 }
  ]),
  submitKyc
);
router.post('/toggle-status', toggleKycStatus);

export default router;
