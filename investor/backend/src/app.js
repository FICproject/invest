import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import companyRoutes from './routes/companyUnifiedRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads folder for KYC docs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Connect Invest Investor API',
    database: 'MongoDB'
  });
});

// API Routes
app.use('/api/company', companyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/transactions', transactionRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
