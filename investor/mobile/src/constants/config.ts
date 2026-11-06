import { Platform } from 'react-native';

export const APP_CONFIG = {
  APP_NAME: 'Connect Invest',
  APP_VERSION: '1.0.0',
  TAGLINE: 'Grow Your Wealth with Vetted Private Opportunities',
  // Default host for physical devices & emulators
  DEFAULT_API_URL: Platform.select({
    android: 'http://192.168.1.171:5000/api',
    default: 'http://localhost:5000/api',
  }),
  DEFAULT_UPLOADS_URL: Platform.select({
    android: 'http://192.168.1.171:5000/uploads',
    default: 'http://localhost:5000/uploads',
  }),
  CURRENCY_SYMBOL: '₹',
  TIMEOUT_MS: 15000,
  SUPPORT_EMAIL: 'support@connectinvest.com',
};
