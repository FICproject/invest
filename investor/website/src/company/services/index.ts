import api from './api';

export const authService = {
  login: async (data: any) => {
    const res = await api.post('/company/auth/login', data);
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post('/company/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/company/profile');
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (data: any) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },
};

export const companyService = {
  getProfile: async () => {
    const res = await api.get('/company/profile');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put('/company/profile', data);
    return res.data;
  },
  addDirector: async (data: any) => {
    const res = await api.post('/company/directors', data);
    return res.data;
  },
  removeDirector: async (index: number) => {
    const res = await api.delete(`/company/directors/${index}`);
    return res.data;
  },
  submitVerification: async () => {
    const res = await api.post('/company/submit-verification');
    return res.data;
  },
};

export const investmentService = {
  getDashboardOverview: async () => {
    const res = await api.get('/company/dashboard-overview');
    return res.data;
  },
  getRequests: async (params?: any) => {
    const res = await api.get('/company/requests', { params });
    return res.data;
  },
  createRequest: async (data: any) => {
    if (data instanceof FormData) {
      const res = await api.post('/company/requests', data, {
        headers: { 'Content-Type': undefined },
      });
      return res.data;
    }
    const res = await api.post('/company/requests', data);
    return res.data;
  },
  getRequestById: async (id: string) => {
    const res = await api.get(`/company/requests/${id}`);
    return res.data;
  },
  updateRequest: async (id: string, data: any) => {
    if (data instanceof FormData) {
      const res = await api.put(`/company/requests/${id}`, data, {
        headers: { 'Content-Type': undefined },
      });
      return res.data;
    }
    const res = await api.put(`/company/requests/${id}`, data);
    return res.data;
  },
  getInvestments: async (params?: any) => {
    const res = await api.get('/company/investments', { params });
    return res.data;
  },
};

export const shareholderService = {
  getShareholders: async () => {
    const res = await api.get('/company/shareholders');
    return res.data;
  },
  createAllocation: async (data: any) => {
    const res = await api.post('/company/shareholders/allocations', data);
    return res.data;
  },
};

export const financialService = {
  getReports: async (params?: any) => {
    const res = await api.get('/company/financials/reports', { params });
    return res.data;
  },
  createReport: async (data: any) => {
    // Check if data is FormData or plain object
    if (data instanceof FormData) {
      const res = await api.post('/company/financials/reports', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    }
    const res = await api.post('/company/financials/reports', data);
    return res.data;
  },
  getReturnsAndDividends: async () => {
    const res = await api.get('/company/financials/returns-and-dividends');
    return res.data;
  },
  declareDividend: async (data: any) => {
    const res = await api.post('/company/financials/dividends', data);
    return res.data;
  },
};

export const transactionService = {
  getTransactions: async (params?: any) => {
    const res = await api.get('/company/transactions', { params });
    return res.data;
  },
};

export const documentService = {
  getDocuments: async () => {
    const res = await api.get('/company/documents');
    return res.data;
  },
  uploadDocument: async (formData: FormData) => {
    const res = await api.post('/company/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  deleteDocument: async (id: string) => {
    const res = await api.delete(`/company/documents/${id}`);
    return res.data;
  },
};

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/company/notifications');
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.put(`/company/notifications/${id}/read`);
    return res.data;
  },
};
