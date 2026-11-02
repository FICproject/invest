import { Platform } from 'react-native';

export const APP_CONFIG = {
  APP_NAME: 'Connect Invest',
  APP_VERSION: '1.0.0',
  TAGLINE: 'Grow Your Wealth with Vetted Private Opportunities',
  // On Android emulator, 10.0.2.2 connects to host localhost
  DEFAULT_API_URL: Platform.select({
    android: 'http://10.0.2.2:5000/api',
    default: 'http://localhost:5000/api',
  }),
  DEFAULT_UPLOADS_URL: Platform.select({
    android: 'http://10.0.2.2:5000/uploads',
    default: 'http://localhost:5000/uploads',
  }),
  CURRENCY_SYMBOL: '₹',
  TIMEOUT_MS: 15000,
  SUPPORT_EMAIL: 'support@connectinvest.com',
};
