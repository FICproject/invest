import axios from 'axios';

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location) {
    // Use relative path so Vite proxy routes requests seamlessly across LAN/Network
    return '/api/v1';
  }
  return 'http://localhost:5000/api/v1';
};

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-attach authorization token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ci_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for Indian Rupee Formatting
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

// API Endpoints
export const authApi = {
  login: credentials => api.post('/auth/login', credentials),
  verify2FA: data => api.post('/auth/verify', data),
  getMe: () => api.get('/auth/me')
};

export const adminApi = {
  // Registration Approvals & Document Review Suite
  getApprovals: params => api.get('/admin/approvals', { params }),
  getApprovalById: (id, params) => api.get(`/admin/approvals/${id}`, { params }),
  decideApproval: (id, data) => api.post(`/admin/approvals/${id}/decision`, data),
  getDocumentPreviewUrl: filename => `${API_BASE}/admin/documents/${filename}`,
  getDocumentDownloadUrl: filename => `${API_BASE}/admin/documents/${filename}/download`,

  // Dashboard & WorkList
  getDashboard: () => api.get('/admin/dashboard'),
  getWorkList: () => api.get('/admin/worklist'),

  // Investors & KYC
  getInvestors: params => api.get('/admin/investors', { params }),
  getInvestorInvestments: id => api.get(`/admin/investors/${id}/investments`),
  getAllInvestments: params => api.get('/admin/investments', { params }),
  decideKyc: (id, data) => api.post(`/admin/kyc/${id}/decision`, data),
  setUserBlockStatus: (id, data) => api.post(`/admin/users/${id}/block`, data),
  suspendInvestorFunding: (id, data) => api.post(`/admin/investors/${id}/suspend-funding`, data),
  suspendInvestorAccount: (id, data) => api.post(`/admin/investors/${id}/suspend-account`, data),

  // Companies & KYB
  getCompanies: params => api.get('/admin/companies', { params }),
  createCompany: data => api.post('/admin/companies', data),
  decideKyb: (id, data) => api.post(`/admin/kyb/${id}/decision`, data),
  suspendCompanyFunding: (id, data) => api.post(`/admin/companies/${id}/suspend-funding`, data),
  suspendCompanyAccount: (id, data) => api.post(`/admin/companies/${id}/suspend-account`, data),
  deleteCompany: id => api.delete(`/admin/companies/${id}`),

  // Offers & Term Sheets
  getOffers: params => api.get('/admin/offers', { params }),
  getOfferInvestments: (id, params) => api.get(`/admin/offers/${id}/investments`, { params }),
  createOffer: data => api.post('/admin/offers', data),
  setOfferTerms: (id, data) => api.put(`/admin/offers/${id}/terms`, data),
  publishOffer: (id, data) => api.post(`/admin/offers/${id}/publish`, data),
  activateOffer: id => api.post(`/admin/offers/${id}/activate`),
  toggleOfferHold: (id, data) => api.post(`/admin/offers/${id}/hold`, data),
  deleteOffer: id => api.delete(`/admin/offers/${id}`),

  // Company Funding / Investment Requests (Company Submissions)
  getFundingRequests: params => api.get('/admin/funding-requests', { params }),
  getFundingRequestById: id => api.get(`/admin/funding-requests/${id}`),
  decideFundingRequest: (id, data) => api.post(`/admin/funding-requests/${id}/decision`, data),

  // Investor Investment Requests (Investor Applications)
  getInvestorRequests: params => api.get('/admin/investor-requests', { params }),
  getInvestorRequestById: id => api.get(`/admin/investor-requests/${id}`),
  decideInvestorRequest: (id, data) => api.post(`/admin/investor-requests/${id}/decision`, data),

  // Fund Releases
  getReleases: () => api.get('/admin/releases'),
  approveRelease: (id, data) => api.post(`/admin/releases/${id}/approve`, data),

  // Repayments
  getRepayments: params => api.get('/admin/repayments', { params }),
  confirmRepaymentReceipt: (id, data) => api.post(`/admin/repayments/${id}/receipt`, data),
  markDefault: (id, data) => api.post(`/admin/repayments/${id}/default`, data),

  // Payout Batches
  getPayouts: params => api.get('/admin/payouts', { params }),
  verifyPayout: (id, data) => api.post(`/admin/payouts/${id}/verify`, data),
  verifyAllPayouts: () => api.post('/admin/payouts/verify-all'),
  getBatches: () => api.get('/admin/payout-batches'),
  createPayoutBatch: () => api.post('/admin/payout-batches'),
  approveAndSendBatch: id => api.post(`/admin/payout-batches/${id}/approve`),
  retryPayout: id => api.post(`/admin/payouts/${id}/retry`),

  // Transactions Ledger
  getTransactions: params => api.get('/admin/transactions', { params }),

  // Audit Logs & Reports
  getAuditLogs: params => api.get('/admin/audit-log', { params }),
  getExportUrl: reportName => `${API_BASE}/admin/reports/${reportName}/export`,

  // Admin Profile & Settings
  updateCredentials: data => api.put('/admin/settings/credentials', data),

  // Queries & Support Tickets
  getQueries: params => api.get('/admin/queries', { params }),
  createQuery: data => api.post('/admin/queries', data),
  replyQuery: (id, data) => api.post(`/admin/queries/${id}/reply`, data),
  updateQueryStatus: (id, data) => api.put(`/admin/queries/${id}/status`, data),

  // Subscriptions (₹500 / month service fee)
  getSubscriptions: params => api.get('/admin/subscriptions', { params }),
  recordSubscription: data => api.post('/admin/subscriptions', data),
  updateSubscriptionStatus: (id, data) => api.put(`/admin/subscriptions/${id}/status`, data),

  // Equity Cap Table & Dividends
  getCompanyCapTable: companyId => api.get(`/admin/companies/${companyId}/cap-table`),
  getDividends: params => api.get('/admin/dividends', { params }),
  declareDividend: data => api.post('/admin/dividends', data),
  distributeDividend: id => api.post(`/admin/dividends/${id}/distribute`),

  // Shareholder Management & Allotments
  getShareholders: params => api.get('/admin/shareholders', { params }),
  updateShareholderAllotment: (id, data) => api.put(`/admin/shareholders/${id}/allotment`, data)
};

export default api;
