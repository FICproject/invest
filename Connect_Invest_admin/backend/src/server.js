import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { connectDB } from './config/db.js';
import authRoutes from './modules/auth/authRoutes.js';
import adminRoutes from './modules/admin/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sseHandler } from './services/sse.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Global Middleware
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Static uploads serving
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

// Real-Time Live Sync SSE Stream (Web & Mobile)
app.get('/api/v1/events', sseHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Connect Invest Core API'
  });
});

// Error handling
app.use(errorHandler);

// Start server and connect DB
async function bootstrap() {
  await connectDB();

  // Auto-seed if database is freshly initialized
  try {
    const { User } = await import('./models/index.js');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('[Bootstrap] No admin account detected. Running initial database seeder...');
      const { seed } = await import('../scripts/seed-db.js');
      await seed(false);
    }
  } catch (err) {
    console.warn('[Bootstrap] Auto-seed check notice:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  Connect Invest Core API Server running`);
    console.log(`  Local URL:    http://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

bootstrap();
