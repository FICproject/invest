import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default deployed live backend host
const DEFAULT_HOST = 'https://connect-invest-backend.onrender.com';

export const api = axios.create({
  baseURL: `${DEFAULT_HOST}/api/v1`,
  timeout: 15000,
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
  // If old local IP was previously stored on device, override it with deployed live host
  if (saved && (saved.includes('192.168.') || saved.includes('10.0.2.2') || saved.includes('localhost'))) {
    await AsyncStorage.setItem('ci_api_host', DEFAULT_HOST);
    return DEFAULT_HOST;
  }
  return saved || DEFAULT_HOST;
}

// Request interceptor to attach JWT token
api.interceptors.request.use(async config => {
  try {
    const savedHost = await AsyncStorage.getItem('ci_api_host');
    const activeHost = (savedHost && !savedHost.includes('192.168.') && !savedHost.includes('10.0.2.2') && !savedHost.includes('localhost'))
      ? savedHost
      : DEFAULT_HOST;

    config.baseURL = `${activeHost}/api/v1`;

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

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  async error => {
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

