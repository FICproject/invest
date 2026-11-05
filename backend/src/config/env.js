import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connect_invest',
  JWT_SECRET: process.env.JWT_SECRET || 'connect_invest_super_secure_jwt_secret_key_2026_unified!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_51ConnectInvestDemo',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'razorpay_secret_test_key_connect_invest_2026',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'razorpay_webhook_secret_2026'
};

