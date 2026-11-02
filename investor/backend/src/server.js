import app from './app.js';
import { connectDB } from './config/database.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();

    app.listen(ENV.PORT, () => {
      console.log(`[Connect Invest Backend] Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
      console.log(`[Connect Invest Backend] API Base URL: http://localhost:${ENV.PORT}/api`);
    });
  } catch (error) {
    console.error('[Server Error] Failed to start server:', error.message);
    process.exit(1);
  }
};

// Connect Invest API Server
startServer();
