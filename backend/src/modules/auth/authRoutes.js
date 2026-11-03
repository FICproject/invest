import express from 'express';
import { login, verify2FA, getMe } from './authController.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/verify', verify2FA);
router.get('/me', authenticate, getMe);

export default router;
