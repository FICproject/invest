export const ROUTES = {
  // Root Stacks
  AUTH_STACK: 'AuthStack',
  APP_TABS: 'AppTabs',

  // Auth Screens
  LOGIN: 'Login',
  REGISTER_ROLE: 'RegisterRole',
  REGISTER: 'Register',
  REGISTER_INVESTOR: 'RegisterInvestor',
  REGISTER_COMPANY: 'RegisterCompany',
  OTP_VERIFICATION: 'OtpVerification',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Bottom Tabs
  TAB_HOME: 'TabHome',
  TAB_OFFERS: 'TabOffers',
  TAB_PORTFOLIO: 'TabPortfolio',
  TAB_WALLET: 'TabWallet',
  TAB_PROFILE: 'TabProfile',

  // Home Stack
  HOME: 'Home',
  SEARCH_OFFERS: 'SearchOffers',

  // Offers Stack
  OFFER_LIST: 'OfferList',
  OFFER_DETAILS: 'OfferDetails',
  INVEST_CONFIRM: 'InvestConfirm',

  // Portfolio Stack
  PORTFOLIO: 'Portfolio',
  INVESTMENT_DETAIL: 'InvestmentDetail',
  PERFORMANCE_ANALYTICS: 'PerformanceAnalytics',

  // Wallet Stack
  WALLET: 'Wallet',
  ADD_FUNDS: 'AddFunds',
  REQUEST_PAYOUT: 'RequestPayout',
  TRANSACTION_HISTORY: 'TransactionHistory',

  // KYC Screens
  KYC_STATUS: 'KycStatus',
  KYC_UPLOAD: 'KycUpload',

  // Profile Stack
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',
  BANK_ACCOUNTS: 'BankAccounts',
  SECURITY_SETTINGS: 'SecuritySettings',
  NOTIFICATIONS: 'Notifications',

  // Company Dashboard Screens
  COMPANY_DASHBOARD: 'CompanyDashboard',
  COMPANY_REQUESTS: 'CompanyRequests',
  COMPANY_CREATE_REQUEST: 'CompanyCreateRequest',
  COMPANY_INVESTMENTS: 'CompanyInvestments',
  COMPANY_SHAREHOLDERS: 'CompanyShareholders',
  COMPANY_PROFILE: 'CompanyProfile',
} as const;
