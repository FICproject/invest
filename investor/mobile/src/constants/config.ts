import { Platform } from 'react-native';

export const APP_CONFIG = {
  APP_NAME: 'Connect Invest',
  APP_VERSION: '1.0.0',
  TAGLINE: 'Grow Your Wealth with Vetted Private Opportunities',
  // Default host for backend
  DEFAULT_API_URL: Platform.select({
    android: 'https://connect-invest-backend.onrender.com/api',
    default: 'https://connect-invest-backend.onrender.com/api',
  }),
  DEFAULT_UPLOADS_URL: Platform.select({
    android: 'https://connect-invest-backend.onrender.com/uploads',
    default: 'https://connect-invest-backend.onrender.com/uploads',
  }),
  CURRENCY_SYMBOL: '₹',
  TIMEOUT_MS: 15000,
  SUPPORT_EMAIL: 'support@connectinvest.com',
};
