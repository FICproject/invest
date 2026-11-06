import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default development host
// Works for both reverse-port physical devices and emulators
const DEFAULT_HOST = 'http://192.168.1.171:5000';

export const api = axios.create({
  baseURL: `${DEFAULT_HOST}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Load custom host if configured by admin (e.g., physical phone on Wi-Fi or adb reverse)
export async function setApiHost(hostUrl) {
  if (!hostUrl) return;
  const cleaned = hostUrl.trim().replace(/\/$/, '');
  const newBase = `${cleaned}/api/v1`;
  api.defaults.baseURL = newBase;
  await AsyncStorage.setItem('ci_api_host', cleaned);
}

export async function getApiHost() {
  const saved = await AsyncStorage.getItem('ci_api_host');
  return saved || DEFAULT_HOST;
}

// Request interceptor to attach JWT token
api.interceptors.request.use(async config => {
  try {
    const savedHost = await AsyncStorage.getItem('ci_api_host');
    if (savedHost) {
      config.baseURL = `${savedHost}/api/v1`;
    } else {
      config.baseURL = `${DEFAULT_HOST}/api/v1`;
    }

    if (config.url?.includes('/auth/login')) {
      delete config.headers.Authorization;
    } else {
      const token = await AsyncStorage.getItem('ci_admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.warn('[API Interceptor Error]:', err.message);
  }
  return config;
});

// Response interceptor for automatic Wi-Fi IP fallback on Network Error
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (
      (!error.response || error.code === 'ERR_NETWORK') &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const currentWifiIp = '192.168.1.171';
      const wifiBase = `http://${currentWifiIp}:5000/api/v1`;
      originalRequest.baseURL = wifiBase;
      api.defaults.baseURL = wifiBase;
      await AsyncStorage.setItem('ci_api_host', `http://${currentWifiIp}:5000`);
      console.log('[API Fallback] Retrying request via Wi-Fi host:', wifiBase);
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

// Format Indian Rupee from whole paise
export function formatINR(paise, includeSymbol = true) {
  if (paise === undefined || paise === null) return includeSymbol ? '₹0' : '0';
  const rupees = Number(paise) / 100;
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(rupees);
  return includeSymbol ? `₹${formatted}` : formatted;
}

export function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

// Auth APIs
export const authApi = {
  login: credentials => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Admin Console APIs
export const adminApi = {
  // Dashboard & WorkList
  getDashboard: () => api.get('/admin/dashboard'),
  getWorkList: () => api.get('/admin/worklist'),

  // Investors & KYC Decisions
  getInvestors: params => api.get('/admin/investors', { params }),
  getAllInvestments: params => api.get('/admin/investments', { params }),
  setUserBlockStatus: (id, data) => api.post(`/admin/users/${id}/block`, data),
  suspendInvestorFunding: (id, data) => api.post(`/admin/investors/${id}/suspend-funding`, data),
  suspendInvestorAccount: (id, data) => api.post(`/admin/investors/${id}/suspend-account`, data),
  decideKyc: (id, data) => api.post(`/admin/kyc/${id}/decision`, data),
  decideKyb: (id, data) => api.post(`/admin/kyb/${id}/decision`, data),

  // Shareholders & Cap Table
  getShareholders: params => api.get('/admin/shareholders', { params }),
  updateShareholderAllotment: (id, data) => api.put(`/admin/shareholders/${id}/allotment`, data),
  getCompanyCapTable: companyId => api.get(`/admin/companies/${companyId}/cap-table`),

  // Offers & Companies
  getOffers: params => api.get('/admin/offers', { params }),
  createOffer: data => api.post('/admin/offers', data),
  getCompanies: params => api.get('/admin/companies', { params }),
  createCompany: data => api.post('/admin/companies', data),
  suspendCompanyFunding: (id, data) => api.post(`/admin/companies/${id}/suspend-funding`, data),
  suspendCompanyAccount: (id, data) => api.post(`/admin/companies/${id}/suspend-account`, data),
  publishOffer: (id, data) => api.post(`/admin/offers/${id}/publish`, data),
  activateOffer: id => api.post(`/admin/offers/${id}/activate`),
  toggleOfferHold: (id, data) => api.post(`/admin/offers/${id}/hold`, data),
  deleteOffer: id => api.delete(`/admin/offers/${id}`),

  // Releases & Repayments
  getReleases: () => api.get('/admin/releases'),
  approveRelease: (id, data) => api.post(`/admin/releases/${id}/approve`, data),
  getRepayments: params => api.get('/admin/repayments', { params }),
  confirmRepaymentReceipt: (id, data) => api.post(`/admin/repayments/${id}/receipt`, data),

  // Transactions Ledger
  getTransactions: params => api.get('/admin/transactions', { params }),

  // Payouts & Batches
  getPayouts: params => api.get('/admin/payouts', { params }),
  verifyPayout: (id, data) => api.post(`/admin/payouts/${id}/verify`, data),
  verifyAllPayouts: () => api.post('/admin/payouts/verify-all'),
  getBatches: () => api.get('/admin/payout-batches'),
  createPayoutBatch: data => api.post('/admin/payout-batches', data),
  approveAndSendBatch: id => api.post(`/admin/payout-batches/${id}/approve`),
  retryPayout: id => api.post(`/admin/payouts/${id}/retry`),

  // Registration & Compliance Approvals
  getApprovals: params => api.get('/admin/approvals', { params }),
  getApprovalById: id => api.get(`/admin/approvals/${id}`),
  decideApproval: (id, data) => api.post(`/admin/approvals/${id}/decision`, data),
  getDocumentPreviewUrl: filename => `${DEFAULT_HOST}/api/v1/admin/documents/${filename}`,
  getDocumentDownloadUrl: filename => `${DEFAULT_HOST}/api/v1/admin/documents/${filename}/download`
};

export function resolveDocumentUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/v1\/?$/, '') : DEFAULT_HOST;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

