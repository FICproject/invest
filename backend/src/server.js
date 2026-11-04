import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sseHandler } from './services/sse.js';

// Admin Routes
import adminAuthRoutes from './modules/auth/authRoutes.js';
import adminRoutes from './modules/admin/adminRoutes.js';

// Investor & Company Routes
import investorAuthRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyUnifiedRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || ENV.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Global Middlewares
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads serving
app.use('/uploads', express.static(uploadDir));

// Real-Time Live Sync SSE Stream (Web & Mobile)
app.get('/api/v1/events', sseHandler);
app.get('/api/events', sseHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Connect Invest Unified API Server',
    database: 'MongoDB',
    port: PORT,
    endpoints: {
      admin: ['/api/v1/admin/*', '/api/v1/auth/*'],
      investor: ['/api/auth/*', '/api/investments/*', '/api/investor/*', '/api/kyc/*', '/api/payments/*', '/api/payouts/*', '/api/transactions/*'],
      company: ['/api/company/*'],
      events: '/api/v1/events',
      uploads: '/uploads/*'
    }
  });
});

// Admin API Routes
app.use('/api/v1/auth', adminAuthRoutes);
app.use('/api/v1/admin', adminRoutes);

// Investor & Company API Routes
app.use('/api/auth', investorAuthRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/transactions', transactionRoutes);

// Global Error Handler
app.use(errorHandler);

// Bootstrap & Start Server
async function bootstrap() {
  await connectDB();

  // Check and run initial seeder if database is fresh
  try {
    const { User } = await import('./models/index.js');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('[Bootstrap] No admin account detected. Running unified database seeder...');
      const { seedDatabase } = await import('./seeders/seedData.js');
      await seedDatabase(false);
    }
  } catch (err) {
    console.warn('[Bootstrap] Auto-seed check notice:', err.message);
  }

  // Initialize automated monthly returns evaluator
  try {
    const { processAutoMonthlyReturns } = await import('./services/autoReturnsService.js');
    // Run initial pass on startup
    processAutoMonthlyReturns();
    // Run periodic evaluation (every 10 minutes)
    setInterval(processAutoMonthlyReturns, 10 * 60 * 1000);
    console.log('[AutoReturnsScheduler] Monthly returns auto-payout scheduler initialized (10m interval)');
  } catch (schedErr) {
    console.warn('[AutoReturnsScheduler] Notice on init:', schedErr.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=============================================================`);
    console.log(`  CONNECT INVEST - UNIFIED MONOREPO BACKEND SERVER`);
    console.log(`  Status:       Online`);
    console.log(`  Port:         ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  Admin API:    http://localhost:${PORT}/api/v1/admin`);
    console.log(`  Investor API: http://localhost:${PORT}/api/investments`);
    console.log(`  Company API:  http://localhost:${PORT}/api/company`);
    console.log(`=============================================================`);
  });
}

bootstrap();

export default app;

